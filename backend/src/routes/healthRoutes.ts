import { Router } from 'express';
import { HealthController } from '../controllers/healthController';

const router = Router();

// Public health check (could be protected by authMiddleware if desired)
router.get('/', HealthController.getHealth);

export default router;
