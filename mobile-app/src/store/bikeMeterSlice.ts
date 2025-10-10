import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bikeService } from '../api/bikeService';
import { 
  BikeMeterState, 
  BikeReading, 
  BikeReadingSubmission 
} from '../types';

// Async thunks
export const uploadBikeMeterReading = createAsyncThunk<
  BikeReading,
  BikeReadingSubmission,
  { rejectValue: string }
>(
  'bikeMeter/uploadReading',
  async ({ type, photoUri, reading, timestamp }, { rejectWithValue }) => {
    try {
      const response = await bikeService.uploadBikeMeterReading(type, photoUri, reading ?? null);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload bike meter reading');
    }
  }
);

export const getTodayBikeMeterStatus = createAsyncThunk<
  { morning: BikeReading | null; evening: BikeReading | null },
  void,
  { rejectValue: string }
>(
  'bikeMeter/getTodayStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bikeService.getTodayStatus();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get bike meter status');
    }
  }
);

export const getBikeMeterHistory = createAsyncThunk<
  BikeReading[],
  any,
  { rejectValue: string }
>(
  'bikeMeter/getHistory',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await bikeService.getBikeMeterList(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get bike meter history');
    }
  }
);

export const getBikeMeterSummary = createAsyncThunk<
  any[],
  { startDate: string; endDate: string },
  { rejectValue: string }
>(
  'bikeMeter/getSummary',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await bikeService.getBikeMeterSummary(startDate, endDate);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get bike meter summary');
    }
  }
);

const initialState: BikeMeterState = {
  readings: [],
  todayReadings: {
    morning: null,
    evening: null,
  },
  loading: false,
  error: null,
  submittingReading: false,
};

const bikeMeterSlice = createSlice({
  name: 'bikeMeter',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastUploadedReading: (state) => {
      // Reset any temporary states if needed
    },
    updateTodayStatus: (state, action: PayloadAction<Partial<BikeMeterState['todayReadings']>>) => {
      state.todayReadings = { ...state.todayReadings, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload bike meter reading
      .addCase(uploadBikeMeterReading.pending, (state) => {
        state.submittingReading = true;
        state.error = null;
      })
      .addCase(uploadBikeMeterReading.fulfilled, (state, action) => {
        state.submittingReading = false;
        
        // Update today's readings
        const readingType = action.payload.type.toLowerCase();
        if (readingType === 'morning') {
          state.todayReadings.morning = action.payload;
        } else if (readingType === 'evening') {
          state.todayReadings.evening = action.payload;
        }
        
        // Add to readings if not already present
        const existingIndex = state.readings.findIndex(
          reading => reading.id === action.payload.id
        );
        if (existingIndex === -1) {
          state.readings.unshift(action.payload);
        }
      })
      .addCase(uploadBikeMeterReading.rejected, (state, action) => {
        state.submittingReading = false;
        state.error = action.payload || 'Failed to upload bike meter reading';
      })
      // Get today's status
      .addCase(getTodayBikeMeterStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTodayBikeMeterStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.todayReadings = action.payload;
      })
      .addCase(getTodayBikeMeterStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to get bike meter status';
      })
      // Get bike meter history
      .addCase(getBikeMeterHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBikeMeterHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.readings = action.payload;
      })
      .addCase(getBikeMeterHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to get bike meter history';
      })
      // Get bike meter summary
      .addCase(getBikeMeterSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBikeMeterSummary.fulfilled, (state, action) => {
        state.loading = false;
        // Handle summary data as needed
      })
      .addCase(getBikeMeterSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to get bike meter summary';
      });
  },
});

export const { clearError, clearLastUploadedReading, updateTodayStatus } = bikeMeterSlice.actions;
export default bikeMeterSlice.reducer;