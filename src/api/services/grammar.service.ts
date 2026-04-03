import { jsonAxios } from '#/api/axios/axios';

export const getAllGrammarByIdLessionService = async (
  id: string,
  limit: number,
  offset: number,
) =>
  await jsonAxios.get(
    `student/grammars?lessonId=${id}&limit=${limit}&offset=${offset}`,
  );
