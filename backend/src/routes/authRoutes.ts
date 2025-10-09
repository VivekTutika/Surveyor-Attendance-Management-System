import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest, schemas } from '../middlewares/validateRequest';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/login', validateRequest(schemas.login), AuthController.login);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, AuthController.getProfile);
router.put('/profile', authMiddleware, AuthController.updateProfile);
router.post('/change-password', authMiddleware, AuthController.changePassword);

// Admin-only routes
router.post('/register', authMiddleware, adminMiddleware, validateRequest(schemas.register), AuthController.register);

export default router;