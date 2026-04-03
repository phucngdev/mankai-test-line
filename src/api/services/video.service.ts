import { jsonAxios } from '#/api/axios/axios';

export const getVideoByIdLessionService = async (
  id: string,
  limit: number,
  offset: number,
) =>
  await jsonAxios.get(`video-url/user/${id}?limit=${limit}&offset=${offset}`);
