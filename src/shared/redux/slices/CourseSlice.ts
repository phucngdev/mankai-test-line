import { createSlice } from '@reduxjs/toolkit';

import { fetchAllCourse, getCourseById } from '../thunk/CourseThunk';
import type { CourseEntity } from '#/api/requests';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: CourseEntity | null;
  error: string | null;
  dataById: CourseEntity | null;
}

const initialState: TopicState = {
  data: null,
  dataById: null,
  error: null,
  status: 'idle',
};

const courseSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(fetchAllCourse.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchAllCourse.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data.items;
      })
      .addCase(fetchAllCourse.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(getCourseById.pending, state => {
        state.status = 'pending';
      })
      .addCase(getCourseById.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataById = action.payload.data;
      })
      .addCase(getCourseById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'course',
  reducers: {},
});

export default courseSlice.reducer;
