import type {
  UpdateLocaleDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
} from '#/api/requests';
import {
  getProfileService,
  putUpdateLocaleService,
  putUpdatePassService,
  putUpdateProfileService,
} from '#/api/services/user.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const putUpdatePass = createAsyncThunk(
  'user/updatePass',
  async (data: UpdateUserPasswordDto) => {
    const response = await putUpdatePassService(data);
    return response.data;
  },
);

export const putUpdateProfile = createAsyncThunk(
  'user/updateProfile',
  async (data: UpdateUserDto) => {
    const response = await putUpdateProfileService(data);
    return response.data;
  },
);

export const getProfile = createAsyncThunk('user/profile', async () => {
  const response = await getProfileService();
  return response.data;
});

export const putUpdateLocale = createAsyncThunk(
  'user/updateLocale',
  async (data: { locale: UpdateLocaleDto }) => {
    const response = await putUpdateLocaleService(data);
    return response.data;
  },
);
