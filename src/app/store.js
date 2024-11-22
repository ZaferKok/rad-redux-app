import { configureStore } from '@reduxjs/toolkit';
import bicycleReducer from '../features/bicycle/bicycleSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    bicycle: bicycleReducer,
    auth: authReducer,
  },
});