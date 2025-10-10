import api, { apiFormData } from './index';
import { 
  LoginRequest, 
  LoginResponse, 
  User, 
  ApiResponse 
} from '../types';

export interface AuthService {
  login: (mobileNumber: string, password: string) => Promise<LoginResponse>;
  getProfile: () => Promise<User>;
  updateProfile: (profileData: Partial<User>) => Promise<User>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<ApiResponse>;
  logout: () => Promise<{ success: boolean }>;
}

export const authService: AuthService = {
  // Login user
  login: async (mobileNumber: string, password: string) => {
    try {
      // eslint-disable-next-line no-console
      console.log('[AuthService] login attempt:', { mobileNumber });
      const response = await api.post('/auth/login', {
        mobileNumber,
        password,
      });
      // eslint-disable-next-line no-console
      console.log('[AuthService] login success');
      return response;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('[AuthService] login error:', error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData: Partial<User>) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout (mainly for clearing local storage)
  logout: async (): Promise<{ success: boolean }> => {
    try {
      // You can add a logout endpoint call here if needed
      // For now, just return success since token clearing is handled in Redux
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
};