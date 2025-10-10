"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const db_1 = require("../config/db");
const cloudinary_1 = require("../config/cloudinary");
class AttendanceService {
    // Mark attendance with selfie and GPS
    static async markAttendance(data) {
        const { userId, type, latitude, longitude, photoBuffer } = data;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Check if attendance already marked for this type today
        const existingAttendance = await db_1.prisma.attendance.findUnique({
            where: {
                userId_date_type: {
                    userId, // Now correctly typed as number
                    date: today,
                    type,
                },
            },
        });
        if (existingAttendance) {
            throw new Error(`${type} attendance already marked for today`);
        }
        // Upload photo to Cloudinary
        const photoUrl = await (0, cloudinary_1.uploadAttendancePhoto)(photoBuffer, userId.toString(), 'attendance'); // Convert to string for Cloudinary
        // Create attendance record
        const attendance = await db_1.prisma.attendance.create({
            data: {
                userId, // Now correctly typed as number
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
    // Get attendance records with filters and pagination
    static async getAttendanceRecords(filters, userRole, requestingUserId) {
        const { userId, date, startDate, endDate, type, page = 1, limit = 10 } = filters;
        // Build where clause
        const where = {};
        // Role-based filtering
        if (userRole === 'SURVEYOR') {
            where.userId = requestingUserId; // Surveyors can only see their own records
        }
        else if (userId) {
            where.userId = userId; // Admins can filter by specific user
        }
        // Date filtering
        if (date) {
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            where.date = targetDate;
        }
        else if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            where.date = {
                gte: start,
                lte: end,
            };
        }
        else if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            where.date = { gte: start };
        }
        else if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            where.date = { lte: end };
        }
        // Type filtering
        if (type) {
            where.type = type;
        }
        // Get total count for pagination
        const total = await db_1.prisma.attendance.count({ where });
        // Calculate pagination
        const skip = (page - 1) * limit;
        const pages = Math.ceil(total / limit);
        const attendanceRecords = await db_1.prisma.attendance.findMany({
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
    static async getTodayAttendanceStatus(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendanceRecords = await db_1.prisma.attendance.findMany({
            where: {
                userId, // Now correctly typed as number
                date: today,
            },
        });
        const status = {
            date: today.toISOString().split('T')[0],
            morningMarked: false,
            eveningMarked: false,
            morningTime: null,
            eveningTime: null,
        };
        attendanceRecords.forEach(record => {
            if (record.type === 'MORNING') {
                status.morningMarked = true;
                status.morningTime = record.capturedAt.toISOString();
            }
            else if (record.type === 'EVENING') {
                status.eveningMarked = true;
                status.eveningTime = record.capturedAt.toISOString();
            }
        });
        return status;
    }
    // Get attendance summary for a user in a date range
    static async getAttendanceSummary(userId, startDate, endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const attendanceRecords = await db_1.prisma.attendance.findMany({
            where: {
                userId, // Now correctly typed as number
                date: {
                    gte: start,
                    lte: end,
                },
            },
            orderBy: { date: 'asc' },
        });
        // Group by date
        const summary = {};
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
    static async deleteAttendance(attendanceId) {
        const attendance = await db_1.prisma.attendance.findUnique({
            where: { id: attendanceId },
        });
        if (!attendance) {
            throw new Error('Attendance record not found');
        }
        await db_1.prisma.attendance.delete({
            where: { id: attendanceId },
        });
        return { message: 'Attendance record deleted successfully' };
    }
}
exports.AttendanceService = AttendanceService;
//# sourceMappingURL=attendanceService.js.map