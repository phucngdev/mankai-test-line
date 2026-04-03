import { createSlice } from '@reduxjs/toolkit';

import { getQuizFlashCardByIdLession } from '../thunk/QuizFlashCardThunk';
import type { QuizFlashCardEntity } from '#/api/requests';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: QuizFlashCardEntity[] | null;
  error: string | null;
  totalElement: number;
}

const initialState: TopicState = {
  data: [],
  error: null,
  status: 'idle',
  totalElement: 0,
};

const quizFlashCardSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(getQuizFlashCardByIdLession.pending, state => {
        state.status = 'pending';
      })
      .addCase(getQuizFlashCardByIdLession.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data.items;
        state.totalElement = action.payload.data.meta.total;
      })
      .addCase(getQuizFlashCardByIdLession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'quizFlashCardSlice',
  reducers: {},
});

export default quizFlashCardSlice.reducer;
