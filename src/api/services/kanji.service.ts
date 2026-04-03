import { jsonAxios } from '#/api/axios/axios';

export const getAllKanjiByIdLessionService = async (
  id: string,
  limit: number,
  offset: number,
) =>
  await jsonAxios.get(
    `student/kanjis?lessonId=${id}&limit=${limit}&offset=${offset}`,
  );
