"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middlewares/errorHandler");
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
// POST /api/auth/register - Register new user (Admin only)
AuthController.register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userData = req.body;
    const result = await authService_1.AuthService.register(userData);
    (0, response_1.sendCreated)(res, 'User registered successfully', result);
});
// POST /api/auth/login - Login user
AuthController.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const loginData = req.body;
    const result = await authService_1.AuthService.login(loginData);
    (0, response_1.sendSuccess)(res, 'Login successful', result);
});
// GET /api/auth/profile - Get user profile
AuthController.getProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const profile = await authService_1.AuthService.getProfile(userId);
    (0, response_1.sendSuccess)(res, 'Profile retrieved successfully', profile);
});
// PUT /api/auth/profile - Update user profile
AuthController.updateProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const updateData = req.body;
    const updatedProfile = await authService_1.AuthService.updateProfile(userId, updateData);
    (0, response_1.sendSuccess)(res, 'Profile updated successfully', updatedProfile);
});
// POST /api/auth/change-password - Change password
AuthController.changePassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const result = await authService_1.AuthService.changePassword(userId, currentPassword, newPassword);
    (0, response_1.sendSuccess)(res, result.message);
});
//# sourceMappingURL=authController.js.map