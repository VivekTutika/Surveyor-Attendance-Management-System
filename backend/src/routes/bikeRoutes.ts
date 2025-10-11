import { Router } from 'express';
import { BikeController } from '../controllers/bikeController';
import { BikeTripController } from '../controllers/bikeTripController';
import { validateRequest, schemas } from '../middlewares/validateRequest';
import { adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Upload bike meter reading (Surveyors and Admins)
router.post('/upload',
  BikeController.uploadMiddleware,
  validateRequest(schemas.uploadBikeMeter),
  BikeController.uploadBikeMeter
);

// Get bike meter readings with filters
router.get('/list',
  validateRequest(schemas.dateQuery),
  BikeController.getBikeMeterList
);

// Get today's bike meter reading status
router.get('/today', BikeController.getTodayStatus);

// Get bike meter summary for date range
router.get('/summary',
  validateRequest(schemas.dateQuery),
  BikeController.getBikeMeterSummary
);

// Update KM reading manually (Admin only)
router.put('/:id/km-reading',
  adminMiddleware,
  validateRequest(schemas.idParam),
  BikeController.updateKmReading
);

// Delete bike meter reading (Admin only)
router.delete('/:id',
  adminMiddleware,
  validateRequest(schemas.idParam),
  BikeController.deleteBikeMeterReading
);

// Bike trip routes (Admin only for modifications)
router.get('/trips',
  validateRequest(schemas.dateQuery),
  BikeTripController.listTrips
);

router.put('/trips/:id/final-km',
  adminMiddleware,
  validateRequest(schemas.idParamInt),
  BikeTripController.setFinalKm
);

router.put('/trips/:id/toggle-approve',
  adminMiddleware,
  validateRequest(schemas.idParamInt),
  BikeTripController.toggleApprove
);

export default router;