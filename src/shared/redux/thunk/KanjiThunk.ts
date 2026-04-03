import { getAllKanjiByIdLessionService } from '#/api/services/kanji.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAllKanjiByIdLession = createAsyncThunk(
  'kanji/fetchAllKanji',
  async ({
    id,
    limit,
    offset,
  }: {
    id: string;
    limit: number;
    offset: number;
  }) => {
    const response = await getAllKanjiByIdLessionService(id, limit, offset);
    return response.data;
  },
);
