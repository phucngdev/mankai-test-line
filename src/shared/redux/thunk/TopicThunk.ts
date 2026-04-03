import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  getAllTopicService,
  getDetailTopicService,
  getTopicByIdService,
} from '#/api/services/topic.service';

export const fetchAllTopic = createAsyncThunk(
  'topic/fetchAll',
  async ({ limit, offset }: { limit: number; offset: number }) => {
    const response = await getAllTopicService(limit, offset);
    return response.data;
  },
);

export const getDetailTopicById = createAsyncThunk(
  'topicVocab/getById',
  async (id: string) => {
    const response = await getDetailTopicService(id);
    return response.data;
  },
);

export const getTopicById = createAsyncThunk(
  'topic/getById',
  async (id: string) => {
    const response = await getTopicByIdService(id);
    return response.data;
  },
);
