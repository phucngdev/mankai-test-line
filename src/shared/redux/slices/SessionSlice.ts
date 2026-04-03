import { createSlice } from '@reduxjs/toolkit';

import {
  fetchAllSessionByIdCourse,
  getSessionById,
} from '../thunk/SessionThunk';
import type { SessonStudentEntity } from '#/api/requests';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: SessonStudentEntity | null;
  error: string | null;
  dataById: SessonStudentEntity | null;
  totalElement: number;
}

const initialState: TopicState = {
  data: null,
  dataById: null,
  error: null,
  status: 'idle',
  totalElement: 0,
};

const sessionSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(fetchAllSessionByIdCourse.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchAllSessionByIdCourse.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data.items;
        state.totalElement = action.payload.data.meta.total;
      })
      .addCase(fetchAllSessionByIdCourse.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(getSessionById.pending, state => {
        state.status = 'pending';
      })
      .addCase(getSessionById.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataById = action.payload.data;
      })
      .addCase(getSessionById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'session',
  reducers: {
    resetDataSession(state) {
      state.data = null;
      state.dataById = null;
      state.totalElement = 0;
    },
  },
});

export const { resetDataSession } = sessionSlice.actions;

export default sessionSlice.reducer;
