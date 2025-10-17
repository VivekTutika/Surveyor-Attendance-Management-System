import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../api/authService';
import { 
  AuthState, 
  LoginRequest, 
  LoginResponse, 
  User, 
  ApiResponse 
} from '../types';
import { normalizeUser } from '../utils/normalizers';

// Async thunks
export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { rejectValue: string }
>(
  'auth/loginUser',
  async ({ mobileNumber, password }, { rejectWithValue }) => {
    try {
      // in this app we now use employeeId in place of mobileNumber
      const employeeId = mobileNumber
      const response = await authService.login(employeeId, password);
      // eslint-disable-next-line no-console
      console.log('[AuthThunk] login response:', response ? Object.keys(response) : 'no response');
      
      // Response is already the data object due to axios interceptor
  const normalizedUser = normalizeUser(response.user);
      await AsyncStorage.setItem('userToken', response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(normalizedUser));
      
      return { ...response, user: normalizedUser } as LoginResponse;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.log('[AuthThunk] login error:', error?.message || error);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk<
  boolean,
  void,
  { rejectValue: string }
>(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      // Remove token from AsyncStorage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      // Note: We preserve rememberMe setting and cachedCredentials during logout
      // They are only cleared when user explicitly toggles "Remember Me" off
      
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const loadStoredAuth = createAsyncThunk<
  { token: string; user: User } | null,
  void,
  { rejectValue: string }
>(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        const parsed = JSON.parse(userData);
        const normalized = normalizeUser(parsed);
        // Ensure storage has the normalized version to avoid future crashes
        await AsyncStorage.setItem('userData', JSON.stringify(normalized));
        return {
          token,
          user: normalized,
        };
      }
      
      return null;
    } catch (error: any) {
      // Don't reject on error to prevent app from hanging
      console.log('Error loading stored auth:', error);
      return null;
    }
  }
);

export const getUserProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      const normalized = normalizeUser(response);
      return normalized;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk<
  User,
  Partial<User>,
  { rejectValue: string }
>(
  'auth/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData);
      const normalized = normalizeUser(response);
      
      // Update stored user data
      await AsyncStorage.setItem('userData', JSON.stringify(normalized));
      
      return normalized;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk<
  ApiResponse,
  { currentPassword: string; newPassword: string },
  { rejectValue: string }
>(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to change password');
    }
  }
);

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAuthState: (state, action: PayloadAction<{ user: User; token: string }>) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = !!token;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // Even if logout fails, clear local state
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Logout failed';
      })
      // Load stored auth
      .addCase(loadStoredAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        } else {
          // Reset state if no stored auth
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.loading = false;
        // Reset state on error
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Get profile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to get profile';
      })
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update profile';
      })
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to change password';
      });
  },
});

export const { clearError, setAuthState } = authSlice.actions;
export default authSlice.reducer;