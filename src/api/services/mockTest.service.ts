import { jsonAxios } from '#/api/axios/axios';
import type { CreateTestResultDto } from '../requests';

export const getMockTestService = async (
  userId: string,
  limit: number,
  offset: number,
) =>
  await jsonAxios.get(
    `test-category/user/${userId}?limit=${limit}&offset=${offset}`,
  );

export const getTestByIdMockTestService = async (
  id: string,
  limit: number,
  offset: number,
  status?: string,
) => {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    ...(status ? { status } : {}),
  });
  return await jsonAxios.get(`test/${id}?${params.toString()}`);
};

export const getByIdMockTestService = async (id: string) =>
  await jsonAxios.get(`test-category/${id}`);

export const getTestDetailByIdTestService = async (
  id: string,
  limit: number,
  offset: number,
) => await jsonAxios.get(`test-detail/${id}?limit=${limit}&offset=${offset}`);

export const postTestService = async (data: CreateTestResultDto) =>
  await jsonAxios.post(`/test-result`, data);

export const getTestResultService = async (
  userId: string,
  testId: string,
  limit: number,
  offset: number,
) =>
  await jsonAxios.get(
    `/test-result/user/${userId}/test/${testId}/?limit=${limit}&offset=${offset}`,
  );

export const getTestResultUserService = async (
  userId: string,
  limit: number,
  offset: number,
) =>
  await jsonAxios.get(
    `/test-result/user-all-test-result/${userId}/?limit=${limit}&offset=${offset}`,
  );

export const getTestByIdService = async (id: string) =>
  await jsonAxios.get(`test/${id}`);

export const joinTestService = async (data: { testId: string }) =>
  await jsonAxios.post(`/test/join`, data);

export const syncCurrentTestDetailService = async () =>
  await jsonAxios.get(`/test/sync-current-test-detail`);

export const switchTestDetailService = async (data: {
  testId: string;
  currentTestDetailId: string;
}) => await jsonAxios.post(`/test/switch-test-detail`, data);

export const saveTemporaryAnswerService = async (data: any) =>
  await jsonAxios.post(`/test/temporary-answer`, data);

export const deleteTestProcessService = async (testId: string) =>
  await jsonAxios.delete(`/test/test-process/${testId}`);
