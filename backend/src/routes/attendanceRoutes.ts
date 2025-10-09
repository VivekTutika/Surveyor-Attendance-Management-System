import { Router } from 'express';
import { AttendanceController } from '../controllers/attendanceController';
import { validateRequest, schemas } from '../middlewares/validateRequest';
import { adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Mark attendance (Surveyors and Admins)
router.post('/mark', 
  AttendanceController.uploadMiddleware,
  validateRequest(schemas.markAttendance),
  AttendanceController.markAttendance
);

// Get attendance records with filters
router.get('/list',
  validateRequest(schemas.dateQuery),
  AttendanceController.getAttendanceList
);

// Get today's attendance status
router.get('/today', AttendanceController.getTodayStatus);

// Get attendance summary for date range
router.get('/summary',
  validateRequest(schemas.dateQuery),
  AttendanceController.getAttendanceSummary
);

// Delete attendance record (Admin only)
router.delete('/:id',
  adminMiddleware,
  validateRequest(schemas.idParam),
  AttendanceController.deleteAttendance
);

export default router;