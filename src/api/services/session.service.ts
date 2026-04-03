import { jsonAxios } from '#/api/axios/axios';

export const getAllSessionByIdCourseService = async (
  id: string,
  limit: number,
  offset: number,
) =>
  await jsonAxios.get(
    `student/sessons?courseId=${id}&limit=${limit}&offset=${offset}`,
  );

export const getSessionService = async (id: string) =>
  await jsonAxios.get(`student/sessons/${id}`);
