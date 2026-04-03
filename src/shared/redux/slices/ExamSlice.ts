import { createSlice } from '@reduxjs/toolkit';

import { getExamByIdLession } from '../thunk/ExamThunk';
import type { ExamLessonEntity } from '#/api/requests';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: ExamLessonEntity | null;
  error: string | null;
}

const initialState: TopicState = {
  data: null,
  error: null,
  status: 'idle',
};

const examSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(getExamByIdLession.pending, state => {
        state.status = 'pending';
      })
      .addCase(getExamByIdLession.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data.items;
      })
      .addCase(getExamByIdLession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'exam',
  reducers: {},
});

export default examSlice.reducer;
