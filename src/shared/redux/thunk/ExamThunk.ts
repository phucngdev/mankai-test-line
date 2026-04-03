import { getExamByIdLessionService } from '#/api/services/exam.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getExamByIdLession = createAsyncThunk(
  'exam/getById',
  async ({ id }: { id: string }) => {
    const response = await getExamByIdLessionService(id);
    return response.data;
  },
);
