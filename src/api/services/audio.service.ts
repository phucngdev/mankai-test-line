import { jsonAxios } from '#/api/axios/axios';

export const getAudioByIdLessionService = async (
  id: string,
  limit: number,
  offset: number,
) =>
  await jsonAxios.get(`audio-url/user/${id}?limit=${limit}&offset=${offset}`);
