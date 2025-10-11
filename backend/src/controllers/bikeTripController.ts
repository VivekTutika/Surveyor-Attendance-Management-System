import { Request, Response } from 'express';
import { BikeTripService } from '../services/bikeTripService';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../middlewares/errorHandler';

export class BikeTripController {
  static listTrips = asyncHandler(async (req: Request, res: Response) => {
    const userRole = req.user!.role;
    const requestingUserId = req.user!.id;
    const rawFilters = (req as any).validatedQuery || req.query;
    const filters: any = { ...rawFilters };
    if (rawFilters && rawFilters.userId) {
      // validatedQuery may have userId as UUID/string; coerce to int when possible
      const asInt = parseInt(rawFilters.userId as string);
      if (!isNaN(asInt)) filters.userId = asInt;
    }

    const trips = await BikeTripService.getTrips(filters, userRole, requestingUserId);
    sendSuccess(res, 'Bike trips retrieved successfully', trips);
  });

  static setFinalKm = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { finalKm } = req.body;

    if (finalKm == null || isNaN(finalKm)) {
      return sendError(res, 'Valid finalKm is required', 400);
    }

    const updated = await BikeTripService.setFinalKm(parseInt(id), parseFloat(finalKm));
    sendSuccess(res, 'Final KM updated successfully', updated);
  });

  static toggleApprove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = req.user!.id;

    const updated = await BikeTripService.toggleApproveTrip(parseInt(id), adminId);
    sendSuccess(res, 'Bike trip approval toggled successfully', updated);
  });
}
