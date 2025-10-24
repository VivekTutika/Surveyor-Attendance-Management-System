import { AttendanceType } from '@prisma/client';
import { prisma } from '../config/db';
import { BikeTripService } from './bikeTripService';
import { uploadAttendancePhoto } from '../config/cloudinary';
import { startOfDayUTC, endOfDayUTC, startOfTodayUTC } from '../utils/dateUtils';

export interface UploadBikeMeterData {
  userId: number;  // Changed from string to number
  type: AttendanceType;
  photoBuffer: Buffer;
  kmReading?: number;
}

export interface BikeMeterFilters {
  userId?: number | string;  // Accept numeric string from query params or number
  date?: string;
  startDate?: string;
  endDate?: string;
  type?: AttendanceType;
  projectId?: number;
  locationId?: number;
}

export class BikeService {
  // Upload bike meter reading with photo
  static async uploadBikeMeterReading(data: UploadBikeMeterData) {
    const { userId, type, photoBuffer, kmReading } = data;
    
  const today = startOfTodayUTC();

    // Ensure user is active
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new Error('Surveyor is inactive or not found');
    }

    // Ensure user has a bike before allowing bike meter uploads
    if ((user as any).hasBike === false) {
      throw new Error('Surveyor does not have a bike');
    }

    // Check if bike meter reading already uploaded for this type today
    const existingReading = await prisma.bikeMeterReading.findUnique({
      where: {
        userId_date_type: {
          userId,  // Now correctly typed as number
          date: today,
          type,
        },
      },
    });

    if (existingReading) {
      throw new Error(`${type} bike meter reading already uploaded for today`);
    }

    // Upload photo to Cloudinary
    const photoUrl = await uploadAttendancePhoto(photoBuffer, userId.toString(), 'bike-meter');  // Convert to string for Cloudinary

