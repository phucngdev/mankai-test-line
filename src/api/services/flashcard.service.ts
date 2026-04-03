import { jsonAxios } from '#/api/axios/axios';

export const getFlashCardByIdLessionService = async (
  id: string,
  limit: number,
  offset: number,
) =>
  await jsonAxios.get(`flash-card/user/${id}?limit=${limit}&offset=${offset}`);

export const postlashCardByIdLessionService = async (id: string) =>
  await jsonAxios.post(`flash-card/${id}/user/set-status`);
