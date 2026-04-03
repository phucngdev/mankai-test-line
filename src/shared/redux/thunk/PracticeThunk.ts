import { getAllQuestionGroupByIdLessionService } from '#/api/services/questionGroup.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAllPracticeByIdLession = createAsyncThunk(
  'practice/fetchAllPractice',
  async ({
    id,
    limit,
    offset,
  }: {
    id: string;
    limit: number;
    offset: number;
  }) => {
    const response = await getAllQuestionGroupByIdLessionService(
      id,
      limit,
      offset,
    );
    return response.data;
  },
);
