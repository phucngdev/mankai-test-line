import { getAllVocabularyByIdLessionService } from '#/api/services/vocabulary.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAllVocabularyByIdLession = createAsyncThunk(
  'topic/fetchAllVocabulary',
  async ({
    id,
    limit,
    offset,
  }: {
    id: string;
    limit: number;
    offset: number;
  }) => {
    const response = await getAllVocabularyByIdLessionService(
      id,
      limit,
      offset,
    );
    return response.data;
  },
);
