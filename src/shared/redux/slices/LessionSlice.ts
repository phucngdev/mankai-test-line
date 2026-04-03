import { createSlice } from '@reduxjs/toolkit';

import {
  fetchAllLessionByIdCourse,
  getLessionById,
  getLessionComment,
} from '../thunk/LessionThunk';
import type {
  LessonCommentEntity,
  LessonProgressEntity,
  LessonStudentEntity,
} from '#/api/requests';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: LessonStudentEntity[] | [];
  error: string | null;
  dataById: LessonStudentEntity | null;
  dataProgress: LessonProgressEntity | null;
  dataComment: LessonCommentEntity[] | [];
}

const initialState: TopicState = {
  data: [],
  dataById: null,
  dataComment: [],
  dataProgress: null,
  error: null,
  status: 'idle',
};

const lessionSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(fetchAllLessionByIdCourse.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchAllLessionByIdCourse.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data;
      })
      .addCase(fetchAllLessionByIdCourse.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(getLessionById.pending, state => {
        state.status = 'pending';
      })
      .addCase(getLessionById.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataById = action.payload.data;
      })
      .addCase(getLessionById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(getLessionComment.pending, state => {
        state.status = 'pending';
      })
      .addCase(getLessionComment.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataComment = action.payload.data;
      })
      .addCase(getLessionComment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'lession',
  reducers: {
    resetDataLession(state) {
      state.data = [];
      state.dataById = null;
      state.dataComment = [];
      state.dataProgress = null;
    },
    updateLessionProgress: (state, action) => {
      const { lessonId, progress } = action.payload;

      if (state.data && state.data.length) {
        const lesson = state.data.find(item => item.id === lessonId);

        if (lesson && lesson.progress !== 100) {
          lesson.progress =
            lesson.progress > progress ? lesson.progress : progress;
        }
      }
    },
  },
});

export const { updateLessionProgress, resetDataLession } = lessionSlice.actions;

export default lessionSlice.reducer;
