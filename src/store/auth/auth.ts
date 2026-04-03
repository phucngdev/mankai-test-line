import { configureStore } from '@reduxjs/toolkit';
import resetPasswordReducer from '../../shared/redux/thunk/auth/Auth';

export const store = configureStore({
  reducer: {
    resetPassword: resetPasswordReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
