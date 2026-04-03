import { jsonAxios } from '#/api/axios/axios';
import type { CreateNotificationTokenDto } from '#/api/requests';

export const addNotificationToken = async (doc: CreateNotificationTokenDto) =>
  await jsonAxios.post(`notification-tokens`, doc);

export const deleteNotificationToken = async (id: string) =>
  await jsonAxios.delete(`notification-tokens/${id}`);
