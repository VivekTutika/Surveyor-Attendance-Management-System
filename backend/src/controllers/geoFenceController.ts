import { Request, Response } from 'express';
import { GeoFenceService } from '../services/geoFenceService';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { asyncHandler } from '../middlewares/errorHandler';

export class GeoFenceController {
  // POST /api/geo-fence/:surveyorId - Create or update geo-fence (Admin only)
  static createOrUpdateGeoFence = asyncHandler(async (req: Request, res: Response) => {
    const { surveyorId } = req.params;
    const { coordinates, isActive } = req.body;

    if (!coordinates || !Array.isArray(coordinates)) {
      return sendError(res, 'Coordinates array is required', 400);
    }

    const geoFenceData = {
      surveyorId,
      coordinates,
      isActive,
    };

    const geoFence = await GeoFenceService.createOrUpdateGeoFence(geoFenceData);

    sendCreated(res, 'Geo-fence created/updated successfully', geoFence);
  });

  // GET /api/geo-fence/:surveyorId - Get geo-fence for a surveyor
  static getGeoFence = asyncHandler(async (req: Request, res: Response) => {
    const { surveyorId } = req.params;

    const geoFence = await GeoFenceService.getGeoFence(surveyorId);

    sendSuccess(res, 'Geo-fence retrieved successfully', geoFence);
  });

  // PUT /api/geo-fence/:surveyorId - Update geo-fence (Admin only)
  static updateGeoFence = asyncHandler(async (req: Request, res: Response) => {
    const { surveyorId } = req.params;
    const updateData = req.body;

    const updatedGeoFence = await GeoFenceService.updateGeoFence(surveyorId, updateData);

    sendSuccess(res, 'Geo-fence updated successfully', updatedGeoFence);
  });

  // DELETE /api/geo-fence/:surveyorId - Delete geo-fence (Admin only)
  static deleteGeoFence = asyncHandler(async (req: Request, res: Response) => {
    const { surveyorId } = req.params;

    const result = await GeoFenceService.deleteGeoFence(surveyorId);

    sendSuccess(res, result.message);
  });

  // GET /api/geo-fence - Get all geo-fences (Admin only)
  static getAllGeoFences = asyncHandler(async (req: Request, res: Response) => {
    const geoFences = await GeoFenceService.getAllGeoFences();

    sendSuccess(res, 'Geo-fences retrieved successfully', geoFences);
  });

  // PATCH /api/geo-fence/:surveyorId/toggle - Toggle geo-fence status (Admin only)
  static toggleGeoFenceStatus = asyncHandler(async (req: Request, res: Response) => {
    const { surveyorId } = req.params;

    const updatedGeoFence = await GeoFenceService.toggleGeoFenceStatus(surveyorId);

    sendSuccess(res, 'Geo-fence status toggled successfully', updatedGeoFence);
  });
}