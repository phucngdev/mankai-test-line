import type { CreateTestResultDto } from '#/api/requests';
import {
  getByIdMockTestService,
  getMockTestService,
  getTestByIdMockTestService,
  getTestByIdService,
  getTestDetailByIdTestService,
  getTestResultService,
  getTestResultUserService,
  postTestService,
  joinTestService,
  syncCurrentTestDetailService,
  switchTestDetailService,
  saveTemporaryAnswerService,
  deleteTestProcessService,
} from '#/api/services/mockTest.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAllMocKTest = createAsyncThunk(
  'mocktest/getById',
  async ({
    userId,
    limit,
    offset,
  }: {
    userId: string;
    limit: number;
    offset: number;
  }) => {
    const response = await getMockTestService(userId, limit, offset);
    return response.data;
  },
);

export const getTestByIdMockTest = createAsyncThunk(
  'test/getById',
  async ({
    id,
    limit,
    offset,
    status,
  }: {
    id: string;
    limit: number;
    offset: number;
    status?: string;
  }) => {
    const response = await getTestByIdMockTestService(
      id,
      limit,
      offset,
      status,
    );
    return response.data;
  },
);

export const getByIdMockTest = createAsyncThunk(
  'test/getByIdMocktest',
  async ({ id }: { id: string }) => {
    const response = await getByIdMockTestService(id);
    return response.data;
  },
);

export const getTestDetailByIdTest = createAsyncThunk(
  'testDetail/getById',
  async ({
    id,
    limit,
    offset,
  }: {
    id: string;
    limit: number;
    offset: number;
  }) => {
    const response = await getTestDetailByIdTestService(id, limit, offset);
    return response.data;
  },
);

export const postTestResult = createAsyncThunk(
  'post/test',
  async ({ data }: { data: CreateTestResultDto }) => {
    const response = await postTestService(data);
    return response.data;
  },
);

export const getTestResult = createAsyncThunk(
  'test/testResult',
  async ({
    userId,
    testId,
    limit,
    offset,
  }: {
    userId: string;
    testId: string;
    limit: number;
    offset: number;
  }) => {
    const response = await getTestResultService(userId, testId, limit, offset);
    return response.data;
  },
);

export const getTestUserResult = createAsyncThunk(
  'testUser/testResult',
  async ({
    userId,
    limit,
    offset,
  }: {
    userId: string;
    limit: number;
    offset: number;
  }) => {
    const response = await getTestResultUserService(userId, limit, offset);
    return response.data;
  },
);

export const getTestById = createAsyncThunk(
  'testById',
  async ({ id }: { id: string }) => {
    const response = await getTestByIdService(id);
    return response.data;
  },
);

export const joinTest = createAsyncThunk(
  'test/join',
  async ({ testId }: { testId: string }) => {
    const response = await joinTestService({ testId });
    return response.data;
  },
);

export const syncCurrentTestDetail = createAsyncThunk(
  'test/syncCurrentTestDetail',
  async () => {
    const response = await syncCurrentTestDetailService();
    return response.data;
  },
);

export const switchTestDetail = createAsyncThunk(
  'test/switchTestDetail',
  async (data: { testId: string; currentTestDetailId: string }) => {
    const response = await switchTestDetailService(data);
    return response.data;
  },
);

export const saveTemporaryAnswer = createAsyncThunk(
  'test/saveTemporaryAnswer',
  async (data: any) => {
    const response = await saveTemporaryAnswerService(data);
    return response.data;
  },
);

export const deleteTestProcess = createAsyncThunk(
  'test/deleteTestProcess',
  async ({ testId }: { testId: string }) => {
    const response = await deleteTestProcessService(testId);
    return response.data;
  },
);
