import { createSlice } from '@reduxjs/toolkit';

import { getTextByIdLession } from '../thunk/TextThunk';
import type { TextEntity } from '#/api/requests';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: TextEntity[] | null;
  error: string | null;
}

const initialState: TopicState = {
  data: [],
  error: null,
  status: 'idle',
};

const textSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(getTextByIdLession.pending, state => {
        state.status = 'pending';
      })
      .addCase(getTextByIdLession.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data.items;
      })
      .addCase(getTextByIdLession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'text',
  reducers: {},
});

export default textSlice.reducer;
