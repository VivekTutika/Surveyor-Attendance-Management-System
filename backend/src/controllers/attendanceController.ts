import { Request, Response } from 'express';
import multer from 'multer';
import { AttendanceService } from '../services/attendanceService';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { asyncHandler } from '../middlewares/errorHandler';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

export class AttendanceController {
  // Multer middleware for photo upload
  static uploadMiddleware = upload.single('photo');

  // POST /api/attendance/mark - Mark attendance with photo and GPS
  static markAttendance = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { type, latitude, longitude } = req.body;
    const photoFile = req.file;

    if (!photoFile) {
      return sendError(res, 'Photo is required for attendance marking', 400);
    }

    if (!photoFile.buffer) {
      return sendError(res, 'Invalid photo file', 400);
    }

    const attendanceData = {
      userId,
      type,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      photoBuffer: photoFile.buffer,
    };

    const attendance = await AttendanceService.markAttendance(attendanceData);

    sendCreated(res, 'Attendance marked successfully', attendance);
  });

  // GET /api/attendance/list - Get attendance records with filters
  static getAttendanceList = asyncHandler(async (req: Request, res: Response) => {
    const userRole = req.user!.role;
    const requestingUserId = req.user!.id;
    const filters = req.query as any;

    const attendanceRecords = await AttendanceService.getAttendanceRecords(
      filters,
      userRole,
      requestingUserId
    );

    sendSuccess(res, 'Attendance records retrieved successfully', attendanceRecords);
  });

  // GET /api/attendance/today - Get today's attendance status
  static getTodayStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.query.userId as string || req.user!.id;

    // If not admin and trying to access another user's data
    if (req.user!.role !== 'ADMIN' && userId !== req.user!.id) {
      return sendError(res, 'Access denied. You can only view your own attendance.', 403);
    }

    const status = await AttendanceService.getTodayAttendanceStatus(userId);

    sendSuccess(res, 'Today\'s attendance status retrieved successfully', status);
  });

  // GET /api/attendance/summary - Get attendance summary for date range
  static getAttendanceSummary = asyncHandler(async (req: Request, res: Response) => {
    const { userId, startDate, endDate } = req.query as any;
    const targetUserId = userId || req.user!.id;

    // If not admin and trying to access another user's data
    if (req.user!.role !== 'ADMIN' && targetUserId !== req.user!.id) {
      return sendError(res, 'Access denied. You can only view your own attendance.', 403);
    }

    if (!startDate || !endDate) {
      return sendError(res, 'Start date and end date are required', 400);
    }

    const summary = await AttendanceService.getAttendanceSummary(
      targetUserId,
      startDate,
      endDate
    );

    sendSuccess(res, 'Attendance summary retrieved successfully', summary);
  });

  // DELETE /api/attendance/:id - Delete attendance record (Admin only)
  static deleteAttendance = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await AttendanceService.deleteAttendance(id);

    sendSuccess(res, result.message);
  });
}