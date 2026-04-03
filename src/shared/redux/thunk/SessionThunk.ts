import {
  getAllSessionByIdCourseService,
  getSessionService,
} from '#/api/services/session.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAllSessionByIdCourse = createAsyncThunk(
  'session/fetchAlSession',
  async ({
    id,
    limit,
    offset,
  }: {
    id: string;
    limit: number;
    offset: number;
  }) => {
    const response = await getAllSessionByIdCourseService(id, limit, offset);
    return response.data;
  },
);

export const getSessionById = createAsyncThunk(
  'session/getById',
  async (id: string) => {
    const response = await getSessionService(id);
    return response.data;
  },
);
