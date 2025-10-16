import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { attendanceService } from '../api/attendanceService';
import { isoToDateKey, nowIso } from '../utils/date';
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
      return response;
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
      return response;
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
      return response;
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
      return response;
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
        // ensure submitting flag is cleared even if payload is malformed
        state.submittingAttendance = false;

        // Action payload may be the attendance record or an API envelope { success, message, data }
        const raw = action.payload as any;
        const payload = raw && (raw.data ?? raw) ? (raw.data ?? raw) : raw;
        if (!payload) return;

        try {
          const attendanceType = (payload.type || '').toString().toLowerCase();
          if (attendanceType === 'morning') {
            state.todayAttendance.morning = payload;
          } else if (attendanceType === 'evening') {
            state.todayAttendance.evening = payload;
          }

          // Add to records if not already present
          const existingIndex = state.records.findIndex(
            record => record.id === payload.id
          );
          if (existingIndex === -1) {
            state.records.unshift(payload);
          }
        } catch (e) {
          // swallow to avoid reducer crash
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
        const raw = action.payload as any;
        const payload = raw && (raw.data ?? raw) ? (raw.data ?? raw) : raw;

        // Two possible backend shapes:
        // 1) { morningMarked: boolean, morningTime: string, eveningMarked: boolean, eveningTime: string }
        // 2) { morning: AttendanceRecord | null, evening: AttendanceRecord | null }
        if (!payload) {
          state.todayAttendance = { morning: null, evening: null };
          return;
        }

        if (payload.morningMarked !== undefined || payload.eveningMarked !== undefined) {
          const baseDate = isoToDateKey(payload.date ?? null);
          const morning = payload.morningMarked ? ({
            id: `morning-${baseDate}`,
            userId: '',
            date: baseDate,
            type: 'Morning' as 'Morning',
            photoPath: '',
            latitude: 0,
            longitude: 0,
            capturedAt: payload.morningTime || nowIso(),
          } as AttendanceRecord) : null;
          const evening = payload.eveningMarked ? ({
            id: `evening-${baseDate}`,
            userId: '',
            date: baseDate,
            type: 'Evening' as 'Evening',
            photoPath: '',
            latitude: 0,
            longitude: 0,
            capturedAt: payload.eveningTime || nowIso(),
          } as AttendanceRecord) : null;
          state.todayAttendance = { morning, evening };
          return;
        }

        if (payload.morning !== undefined || payload.evening !== undefined) {
          // assume they are already in the expected shape
          state.todayAttendance = {
            morning: payload.morning ?? null,
            evening: payload.evening ?? null,
          };
          return;
        }

        // fallback to clear
        state.todayAttendance = { morning: null, evening: null };
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