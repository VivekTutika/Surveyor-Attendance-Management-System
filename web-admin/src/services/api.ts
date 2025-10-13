import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import Cookies from 'js-cookie'

// Debug environment variables
console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL)
console.log('API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000')

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Debug axios instance creation
console.log('Creating axios instance with baseURL:', API_BASE_URL)

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.baseURL, config.url)
    const token = Cookies.get('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url)
    return response
  },
  (error: AxiosError) => {
    console.error('Response error:', error.response?.status, error.response?.data, error.config?.url)
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message)
      return Promise.reject(new Error('Network error. Please check your connection.'))
    }
    
    if (error.response?.status === 401) {
      Cookies.remove('adminToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API response types
interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

interface User {
  id: string
  name: string
  mobileNumber: string
  role: 'ADMIN' | 'SURVEYOR'
  isActive: boolean
  hasBike?: boolean
  createdAt: string
  project?: {
    id: number
    name: string
  }
  location?: {
    id: number
    name: string
  }
}

interface AuthResponse {
  user: User
  token: string
}

interface Attendance {
  id: string
  userId: string
  date: string
  // Backend uses AttendanceType enum: MORNING | EVENING
  type: 'MORNING' | 'EVENING'
  photoPath: string
  latitude: number
  longitude: number
  capturedAt: string
  user: {
    name: string
    mobileNumber: string
  }
  approved?: boolean
}

interface BikeMeterReading {
  id: string
  userId: string
  date: string
  reading: number
  // AttendanceType: MORNING | EVENING
  type?: 'MORNING' | 'EVENING'
  photoPath: string
  capturedAt: string
  user: {
    name: string
    mobileNumber: string
  }
}

interface DashboardStats {
  totalSurveyors: number
  activeSurveyors: number
  todayAttendance: number
  todayBikeReadings: number
  // Separate counts
  todayAttendanceMorning?: number
  todayAttendanceEvening?: number
  todayBikeMorning?: number
  todayBikeEvening?: number
  weeklyAttendance: Array<{ date: string; count: number }>
  monthlyStats: Array<{ month: string; attendance: number; bikeReadings: number }>
}

// Auth Service
export const authService = {
  login: async (mobileNumber: string, password: string) => {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = 
        await api.post('/api/auth/login', { mobileNumber, password })
      return response.data.data!
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  getProfile: async () => {
    try {
      const response: AxiosResponse<ApiResponse<User>> = 
        await api.get('/api/auth/profile')
      return response.data.data!
    } catch (error) {
      console.error('Get profile error:', error)
      throw error
    }
  },
}

// Surveyor Service
export const surveyorService = {
  getAll: async () => {
    try {
      const response: AxiosResponse<ApiResponse<User[]>> = 
        await api.get('/api/surveyors')
      return response.data.data!
    } catch (error) {
      console.error('Get surveyors error:', error)
      throw error
    }
  },

  getById: async (id: string) => {
    try {
      const response: AxiosResponse<ApiResponse<User>> = 
        await api.get(`/api/surveyors/${id}`)
      return response.data.data!
    } catch (error) {
      console.error('Get surveyor by id error:', error)
      throw error
    }
  },

  create: async (userData: Partial<User>) => {
    try {
      const response: AxiosResponse<ApiResponse<User>> = 
        await api.post('/api/surveyors', userData)
      return response.data.data!
    } catch (error) {
      console.error('Create surveyor error:', error)
      throw error
    }
  },

  update: async (id: string, userData: Partial<User>) => {
    try {
      const response: AxiosResponse<ApiResponse<User>> = 
        await api.put(`/api/surveyors/${id}`, userData)
      return response.data.data!
    } catch (error) {
      console.error('Update surveyor error:', error)
      throw error
    }
  },

  delete: async (id: string) => {
    try {
      const response: AxiosResponse<ApiResponse> = 
        await api.delete(`/api/surveyors/${id}`)
      return response.data
    } catch (error) {
      console.error('Delete surveyor error:', error)
      throw error
    }
  },

  toggleStatus: async (id: string) => {
    try {
      const response: AxiosResponse<ApiResponse<User>> = 
        await api.patch(`/api/surveyors/${id}/toggle-status`)
      return response.data.data!
    } catch (error) {
      console.error('Toggle surveyor status error:', error)
      throw error
    }
  },
}

// Attendance Service
export const attendanceService = {
  getAll: async (params?: { 
    startDate?: string; 
    endDate?: string; 
    userId?: string; 
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      const response: AxiosResponse<ApiResponse<{ 
        attendance: Attendance[]; 
        total: number; 
        page: number; 
        pages: number; 
      }>> = await api.get('/api/attendance/list', { params })
      return response.data.data!
    } catch (error) {
      console.error('Get attendance error:', error)
      throw error
    }
  },

  getByUserId: async (userId: string, params?: { startDate?: string; endDate?: string }) => {
    try {
      const response: AxiosResponse<ApiResponse<{ attendance: Attendance[] }>> = 
        await api.get(`/api/attendance/user/${userId}`, { params })
      return response.data.data!
    } catch (error) {
      console.error('Get attendance by user id error:', error)
      throw error
    }
  },
  // Approve attendance (Admin only) - backend endpoint may need to be added
  approve: async (attendanceId: string) => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await api.post(`/api/attendance/${attendanceId}/approve`)
      return response.data.data
    } catch (error) {
      console.error('Approve attendance error:', error)
      throw error
    }
  },
}

// Bike Meter Service
export const bikeMeterService = {
  getAll: async (params?: { 
    startDate?: string; 
    endDate?: string; 
    userId?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      const response: AxiosResponse<ApiResponse<{ 
        readings: BikeMeterReading[]; 
        total: number; 
        page: number; 
        pages: number; 
      }>> = await api.get('/api/bike/list', { params })
      const d = response.data.data!

      // Normalizer: backend uses `kmReading` while UI expects `reading`.
      const normalize = (item: any) => ({
        // preserve other fields but map kmReading -> reading for UI
        ...item,
        reading: item.kmReading !== undefined ? item.kmReading : item.reading,
      })

      // Backend may return either a paginated object or a plain array.
      if (Array.isArray(d)) {
        return {
          readings: d.map(normalize),
          total: d.length,
          page: 1,
          pages: 1,
        }
      }

      // Paginated object
      return {
        ...d,
        readings: (d.readings || []).map(normalize),
      }
    } catch (error) {
      console.error('Get bike meter readings error:', error)
      throw error
    }
  },

  getByUserId: async (userId: string, params?: { startDate?: string; endDate?: string }) => {
    try {
      const response: AxiosResponse<ApiResponse<{ readings: BikeMeterReading[] }>> = 
        await api.get(`/api/bike/user/${userId}`, { params })
      const d = response.data.data!
      // normalize kmReading -> reading
      return {
        readings: (d.readings || []).map((r: any) => ({ ...r, reading: r.kmReading !== undefined ? r.kmReading : r.reading })),
      }
    } catch (error) {
      console.error('Get bike meter readings by user id error:', error)
      throw error
    }
  },
  // Update KM reading manually (Admin only)
  updateKmReading: async (id: string, kmReading: number) => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await api.put(`/api/bike/${id}/km-reading`, { kmReading })
      return response.data.data
    } catch (error) {
      console.error('Update KM reading error:', error)
      throw error
    }
  },
  // Delete a bike meter reading (Admin only) - used as a revert/cancel action
  delete: async (id: string) => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await api.delete(`/api/bike/${id}`)
      return response.data
    } catch (error) {
      console.error('Delete bike meter reading error:', error)
      throw error
    }
  },
  // Clear only the kmReading for a bike meter reading (Admin only)
  clearReading: async (id: string) => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await api.patch(`/api/bike/${id}/clear-reading`)
      return response.data.data
    } catch (error) {
      console.error('Clear bike meter reading error:', error)
      throw error
    }
  },
}

// Dashboard Service
export const dashboardService = {
  getStats: async () => {
    try {
      const response: AxiosResponse<ApiResponse<DashboardStats>> = 
        await api.get('/api/dashboard/stats')
      return response.data.data!
    } catch (error) {
      console.error('Get dashboard stats error:', error)
      throw error
    }
  },
}

// Export types for use in components
export type {
  User,
  Attendance,
  BikeMeterReading,
  DashboardStats,
  ApiResponse,
}