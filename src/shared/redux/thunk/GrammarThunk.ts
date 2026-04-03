import { getAllGrammarByIdLessionService } from '#/api/services/grammar.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAllGrammarByIdLession = createAsyncThunk(
  'gramar/fetchAllKanji',
  async ({
    id,
    limit,
    offset,
  }: {
    id: string;
    limit: number;
    offset: number;
  }) => {
    const response = await getAllGrammarByIdLessionService(id, limit, offset);
    return response.data;
  },
);
