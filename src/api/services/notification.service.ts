import { jsonAxios } from '#/api/axios/axios';
import type { UpdateNotificationDto } from '#/api/requests';

export const getNotifications = async (limit?: number, offset?: number) =>
  await jsonAxios.get(`notifications?limit=${limit}&offset=${offset}`);

export const getUnreadCountNotification = async () =>
  await jsonAxios.get(`notifications/unread-count`);

export const readNotification = async (
  id: string,
  doc: UpdateNotificationDto,
) => await jsonAxios.put(`notifications/${id}/seen`, doc);
