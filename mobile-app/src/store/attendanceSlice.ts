import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { attendanceService } from '../api/attendanceService';
import { 
  AttendanceState, 
  AttendanceRecord, 
  AttendanceSubmission 
} from '../types';

// Async thunks
export const markAttendance = createAsyncThunk<
  AttendanceRecord,
  AttendanceSubmission,
  { rejectValue: string }
>(
  'attendance/markAttendance',
  async ({ type, latitude, longitude, photoUri, timestamp }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.markAttendance(type, latitude, longitude, photoUri);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark attendance');
    }
  }
);

export const getTodayAttendanceStatus = createAsyncThunk<
  { morning: AttendanceRecord | null; evening: AttendanceRecord | null },
  void,
  { rejectValue: string }
>(
  'attendance/getTodayStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getTodayStatus();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get attendance status');
    }
  }
);

export const getAttendanceHistory = createAsyncThunk<
  AttendanceRecord[],
  any,
  { rejectValue: string }
>(
  'attendance/getHistory',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getAttendanceList(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get attendance history');
    }
  }
);

export const getAttendanceSummary = createAsyncThunk<
  any[],
  { startDate: string; endDate: string },
  { rejectValue: string }
>(
  'attendance/getSummary',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getAttendanceSummary(startDate, endDate);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get attendance summary');
    }
  }
);

const initialState: AttendanceState = {
  records: [],
  todayAttendance: {
    morning: null,
    evening: null,
  },
  loading: false,
  error: null,
  submittingAttendance: false,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastMarkedAttendance: (state) => {
      // Reset any temporary states if needed
    },
    updateTodayStatus: (state, action: PayloadAction<Partial<AttendanceState['todayAttendance']>>) => {
      state.todayAttendance = { ...state.todayAttendance, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Mark attendance
      .addCase(markAttendance.pending, (state) => {
        state.submittingAttendance = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.submittingAttendance = false;
        
        // Update today's attendance
        const attendanceType = action.payload.type.toLowerCase();
        if (attendanceType === 'morning') {
          state.todayAttendance.morning = action.payload;
        } else if (attendanceType === 'evening') {
          state.todayAttendance.evening = action.payload;
        }
        
        // Add to records if not already present
        const existingIndex = state.records.findIndex(
          record => record.id === action.payload.id
        );
        if (existingIndex === -1) {
          state.records.unshift(action.payload);
        }
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.submittingAttendance = false;
        state.error = action.payload || 'Failed to mark attendance';
      })
      // Get today's status
      .addCase(getTodayAttendanceStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTodayAttendanceStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.todayAttendance = action.payload;
      })
      .addCase(getTodayAttendanceStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to get attendance status';
      })
      // Get attendance history
      .addCase(getAttendanceHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAttendanceHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(getAttendanceHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to get attendance history';
      })
      // Get attendance summary
      .addCase(getAttendanceSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAttendanceSummary.fulfilled, (state, action) => {
        state.loading = false;
        // Handle summary data as needed
      })
      .addCase(getAttendanceSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to get attendance summary';
      });
  },
});

export const { clearError, clearLastMarkedAttendance, updateTodayStatus } = attendanceSlice.actions;
export default attendanceSlice.reducer;