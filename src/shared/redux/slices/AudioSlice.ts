import { createSlice } from '@reduxjs/toolkit';

import { getAudioByIdLession } from '../thunk/AudioThunk';
import type { QuestionGroupEntity } from '#/api/requests';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: QuestionGroupEntity[] | null;
  error: string | null;
  totalElement: number;
}

const initialState: TopicState = {
  data: [],
  error: null,
  status: 'idle',
  totalElement: 0,
};

const audioSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(getAudioByIdLession.pending, state => {
        state.status = 'pending';
      })
      .addCase(getAudioByIdLession.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data.items;
        state.totalElement = action.payload.data.meta.total;
      })
      .addCase(getAudioByIdLession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'audio',
  reducers: {},
});

export default audioSlice.reducer;
