import { jsonAxios } from '#/api/axios/axios';

export const getAllQuestionGroupByIdLessionService = async (
  id: string,
  limit: number,
  offset: number,
) =>
  await jsonAxios.get(
    `student/question-groups?examId=${id}&limit=${limit}&offset=${offset}`,
  );
