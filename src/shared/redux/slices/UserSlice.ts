import { createSlice } from '@reduxjs/toolkit';
import type { UserEntity } from '#/api/requests';
import { getProfile } from '../thunk/UserThunk';

interface TopicState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: UserEntity | null;
  error: string | null;
}

const initialState: TopicState = {
  data: null,
  error: null,
  status: 'idle',
};

const userSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(getProfile.pending, state => {
        state.status = 'pending';
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.data = action.payload.data;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'user',
  reducers: {},
});

export default userSlice.reducer;
