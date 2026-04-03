import { jsonAxios } from '#/api/axios/axios';
import type {
  CreateLessonCommentDto,
  UpsertLessonProgressDto,
} from '../requests';

export const getAllLessionByIdCourseService = async (id: string) =>
  await jsonAxios.get(`student/lessons?sessonId=${id}`);

export const getLessionService = async (id: string) =>
  await jsonAxios.get(`student/lessons/${id}`);

export const postLessionProgressService = async (
  data: UpsertLessonProgressDto,
) => await jsonAxios.post(`lesson-progresses`, data);

export const postLessionCommentService = async (data: CreateLessonCommentDto) =>
  await jsonAxios.post(`lesson-comment`, data);

export const getLessionCommentService = async (id: string) =>
  await jsonAxios.get(`lesson-comment/${id}`);
