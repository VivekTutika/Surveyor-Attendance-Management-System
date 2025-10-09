import axios, { AxiosInstance, AxiosResponse } from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

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
    const token = Cookies.get('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
  data?: T
  message?: string
}

interface User {
  id: string
  name: string
  mobileNumber: string
  role: 'ADMIN' | 'SURVEYOR'
  isActive: boolean
  createdAt: string
}

interface Attendance {
  id: string
  userId: string
  date: string
  type: 'CHECK_IN' | 'CHECK_OUT'
  photoPath: string
  latitude: number
  longitude: number
  capturedAt: string
  user: {
    name: string
    mobileNumber: string
  }
}

interface BikeMeterReading {
  id: string
  userId: string
  date: string
  reading: number
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
  weeklyAttendance: Array<{ date: string; count: number }>
  monthlyStats: Array<{ month: string; attendance: number; bikeReadings: number }>
}

// Auth Service
export const authService = {
  login: async (mobileNumber: string, password: string) => {
    const response: AxiosResponse<ApiResponse<{ token: string; user: User }>> = 
      await api.post('/auth/login', { mobileNumber, password })
    return response.data.data!
  },

  getProfile: async () => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = 
      await api.get('/auth/profile')
    return response.data.data!
  },
}

// Surveyor Service
export const surveyorService = {
  getAll: async () => {
    const response: AxiosResponse<ApiResponse<{ surveyors: User[] }>> = 
      await api.get('/surveyors')
    return response.data.data!
  },

  getById: async (id: string) => {
    const response: AxiosResponse<ApiResponse<{ surveyor: User }>> = 
      await api.get(`/surveyors/${id}`)
    return response.data.data!
  },

  create: async (userData: Partial<User>) => {
    const response: AxiosResponse<ApiResponse<{ surveyor: User }>> = 
      await api.post('/surveyors', userData)
    return response.data.data!
  },

  update: async (id: string, userData: Partial<User>) => {
    const response: AxiosResponse<ApiResponse<{ surveyor: User }>> = 
      await api.put(`/surveyors/${id}`, userData)
    return response.data.data!
  },

  delete: async (id: string) => {
    const response: AxiosResponse<ApiResponse> = 
      await api.delete(`/surveyors/${id}`)
    return response.data
  },

  toggleStatus: async (id: string) => {
    const response: AxiosResponse<ApiResponse<{ surveyor: User }>> = 
      await api.patch(`/surveyors/${id}/toggle-status`)
    return response.data.data!
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
    const response: AxiosResponse<ApiResponse<{ 
      attendance: Attendance[]; 
      total: number; 
      page: number; 
      pages: number; 
    }>> = await api.get('/attendance/list', { params })
    return response.data.data!
  },

  getByUserId: async (userId: string, params?: { startDate?: string; endDate?: string }) => {
    const response: AxiosResponse<ApiResponse<{ attendance: Attendance[] }>> = 
      await api.get(`/attendance/user/${userId}`, { params })
    return response.data.data!
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
    const response: AxiosResponse<ApiResponse<{ 
      readings: BikeMeterReading[]; 
      total: number; 
      page: number; 
      pages: number; 
    }>> = await api.get('/bike/list', { params })
    return response.data.data!
  },

  getByUserId: async (userId: string, params?: { startDate?: string; endDate?: string }) => {
    const response: AxiosResponse<ApiResponse<{ readings: BikeMeterReading[] }>> = 
      await api.get(`/bike/user/${userId}`, { params })
    return response.data.data!
  },
}

// Dashboard Service
export const dashboardService = {
  getStats: async () => {
    const response: AxiosResponse<ApiResponse<DashboardStats>> = 
      await api.get('/dashboard/stats')
    return response.data.data!
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