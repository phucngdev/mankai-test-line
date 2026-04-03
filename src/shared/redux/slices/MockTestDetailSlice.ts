import { createSlice } from '@reduxjs/toolkit';

import {
  getTestDetailByIdTest,
  getTestResult,
  getTestUserResult,
} from '../thunk/MockTestThunk';
import type {
  GroupedTestDetailEntity,
  QuestionGroupUserAnswerEntity,
  TestResultUserDetailEntity,
} from '#/api/requests';

interface MockTestCategoryState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: GroupedTestDetailEntity[] | [];
  error: string | null;
  totalElement: number;
  dataResult: QuestionGroupUserAnswerEntity[] | [];
  dataResultUser: TestResultUserDetailEntity[] | [];
}

const initialState: MockTestCategoryState = {
  data: [],
  dataResult: [],
  dataResultUser: [],
  error: null,
  status: 'idle',
  totalElement: 0,
};

const mockTestDetailSlice = createSlice({
  extraReducers: builder => {
    builder

      .addCase(getTestDetailByIdTest.pending, state => {
        state.status = 'pending';
      })
      .addCase(getTestDetailByIdTest.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data.items;
      })
      .addCase(getTestDetailByIdTest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(getTestResult.pending, state => {
        state.status = 'pending';
      })
      .addCase(getTestResult.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataResult = action.payload.data.items;
      })
      .addCase(getTestResult.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(getTestUserResult.pending, state => {
        state.status = 'pending';
      })
      .addCase(getTestUserResult.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataResultUser = action.payload.data.items;
        state.totalElement = action.payload.data.meta.total;
      })
      .addCase(getTestUserResult.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'mockTestDetail',
  reducers: {},
});

export default mockTestDetailSlice.reducer;
