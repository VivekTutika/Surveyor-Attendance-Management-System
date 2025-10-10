"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoFenceController = void 0;
const geoFenceService_1 = require("../services/geoFenceService");
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middlewares/errorHandler");
class GeoFenceController {
}
exports.GeoFenceController = GeoFenceController;
_a = GeoFenceController;
// POST /api/geo-fence/:surveyorId - Create or update geo-fence (Admin only)
GeoFenceController.createOrUpdateGeoFence = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { surveyorId } = req.params;
    const { coordinates, isActive } = req.body;
    if (!coordinates || !Array.isArray(coordinates)) {
        return (0, response_1.sendError)(res, 'Coordinates array is required', 400);
    }
    const geoFenceData = {
        surveyorId: parseInt(surveyorId), // Convert to number
        coordinates,
        isActive,
    };
    const geoFence = await geoFenceService_1.GeoFenceService.createOrUpdateGeoFence(geoFenceData);
    (0, response_1.sendCreated)(res, 'Geo-fence created/updated successfully', geoFence);
});
// GET /api/geo-fence/:surveyorId - Get geo-fence for a surveyor
GeoFenceController.getGeoFence = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { surveyorId } = req.params;
    const geoFence = await geoFenceService_1.GeoFenceService.getGeoFence(parseInt(surveyorId)); // Convert to number
    (0, response_1.sendSuccess)(res, 'Geo-fence retrieved successfully', geoFence);
});
// PUT /api/geo-fence/:surveyorId - Update geo-fence (Admin only)
GeoFenceController.updateGeoFence = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { surveyorId } = req.params;
    const updateData = req.body;
    const updatedGeoFence = await geoFenceService_1.GeoFenceService.updateGeoFence(parseInt(surveyorId), updateData); // Convert to number
    (0, response_1.sendSuccess)(res, 'Geo-fence updated successfully', updatedGeoFence);
});
// DELETE /api/geo-fence/:surveyorId - Delete geo-fence (Admin only)
GeoFenceController.deleteGeoFence = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { surveyorId } = req.params;
    const result = await geoFenceService_1.GeoFenceService.deleteGeoFence(parseInt(surveyorId)); // Convert to number
    (0, response_1.sendSuccess)(res, result.message);
});
// GET /api/geo-fence - Get all geo-fences (Admin only)
GeoFenceController.getAllGeoFences = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const geoFences = await geoFenceService_1.GeoFenceService.getAllGeoFences();
    (0, response_1.sendSuccess)(res, 'Geo-fences retrieved successfully', geoFences);
});
// PATCH /api/geo-fence/:surveyorId/toggle - Toggle geo-fence status (Admin only)
GeoFenceController.toggleGeoFenceStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { surveyorId } = req.params;
    const updatedGeoFence = await geoFenceService_1.GeoFenceService.toggleGeoFenceStatus(parseInt(surveyorId)); // Convert to number
    (0, response_1.sendSuccess)(res, 'Geo-fence status toggled successfully', updatedGeoFence);
});
//# sourceMappingURL=geoFenceController.js.map