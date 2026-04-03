import { createSlice } from '@reduxjs/toolkit';

import { fetchAllGrammarByIdLession } from '../thunk/GrammarThunk';
import type { GrammarEntity } from '#/api/requests';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: GrammarEntity[] | null;
  totalElement: number;
  error: string | null;
}

const initialState: TopicState = {
  data: null,
  error: null,
  status: 'idle',
  totalElement: 0,
};

const grammarSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(fetchAllGrammarByIdLession.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchAllGrammarByIdLession.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data.items;
        state.totalElement = action.payload.data.meta.total;
      })
      .addCase(fetchAllGrammarByIdLession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'grammar',
  reducers: {},
});

export default grammarSlice.reducer;
