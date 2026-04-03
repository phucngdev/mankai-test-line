import { jsonAxios } from '#/api/axios/axios';

export const getExamLessionByLessonIdService = async (id: string) =>
  await jsonAxios.get(`exam-lesson/user/${id}`);
