"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bikeController_1 = require("../controllers/bikeController");
const validateRequest_1 = require("../middlewares/validateRequest");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Upload bike meter reading (Surveyors and Admins)
router.post('/upload', bikeController_1.BikeController.uploadMiddleware, (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.uploadBikeMeter), bikeController_1.BikeController.uploadBikeMeter);
// Get bike meter readings with filters
router.get('/list', (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.dateQuery), bikeController_1.BikeController.getBikeMeterList);
// Get today's bike meter reading status
router.get('/today', bikeController_1.BikeController.getTodayStatus);
// Get bike meter summary for date range
router.get('/summary', (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.dateQuery), bikeController_1.BikeController.getBikeMeterSummary);
// Update KM reading manually (Admin only)
router.put('/:id/km-reading', authMiddleware_1.adminMiddleware, (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.idParam), bikeController_1.BikeController.updateKmReading);
// Delete bike meter reading (Admin only)
router.delete('/:id', authMiddleware_1.adminMiddleware, (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.idParam), bikeController_1.BikeController.deleteBikeMeterReading);
exports.default = router;
//# sourceMappingURL=bikeRoutes.js.map