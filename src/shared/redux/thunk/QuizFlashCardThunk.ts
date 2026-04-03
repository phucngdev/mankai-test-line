import { getQuizFlashByIdLessionService } from '#/api/services/quizFlashCard.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getQuizFlashCardByIdLession = createAsyncThunk(
  'quiz-flash-card/getById',
  async ({
    id,
    limit,
    offset,
  }: {
    id: string;
    limit: number;
    offset: number;
  }) => {
    const response = await getQuizFlashByIdLessionService(id, limit, offset);
    return response.data;
  },
);
