import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  getAllCourseService,
  getCourseByIdService,
} from '#/api/services/course.service';

export const fetchAllCourse = createAsyncThunk(
  'course/fetchAll',
  async ({ limit, offset }: { limit: number; offset: number }) => {
    const response = await getAllCourseService(limit, offset);
    return response.data;
  },
);

export const getCourseById = createAsyncThunk(
  'course/getCourseById',
  async (id: string) => {
    const response = await getCourseByIdService(id);
    return response.data;
  },
);
