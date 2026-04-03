import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { SessonScheduleStatusEntity } from '#/api/requests';
import { getSessonSchedules } from '../thunk/SessonScheduleThunk';

interface SessonSchedulesState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  data: SessonScheduleStatusEntity[];
  error: string | null;
  totalElement: number;
  offset: number;
}

const initialState: SessonSchedulesState = {
  data: [],
  error: null,
  offset: 0,
  status: 'idle',
  totalElement: 0,
};

const sessonSchedulesSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(getSessonSchedules.pending, state => {
        state.status = 'pending';
      })
      .addCase(getSessonSchedules.fulfilled, (state, action) => {
        state.status = 'successfully';

        if (state.data.length < state.totalElement || state.data.length === 0) {
          state.data = [...state.data, ...action.payload.data.items];
          state.offset = action.payload.data.meta.offset;
        }

        state.totalElement = action.payload.data.meta.total;
      })
      .addCase(getSessonSchedules.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'sessonSchedules',
  reducers: {
    resetData: state => {
      state.data = [];
      state.totalElement = 0;
    },
    setData: (
      state,
      action: PayloadAction<{ data: any[]; totalElement: number }>,
    ) => {
      state.data = Array.isArray(action.payload.data)
        ? action.payload.data
        : []; // ✅ ép thành mảng
      state.totalElement = action.payload.totalElement ?? 0;
    },
  },
});

export const { resetData, setData } = sessonSchedulesSlice.actions;

export default sessonSchedulesSlice.reducer;
