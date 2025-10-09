"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendanceController_1 = require("../controllers/attendanceController");
const validateRequest_1 = require("../middlewares/validateRequest");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Mark attendance (Surveyors and Admins)
router.post('/mark', attendanceController_1.AttendanceController.uploadMiddleware, (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.markAttendance), attendanceController_1.AttendanceController.markAttendance);
// Get attendance records with filters
router.get('/list', (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.dateQuery), attendanceController_1.AttendanceController.getAttendanceList);
// Get today's attendance status
router.get('/today', attendanceController_1.AttendanceController.getTodayStatus);
// Get attendance summary for date range
router.get('/summary', (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.dateQuery), attendanceController_1.AttendanceController.getAttendanceSummary);
// Delete attendance record (Admin only)
router.delete('/:id', authMiddleware_1.adminMiddleware, (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.idParam), attendanceController_1.AttendanceController.deleteAttendance);
exports.default = router;
//# sourceMappingURL=attendanceRoutes.js.map