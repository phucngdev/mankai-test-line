import { getTextByIdLessionService } from '#/api/services/text.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getTextByIdLession = createAsyncThunk(
  'text/getById',
  async ({
    id,
    limit,
    offset,
  }: {
    id: string;
    limit: number;
    offset: number;
  }) => {
    const response = await getTextByIdLessionService(id, limit, offset);
    return response.data;
  },
);
