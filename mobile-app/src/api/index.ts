import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Read from env and provide sensible fallbacks for emulators/devices
function deriveDefaultBaseUrl(): string {
  try {
    // Prefer Expo public env first
    const envUrl =
      process.env.EXPO_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '';
    if (envUrl) return envUrl;

    // Try to infer host from Expo runtime
    // SDK 49+ provides expoConfig.hostUri; older SDKs have manifest?.debuggerHost
    const hostUri = (Constants as any)?.expoConfig?.hostUri ||
      (Constants as any)?.manifest2?.extra?.expoClient?.hostUri ||
      (Constants as any)?.manifest?.debuggerHost || '';

    if (hostUri) {
      const host = hostUri.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:5000/api`;
      }
    }

    // Fallbacks
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000/api';
    }
    return 'http://localhost:5000/api';
  } catch (e) {
    return Platform.OS === 'android'
      ? 'http://10.0.2.2:5000/api'
      : 'http://localhost:5000/api';
  }
}

let API_BASE_URL = deriveDefaultBaseUrl();
// eslint-disable-next-line no-console
console.log('[API] Base URL:', API_BASE_URL);

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: any) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // eslint-disable-next-line no-console
      console.log('[API] Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return the data from successful responses
    return response.data.data || response.data;
  },
  async (error: any) => {
    const { response } = error;
    
    if (response) {
      // eslint-disable-next-line no-console
      console.log('[API] Error Response:', {
        status: response.status,
        url: response.config?.baseURL + response.config?.url,
        data: response.data,
      });
      // Handle different HTTP status codes
      switch (response.status) {
        case 401:
          // Unauthorized - clear stored token and redirect to login
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userData');
          throw new Error('Session expired. Please login again.');
          
        case 403:
          throw new Error('Access denied. You do not have permission to perform this action.');
          
        case 404:
          throw new Error('Requested resource not found.');
          
        case 422:
          // Validation error
          const message = response.data?.message || 'Validation error';
          throw new Error(message);
          
        case 500:
          throw new Error('Internal server error. Please try again later.');
          
        default:
          // Prefer detailed backend error payloads when available
          const specific = response.data?.data?.error || response.data?.error || response.data?.message;
          const errorMessage = specific || `HTTP Error ${response.status}`;
          throw new Error(errorMessage);
      }
    } else if (error.request) {
      // Network error
      // eslint-disable-next-line no-console
      console.log('[API] Network Error:', {
        message: error.message,
        url: error.config?.baseURL + error.config?.url,
      });
      throw new Error('Network error. Please check your internet connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred.');
    }
  }
);

// Helper function to create FormData for file uploads
export const createFormData = (
  data: Record<string, any>, 
  fileUri?: string, 
  fileName: string = 'photo', 
  fileType: string = 'image/jpeg'
): FormData => {
  const formData = new FormData();
  
  // Add the file
  if (fileUri) {
    formData.append('photo', {
      uri: fileUri,
      type: fileType,
      name: fileName,
    } as any);
  }
  
  // Add other data
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });
  
  return formData;
};

// Helper function for multipart/form-data requests
const apiFormData: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Longer timeout for file uploads
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Add the same interceptors to the form data instance
apiFormData.interceptors.request.use(
  async (config: any) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

apiFormData.interceptors.response.use(
  (response: AxiosResponse) => response.data.data || response.data,
  async (error: any) => {
    // Same error handling as the main api instance
    const { response } = error;
    
    if (response) {
      // eslint-disable-next-line no-console
      console.log('[API] Error Response (FormData):', {
        status: response.status,
        url: response.config?.baseURL + response.config?.url,
        data: response.data,
      });
      const specific = response.data?.data?.error || response.data?.error || response.data?.message;
      switch (response.status) {
        case 401:
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userData');
          throw new Error(specific || 'Session expired. Please login again.');
        case 403:
          throw new Error(specific || 'Access denied.');
        case 404:
          throw new Error(specific || 'Resource not found.');
        case 422:
          throw new Error(specific || 'Validation error');
        case 500:
          throw new Error(specific || 'Server error. Please try again.');
        default:
          throw new Error(specific || `Error ${response.status}`);
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred.');
    }
  }
);

export default api;
export { apiFormData };