import {
  getFlashCardByIdLessionService,
  postlashCardByIdLessionService,
} from '#/api/services/flashcard.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getFlashCardByIdLession = createAsyncThunk(
  'flash-card/getById',
  async ({
    id,
    limit,
    offset,
  }: {
    id: string;
    limit: number;
    offset: number;
  }) => {
    const response = await getFlashCardByIdLessionService(id, limit, offset);
    return response.data;
  },
);

export const postFlashCardByIdLession = createAsyncThunk(
  'flash-card/post',
  async ({ id }: { id: string }) => {
    const response = await postlashCardByIdLessionService(id);
    return response.data;
  },
);
