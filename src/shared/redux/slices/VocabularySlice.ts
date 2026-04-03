import { createSlice } from '@reduxjs/toolkit';

import { fetchAllVocabularyByIdLession } from '../thunk/VocabularyThunk';
import type { CourseVocabEntity } from '#/api/requests';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: CourseVocabEntity[] | null;
  totalElement: number;
  error: string | null;
}

const initialState: TopicState = {
  data: null,
  error: null,
  status: 'idle',
  totalElement: 0,
};

const vocabularySlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(fetchAllVocabularyByIdLession.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchAllVocabularyByIdLession.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data.items;
        state.totalElement = action.payload.data.meta.total;
      })
      .addCase(fetchAllVocabularyByIdLession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'vocabulary',
  reducers: {},
});

export default vocabularySlice.reducer;
