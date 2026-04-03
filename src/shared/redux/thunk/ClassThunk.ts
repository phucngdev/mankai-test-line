import {
  getAllClassService,
  getClassByIdService,
  getUserClassService,
} from '#/api/services/class.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getClasByIdUser = createAsyncThunk('class/getById', async () => {
  const response = await getUserClassService();
  return response.data;
});

export const getAllClass = createAsyncThunk('classAll', async () => {
  const response = await getAllClassService();
  return response.data;
});

export const getClassById = createAsyncThunk(
  'classAll/getById',
  async ({ id }: { id: string }) => {
    const response = await getClassByIdService(id);
    return response.data;
  },
);
