import type { UpsertExamResultStudentDto } from '#/api/requests';
import {
  getExamResultHistoryDetailService,
  getExamResultHistoryService,
  getExamResultService,
  postExamResultService,
} from '#/api/services/examResult.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const postExamReults = createAsyncThunk(
  'exam-results',
  async (data: UpsertExamResultStudentDto) => {
    const response = await postExamResultService(data);
    return response.data;
  },
);

export const getExamReults = createAsyncThunk(
  'exam-results/classId/courseId',
  async ({ classId, courseId }: { classId: string; courseId: string }) => {
    const response = await getExamResultService(classId, courseId);
    return response.data;
  },
);

export const getExamReultsHistory = createAsyncThunk(
  'exam-results/examId',
  async ({ examId, userId }: { examId: string; userId: string }) => {
    const response = await getExamResultHistoryService(examId, userId);
    return response.data;
  },
);

export const getExamReultsDetailHistory = createAsyncThunk(
  'exam-results/userId/examId',
  async ({ examResultId }: { examResultId: string }) => {
    const response = await getExamResultHistoryDetailService(examResultId);
    return response.data;
  },
);
