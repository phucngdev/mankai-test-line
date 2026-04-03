import { getVideoByIdLessionService } from '#/api/services/video.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getVideoByIdLession = createAsyncThunk(
  'video/getById',
  async ({
    id,
    limit,
    offset,
  }: {
    id: string;
    limit: number;
    offset: number;
  }) => {
    const response = await getVideoByIdLessionService(id, limit, offset);
    return response.data;
  },
);
