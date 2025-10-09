import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceService } from '../api/attendanceService';

// Async thunks
export const markAttendance = createAsyncThunk(
  'attendance/markAttendance',
  async ({ type, latitude, longitude, photoUri }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.markAttendance(type, latitude, longitude, photoUri);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to mark attendance');
    }
  }
);

export const getTodayAttendanceStatus = createAsyncThunk(
  'attendance/getTodayStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getTodayStatus();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get attendance status');
    }
  }
);

export const getAttendanceHistory = createAsyncThunk(
  'attendance/getHistory',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getAttendanceList(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get attendance history');
    }
  }
);

export const getAttendanceSummary = createAsyncThunk(
  'attendance/getSummary',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getAttendanceSummary(startDate, endDate);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get attendance summary');
    }
  }
);

const initialState = {
  todayStatus: {
    date: null,
    morningMarked: false,
    eveningMarked: false,
    morningTime: null,
    eveningTime: null,
  },
  attendanceHistory: [],
  attendanceSummary: [],
  loading: false,
  markingAttendance: false,
  error: null,
  lastMarkedAttendance: null,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastMarkedAttendance: (state) => {
      state.lastMarkedAttendance = null;
    },
    updateTodayStatus: (state, action) => {
      state.todayStatus = { ...state.todayStatus, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Mark attendance
      .addCase(markAttendance.pending, (state) => {
        state.markingAttendance = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.markingAttendance = false;
        state.lastMarkedAttendance = action.payload;
        
        // Update today's status
        const attendanceType = action.payload.type.toLowerCase();
        if (attendanceType === 'morning') {
          state.todayStatus.morningMarked = true;
          state.todayStatus.morningTime = action.payload.capturedAt;
        } else if (attendanceType === 'evening') {
          state.todayStatus.eveningMarked = true;
          state.todayStatus.eveningTime = action.payload.capturedAt;
        }
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.markingAttendance = false;
        state.error = action.payload;
      })
      // Get today's status
      .addCase(getTodayAttendanceStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTodayAttendanceStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.todayStatus = action.payload;
      })
      .addCase(getTodayAttendanceStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get attendance history
      .addCase(getAttendanceHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAttendanceHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceHistory = action.payload;
      })
      .addCase(getAttendanceHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get attendance summary
      .addCase(getAttendanceSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAttendanceSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceSummary = action.payload;
      })
      .addCase(getAttendanceSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearLastMarkedAttendance, updateTodayStatus } = attendanceSlice.actions;
export default attendanceSlice.reducer;