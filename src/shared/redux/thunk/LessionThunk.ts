import type {
  CreateLessonCommentDto,
  UpsertLessonProgressDto,
} from '#/api/requests';
import {
  getAllLessionByIdCourseService,
  getLessionCommentService,
  getLessionService,
  postLessionCommentService,
  postLessionProgressService,
} from '#/api/services/lession.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAllLessionByIdCourse = createAsyncThunk(
  'lession/fetchAllSession',
  async ({ id }: { id: string }) => {
    const response = await getAllLessionByIdCourseService(id);
    return response.data;
  },
);

export const getLessionById = createAsyncThunk(
  'lession/getById',
  async (id: string) => {
    const response = await getLessionService(id);
    return response.data;
  },
);

export const postLessionProgress = createAsyncThunk(
  'lessionProgress',
  async (data: UpsertLessonProgressDto) => {
    const response = await postLessionProgressService(data);
    return response.data;
  },
);

export const getLessionComment = createAsyncThunk(
  'lession-comment/getById',
  async (id: string) => {
    const response = await getLessionCommentService(id);
    return response.data;
  },
);

export const postLessonComment = createAsyncThunk(
  'lessionProgress',
  async (data: CreateLessonCommentDto) => {
    const response = await postLessionCommentService(data);
    return response.data;
  },
);
