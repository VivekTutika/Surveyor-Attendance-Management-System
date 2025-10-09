"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validateRequest_1 = require("../middlewares/validateRequest");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.post('/login', (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.login), authController_1.AuthController.login);
// Protected routes (require authentication)
router.get('/profile', authMiddleware_1.authMiddleware, authController_1.AuthController.getProfile);
router.put('/profile', authMiddleware_1.authMiddleware, authController_1.AuthController.updateProfile);
router.post('/change-password', authMiddleware_1.authMiddleware, authController_1.AuthController.changePassword);
// Admin-only routes
router.post('/register', authMiddleware_1.authMiddleware, authMiddleware_1.adminMiddleware, (0, validateRequest_1.validateRequest)(validateRequest_1.schemas.register), authController_1.AuthController.register);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map