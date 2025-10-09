import { apiFormData, createFormData } from './index';
import api from './index';

export interface BikeReadingFilters {
  date?: string;
  startDate?: string;
  endDate?: string;
  type?: 'Morning' | 'Evening';
}

export interface BikeService {
  uploadBikeMeterReading: (type: 'Morning' | 'Evening', photoUri: string, kmReading?: number | null) => Promise<any>;
  getTodayStatus: () => Promise<any>;
  getBikeMeterList: (filters?: BikeReadingFilters) => Promise<any>;
  getBikeMeterSummary: (startDate: string, endDate: string) => Promise<any>;
}

export const bikeService: BikeService = {
  // Upload bike meter reading with photo
  uploadBikeMeterReading: async (type: 'Morning' | 'Evening', photoUri: string, kmReading: number | null = null) => {
    try {
      const formData = createFormData(
        {
          type,
          ...(kmReading && { kmReading: kmReading.toString() }),
        },
        photoUri,
        `bike_meter_${type}_${Date.now()}.jpg`
      );

      const response = await apiFormData.post('/bike/upload', formData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get today's bike meter status
  getTodayStatus: async () => {
    try {
      const response = await api.get('/bike/today');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get bike meter readings list with filters
  getBikeMeterList: async (filters: BikeReadingFilters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.date) params.append('date', filters.date);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.type) params.append('type', filters.type);

      const queryString = params.toString();
      const url = queryString ? `/bike/list?${queryString}` : '/bike/list';
      
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get bike meter summary
  getBikeMeterSummary: async (startDate: string, endDate: string) => {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      const response = await api.get(`/bike/summary?${params.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};