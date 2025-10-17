import { AttendanceType } from '@prisma/client';
import { prisma } from '../config/db';
import { uploadAttendancePhoto } from '../config/cloudinary';
import { startOfDayUTC, endOfDayUTC, startOfTodayUTC } from '../utils/dateUtils';

export interface MarkAttendanceData {
  userId: number;  // Changed from string to number
  type: AttendanceType;
  latitude: number;
  longitude: number;
  photoBuffer: Buffer;
}

export interface AttendanceFilters {
  userId?: number;  // Changed from string to number
  date?: string;
  startDate?: string;
  endDate?: string;
  type?: AttendanceType;
  page?: number;
  limit?: number;
  projectId?: number;
  locationId?: number;
}

export interface PaginatedAttendanceResult {
  attendance: any[];
  total: number;
  page: number;
  pages: number;
}

export class AttendanceService {
  // Mark attendance with selfie and GPS
  static async markAttendance(data: MarkAttendanceData) {
    const { userId, type, latitude, longitude, photoBuffer } = data;
    
  const today = startOfTodayUTC();

    // Ensure user is active
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new Error('Surveyor is inactive or not found');
    }

    // Check if attendance already marked for this type today
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_date_type: {
          userId,  // Now correctly typed as number
          date: today,
          type,
        },
      },
    });

    if (existingAttendance) {
      throw new Error(`${type} attendance already marked for today`);
    }

    // Upload photo to Cloudinary
    const photoUrl = await uploadAttendancePhoto(photoBuffer, userId.toString(), 'attendance');  // Convert to string for Cloudinary

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId,  // Now correctly typed as number
        type,
        date: today,
        latitude,
        longitude,
        photoPath: photoUrl,
        capturedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            mobileNumber: true,
            project: true,
            location: true,
          },
        },
      },
    });

    return attendance;
  }

  // Get attendance records with filters and pagination
  static async getAttendanceRecords(filters: AttendanceFilters, userRole: string, requestingUserId: number) {  // Changed from string to number
    let { userId, date, startDate, endDate, type, page = 1, limit = 10, projectId, locationId } = filters as any;
    // Coerce userId which may come as a query string into a number for Prisma
    if (typeof userId === 'string') {
      const parsed = parseInt(userId, 10)
      userId = Number.isFinite(parsed) ? parsed : undefined
    }

    // Build where clause
    const where: any = {};

    // Role-based filtering
    if (userRole === 'SURVEYOR') {
      where.userId = requestingUserId; // Surveyors can only see their own records
    } else if (userId !== undefined && userId !== null) {
      where.userId = userId; // Admins can filter by specific user
    }

    // Date filtering
    if (date) {
      // exact date provided (YYYY-MM-DD) -> match that UTC day
      where.date = {
        gte: startOfDayUTC(date as any),
        lte: endOfDayUTC(date as any),
      }
    } else if (startDate && endDate) {
      where.date = {
        gte: startOfDayUTC(startDate as any),
        lte: endOfDayUTC(endDate as any),
      }
    } else if (startDate) {
      where.date = { gte: startOfDayUTC(startDate as any) };
    } else if (endDate) {
      where.date = { lte: endOfDayUTC(endDate as any) };
    }

    // Type filtering
    if (type) {
      where.type = type;
    }

    // Project filtering
    if (projectId) {
      // Add a relation filter to only include users with the specified projectId
      where.user = where.user || {};
      where.user.projectId = parseInt(projectId, 10);
    }

    // Location filtering
    if (locationId) {
      // Add a relation filter to only include users with the specified locationId
      where.user = where.user || {};
      where.user.locationId = parseInt(locationId, 10);
    }

  // Get total count for pagination
  const total = await prisma.attendance.count({ where });
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    const pages = Math.ceil(total / limit);

    const attendanceRecords = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            employeeId: true,
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
      skip,
      take: limit,
    });

    return {
      attendance: attendanceRecords,
      total,
      page,
      pages
    };
  }

  // Get today's attendance status for a user
  static async getTodayAttendanceStatus(userId: number) {  // Changed from string to number
    const today = startOfTodayUTC();

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId,  // Now correctly typed as number
        date: today,
      },
    });

    const status = {
      date: today.toISOString().split('T')[0],
      morningMarked: false,
      eveningMarked: false,
      morningTime: null as string | null,
      eveningTime: null as string | null,
    };

    attendanceRecords.forEach(record => {
      if (record.type === 'MORNING') {
        status.morningMarked = true;
        status.morningTime = record.capturedAt.toISOString();
      } else if (record.type === 'EVENING') {
        status.eveningMarked = true;
        status.eveningTime = record.capturedAt.toISOString();
      }
    });

    return status;
  }

  // Get attendance summary for a user in a date range
  static async getAttendanceSummary(userId: number, startDate: string, endDate: string) {  // Changed from string to number
    const start = startOfDayUTC(startDate);
    const end = endOfDayUTC(endDate);

    const attendanceRecords = await prisma.attendance.findMany({
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
    attendanceRecords.forEach(record => {
      const dateKey = record.date.toISOString().split('T')[0];
      if (!summary[dateKey]) {
        summary[dateKey] = {
          date: dateKey,
          morning: null,
          evening: null,
        };
      }
      summary[dateKey][record.type.toLowerCase()] = {
        time: record.capturedAt.toISOString(),
        latitude: record.latitude,
        longitude: record.longitude,
        photoPath: record.photoPath,
      };
    });

    return Object.values(summary);
  }

  // Delete attendance record (Admin only)
  static async deleteAttendance(attendanceId: string) {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    await prisma.attendance.delete({
      where: { id: attendanceId },
    });

    return { message: 'Attendance record deleted successfully' };
  }

  // Approve attendance (Admin only)
  static async approveAttendance(attendanceId: string, adminId: number) {
    const attendance = await prisma.attendance.findUnique({ where: { id: attendanceId } });

    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    // Toggle approval: if currently approved -> disapprove, else approve
    const isCurrentlyApproved = !!attendance.approved;

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: isCurrentlyApproved
        ? {
            approved: false,
            approvedBy: null,
            approvedAt: null,
          }
        : {
            approved: true,
            approvedBy: adminId,
            approvedAt: new Date(),
          },
      include: {
        user: {
          select: {
            id: true,
            employeeId: true,
            name: true,
            mobileNumber: true,
            project: true,
            location: true,
          },
        },
      },
    });

    return updated;
  }
}