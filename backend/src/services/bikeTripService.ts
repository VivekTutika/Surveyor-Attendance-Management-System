import { prisma } from '../config/db';

export interface BikeTripFilters {
  userId?: number;
  date?: string;
  startDate?: string;
  endDate?: string;
}

export class BikeTripService {
  // Upsert or create a BikeTrip record based on a bike meter reading
  static async upsertTripForReading(reading: any) {
    const { id: readingId, userId, date, type, kmReading } = reading;

    // Normalize date (ensure date-only)
    const tripDate = new Date(date);
    tripDate.setHours(0, 0, 0, 0);

    // Perform transactional upsert/link to avoid races
    const result = await prisma.$transaction(async (tx) => {
      const existing = await (tx as any).bikeTrip.findUnique({
        where: { surveyorId_date: { surveyorId: userId, date: tripDate } },
      });

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
          data,
        });

        return updated;
      }

      // Create a new trip
      const createData: any = {
        surveyorId: userId,
        date: tripDate,
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

      const created = await (tx as any).bikeTrip.create({ data: createData });
      return created;
    });

    return result;
  }

  static async getTrips(filters: BikeTripFilters, userRole: string, requestingUserId: number) {
    const { userId, date, startDate, endDate } = filters;

    const where: any = {};

    if (userRole === 'SURVEYOR') {
      where.surveyorId = requestingUserId;
    } else if (userId) {
      where.surveyorId = userId;
    }

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      where.date = d;
    } else if (startDate && endDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      where.date = { gte: s, lte: e };
    }

    const trips = await (prisma as any).bikeTrip.findMany({
      where,
      include: {
        surveyor: {
          select: { id: true, name: true, mobileNumber: true, project: true, location: true },
        },
      },
      orderBy: [{ date: 'desc' }],
    });

    return trips;
  }

  static async setFinalKm(tripId: number, finalKm: number) {
    const updated = await (prisma as any).bikeTrip.update({
      where: { id: tripId },
      data: { finalKm },
    });
    return updated;
  }

  static async toggleApproveTrip(tripId: number, adminId: number) {
    const trip = await (prisma as any).bikeTrip.findUnique({ where: { id: tripId } });
    if (!trip) throw new Error('Bike trip not found');

    if (!trip.isApproved) {
      const updated = await (prisma as any).bikeTrip.update({
        where: { id: tripId },
        data: { isApproved: true, approvedBy: adminId, approvedAt: new Date() },
      });
      return updated;
    }

    const updated = await (prisma as any).bikeTrip.update({
      where: { id: tripId },
      data: { isApproved: false, approvedBy: null, approvedAt: null },
    });
    return updated;
  }
}
