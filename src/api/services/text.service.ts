import { jsonAxios } from '#/api/axios/axios';

export const getTextByIdLessionService = async (
  id: string,
  limit: number,
  offset: number,
) => await jsonAxios.get(`text/user/${id}?limit=${limit}&offset=${offset}`);
