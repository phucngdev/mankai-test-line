import { createSlice } from '@reduxjs/toolkit';

import { getVideoByIdLession } from '../thunk/VideoThunk';
import type { VideoUrlEntity } from '#/api/requests';
import { message } from 'antd';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: VideoUrlEntity[] | null;
  error: string | null;
}

const initialState: TopicState = {
  data: [],
  error: null,
  status: 'idle',
};

const videoSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(getVideoByIdLession.pending, state => {
        state.status = 'pending';
      })
      .addCase(getVideoByIdLession.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data.items;
      })
      .addCase(getVideoByIdLession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
        message.error(
          `Lỗi khi lấy video (10s): ${action.error.message || 'Unknown error'}`,
          10,
        );
      });
  },
  initialState,
  name: 'video',
  reducers: {},
});

export default videoSlice.reducer;
