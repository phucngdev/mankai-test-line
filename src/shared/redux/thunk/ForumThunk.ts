import type {
  CreatePostPayload,
  ForumPostListResponse,
  ForumRankingResponse,
  ForumTagListResponse,
  GetAllPostsParams,
  GetForumRankingParams,
} from '#/api/requests/interface/Forum/Forum';
import {
  createPostService,
  deletePostService,
  getAllPostsService,
  getAllTagService,
  getForumRankingService,
  togglePostFlowerService,
  togglePostLikeService,
  updatePostService,
} from '#/api/services/forum.services';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAllTags = createAsyncThunk(
  'forum/fetchAllTags',
  async (params: {
    limit: number;
    offset: number;
  }): Promise<ForumTagListResponse> => {
    const { data } = await getAllTagService(params.limit, params.offset);
    return data;
  },
);

export const createPost = createAsyncThunk(
  'forum/createPost',
  async (payload: CreatePostPayload, { rejectWithValue }) => {
    try {
      const { data } = await createPostService(payload);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data ?? err);
    }
  },
);

export const fetchAllPosts = createAsyncThunk(
  'forum/fetchAllPosts',
  async (params: GetAllPostsParams): Promise<ForumPostListResponse> => {
    const { data } = await getAllPostsService(params);
    return data;
  },
);

export const fetchForumRanking = createAsyncThunk(
  'forum/fetchForumRanking',
  async (params: GetForumRankingParams): Promise<ForumRankingResponse> => {
    const { data } = await getForumRankingService(params);
    return data;
  },
);

export const togglePostLike = createAsyncThunk(
  'forum/togglePostLike',
  async (postId: string, { rejectWithValue }) => {
    try {
      const { data } = await togglePostLikeService(postId);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data ?? err);
    }
  },
);

export const togglePostFlower = createAsyncThunk(
  'forum/togglePostFlower',
  async (postId: string, { rejectWithValue }) => {
    try {
      const { data } = await togglePostFlowerService(postId);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data ?? err);
    }
  },
);

export const updatePost = createAsyncThunk(
  'forum/updatePost',
  async (
    params: { postId: string; payload: CreatePostPayload },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await updatePostService(params.postId, params.payload);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data ?? err);
    }
  },
);

export const deletePost = createAsyncThunk(
  'forum/deletePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      await deletePostService(postId);
      return postId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data ?? err);
    }
  },
);
