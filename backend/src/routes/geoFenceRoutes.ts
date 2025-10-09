import { Router } from 'express';
import { GeoFenceController } from '../controllers/geoFenceController';
import { validateRequest, schemas } from '../middlewares/validateRequest';
import { adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Note: All geo-fence routes require admin privileges as this is a v2 feature
// For v1, these routes are available but the functionality is not actively used

// Get all geo-fences (Admin only)
router.get('/',
  adminMiddleware,
  GeoFenceController.getAllGeoFences
);

// Get geo-fence for specific surveyor
router.get('/:surveyorId',
  validateRequest(schemas.idParam),
  GeoFenceController.getGeoFence
);

// Create or update geo-fence (Admin only)
router.post('/:surveyorId',
  adminMiddleware,
  validateRequest(schemas.idParam),
  GeoFenceController.createOrUpdateGeoFence
);

// Update geo-fence (Admin only)
router.put('/:surveyorId',
  adminMiddleware,
  validateRequest(schemas.idParam),
  GeoFenceController.updateGeoFence
);

// Delete geo-fence (Admin only)
router.delete('/:surveyorId',
  adminMiddleware,
  validateRequest(schemas.idParam),
  GeoFenceController.deleteGeoFence
);

// Toggle geo-fence status (Admin only)
router.patch('/:surveyorId/toggle',
  adminMiddleware,
  validateRequest(schemas.idParam),
  GeoFenceController.toggleGeoFenceStatus
);

export default router;