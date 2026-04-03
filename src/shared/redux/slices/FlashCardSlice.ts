import { createSlice } from '@reduxjs/toolkit';

import { getFlashCardByIdLession } from '../thunk/FlashCardThunk';
import type { FlashCardStatusEntity } from '#/api/requests';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: FlashCardStatusEntity[] | null;
  error: string | null;
  totalElement: number;
}

const initialState: TopicState = {
  data: [],
  error: null,
  status: 'idle',
  totalElement: 0,
};

const flashCardSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(getFlashCardByIdLession.pending, state => {
        state.status = 'pending';
      })
      .addCase(getFlashCardByIdLession.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data.items;
        state.totalElement = action.payload.data.meta.total;
      })
      .addCase(getFlashCardByIdLession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'flashCard',
  reducers: {},
});

export default flashCardSlice.reducer;
