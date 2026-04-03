import { createSlice } from '@reduxjs/toolkit';

import { getSlideByIdLession } from '../thunk/SlideThunk';
import type { SlideEntity } from '#/api/requests';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: SlideEntity[] | null;
  error: string | null;
}

const initialState: TopicState = {
  data: [],
  error: null,
  status: 'idle',
};

const slideSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(getSlideByIdLession.pending, state => {
        state.status = 'pending';
      })
      .addCase(getSlideByIdLession.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data;
      })
      .addCase(getSlideByIdLession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'slide',
  reducers: {},
});

export default slideSlice.reducer;
