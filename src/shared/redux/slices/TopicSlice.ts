import { createSlice } from '@reduxjs/toolkit';

import { fetchAllTopic, getTopicById } from '../thunk/TopicThunk';
import type { TopicEntity } from '#/api/requests';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: TopicEntity | null;
  error: string | null;
  dataEdit: TopicEntity | null;
}

const initialState: TopicState = {
  data: null,
  dataEdit: null,
  error: null,
  status: 'idle',
};

const topicSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(fetchAllTopic.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchAllTopic.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data.items;
      })
      .addCase(fetchAllTopic.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(getTopicById.pending, state => {
        state.status = 'pending';
      })
      .addCase(getTopicById.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data;
      })
      .addCase(getTopicById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'topic',
  reducers: {
    selectTopic: (state, action) => {
      state.dataEdit = action.payload;
    },
  },
});
export const { selectTopic } = topicSlice.actions;

export default topicSlice.reducer;
