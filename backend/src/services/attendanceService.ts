import { AttendanceType } from '@prisma/client';
import { prisma } from '../config/db';
import { uploadAttendancePhoto } from '../config/cloudinary';

export interface MarkAttendanceData {
  userId: string;
  type: AttendanceType;
  latitude: number;
  longitude: number;
  photoBuffer: Buffer;
}

export interface AttendanceFilters {
  userId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  type?: AttendanceType;
}

export class AttendanceService {
  // Mark attendance with selfie and GPS
  static async markAttendance(data: MarkAttendanceData) {
    const { userId, type, latitude, longitude, photoBuffer } = data;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if attendance already marked for this type today
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_date_type: {
          userId,
          date: today,
          type,
        },
      },
    });

    if (existingAttendance) {
      throw new Error(`${type} attendance already marked for today`);
    }

    // Upload photo to Cloudinary
    const photoUrl = await uploadAttendancePhoto(photoBuffer, userId, 'attendance');

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId,
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

  // Get attendance records with filters
  static async getAttendanceRecords(filters: AttendanceFilters, userRole: string, requestingUserId: string) {
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

    const attendanceRecords = await prisma.attendance.findMany({
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

    return attendanceRecords;
  }

  // Get today's attendance status for a user
  static async getTodayAttendanceStatus(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId,
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
  static async getAttendanceSummary(userId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId,
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
}