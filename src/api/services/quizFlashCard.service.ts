import { jsonAxios } from '#/api/axios/axios';

export const getQuizFlashByIdLessionService = async (
  id: string,
  limit: number,
  offset: number,
) =>
  await jsonAxios.get(
    `quiz-flash-card/user/${id}?limit=${limit}&offset=${offset}`,
  );
