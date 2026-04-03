import { createSlice } from '@reduxjs/toolkit';

import type { ExamLessonWithMappingEntity } from '#/api/requests';
import { getExamLessonByIdLession } from '../thunk/ExamLesson';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data:
    | ExamLessonWithMappingEntity
    | { data: string; encrypted: boolean }
    | null;
  error: string | null;
}

const initialState: TopicState = {
  data: null,
  error: null,
  status: 'idle',
};

const examLessonSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(getExamLessonByIdLession.pending, state => {
        state.status = 'pending';
        state.data = null;
      })
      .addCase(getExamLessonByIdLession.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data;
      })
      .addCase(getExamLessonByIdLession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
        state.data = null;
      });
  },
  initialState,
  name: 'examLesson',
  reducers: {},
});

export default examLessonSlice.reducer;
