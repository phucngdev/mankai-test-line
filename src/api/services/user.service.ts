import { jsonAxios } from '#/api/axios/axios';
import type {
  UpdateLocaleDto,
  UpdateLoginProviderDto,
  UpdateUserDto,
  UpdateUserPasswordDto,
} from '../requests';

export const putUpdatePassService = async (data: UpdateUserPasswordDto) =>
  await jsonAxios.put(`users/me/update-password`, data);

export const putUpdateProfileService = async (data: UpdateUserDto) =>
  await jsonAxios.put(`users/me`, data);

export const getProfileService = async () => await jsonAxios.get(`users/me`);

export const putUpdateLocaleService = async (data: {
  locale: UpdateLocaleDto;
}) => await jsonAxios.put(`users/me/update-locale`, data);

export const putUpdateLoginProviderService = async (
  data: UpdateLoginProviderDto,
) => await jsonAxios.put(`users/me/login-provider`, data);
