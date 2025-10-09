import { Request, Response } from 'express';
import { LocationService } from '../services/locationService';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { asyncHandler } from '../middlewares/errorHandler';

export class LocationController {
  // POST /api/locations - Create new location (Admin only)
  static createLocation = asyncHandler(async (req: Request, res: Response) => {
    const locationData = req.body;

    const location = await LocationService.createLocation(locationData);

    sendCreated(res, 'Location created successfully', location);
  });

  // GET /api/locations - Get all locations (Admin only)
  static getLocations = asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query as any;

    const locations = await LocationService.getLocations(filters);

    sendSuccess(res, 'Locations retrieved successfully', locations);
  });

  // GET /api/locations/:id - Get location by ID (Admin only)
  static getLocationById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const location = await LocationService.getLocationById(parseInt(id));

    sendSuccess(res, 'Location retrieved successfully', location);
  });

  // PUT /api/locations/:id - Update location (Admin only)
  static updateLocation = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const updatedLocation = await LocationService.updateLocation(parseInt(id), updateData);

    sendSuccess(res, 'Location updated successfully', updatedLocation);
  });

  // DELETE /api/locations/:id - Delete location (Admin only)
  static deleteLocation = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await LocationService.deleteLocation(parseInt(id));

    sendSuccess(res, result.message);
  });

  // GET /api/locations/:id/users - Get users assigned to location (Admin only)
  static getLocationUsers = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const users = await LocationService.getLocationUsers(parseInt(id));

    sendSuccess(res, 'Location users retrieved successfully', users);
  });
}