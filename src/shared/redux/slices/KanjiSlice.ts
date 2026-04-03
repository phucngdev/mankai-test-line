import { createSlice } from '@reduxjs/toolkit';

import { fetchAllKanjiByIdLession } from '../thunk/KanjiThunk';
import type { KanjiEntity } from '#/api/requests';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: KanjiEntity[] | null;
  totalElement: number;
  error: string | null;
}

const initialState: TopicState = {
  data: null,
  error: null,
  status: 'idle',
  totalElement: 0,
};

const kanjiSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(fetchAllKanjiByIdLession.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchAllKanjiByIdLession.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data.items;
        state.totalElement = action.payload.data.meta.total;
      })
      .addCase(fetchAllKanjiByIdLession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'kanji',
  reducers: {},
});

export default kanjiSlice.reducer;
