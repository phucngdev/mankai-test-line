import type { UpdateNotificationDto } from '#/api/requests';
import {
  getNotifications,
  getUnreadCountNotification,
  readNotification,
} from '#/api/services/notification.service';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchNotification = createAsyncThunk(
  'notification/fetch',
  async ({
    limit = 10,
    offset = 0,
  }: { limit?: number; offset?: number } = {}) => {
    const response = await getNotifications(limit, offset);
    return response.data;
  },
);

export const fetchUnreadCountNotification = createAsyncThunk(
  'notification/fetchUnreadCount',
  async () => {
    const response = await getUnreadCountNotification();
    return response.data;
  },
);

export const markReadNotification = createAsyncThunk(
  'notification/read',
  async ({ id, doc }: { id: string; doc: UpdateNotificationDto }) => {
    const response = await readNotification(id, doc);

    return response.data;
  },
);
