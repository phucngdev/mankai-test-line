import { createSlice } from '@reduxjs/toolkit';

import { fetchAllReadingByIdLession } from '../thunk/ReadingThunk';
import type { QuestionGroupEntity } from '#/api/requests';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: QuestionGroupEntity[] | null;
  totalElement: number;
  error: string | null;
}

const initialState: TopicState = {
  data: null,
  error: null,
  status: 'idle',
  totalElement: 0,
};

const readingSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(fetchAllReadingByIdLession.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchAllReadingByIdLession.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data.items;
        state.totalElement = action.payload.data.meta.total;
      })
      .addCase(fetchAllReadingByIdLession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'reading',
  reducers: {},
});

export default readingSlice.reducer;
