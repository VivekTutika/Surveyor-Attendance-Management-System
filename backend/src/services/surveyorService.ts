import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../config/db';

export interface CreateSurveyorData {
  name: string;
  mobileNumber: string;
  password: string;
  project?: string;
  location?: string;
}

export interface UpdateSurveyorData {
  name?: string;
  mobileNumber?: string;
  project?: string;
  location?: string;
  isActive?: boolean;
}

export interface SurveyorFilters {
  search?: string;
  project?: string;
  location?: string;
  isActive?: boolean;
  role?: Role;
}

export class SurveyorService {
  // Create new surveyor (Admin only)
  static async createSurveyor(data: CreateSurveyorData) {
    const { name, mobileNumber, password, project, location } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { mobileNumber },
    });

    if (existingUser) {
      throw new Error('User with this mobile number already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create surveyor
    const surveyor = await prisma.user.create({
      data: {
        name,
        mobileNumber,
        passwordHash,
        role: Role.SURVEYOR,
        project,
        location,
      },
      select: {
        id: true,
        name: true,
        mobileNumber: true,
        role: true,
        project: true,
        location: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return surveyor;
  }

  // Get all surveyors with filters
  static async getSurveyors(filters: SurveyorFilters) {
    const { search, project, location, isActive, role } = filters;

    const where: any = {};

    // Role filter (default to surveyors, but allow admin filtering)
    if (role) {
      where.role = role;
    } else {
      where.role = Role.SURVEYOR;
    }

    // Search filter (name or mobile number)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { mobileNumber: { contains: search } },
      ];
    }

    // Project filter
    if (project) {
      where.project = { contains: project, mode: 'insensitive' };
    }

    // Location filter
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // Active status filter
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const surveyors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        mobileNumber: true,
        role: true,
        project: true,
        location: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            attendances: true,
            bikeMeterReadings: true,
          },
        },
      },
      orderBy: [
        { isActive: 'desc' },
        { name: 'asc' },
      ],
    });

    return surveyors;
  }

  // Get surveyor by ID
  static async getSurveyorById(surveyorId: string) {
    const surveyor = await prisma.user.findUnique({
      where: { id: surveyorId },
      select: {
        id: true,
        name: true,
        mobileNumber: true,
        role: true,
        project: true,
        location: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            attendances: true,
            bikeMeterReadings: true,
          },
        },
      },
    });

    if (!surveyor) {
      throw new Error('Surveyor not found');
    }

    return surveyor;
  }

  // Update surveyor (Admin only)
  static async updateSurveyor(surveyorId: string, updateData: UpdateSurveyorData) {
    const { name, mobileNumber, project, location, isActive } = updateData;

    // Check if surveyor exists
    const existingSurveyor = await prisma.user.findUnique({
      where: { id: surveyorId },
    });

    if (!existingSurveyor) {
      throw new Error('Surveyor not found');
    }

    // If updating mobile number, check for conflicts
    if (mobileNumber && mobileNumber !== existingSurveyor.mobileNumber) {
      const conflictingUser = await prisma.user.findUnique({
        where: { mobileNumber },
      });

      if (conflictingUser) {
        throw new Error('Mobile number already exists');
      }
    }

    // Update surveyor
    const updatedSurveyor = await prisma.user.update({
      where: { id: surveyorId },
      data: {
        ...(name && { name }),
        ...(mobileNumber && { mobileNumber }),
        ...(project !== undefined && { project }),
        ...(location !== undefined && { location }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
      select: {
        id: true,
        name: true,
        mobileNumber: true,
        role: true,
        project: true,
        location: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedSurveyor;
  }

  // Delete surveyor (Admin only)
  static async deleteSurveyor(surveyorId: string) {
    // Check if surveyor exists
    const surveyor = await prisma.user.findUnique({
      where: { id: surveyorId },
    });

    if (!surveyor) {
      throw new Error('Surveyor not found');
    }

    if (surveyor.role === Role.ADMIN) {
      throw new Error('Cannot delete admin users');
    }

    // Delete surveyor (this will cascade to delete attendance and bike meter readings)
    await prisma.user.delete({
      where: { id: surveyorId },
    });

    return { message: 'Surveyor deleted successfully' };
  }

  // Reset surveyor password (Admin only)
  static async resetSurveyorPassword(surveyorId: string, newPassword: string) {
    const surveyor = await prisma.user.findUnique({
      where: { id: surveyorId },
    });

    if (!surveyor) {
      throw new Error('Surveyor not found');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: surveyorId },
      data: { passwordHash },
    });

    return { message: 'Password reset successfully' };
  }

  // Get surveyor statistics
  static async getSurveyorStatistics(surveyorId: string, startDate?: string, endDate?: string) {
    const surveyor = await prisma.user.findUnique({
      where: { id: surveyorId },
      select: {
        id: true,
        name: true,
        mobileNumber: true,
        project: true,
        location: true,
      },
    });

    if (!surveyor) {
      throw new Error('Surveyor not found');
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.date = { gte: start, lte: end };
    }

    // Get attendance statistics
    const attendanceStats = await prisma.attendance.groupBy({
      by: ['type'],
      where: {
        userId: surveyorId,
        ...dateFilter,
      },
      _count: { type: true },
    });

    // Get bike meter statistics
    const bikeMeterStats = await prisma.bikeMeterReading.groupBy({
      by: ['type'],
      where: {
        userId: surveyorId,
        ...dateFilter,
      },
      _count: { type: true },
    });

    return {
      surveyor,
      statistics: {
        attendance: {
          morning: attendanceStats.find(stat => stat.type === 'MORNING')?._count.type || 0,
          evening: attendanceStats.find(stat => stat.type === 'EVENING')?._count.type || 0,
        },
        bikeMeter: {
          morning: bikeMeterStats.find(stat => stat.type === 'MORNING')?._count.type || 0,
          evening: bikeMeterStats.find(stat => stat.type === 'EVENING')?._count.type || 0,
        },
      },
      dateRange: { startDate, endDate },
    };
  }
}