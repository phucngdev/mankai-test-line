import { jsonAxios } from '#/api/axios/axios';

export const getUserClassService = async () =>
  await jsonAxios.get(`student/courses`);

export const getAllClassService = async () =>
  await jsonAxios.get(`student/classes/all-classes`);

export const getClassByIdService = async (id: string) =>
  await jsonAxios.get(`student/classes/${id}`);
