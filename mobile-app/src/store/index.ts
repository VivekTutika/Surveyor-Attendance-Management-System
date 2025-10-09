import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import attendanceSlice from './attendanceSlice';
import bikeMeterSlice from './bikeMeterSlice';
import { RootState } from '../types';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    attendance: attendanceSlice,
    bikeMeter: bikeMeterSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;
export type { RootState };

// Export typed hooks
export { useAppDispatch, useAppSelector } from './hooks';

export default store;