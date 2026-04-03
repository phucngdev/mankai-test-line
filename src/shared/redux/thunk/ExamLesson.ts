import { getExamLessionByLessonIdService } from '#/api/services/examLesson.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getExamLessonByIdLession = createAsyncThunk(
  'examLesson/getByLessonId',
  async ({ id }: { id: string }) => {
    const response = await getExamLessionByLessonIdService(id);
    return response.data;
  },
);
