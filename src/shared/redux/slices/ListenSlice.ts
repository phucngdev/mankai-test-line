import { createSlice } from '@reduxjs/toolkit';

import { fetchAllListenByIdLession } from '../thunk/ListeningThunk';
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

const listenSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(fetchAllListenByIdLession.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchAllListenByIdLession.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data.items;
        state.totalElement = action.payload.data.meta.total;
      })
      .addCase(fetchAllListenByIdLession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'listen',
  reducers: {},
});

export default listenSlice.reducer;
