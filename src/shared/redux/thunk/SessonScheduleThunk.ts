import { getSessonSchedulesService } from '#/api/services/sessonschedules.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getSessonSchedules = createAsyncThunk(
  'getSessonSchedules',
  async ({
    classId,
    courseId,
    limit,
    offset,
  }: {
    classId: string;
    courseId: string;
    limit: number;
    offset: number;
  }) => {
    const response = await getSessonSchedulesService(
      classId,
      courseId,
      limit,
      offset,
    );
    return response.data;
  },
);
