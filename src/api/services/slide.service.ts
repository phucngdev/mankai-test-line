import { jsonAxios } from '#/api/axios/axios';

export const getSlideByIdLessionService = async (id: string) =>
  await jsonAxios.get(`slide/${id}`);
