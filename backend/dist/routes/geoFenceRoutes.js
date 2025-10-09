"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const geoFenceController_1 = require("../controllers/geoFenceController");
const validateRequest_1 = require("../middlewares/validateRequest");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Note: All geo-fence routes require admin privileges as this is a v2 feature
// For v1, these routes are available but the functionality is not actively used
// Get all geo-fences (Admin only)
router.get('/', authMiddleware_1.adminMiddleware, geoFenceController_1.GeoFenceController.getAllGeoFences);
// Get geo-fence for specific surveyor
router.get('/:surveyorId', (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.idParam), geoFenceController_1.GeoFenceController.getGeoFence);
// Create or update geo-fence (Admin only)
router.post('/:surveyorId', authMiddleware_1.adminMiddleware, (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.idParam), geoFenceController_1.GeoFenceController.createOrUpdateGeoFence);
// Update geo-fence (Admin only)
router.put('/:surveyorId', authMiddleware_1.adminMiddleware, (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.idParam), geoFenceController_1.GeoFenceController.updateGeoFence);
// Delete geo-fence (Admin only)
router.delete('/:surveyorId', authMiddleware_1.adminMiddleware, (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.idParam), geoFenceController_1.GeoFenceController.deleteGeoFence);
// Toggle geo-fence status (Admin only)
router.patch('/:surveyorId/toggle', authMiddleware_1.adminMiddleware, (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.idParam), geoFenceController_1.GeoFenceController.toggleGeoFenceStatus);
exports.default = router;
//# sourceMappingURL=geoFenceRoutes.js.map