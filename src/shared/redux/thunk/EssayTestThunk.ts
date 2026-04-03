import type {
  CreateEssayTestDto,
  UpdateSubmitEssayUserDto,
} from '#/api/requests';
import {
  deleteEssayService,
  getEssayByUserService,
  postEssayService,
  updateEssayService,
} from '#/api/services/essay.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const createEssay = createAsyncThunk(
  'essay/create',
  async (data: CreateEssayTestDto) => {
    const response = await postEssayService(data);
    return response.data;
  },
);

export const deleteEssay = createAsyncThunk(
  'deteleEssayById',
  async (id: string) => {
    const response = await deleteEssayService(id);
    return response.data;
  },
);

export const getEssayByUser = createAsyncThunk(
  'essayByUser',
  async ({ userId, examId }: { userId: string; examId: string }) => {
    try {
      const response = await getEssayByUserService(userId, examId);
      return response.data;
    } catch (error) {}
  },
);

export const updateEssay = createAsyncThunk(
  'essayTest/updateEssay',
  async ({ id, data }: { id: string; data: UpdateSubmitEssayUserDto }) => {
    const response = await updateEssayService(id, data);
    return response.data;
  },
);
