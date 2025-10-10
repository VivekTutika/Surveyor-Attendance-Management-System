import { Request, Response } from 'express';
import multer from 'multer';
import { BikeService } from '../services/bikeService';
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

export class BikeController {
  // Multer middleware for photo upload
  static uploadMiddleware = upload.single('photo');

  // POST /api/bike/upload - Upload bike meter reading with photo
  static uploadBikeMeter = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { type, kmReading } = req.body;
    const photoFile = req.file;

    if (!photoFile) {
      return sendError(res, 'Photo is required for bike meter reading', 400);
    }

    if (!photoFile.buffer) {
      return sendError(res, 'Invalid photo file', 400);
    }

    const bikeMeterData = {
      userId,
      type,
      photoBuffer: photoFile.buffer,
      kmReading: kmReading ? parseFloat(kmReading) : undefined,
    };

    const bikeMeterReading = await BikeService.uploadBikeMeterReading(bikeMeterData);

    sendCreated(res, 'Bike meter reading uploaded successfully', bikeMeterReading);
  });

  // GET /api/bike/list - Get bike meter readings with filters
  static getBikeMeterList = asyncHandler(async (req: Request, res: Response) => {
    const userRole = req.user!.role;
    const requestingUserId = req.user!.id;
    const filters = (req as any).validatedQuery || req.query;

    const bikeMeterReadings = await BikeService.getBikeMeterReadings(
      filters,
      userRole,
      requestingUserId
    );

    sendSuccess(res, 'Bike meter readings retrieved successfully', bikeMeterReadings);
  });

  // GET /api/bike/today - Get today's bike meter reading status
  static getTodayStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : req.user!.id;

    // If not admin and trying to access another user's data
    if (req.user!.role !== 'ADMIN' && userId !== req.user!.id) {
      return sendError(res, 'Access denied. You can only view your own bike meter readings.', 403);
    }

    const status = await BikeService.getTodayBikeMeterStatus(userId);

    sendSuccess(res, 'Today\'s bike meter status retrieved successfully', status);
  });

  // PUT /api/bike/:id/km-reading - Update KM reading manually (Admin only)
  static updateKmReading = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { kmReading } = req.body;

    if (!kmReading || kmReading <= 0) {
      return sendError(res, 'Valid KM reading is required', 400);
    }

    const updatedReading = await BikeService.updateKmReading(id, parseFloat(kmReading));

    sendSuccess(res, 'KM reading updated successfully', updatedReading);
  });

  // GET /api/bike/summary - Get bike meter summary for date range
  static getBikeMeterSummary = asyncHandler(async (req: Request, res: Response) => {
    const { userId, startDate, endDate } = (req as any).validatedQuery || req.query;
    const targetUserId = userId ? parseInt(userId) : req.user!.id;

    // If not admin and trying to access another user's data
    if (req.user!.role !== 'ADMIN' && targetUserId !== req.user!.id) {
      return sendError(res, 'Access denied. You can only view your own bike meter readings.', 403);
    }

    if (!startDate || !endDate) {
      return sendError(res, 'Start date and end date are required', 400);
    }

    const summary = await BikeService.getBikeMeterSummary(
      targetUserId,
      startDate,
      endDate
    );

    sendSuccess(res, 'Bike meter summary retrieved successfully', summary);
  });

  // DELETE /api/bike/:id - Delete bike meter reading (Admin only)
  static deleteBikeMeterReading = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await BikeService.deleteBikeMeterReading(id);

    sendSuccess(res, result.message);
  });
}