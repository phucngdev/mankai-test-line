import { createSlice } from '@reduxjs/toolkit';
import {
  getAllClass,
  getClasByIdUser,
  getClassById,
} from '../thunk/ClassThunk';
import type { ClassDetailEntity, EnrolledCourseEntity } from '#/api/requests';

interface ClassState {
  status: 'idle' | 'pending' | 'successfully' | 'failed';
  dataClass: EnrolledCourseEntity[] | [];
  error: string | null;
  dataAllClass: ClassDetailEntity[] | [];
  dataClassById: ClassDetailEntity | null;
}

const initialState: ClassState = {
  dataAllClass: [],
  dataClass: [],
  dataClassById: null,
  error: null,
  status: 'idle',
};

const classSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(getClasByIdUser.pending, state => {
        state.status = 'pending';
      })
      .addCase(getClasByIdUser.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataClass = action.payload.data;
      })
      .addCase(getClasByIdUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(getAllClass.pending, state => {
        state.status = 'pending';
      })
      .addCase(getAllClass.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataAllClass = action.payload.data;
      })
      .addCase(getAllClass.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(getClassById.pending, state => {
        state.status = 'pending';
      })
      .addCase(getClassById.fulfilled, (state, action) => {
        state.status = 'successfully';
        state.dataClassById = action.payload.data;
      })
      .addCase(getClassById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Unknown error';
      });
  },
  initialState,
  name: 'class',
  reducers: {
    resetDataClass(state) {
      state.dataClass = [];
      state.status = 'idle';
      state.error = null;
    },
    resetDataClassById(state) {
      state.dataClassById = null;
    },
  },
});

export const { resetDataClassById, resetDataClass } = classSlice.actions;

export default classSlice.reducer;
