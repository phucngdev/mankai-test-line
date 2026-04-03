import { getSlideByIdLessionService } from '#/api/services/slide.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getSlideByIdLession = createAsyncThunk(
  'slide/getById',
  async ({ id }: { id: string }) => {
    const response = await getSlideByIdLessionService(id);
    return response.data;
  },
);
