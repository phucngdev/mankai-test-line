import { createSlice } from '@reduxjs/toolkit';

import { fetchAllPracticeByIdLession } from '../thunk/PracticeThunk';
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

const practiceSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(fetchAllPracticeByIdLession.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchAllPracticeByIdLession.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data.items;
        state.totalElement = action.payload.data.meta.total;
      })
      .addCase(fetchAllPracticeByIdLession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'practice',
  reducers: {},
});

export default practiceSlice.reducer;
