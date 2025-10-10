import { apiFormData, createFormData } from './index';
import api from './index';

export interface AttendanceFilters {
  date?: string;
  startDate?: string;
  endDate?: string;
  type?: 'Morning' | 'Evening';
}

export interface AttendanceService {
  markAttendance: (type: 'Morning' | 'Evening', latitude: number, longitude: number, photoUri: string) => Promise<any>;
  getTodayStatus: () => Promise<any>;
  getAttendanceList: (filters?: AttendanceFilters) => Promise<any>;
  getAttendanceSummary: (startDate: string, endDate: string) => Promise<any>;
}

export const attendanceService: AttendanceService = {
  // Mark attendance with photo and GPS
  markAttendance: async (type: 'Morning' | 'Evening', latitude: number, longitude: number, photoUri: string) => {
    try {
      const formData = createFormData(
        {
          type: type.toUpperCase(),
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        },
        photoUri,
        `attendance_${type}_${Date.now()}.jpg`
      );

      const response = await apiFormData.post('/attendance/mark', formData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get today's attendance status
  getTodayStatus: async () => {
    try {
      const response = await api.get('/attendance/today');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get attendance list with filters
  getAttendanceList: async (filters: AttendanceFilters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.date) params.append('date', filters.date);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.type) params.append('type', filters.type);

      const queryString = params.toString();
      const url = queryString ? `/attendance/list?${queryString}` : '/attendance/list';
      
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get attendance summary
  getAttendanceSummary: async (startDate: string, endDate: string) => {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      const response = await api.get(`/attendance/summary?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};