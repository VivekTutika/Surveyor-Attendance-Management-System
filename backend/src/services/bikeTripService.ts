import { prisma } from '../config/db';

export interface BikeTripFilters {
  userId?: number;
  date?: string;
  startDate?: string;
  endDate?: string;
  projectId?: number;
  locationId?: number;
}

export class BikeTripService {
  // Upsert or create a BikeTrip record based on a bike meter reading
  static async upsertTripForReading(reading: any) {
    const { id: readingId, userId, date, type, kmReading, capturedAt } = reading;

    // Prefer using the reading's capturedAt (timestamp) as the trip.date. If unavailable,
    // fall back to the provided date value. Store timestamps (UTC) to preserve the upload instant.
    const ts = capturedAt ? new Date(capturedAt) : new Date(date as any);
    const tripTimestamp = new Date(ts);

    // Perform transactional upsert/link to avoid races
    const result = await prisma.$transaction(async (tx) => {
      // Find any existing trip for this surveyor on the same UTC day. Because `date` is now a
      // timestamp, exact equality won't match; we search for trips whose timestamp falls within
      // the UTC day range for the reading's timestamp.
      const startOfDay = new Date(Date.UTC(tripTimestamp.getUTCFullYear(), tripTimestamp.getUTCMonth(), tripTimestamp.getUTCDate(), 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(tripTimestamp.getUTCFullYear(), tripTimestamp.getUTCMonth(), tripTimestamp.getUTCDate(), 23, 59, 59, 999));
      const existingArr = await (tx as any).bikeTrip.findMany({
        where: { surveyorId: userId, date: { gte: startOfDay, lte: endOfDay } },
      });
      const existing = existingArr.length ? existingArr[0] : null;

      const isMorning = type === 'MORNING';

      if (existing) {
        const data: any = {};
        if (isMorning) {
          data.morningReadingId = readingId;
          data.morningKm = kmReading ?? undefined;
        } else {
          data.eveningReadingId = readingId;
          data.eveningKm = kmReading ?? undefined;
        }

        // compute kms if both present (prefer latest values)
        const morningKm = (isMorning ? (kmReading ?? existing.morningKm) : existing.morningKm) as number | null | undefined;
        const eveningKm = (!isMorning ? (kmReading ?? existing.eveningKm) : existing.eveningKm) as number | null | undefined;

        let computedKm: number | null = null;
        if (typeof morningKm === 'number' && typeof eveningKm === 'number') {
          computedKm = eveningKm - morningKm;
        }

        if (computedKm !== null) {
          data.computedKm = computedKm;
          // if finalKm is null, set it to computedKm by default
          if (existing.finalKm === null) {
            data.finalKm = computedKm;
          }
        }

        const updated = await (tx as any).bikeTrip.update({
          where: { id: existing.id },
          data: { ...data, updatedAt: new Date() },
        });

        return updated;
      }

      // Create a new trip
      const createData: any = {
        surveyorId: userId,
        date: tripTimestamp,
      };

      if (isMorning) {
        createData.morningReadingId = readingId;
        createData.morningKm = kmReading ?? undefined;
      } else {
        createData.eveningReadingId = readingId;
        createData.eveningKm = kmReading ?? undefined;
      }

      if (createData.morningKm != null && createData.eveningKm != null) {
        const computed = createData.eveningKm - createData.morningKm;
        createData.computedKm = computed;
        createData.finalKm = computed;
      }

  // Set createdAt and updatedAt from the application/system time to avoid DB timezone offsets
  createData.createdAt = new Date();
  createData.updatedAt = new Date();

  const created = await (tx as any).bikeTrip.create({ data: createData });
      return created;
    });

    return result;
  }

  static async getTrips(filters: BikeTripFilters, userRole: string, requestingUserId: number) {
    const { userId, date, startDate, endDate, projectId, locationId } = filters;

    const where: any = {};

    if (userRole === 'SURVEYOR') {
      where.surveyorId = requestingUserId;
    } else if (userId) {
      where.surveyorId = userId;
    }

    // Parse incoming date filters as UTC date-only to avoid local timezone shifts.
    // Expecting date/startDate/endDate in YYYY-MM-DD format.
    if (date) {
      // create a Date at UTC midnight for the provided date
      const parts = (date as string).split('-').map((p) => parseInt(p, 10));
      if (parts.length === 3) {
        const [y, m, d] = parts;
        const utcDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
        where.date = utcDate;
      } else {
        const dObj = new Date(date as string);
        dObj.setUTCHours(0, 0, 0, 0);
        where.date = dObj;
      }
    } else if (startDate && endDate) {
      const sParts = (startDate as string).split('-').map((p) => parseInt(p, 10));
      const eParts = (endDate as string).split('-').map((p) => parseInt(p, 10));
      if (sParts.length === 3 && eParts.length === 3) {
        const sUtc = new Date(Date.UTC(sParts[0], sParts[1] - 1, sParts[2], 0, 0, 0, 0));
        const eUtc = new Date(Date.UTC(eParts[0], eParts[1] - 1, eParts[2], 23, 59, 59, 999));
        where.date = { gte: sUtc, lte: eUtc };
      } else {
        const s = new Date(startDate as string);
        s.setUTCHours(0, 0, 0, 0);
        const e = new Date(endDate as string);
        e.setUTCHours(23, 59, 59, 999);
        where.date = { gte: s, lte: e };
      }
    }

    // Project filtering
    if (projectId) {
      // Add a relation filter to only include surveyors with the specified projectId
      where.surveyor = where.surveyor || {};
      where.surveyor.projectId = parseInt(projectId as any, 10);
    }

    // Location filtering
    if (locationId) {
      // Add a relation filter to only include surveyors with the specified locationId
      where.surveyor = where.surveyor || {};
      where.surveyor.locationId = parseInt(locationId as any, 10);
    }

    const trips = await (prisma as any).bikeTrip.findMany({
      where,
      include: {
        surveyor: {
          select: { id: true, name: true, employeeId: true, mobileNumber: true, project: true, location: true },
        },
      },
      orderBy: [{ date: 'desc' }],
    });

    return trips;
  }

  static async setFinalKm(tripId: number, finalKm: number) {
    const updated = await (prisma as any).bikeTrip.update({
      where: { id: tripId },
      data: { finalKm, updatedAt: new Date() },
    });
    return updated;
  }

  static async toggleApproveTrip(tripId: number, adminId: number) {
    const trip = await (prisma as any).bikeTrip.findUnique({ where: { id: tripId } });
    if (!trip) throw new Error('Bike trip not found');

    if (!trip.isApproved) {
      const updated = await (prisma as any).bikeTrip.update({
        where: { id: tripId },
        data: { isApproved: true, approvedBy: adminId, approvedAt: new Date(), updatedAt: new Date() },
      });
      return updated;
    }

    const updated = await (prisma as any).bikeTrip.update({
      where: { id: tripId },
      data: { isApproved: false, approvedBy: null, approvedAt: null, updatedAt: new Date() },
    });
    return updated;
  }
}