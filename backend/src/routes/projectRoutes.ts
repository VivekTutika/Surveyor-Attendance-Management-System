import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { validateRequest, schemas } from '../middlewares/validateRequest';
import { adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// All project routes require admin privileges
router.use(adminMiddleware);

// CRUD operations
router.post('/',
  validateRequest(schemas.createProject),
  ProjectController.createProject
);

router.get('/', ProjectController.getProjects);

router.get('/:id',
  validateRequest(schemas.idParamInt),
  ProjectController.getProjectById
);

router.put('/:id',
  validateRequest(schemas.idParamInt),
  validateRequest(schemas.updateProject),
  ProjectController.updateProject
);

router.delete('/:id',
  validateRequest(schemas.idParamInt),
  ProjectController.deleteProject
);

// Additional operations
router.get('/:id/users',
  validateRequest(schemas.idParamInt),
  ProjectController.getProjectUsers
);

export default router;