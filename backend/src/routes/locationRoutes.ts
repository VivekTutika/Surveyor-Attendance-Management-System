import { Router } from 'express';
import { LocationController } from '../controllers/locationController';
import { validateRequest, schemas } from '../middlewares/validateRequest';
import { adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// All location routes require admin privileges
router.use(adminMiddleware);

// CRUD operations
router.post('/',
  validateRequest(schemas.createLocation),
  LocationController.createLocation
);

router.get('/', LocationController.getLocations);

router.get('/:id',
  validateRequest(schemas.idParamInt),
  LocationController.getLocationById
);

router.put('/:id',
  validateRequest(schemas.idParamInt),
  validateRequest(schemas.updateLocation),
  LocationController.updateLocation
);

router.delete('/:id',
  validateRequest(schemas.idParamInt),
  LocationController.deleteLocation
);

// Additional operations
router.get('/:id/users',
  validateRequest(schemas.idParamInt),
  LocationController.getLocationUsers
);

export default router;