    // Create bike meter reading record
    const bikeMeterReading = await prisma.bikeMeterReading.create({
      data: {
        userId,  // Now correctly typed as number
        type,
        date: today,
        photoPath: photoUrl,
        kmReading,
        capturedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            mobileNumber: true,
            project: true,
            location: true,
          },
        },
      },
    });

    // Upsert corresponding bike trip record asynchronously (don't block primary flow)
    try {
      // pass the created reading to the trip service to link/create trips
      void BikeTripService.upsertTripForReading(bikeMeterReading as any);
    } catch (err) {
      // log errors to help with debugging
      console.error('BikeTrip upsert failed', err);
    }

    return bikeMeterReading;
  }

  // Get bike meter readings with filters
  static async getBikeMeterReadings(filters: BikeMeterFilters, userRole: string, requestingUserId: number) {  // Changed from string to number
    const { userId, date, startDate, endDate, type, projectId, locationId } = filters;

    // Build where clause
    const where: any = {};

    // Normalize and validate userId filter (query params arrive as strings)
    let parsedUserId: number | undefined;
    if (userId !== undefined && userId !== null) {
      if (typeof userId === 'string') {
        const p = parseInt(userId, 10);
        if (Number.isNaN(p)) {
          throw new Error('Invalid userId filter');
        }
        parsedUserId = p;
      } else {
        parsedUserId = userId;
      }
    }

    // Role-based filtering
    if (userRole === 'SURVEYOR') {
      where.userId = requestingUserId; // Surveyors can only see their own records
    } else if (parsedUserId !== undefined) {
      where.userId = parsedUserId; // Admins can filter by specific user
    }

    // Date filtering
    if (date) {
      where.date = { gte: startOfDayUTC(date as any), lte: endOfDayUTC(date as any) }
    } else if (startDate && endDate) {
      where.date = { gte: startOfDayUTC(startDate as any), lte: endOfDayUTC(endDate as any) }
    } else if (startDate) {
      where.date = { gte: startOfDayUTC(startDate as any) }
    } else if (endDate) {
      where.date = { lte: endOfDayUTC(endDate as any) }
    }

    // Type filtering
    if (type) {
      where.type = type;
    }

    // Project filtering
    if (projectId) {
      // Add a relation filter to only include users with the specified projectId
      where.user = where.user || {};
      where.user.projectId = parseInt(projectId as any, 10);
    }

    // Location filtering
    if (locationId) {
      // Add a relation filter to only include users with the specified locationId
      where.user = where.user || {};
      where.user.locationId = parseInt(locationId as any, 10);
    }

    const bikeMeterReadings = await prisma.bikeMeterReading.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            mobileNumber: true,
            project: true,
            location: true,
          },
        },
      },
      orderBy: [
        { date: 'desc' },
        { type: 'asc' },
      ],
    });

    return bikeMeterReadings;
  }

  // Get today's bike meter reading status for a user
  static async getTodayBikeMeterStatus(userId: number) {  // Changed from string to number
  const today = startOfTodayUTC();

    const readings = await prisma.bikeMeterReading.findMany({
      where: {
        userId,  // Now correctly typed as number
        date: today,
      },
    });

    const status = {
      date: today.toISOString().split('T')[0],
      morningUploaded: false,
      eveningUploaded: false,
      morningTime: null as string | null,
      eveningTime: null as string | null,
      morningKm: null as number | null,
      eveningKm: null as number | null,
    };

    readings.forEach(reading => {
      if (reading.type === 'MORNING') {
        status.morningUploaded = true;
        status.morningTime = reading.capturedAt.toISOString();
        status.morningKm = reading.kmReading;
      } else if (reading.type === 'EVENING') {
        status.eveningUploaded = true;
        status.eveningTime = reading.capturedAt.toISOString();
        status.eveningKm = reading.kmReading;
      }
    });

    return status;
  }

  // Update KM reading manually (Admin only)
  static async updateKmReading(readingId: string, kmReading: number) {
    const bikeMeterReading = await prisma.bikeMeterReading.findUnique({
      where: { id: readingId },
    });

    if (!bikeMeterReading) {
      throw new Error('Bike meter reading not found');
    }

    const updated = await prisma.bikeMeterReading.update({
      where: { id: readingId },
      data: { kmReading },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            mobileNumber: true,
            project: true,
            location: true,
          },
        },
      },
    });

    // Update corresponding bike trip record with the new KM reading
    try {
      await BikeTripService.upsertTripForReading(updated);
    } catch (err) {
      console.error('Failed to update bike trip with new KM reading', err);
    }

    return updated;
  }

  // Get bike meter summary for date range
  static async getBikeMeterSummary(userId: number, startDate: string, endDate: string) {
    const start = startOfDayUTC(startDate);
    const end = endOfDayUTC(endDate);

    const readings = await prisma.bikeMeterReading.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate summary statistics
    let totalDistance = 0;
    let morningCount = 0;
    let eveningCount = 0;

    readings.forEach(reading => {
      if (reading.kmReading) {
        totalDistance += reading.kmReading;
      }
      if (reading.type === 'MORNING') {
        morningCount++;
      } else if (reading.type === 'EVENING') {
        eveningCount++;
      }
    });

    return {
      userId,
      startDate,
      endDate,
      totalReadings: readings.length,
      morningReadings: morningCount,
      eveningReadings: eveningCount,
      totalDistance,
      readings,
    };
  }

  // Delete bike meter reading (Admin only)
  static async deleteBikeMeterReading(readingId: string) {
    const bikeMeterReading = await prisma.bikeMeterReading.findUnique({
      where: { id: readingId },
    });

    if (!bikeMeterReading) {
      throw new Error('Bike meter reading not found');
    }

    await prisma.bikeMeterReading.delete({
      where: { id: readingId },
    });

    // Update corresponding bike trip record to remove the reading reference
    try {
      await BikeTripService.upsertTripForReading({
        ...bikeMeterReading,
        kmReading: null // Set kmReading to null to indicate deletion
      });
    } catch (err) {
      console.error('Failed to update bike trip after deleting bike meter reading', err);
    }

    return { message: 'Bike meter reading deleted successfully' };
  }

  // Clear KM reading (Admin only)
  static async clearKmReading(readingId: string) {
    const bikeMeterReading = await prisma.bikeMeterReading.findUnique({
      where: { id: readingId },
    });

    if (!bikeMeterReading) {
      throw new Error('Bike meter reading not found');
    }

    const updated = await prisma.bikeMeterReading.update({
      where: { id: readingId },
      data: { kmReading: null },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            mobileNumber: true,
            project: true,
            location: true,
          },
        },
      },
    });

    // Update corresponding bike trip record with the cleared KM reading
    try {
      await BikeTripService.upsertTripForReading(updated);
    } catch (err) {
      console.error('Failed to update bike trip with cleared KM reading', err);
    }

    return updated;
  }
}