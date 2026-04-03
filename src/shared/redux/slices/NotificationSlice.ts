import type { NotificationEntity } from '#/api/requests';
import {
  fetchNotification,
  fetchUnreadCountNotification,
  markReadNotification,
} from '#/shared/redux/thunk/NotificationThunk';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

interface NotificationState {
  items: NotificationEntity[];
  unreadCount: number;
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  error: string | null;
}

const initialState: NotificationState = {
  error: null,
  items: [],
  status: 'idle',
  unreadCount: 0,
};

const notificationSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(fetchNotification.fulfilled, (state, action) => {
        if (!action.meta.arg || action.meta.arg.offset === 0) {
          state.items = action.payload.data.items;
        } else {
          state.items.push(...action.payload.data.items);
        }

        state.status = 'successfully';
      })
      .addCase(fetchNotification.rejected, state => {
        state.status = 'failed';
      })
      .addCase(fetchNotification.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchUnreadCountNotification.fulfilled, (state, action) => {
        state.unreadCount = action.payload.data;
      })
      .addCase(fetchUnreadCountNotification.rejected, state => {
        state.status = 'failed';
      })
      .addCase(fetchUnreadCountNotification.pending, state => {
        state.status = 'pending';
      })
      .addCase(markReadNotification.fulfilled, (state, action) => {
        const itemToUpdate = state.items.find(
          i => i.id === action.payload.data.id,
        );

        if (itemToUpdate && !itemToUpdate.isSeen) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }

        state.items = state.items.map(i =>
          i.id === action.payload.data.id ? { ...i, isSeen: true } : i,
        );
      })
      .addCase(markReadNotification.rejected, state => {
        state.status = 'failed';
      })
      .addCase(markReadNotification.pending, state => {
        state.status = 'pending';
      });
  },
  initialState,
  name: 'notifications',
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationEntity>) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAllAsRead: state => {
      state.unreadCount = 0;
      state.items = state.items.map(i => ({ ...i, isSeen: true }));
    },
    setNotifications: (state, action: PayloadAction<NotificationEntity[]>) => {
      state.items = action.payload;
      state.unreadCount = action.payload.filter(i => !i.isSeen).length;
    },
  },
});

export const { setNotifications, addNotification, markAllAsRead } =
  notificationSlice.actions;

export default notificationSlice.reducer;
