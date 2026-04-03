import { createSlice } from '@reduxjs/toolkit';

import type { EssayTestEntity } from '#/api/requests';
import {
  createEssay,
  getEssayByUser,
  updateEssay,
} from '../thunk/EssayTestThunk';

interface ClassState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  dataEssay: EssayTestEntity | null;
  error: string | null;
}

const initialState: ClassState = {
  dataEssay: null,
  error: null,
  status: 'idle',
};

const essayTestSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(getEssayByUser.pending, state => {
        state.status = 'pending';
      })
      .addCase(getEssayByUser.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataEssay = action.payload.data;
      })
      .addCase(getEssayByUser.rejected, (state, action) => {
        state.dataEssay = null;
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })

      // ✅ Handle updateEssay
      .addCase(updateEssay.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataEssay = action.payload.data; // cập nhật ngay state
      })

      // ✅ Handle createEssay
      .addCase(createEssay.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataEssay = action.payload.data; // gán ngay sau khi tạo
      });
  },
  initialState,
  name: 'essayTest',
  reducers: {
    resetEssay: state => {
      state.dataEssay = null;
      state.status = 'idle';
      state.error = null;
    },
  },
});

export const { resetEssay } = essayTestSlice.actions;

export default essayTestSlice.reducer;
