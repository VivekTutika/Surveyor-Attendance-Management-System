import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { asyncHandler } from '../middlewares/errorHandler';

export class AuthController {
  // POST /api/auth/register - Register new user (Admin only)
  static register = asyncHandler(async (req: Request, res: Response) => {
    const userData = req.body;
    
    const result = await AuthService.register(userData);
    
    sendCreated(res, 'User registered successfully', result);
  });

  // POST /api/auth/login - Login user
  static login = asyncHandler(async (req: Request, res: Response) => {
    const loginData = req.body;
    
    const result = await AuthService.login(loginData);
    
    sendSuccess(res, 'Login successful', result);
  });

  // GET /api/auth/profile - Get user profile
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    
    const profile = await AuthService.getProfile(userId);
    
    sendSuccess(res, 'Profile retrieved successfully', profile);
  });

  // PUT /api/auth/profile - Update user profile
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const updateData = req.body;
    
    const updatedProfile = await AuthService.updateProfile(userId, updateData);
    
    sendSuccess(res, 'Profile updated successfully', updatedProfile);
  });

  // POST /api/auth/change-password - Change password
  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;
    
    const result = await AuthService.changePassword(userId, currentPassword, newPassword);
    
    sendSuccess(res, result.message);
  });
}