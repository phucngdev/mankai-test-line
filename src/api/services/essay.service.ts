import { jsonAxios } from '#/api/axios/axios';
import type { CreateEssayTestDto, UpdateSubmitEssayUserDto } from '../requests';

export const postEssayService = async (data: CreateEssayTestDto) =>
  await jsonAxios.post(`essay-test`, data);

export const deleteEssayService = async (id: string) =>
  await jsonAxios.delete(`essay-test/${id}`);

export const getEssayByUserService = async (
  userId: string,
  examId: string,
  testDetailId?: string,
  questionId?: string,
) => {
  const params = new URLSearchParams({ userId, examId });
  if (testDetailId) params.set('testDetailId', testDetailId);
  if (questionId) params.set('questionId', questionId);
  return await jsonAxios.get(`essay-test/by-user/test?${params.toString()}`);
};

export const updateEssayService = async (
  id: string,
  data: UpdateSubmitEssayUserDto,
) => await jsonAxios.put(`essay-test/submit/${id}`, data);
