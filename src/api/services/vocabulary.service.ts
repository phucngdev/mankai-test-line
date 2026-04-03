import { jsonAxios } from '#/api/axios/axios';

export const getAllVocabularyByIdLessionService = async (
  id: string,
  limit: number,
  offset: number,
) =>
  await jsonAxios.get(
    `student/course-vocabs?lessonId=${id}&limit=${limit}&offset=${offset}`,
  );
