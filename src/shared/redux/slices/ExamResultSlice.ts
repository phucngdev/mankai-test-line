import { createSlice } from '@reduxjs/toolkit';

import type {
  ExamResulHistoryDetailEntity,
  ExamResulHistoryEntity,
  ExamResultInCourseOfStudentEntity,
} from '#/api/requests';
import {
  getExamReults,
  getExamReultsDetailHistory,
  getExamReultsHistory,
} from '../thunk/ExamReultsThunk';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  dataExamResult: ExamResultInCourseOfStudentEntity[] | [];
  error: string | null;
  dataExamResultHistory: ExamResulHistoryEntity[] | [];
  dataExamResultDetailHistory: ExamResulHistoryDetailEntity[] | [];
}

const initialState: TopicState = {
  dataExamResult: [],
  dataExamResultDetailHistory: [],
  dataExamResultHistory: [],
  error: null,
  status: 'idle',
};

const examResultSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(getExamReults.pending, state => {
        state.status = 'pending';
      })
      .addCase(getExamReults.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataExamResult = action.payload.data;
      })
      .addCase(getExamReults.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(getExamReultsHistory.pending, state => {
        state.status = 'pending';
      })
      .addCase(getExamReultsHistory.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataExamResultHistory = action.payload.data;
      })
      .addCase(getExamReultsHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(getExamReultsDetailHistory.pending, state => {
        state.status = 'pending';
      })
      .addCase(getExamReultsDetailHistory.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataExamResultDetailHistory = action.payload.data;
      })
      .addCase(getExamReultsDetailHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'examResult',
  reducers: {},
});

export default examResultSlice.reducer;
