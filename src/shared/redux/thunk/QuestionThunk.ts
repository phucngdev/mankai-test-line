import { getAllQuestionService } from '#/api/services/question.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAllQuestion = createAsyncThunk(
  'question/fetchAllQuestion',
  async ({ limit, offset }: { limit: number; offset: number }) => {
    const response = await getAllQuestionService(limit, offset);
    return response.data;
  },
);
