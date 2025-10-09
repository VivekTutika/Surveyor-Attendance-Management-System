import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bikeService } from '../api/bikeService';

// Async thunks
export const uploadBikeMeterReading = createAsyncThunk(
  'bikeMeter/uploadReading',
  async ({ type, photoUri, kmReading }, { rejectWithValue }) => {
    try {
      const response = await bikeService.uploadBikeMeterReading(type, photoUri, kmReading);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to upload bike meter reading');
    }
  }
);

export const getTodayBikeMeterStatus = createAsyncThunk(
  'bikeMeter/getTodayStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bikeService.getTodayStatus();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get bike meter status');
    }
  }
);

export const getBikeMeterHistory = createAsyncThunk(
  'bikeMeter/getHistory',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await bikeService.getBikeMeterList(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get bike meter history');
    }
  }
);

export const getBikeMeterSummary = createAsyncThunk(
  'bikeMeter/getSummary',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await bikeService.getBikeMeterSummary(startDate, endDate);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get bike meter summary');
    }
  }
);

const initialState = {
  todayStatus: {
    date: null,
    morningUploaded: false,
    eveningUploaded: false,
    morningTime: null,
    eveningTime: null,
    morningKm: null,
    eveningKm: null,
  },
  bikeMeterHistory: [],
  bikeMeterSummary: [],
  loading: false,
  uploadingReading: false,
  error: null,
  lastUploadedReading: null,
};

const bikeMeterSlice = createSlice({
  name: 'bikeMeter',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastUploadedReading: (state) => {
      state.lastUploadedReading = null;
    },
    updateTodayStatus: (state, action) => {
      state.todayStatus = { ...state.todayStatus, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload bike meter reading
      .addCase(uploadBikeMeterReading.pending, (state) => {
        state.uploadingReading = true;
        state.error = null;
      })
      .addCase(uploadBikeMeterReading.fulfilled, (state, action) => {
        state.uploadingReading = false;
        state.lastUploadedReading = action.payload;
        
        // Update today's status
        const readingType = action.payload.type.toLowerCase();
        if (readingType === 'morning') {
          state.todayStatus.morningUploaded = true;
          state.todayStatus.morningTime = action.payload.capturedAt;
          state.todayStatus.morningKm = action.payload.kmReading;
        } else if (readingType === 'evening') {
          state.todayStatus.eveningUploaded = true;
          state.todayStatus.eveningTime = action.payload.capturedAt;
          state.todayStatus.eveningKm = action.payload.kmReading;
        }
      })
      .addCase(uploadBikeMeterReading.rejected, (state, action) => {
        state.uploadingReading = false;
        state.error = action.payload;
      })
      // Get today's status
      .addCase(getTodayBikeMeterStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTodayBikeMeterStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.todayStatus = action.payload;
      })
      .addCase(getTodayBikeMeterStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get bike meter history
      .addCase(getBikeMeterHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBikeMeterHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.bikeMeterHistory = action.payload;
      })
      .addCase(getBikeMeterHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get bike meter summary
      .addCase(getBikeMeterSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBikeMeterSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.bikeMeterSummary = action.payload;
      })
      .addCase(getBikeMeterSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearLastUploadedReading, updateTodayStatus } = bikeMeterSlice.actions;
export default bikeMeterSlice.reducer;