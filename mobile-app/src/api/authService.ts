import api, { apiFormData } from './index';
import { 
  LoginRequest, 
  LoginResponse, 
  User, 
  ApiResponse 
} from '../types';

export interface AuthService {
  login: (employeeId: string, password: string) => Promise<LoginResponse>;
  getProfile: () => Promise<User>;
  updateProfile: (profileData: Partial<User>) => Promise<User>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<ApiResponse>;
  logout: () => Promise<{ success: boolean }>;
}

export const authService: AuthService = {
  // Login user (by employeeId)
  login: async (employeeId: string, password: string) => {
    try {
      // eslint-disable-next-line no-console
      console.log('[AuthService] login attempt:', { employeeId });
      const response = await api.post('/auth/login', {
        employeeId,
        password,
      });
      // eslint-disable-next-line no-console
      console.log('[AuthService] login success');
      // The api interceptor already returns response.data or response.data.data
      // Cast to LoginResponse to keep callers strongly typed
      return (response as unknown) as LoginResponse;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('[AuthService] login error:', error);
      const axiosErr = error as any;
      if (axiosErr.response) {
        const status = axiosErr.response.status;
        const serverMsg = axiosErr.response.data?.message || axiosErr.response.statusText;
        if (status === 401) {
          const e: any = new Error('Invalid credentials');
          e.status = 401;
          throw e;
        }
        const e: any = new Error(serverMsg || 'Login failed');
        e.status = status;
        throw e;
      }
      // Network or other non-response error
      throw new Error('Network error. Please try again.');
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
  return (response as unknown) as User;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData: Partial<User>) => {
    try {
      const response = await api.put('/auth/profile', profileData);
  return (response as unknown) as User;
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
  return (response as unknown) as ApiResponse;
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