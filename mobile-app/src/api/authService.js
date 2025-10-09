import api from './index';

export const authService = {
  // Login user
  login: async (mobileNumber, password) => {
    try {
      const response = await api.post('/auth/login', {
        mobileNumber,
        password,
      });
      return response;
    } catch (error) {
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
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
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
  logout: async () => {
    try {
      // You can add a logout endpoint call here if needed
      // For now, just return success since token clearing is handled in Redux
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
};