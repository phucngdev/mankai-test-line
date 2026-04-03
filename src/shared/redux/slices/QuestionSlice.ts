import { createSlice } from '@reduxjs/toolkit';

import { fetchAllQuestion } from '../thunk/QuestionThunk';
import type { QuestionEntity } from '#/api/requests';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  dataQuestion: QuestionEntity[] | null;
  totalElement: number;
  error: string | null;
}

const initialState: TopicState = {
  dataQuestion: null,
  error: null,
  status: 'idle',
  totalElement: 0,
};

const questionSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(fetchAllQuestion.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchAllQuestion.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataQuestion = action.payload.data.items;
        state.totalElement = action.payload.data.meta.total;
      })
      .addCase(fetchAllQuestion.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'question',
  reducers: {},
});

export default questionSlice.reducer;
