import { createSlice } from '@reduxjs/toolkit';

import {
  fetchAllMocKTest,
  getByIdMockTest,
  getTestById,
  getTestByIdMockTest,
} from '../thunk/MockTestThunk';
import type { TestCategoryEntity, TestEntity } from '#/api/requests';

interface MockTestCategoryState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: TestCategoryEntity[] | [];
  error: string | null;
  dataById: TestEntity[] | null;
  dataMockTest: TestCategoryEntity | null;
  totalElement: number;
  dataByIdTest: TestEntity | null;
}

const initialState: MockTestCategoryState = {
  data: [],
  dataById: [],
  dataByIdTest: null,
  dataMockTest: null,
  error: null,
  status: 'idle',
  totalElement: 0,
};

const mockTestSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(fetchAllMocKTest.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchAllMocKTest.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data.items;
      })
      .addCase(fetchAllMocKTest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(getTestByIdMockTest.pending, state => {
        state.status = 'pending';
      })
      .addCase(getTestByIdMockTest.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataById = action.payload.data.items;
      })
      .addCase(getTestByIdMockTest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(getByIdMockTest.pending, state => {
        state.status = 'pending';
      })
      .addCase(getByIdMockTest.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataMockTest = action.payload.data;
      })
      .addCase(getByIdMockTest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(getTestById.pending, state => {
        state.status = 'pending';
      })
      .addCase(getTestById.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataByIdTest = action.payload.data;
      })
      .addCase(getTestById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'mockTest',
  reducers: {},
});

export default mockTestSlice.reducer;
