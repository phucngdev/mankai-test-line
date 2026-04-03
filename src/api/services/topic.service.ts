import { jsonAxios } from '#/api/axios/axios';

export const getAllTopicService = async (limit: number, offset: number) =>
  await jsonAxios.get(`user/topics?limit=${limit}&offset=${offset}`);

export const getTopicByIdService = async (id: string) =>
  await jsonAxios.get(`/user/topics/${id}`);

export const getDetailTopicService = async (id: string) =>
  await jsonAxios.get(`student/topic-vocabs?topicId=${id}`);
