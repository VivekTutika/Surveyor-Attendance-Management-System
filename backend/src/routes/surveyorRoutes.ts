import { Router } from 'express';
import { SurveyorController } from '../controllers/surveyorController';
import { validateRequest, schemas } from '../middlewares/validateRequest';
import { adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// All surveyor routes require admin privileges
router.use(adminMiddleware);

// CRUD operations
router.post('/',
  validateRequest(schemas.createSurveyor),
  SurveyorController.createSurveyor
);

router.get('/', SurveyorController.getSurveyors);

router.get('/projects', SurveyorController.getProjects);

router.get('/locations', SurveyorController.getLocations);

router.get('/:id',
  validateRequest(schemas.idParamInt),
  SurveyorController.getSurveyorById
);

router.put('/:id',
  validateRequest(schemas.idParamInt),
  validateRequest(schemas.updateSurveyor),
  SurveyorController.updateSurveyor
);

router.delete('/:id',
  validateRequest(schemas.idParamInt),
  SurveyorController.deleteSurveyor
);

// Additional operations
router.post('/:id/reset-password',
  validateRequest(schemas.idParamInt),
  SurveyorController.resetSurveyorPassword
);

router.get('/:id/statistics',
  validateRequest(schemas.idParamInt),
  validateRequest(schemas.dateQuery),
  SurveyorController.getSurveyorStatistics
);

// Toggle active/inactive status
router.patch('/:id/toggle-status',
  validateRequest(schemas.idParamInt),
  SurveyorController.toggleStatus
);

export default router;