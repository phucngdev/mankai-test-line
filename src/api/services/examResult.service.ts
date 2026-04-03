import { jsonAxios } from '#/api/axios/axios';
import type { UpsertExamResultStudentDto } from '../requests';

export const postExamResultService = async (data: UpsertExamResultStudentDto) =>
  await jsonAxios.post(`/student/exam-results`, data);

export const getExamResultService = async (classId: string, courseId: string) =>
  await jsonAxios.get(
    `/student/exam-results?classId=${classId}&courseId=${courseId}`,
  );

export const getExamResultHistoryService = async (
  examId: string,
  userId: string,
) => await jsonAxios.get(`/student/exam-results/exam/${examId}/user/${userId}`);

export const getExamResultHistoryDetailService = async (examResultId: string) =>
  await jsonAxios.get(`/student/exam-results/exam-detail/${examResultId}`);
