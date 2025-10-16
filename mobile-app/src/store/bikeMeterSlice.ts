import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bikeService } from '../api/bikeService';
import { isoToDateKey, nowIso } from '../utils/date';
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
        // ensure flag cleared
        state.submittingReading = false;

        const raw = action.payload as any;
        let payload = raw && (raw.data ?? raw) ? (raw.data ?? raw) : raw;

        // If the server returned no useful payload (some backends return just a message),
        // synthesize a minimal reading from the original thunk args so the UI flips immediately.
        if (!payload) {
          try {
            const args = (action as any).meta?.arg;
            const argType = (args?.type || '').toString().toLowerCase();
            const baseDate = isoToDateKey(args?.timestamp ?? null);
            payload = {
              id: `${argType}-${baseDate}-${Date.now()}`,
              userId: '',
              date: baseDate,
              type: argType === 'morning' ? 'Morning' : 'Evening',
              photoPath: args?.photoUri ?? '',
              reading: args?.reading,
              capturedAt: args?.timestamp ?? nowIso(),
            } as any;
          } catch (e) {
            // If anything fails, bail out
            return;
          }
        }

        // If payload exists but is a flag-style response (e.g., morningMarked/morning_marked),
        // synthesize an object using the thunk args (meta.arg) to determine the type.
        const isFlagStyle = (p: any) => (
          p && (
            p.morningMarked !== undefined || p.eveningMarked !== undefined ||
            p.morning_marked !== undefined || p.evening_marked !== undefined ||
            p.morningUploaded !== undefined || p.eveningUploaded !== undefined ||
            p.morning_uploaded !== undefined || p.evening_uploaded !== undefined
          )
        );

        if (isFlagStyle(payload)) {
          const args = (action as any).meta?.arg;
          const argType = (args?.type || '').toString().toLowerCase();
          const baseDate = isoToDateKey(args?.timestamp ?? (payload.date ?? null));
          const normalizedReading = {
            id: `${argType}-${baseDate}-${Date.now()}`,
            userId: '',
            date: baseDate,
            type: argType === 'morning' ? 'Morning' : 'Evening',
            photoPath: args?.photoUri ?? '',
            reading: args?.reading,
            capturedAt: args?.timestamp ?? (payload.morningTime || payload.morning_time || payload.eveningTime || payload.evening_time || nowIso()),
          } as any;

          if (argType === 'morning') state.todayReadings.morning = normalizedReading;
          else state.todayReadings.evening = normalizedReading;

          const existingIndex = state.readings.findIndex(r => r.id === normalizedReading.id);
          if (existingIndex === -1) state.readings.unshift(normalizedReading);
          return;
        }

        try {
          // Payload might be the created BikeReading or an API envelope
          const readingType = (payload.type || payload.data?.type || '').toString().toLowerCase();
          const baseDate = isoToDateKey(payload.date ?? payload.data?.date ?? null);

          const normalizedReading = payload && (payload.id || payload.data?.id) ? (payload.data ?? payload) : {
            id: payload.id ?? payload.data?.id ?? `${readingType}-${baseDate}`,
            userId: payload.userId ?? payload.data?.userId ?? '',
            date: baseDate,
            type: (readingType === 'morning' ? 'Morning' : 'Evening') as 'Morning' | 'Evening',
            photoPath: payload.photoPath ?? payload.data?.photoPath ?? '',
            reading: payload.reading ?? payload.data?.reading,
            capturedAt: payload.capturedAt ?? payload.data?.capturedAt ?? nowIso(),
          } as any;

          if (readingType === 'morning') {
            state.todayReadings.morning = normalizedReading;
          } else if (readingType === 'evening') {
            state.todayReadings.evening = normalizedReading;
          }

          // Add to readings if not already present
          const existingIndex = state.readings.findIndex(
            reading => reading.id === normalizedReading.id
          );
          if (existingIndex === -1) {
            state.readings.unshift(normalizedReading);
          }
        } catch (e) {
          // swallow errors to avoid reducer crash
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
        const raw = action.payload as any;
        const payload = raw && (raw.data ?? raw) ? (raw.data ?? raw) : raw;

        if (!payload) {
          state.todayReadings = { morning: null, evening: null };
          return;
        }

        // Backend may return flag-style shape: morningMarked/morningTime or snake_case variants
        const flagTrue = (p: any, keyCamel: string, keySnake: string) => (p && (p[keyCamel] !== undefined || p[keySnake] !== undefined))
          ? (p[keyCamel] ?? p[keySnake]) : undefined;

  const morningMarked = flagTrue(payload, 'morningMarked', 'morning_marked');
  const eveningMarked = flagTrue(payload, 'eveningMarked', 'evening_marked');
  // also consider uploaded variants
  const morningUploaded = flagTrue(payload, 'morningUploaded', 'morning_uploaded');
  const eveningUploaded = flagTrue(payload, 'eveningUploaded', 'evening_uploaded');
  const morningTime = (payload.morningTime || payload.morning_time || payload.morning_time_string);
  const eveningTime = (payload.eveningTime || payload.evening_time || payload.evening_time_string);

        // if any of the recognized flag/uploaded indicators are present
        if (morningMarked !== undefined || eveningMarked !== undefined || morningUploaded !== undefined || eveningUploaded !== undefined) {
          const baseDate = payload.date || new Date().toISOString().split('T')[0];
          const morning = (morningMarked ?? morningUploaded) ? ({
            id: `morning-${baseDate}`,
            userId: '',
            date: baseDate,
            type: 'Morning' as 'Morning',
            photoPath: '',
            reading: payload.morningKm ?? payload.morning_km ?? undefined,
            capturedAt: morningTime || new Date().toISOString(),
          } as any) : null;

          const evening = (eveningMarked ?? eveningUploaded) ? ({
            id: `evening-${baseDate}`,
            userId: '',
            date: baseDate,
            type: 'Evening' as 'Evening',
            photoPath: '',
            reading: payload.eveningKm ?? payload.evening_km ?? undefined,
            capturedAt: eveningTime || new Date().toISOString(),
          } as any) : null;

          state.todayReadings = { morning, evening };
          return;
        }

        // Check for directly supplied morning/evening objects in a few naming variants
        const morningObj = payload.morning ?? payload.morning_reading ?? payload.morningReading ?? payload.data?.morning ?? payload.data?.morning_reading;
        const eveningObj = payload.evening ?? payload.evening_reading ?? payload.eveningReading ?? payload.data?.evening ?? payload.data?.evening_reading;
        if (morningObj !== undefined || eveningObj !== undefined) {
          state.todayReadings = {
            morning: morningObj ?? null,
            evening: eveningObj ?? null,
          };
          return;
        }

        // If payload.data contains the objects
        if (payload.data && (payload.data.morning !== undefined || payload.data.evening !== undefined)) {
          state.todayReadings = {
            morning: payload.data.morning ?? payload.data.morning_reading ?? null,
            evening: payload.data.evening ?? payload.data.evening_reading ?? null,
          };
          return;
        }

        // fallback — log unexpected payloads (temporary debug; remove after reproduction)
        if (payload && Object.keys(payload).length) {
          // eslint-disable-next-line no-console
          console.log('[DEBUG][bikeMeter] Unrecognized today payload shape:', JSON.stringify(payload));
        }
        state.todayReadings = { morning: null, evening: null };
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