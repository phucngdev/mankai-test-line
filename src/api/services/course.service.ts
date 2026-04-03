import { jsonAxios } from '#/api/axios/axios';

export const getAllCourseService = async (limit: number, offset: number) =>
  await jsonAxios.get(`courses?limit=${limit}&offset=${offset}`);

export const getCourseByIdService = async (id: string) =>
  await jsonAxios.get(`student/courses/${id}`);
