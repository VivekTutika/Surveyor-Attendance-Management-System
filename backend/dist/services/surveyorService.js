"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyorService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const db_1 = require("../config/db");
class SurveyorService {
    // Create new surveyor (Admin only)
    static async createSurveyor(data) {
        const { name, mobileNumber, password, project, location } = data;
        // Check if user already exists
        const existingUser = await db_1.prisma.user.findUnique({
            where: { mobileNumber },
        });
        if (existingUser) {
            throw new Error('User with this mobile number already exists');
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        // Create surveyor
        const surveyor = await db_1.prisma.user.create({
            data: {
                name,
                mobileNumber,
                passwordHash,
                role: client_1.Role.SURVEYOR,
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
    static async getSurveyors(filters) {
        const { search, project, location, isActive, role } = filters;
        const where = {};
        // Role filter (default to surveyors, but allow admin filtering)
        if (role) {
            where.role = role;
        }
        else {
            where.role = client_1.Role.SURVEYOR;
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
        const surveyors = await db_1.prisma.user.findMany({
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
    static async getSurveyorById(surveyorId) {
        const surveyor = await db_1.prisma.user.findUnique({
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
    static async updateSurveyor(surveyorId, updateData) {
        const { name, mobileNumber, project, location, isActive } = updateData;
        // Check if surveyor exists
        const existingSurveyor = await db_1.prisma.user.findUnique({
            where: { id: surveyorId },
        });
        if (!existingSurveyor) {
            throw new Error('Surveyor not found');
        }
        // If updating mobile number, check for conflicts
        if (mobileNumber && mobileNumber !== existingSurveyor.mobileNumber) {
            const conflictingUser = await db_1.prisma.user.findUnique({
                where: { mobileNumber },
            });
            if (conflictingUser) {
                throw new Error('Mobile number already exists');
            }
        }
        // Update surveyor
        const updatedSurveyor = await db_1.prisma.user.update({
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
    static async deleteSurveyor(surveyorId) {
        // Check if surveyor exists
        const surveyor = await db_1.prisma.user.findUnique({
            where: { id: surveyorId },
        });
        if (!surveyor) {
            throw new Error('Surveyor not found');
        }
        if (surveyor.role === client_1.Role.ADMIN) {
            throw new Error('Cannot delete admin users');
        }
        // Delete surveyor (this will cascade to delete attendance and bike meter readings)
        await db_1.prisma.user.delete({
            where: { id: surveyorId },
        });
        return { message: 'Surveyor deleted successfully' };
    }
    // Reset surveyor password (Admin only)
    static async resetSurveyorPassword(surveyorId, newPassword) {
        const surveyor = await db_1.prisma.user.findUnique({
            where: { id: surveyorId },
        });
        if (!surveyor) {
            throw new Error('Surveyor not found');
        }
        // Hash new password
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        // Update password
        await db_1.prisma.user.update({
            where: { id: surveyorId },
            data: { passwordHash },
        });
        return { message: 'Password reset successfully' };
    }
    // Get surveyor statistics
    static async getSurveyorStatistics(surveyorId, startDate, endDate) {
        const surveyor = await db_1.prisma.user.findUnique({
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
        const dateFilter = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.date = { gte: start, lte: end };
        }
        // Get attendance statistics
        const attendanceStats = await db_1.prisma.attendance.groupBy({
            by: ['type'],
            where: {
                userId: surveyorId,
                ...dateFilter,
            },
            _count: { type: true },
        });
        // Get bike meter statistics
        const bikeMeterStats = await db_1.prisma.bikeMeterReading.groupBy({
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
exports.SurveyorService = SurveyorService;
//# sourceMappingURL=surveyorService.js.map