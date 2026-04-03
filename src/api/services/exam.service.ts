import { jsonAxios } from '#/api/axios/axios';

export const getExamByIdLessionService = async (id: string) =>
  await jsonAxios.get(`exam-lesson/user/${id}`);
