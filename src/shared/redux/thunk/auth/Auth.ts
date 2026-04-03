import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

interface ResetPasswordState {
  email: string;
  verifyCode: string;
}

const initialState: ResetPasswordState = {
  email: '',
  verifyCode: '',
};

const resetPasswordSlice = createSlice({
  initialState,
  name: 'resetPassword',
  reducers: {
    clearResetInfo(state) {
      state.email = '';
      state.verifyCode = '';
    },
    setResetInfo(state, action: PayloadAction<ResetPasswordState>) {
      state.email = action.payload.email;
      state.verifyCode = action.payload.verifyCode;
    },
  },
});

export const { setResetInfo, clearResetInfo } = resetPasswordSlice.actions;

export default resetPasswordSlice.reducer;
