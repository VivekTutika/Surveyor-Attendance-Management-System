"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const multer_1 = __importDefault(require("multer"));
const attendanceService_1 = require("../services/attendanceService");
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middlewares/errorHandler");
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    },
});
class AttendanceController {
}
exports.AttendanceController = AttendanceController;
_a = AttendanceController;
// Multer middleware for photo upload
AttendanceController.uploadMiddleware = upload.single('photo');
// POST /api/attendance/mark - Mark attendance with photo and GPS
AttendanceController.markAttendance = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { type, latitude, longitude } = req.body;
    const photoFile = req.file;
    if (!photoFile) {
        return (0, response_1.sendError)(res, 'Photo is required for attendance marking', 400);
    }
    if (!photoFile.buffer) {
        return (0, response_1.sendError)(res, 'Invalid photo file', 400);
    }
    const attendanceData = {
        userId,
        type,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        photoBuffer: photoFile.buffer,
    };
    const attendance = await attendanceService_1.AttendanceService.markAttendance(attendanceData);
    (0, response_1.sendCreated)(res, 'Attendance marked successfully', attendance);
});
// GET /api/attendance/list - Get attendance records with filters
AttendanceController.getAttendanceList = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userRole = req.user.role;
    const requestingUserId = req.user.id;
    const filters = req.query;
    const attendanceRecords = await attendanceService_1.AttendanceService.getAttendanceRecords(filters, userRole, requestingUserId);
    (0, response_1.sendSuccess)(res, 'Attendance records retrieved successfully', attendanceRecords);
});
// GET /api/attendance/today - Get today's attendance status
AttendanceController.getTodayStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.query.userId ? parseInt(req.query.userId) : req.user.id;
    // If not admin and trying to access another user's data
    if (req.user.role !== 'ADMIN' && userId !== req.user.id) {
        return (0, response_1.sendError)(res, 'Access denied. You can only view your own attendance.', 403);
    }
    const status = await attendanceService_1.AttendanceService.getTodayAttendanceStatus(userId);
    (0, response_1.sendSuccess)(res, 'Today\'s attendance status retrieved successfully', status);
});
// GET /api/attendance/summary - Get attendance summary for date range
AttendanceController.getAttendanceSummary = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { userId, startDate, endDate } = req.query;
    const targetUserId = userId ? parseInt(userId) : req.user.id;
    // If not admin and trying to access another user's data
    if (req.user.role !== 'ADMIN' && targetUserId !== req.user.id) {
        return (0, response_1.sendError)(res, 'Access denied. You can only view your own attendance.', 403);
    }
    if (!startDate || !endDate) {
        return (0, response_1.sendError)(res, 'Start date and end date are required', 400);
    }
    const summary = await attendanceService_1.AttendanceService.getAttendanceSummary(targetUserId, startDate, endDate);
    (0, response_1.sendSuccess)(res, 'Attendance summary retrieved successfully', summary);
});
// DELETE /api/attendance/:id - Delete attendance record (Admin only)
AttendanceController.deleteAttendance = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await attendanceService_1.AttendanceService.deleteAttendance(id);
    (0, response_1.sendSuccess)(res, result.message);
});
//# sourceMappingURL=attendanceController.js.map