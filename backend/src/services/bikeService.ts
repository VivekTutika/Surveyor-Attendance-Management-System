import { AttendanceType } from '@prisma/client';
import { prisma } from '../config/db';
import { BikeTripService } from './bikeTripService';
import { uploadAttendancePhoto } from '../config/cloudinary';

export interface UploadBikeMeterData {
  userId: number;  // Changed from string to number
  type: AttendanceType;
  photoBuffer: Buffer;
  kmReading?: number;
}

export interface BikeMeterFilters {
  userId?: number;  // Changed from string to number
  date?: string;
  startDate?: string;
  endDate?: string;
  type?: AttendanceType;
}

export class BikeService {
  // Upload bike meter reading with photo
  static async uploadBikeMeterReading(data: UploadBikeMeterData) {
    const { userId, type, photoBuffer, kmReading } = data;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
      // swallow errors to avoid breaking upload; log in future
      // console.error('BikeTrip upsert failed', err);
    }

    return bikeMeterReading;
  }

  // Get bike meter readings with filters
  static async getBikeMeterReadings(filters: BikeMeterFilters, userRole: string, requestingUserId: number) {  // Changed from string to number
    const { userId, date, startDate, endDate, type } = filters;

    // Build where clause
    const where: any = {};

    // Role-based filtering
    if (userRole === 'SURVEYOR') {
      where.userId = requestingUserId; // Surveyors can only see their own records
    } else if (userId) {
      where.userId = userId; // Admins can filter by specific user
    }

    // Date filtering
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      where.date = targetDate;
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.date = {
        gte: start,
        lte: end,
      };
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      where.date = { gte: start };
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.date = { lte: end };
    }

    // Type filtering
    if (type) {
      where.type = type;
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    const updatedReading = await prisma.bikeMeterReading.update({
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

    // After updating the km reading, upsert bike trip to recompute computedKm/finalKm
    try {
      void BikeTripService.upsertTripForReading(updatedReading as any);
    } catch (err) {
      // swallow for now
    }

    return updatedReading;
  }

  // Clear only the kmReading for a bike meter reading (Admin only) - logical revert
  static async clearKmReading(readingId: string) {
    const bikeMeterReading = await prisma.bikeMeterReading.findUnique({
      where: { id: readingId },
    })

    if (!bikeMeterReading) {
      throw new Error('Bike meter reading not found')
    }

    const updatedReading = await prisma.bikeMeterReading.update({
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
    })

    // After clearing the km reading, upsert bike trip to recompute computedKm/finalKm
    try {
      void BikeTripService.upsertTripForReading(updatedReading as any)
    } catch (err) {
      // swallow for now
    }

    return updatedReading
  }

  // Get bike meter summary for a user in a date range
  static async getBikeMeterSummary(userId: number, startDate: string, endDate: string) {  // Changed from string to number
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const readings = await prisma.bikeMeterReading.findMany({
      where: {
        userId,  // Now correctly typed as number
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Group by date
    const summary: { [date: string]: any } = {};
    readings.forEach(reading => {
      const dateKey = reading.date.toISOString().split('T')[0];
      if (!summary[dateKey]) {
        summary[dateKey] = {
          date: dateKey,
          morning: null,
          evening: null,
        };
      }
      summary[dateKey][reading.type.toLowerCase()] = {
        time: reading.capturedAt.toISOString(),
        photoPath: reading.photoPath,
        kmReading: reading.kmReading,
      };
    });

    return Object.values(summary);
  }

  // Delete bike meter reading (Admin only)
  static async deleteBikeMeterReading(readingId: string) {
    const reading = await prisma.bikeMeterReading.findUnique({
      where: { id: readingId },
    });

    if (!reading) {
      throw new Error('Bike meter reading not found');
    }

    await prisma.bikeMeterReading.delete({
      where: { id: readingId },
    });

    return { message: 'Bike meter reading deleted successfully' };
  }
}