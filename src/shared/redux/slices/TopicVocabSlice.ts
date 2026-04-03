import { createSlice } from '@reduxjs/toolkit';

import { getDetailTopicById } from '../thunk/TopicThunk';
import type { TopicVocabEntity } from '#/api/requests';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: TopicVocabEntity | null;
  error: string | null;
}

const initialState: TopicState = {
  data: null,
  error: null,
  status: 'idle',
};

const topicVocabSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(getDetailTopicById.pending, state => {
        state.status = 'pending';
      })
      .addCase(getDetailTopicById.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data.items;
      })
      .addCase(getDetailTopicById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'topicVocab',
  reducers: {},
});

export default topicVocabSlice.reducer;
