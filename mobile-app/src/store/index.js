import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import attendanceSlice from './attendanceSlice';
import bikeMeterSlice from './bikeMeterSlice';

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

export default store;