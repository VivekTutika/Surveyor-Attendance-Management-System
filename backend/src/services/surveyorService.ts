import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../config/db';

export interface CreateSurveyorData {
  name: string;
  mobileNumber: string;
  employeeId: string;
  hasBike?: boolean;
  password: string;
  projectId?: number;
  locationId?: number;
}

export interface UpdateSurveyorData {
  employeeId?: string;
  name?: string;
  mobileNumber?: string;
  projectId?: number;
  locationId?: number;
  isActive?: boolean;
  hasBike?: boolean;
}

export interface SurveyorFilters {
  search?: string;
  projectId?: number;
  locationId?: number;
  isActive?: boolean;
  role?: Role;
}

export class SurveyorService {
  // Create new surveyor (Admin only)
  static async createSurveyor(data: CreateSurveyorData) {
    const { name, mobileNumber, password, projectId, locationId, employeeId } = data;

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
      // cast data to any to avoid transient type mismatch until prisma client is updated in every environment
      data: {
        name,
        mobileNumber,
        employeeId,
        hasBike: (data as any).hasBike ?? false,
        passwordHash,
        role: Role.SURVEYOR,
        projectId,
        locationId,
      } as any,
      // Cast select to any because generated Prisma client types may not yet include
      // the `hasBike` field. This preserves runtime selection while avoiding
      // TypeScript compile errors until prisma generate is run.
      select: {
        employeeId: true,
        id: true,
        name: true,
        mobileNumber: true,
        role: true,
        projectId: true,
        locationId: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
  isActive: true,
  hasBike: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return surveyor;
  }

  // Get all surveyors with filters
  static async getSurveyors(filters: SurveyorFilters) {
    const { search, projectId, locationId, isActive, role } = filters;

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
    if (projectId) {
      where.projectId = projectId;
    }

    // Location filter
    if (locationId) {
      where.locationId = locationId;
    }

    // Active status filter
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const surveyors = await prisma.user.findMany({
      where,
      select: {
        employeeId: true,
        id: true,
        name: true,
        mobileNumber: true,
        role: true,
        projectId: true,
        locationId: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        isActive: true,
  hasBike: true,
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
  static async getSurveyorById(surveyorId: number) {
    const surveyor = await prisma.user.findUnique({
      where: { id: surveyorId },
      select: {
        employeeId: true,
        id: true,
        name: true,
        mobileNumber: true,
        role: true,
        projectId: true,
        locationId: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        isActive: true,
  hasBike: true,
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
  static async updateSurveyor(surveyorId: number, updateData: UpdateSurveyorData) {
  const { name, mobileNumber, projectId, locationId, isActive, hasBike, employeeId } = updateData;

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
      data: ({
        ...(employeeId !== undefined && { employeeId }),
        ...(name && { name }),
        ...(mobileNumber && { mobileNumber }),
        ...(projectId !== undefined && { projectId }),
        ...(locationId !== undefined && { locationId }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(typeof hasBike === 'boolean' && { hasBike }),
      } as any),
      select: {
        employeeId: true,
        id: true,
        name: true,
        mobileNumber: true,
        role: true,
        projectId: true,
        locationId: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        isActive: true,
        hasBike: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedSurveyor;
  }

  // Delete surveyor (Admin only)
  static async deleteSurveyor(surveyorId: number) {
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
  static async resetSurveyorPassword(surveyorId: number, newPassword: string) {
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
  static async getSurveyorStatistics(surveyorId: number, startDate?: string, endDate?: string) {
    const surveyor = await prisma.user.findUnique({
      where: { id: surveyorId },
      select: {
        id: true,
        name: true,
        mobileNumber: true,
        projectId: true,
        locationId: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
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