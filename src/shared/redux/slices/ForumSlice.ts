import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type {
  ForumPost,
  ForumPostListResponse,
  ForumPostSingleResponse,
  ForumRankingItem,
  ForumRankingResponse,
  ForumTag,
  ForumTagListResponse,
} from '#/api/requests/interface/Forum/Forum';
import {
  createPost,
  deletePost,
  fetchAllPosts,
  fetchAllTags,
  fetchForumRanking,
  togglePostFlower,
  togglePostLike,
  updatePost,
} from '../thunk/ForumThunk';

interface ForumState {
  tags: ForumTag[];
  posts: ForumPost[];
  selectedTagId: number | null;
  postsStatus: 'idle' | 'pending' | 'successfully' | 'failed';
  createPostStatus: 'idle' | 'pending' | 'successfully' | 'failed';
  ranking: ForumRankingItem[];
  rankingStatus: 'idle' | 'pending' | 'successfully' | 'failed';
  editingPostId: string | null;
}

const initialState: ForumState = {
  createPostStatus: 'idle',
  editingPostId: null,
  posts: [],
  postsStatus: 'idle',
  ranking: [],
  rankingStatus: 'idle',
  selectedTagId: null,
  tags: [],
};

const forumSlice = createSlice({
  extraReducers: builder => {
    builder
      .addCase(
        fetchAllTags.fulfilled,
        (state, action: { payload: ForumTagListResponse }) => {
          const {
            payload: {
              data: { items },
            },
          } = action;
          state.tags = items.map((tag: ForumTag) => ({
            id: tag.id,
            name: tag.name,
          }));
        },
      )
      .addCase(createPost.pending, state => {
        state.createPostStatus = 'pending';
      })
      .addCase(createPost.fulfilled, state => {
        state.createPostStatus = 'successfully';
      })
      .addCase(createPost.rejected, state => {
        state.createPostStatus = 'failed';
      })
      .addCase(fetchAllPosts.pending, state => {
        state.postsStatus = 'pending';
      })
      .addCase(
        fetchAllPosts.fulfilled,
        (state, action: { payload: ForumPostListResponse }) => {
          state.postsStatus = 'successfully';
          state.posts = action.payload.data.items;
        },
      )
      .addCase(fetchAllPosts.rejected, state => {
        state.postsStatus = 'failed';
      })
      .addCase(fetchForumRanking.pending, state => {
        state.rankingStatus = 'pending';
      })
      .addCase(
        fetchForumRanking.fulfilled,
        (state, action: { payload: ForumRankingResponse }) => {
          state.rankingStatus = 'successfully';
          state.ranking = action.payload.data.top10;
        },
      )
      .addCase(fetchForumRanking.rejected, state => {
        state.rankingStatus = 'failed';
      })
      .addCase(togglePostLike.pending, (state, action) => {
        const post = state.posts.find(p => p.id === action.meta.arg);
        if (!post) return;
        const wasLiked = Boolean(post.isLiked);
        post.isLiked = !wasLiked;
        const nextCount = (post.userLikeCount ?? 0) + (wasLiked ? -1 : 1);
        post.userLikeCount = Math.max(0, nextCount);
      })
      .addCase(togglePostLike.fulfilled, (state, action) => {
        const post = state.posts.find(p => p.id === action.meta.arg);
        if (!post) return;
        const payload = action.payload as {
          data?: { isLiked?: boolean; userLikeCount?: number };
          isLiked?: boolean;
          userLikeCount?: number;
        };
        const result = payload?.data ?? payload;
        if (result?.isLiked !== undefined) {
          post.isLiked = Boolean(result.isLiked);
        }
        if (typeof result?.userLikeCount === 'number') {
          post.userLikeCount = result.userLikeCount;
        }
      })
      .addCase(togglePostLike.rejected, (state, action) => {
        const post = state.posts.find(p => p.id === action.meta.arg);
        if (!post) return;
        const wasLiked = Boolean(post.isLiked);
        post.isLiked = !wasLiked;
        const nextCount = (post.userLikeCount ?? 0) + (wasLiked ? -1 : 1);
        post.userLikeCount = Math.max(0, nextCount);
      })
      .addCase(togglePostFlower.pending, (state, action) => {
        const post = state.posts.find(p => p.id === action.meta.arg);
        if (!post) return;
        const wasFlower = Boolean(post.isFlower);
        post.isFlower = !wasFlower;
        const nextCount =
          (post.userGiveFlowerCount ?? 0) + (wasFlower ? -1 : 1);
        post.userGiveFlowerCount = Math.max(0, nextCount);
      })
      .addCase(togglePostFlower.fulfilled, (state, action) => {
        const post = state.posts.find(p => p.id === action.meta.arg);
        if (!post) return;
        const payload = action.payload as {
          data?: { isFlower?: boolean; userGiveFlowerCount?: number };
          isFlower?: boolean;
          userGiveFlowerCount?: number;
        };
        const result = payload?.data ?? payload;
        if (result?.isFlower !== undefined) {
          post.isFlower = Boolean(result.isFlower);
        }
        if (typeof result?.userGiveFlowerCount === 'number') {
          post.userGiveFlowerCount = result.userGiveFlowerCount;
        }
      })
      .addCase(togglePostFlower.rejected, (state, action) => {
        const post = state.posts.find(p => p.id === action.meta.arg);
        if (!post) return;
        const wasFlower = Boolean(post.isFlower);
        post.isFlower = !wasFlower;
        const nextCount =
          (post.userGiveFlowerCount ?? 0) + (wasFlower ? -1 : 1);
        post.userGiveFlowerCount = Math.max(0, nextCount);
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const { postId } = action.meta.arg as { postId: string };
        const existing = state.posts.find(p => p.id === postId);
        if (!existing) return;

        const updatedPost = (action as { payload: ForumPostSingleResponse })
          .payload.data;

        existing.content = updatedPost.content;
        existing.tagIds = updatedPost.tagIds;
        existing.status = updatedPost.status;
        existing.isDeleted = updatedPost.isDeleted;
      })
      .addCase(deletePost.fulfilled, (state, action: PayloadAction<string>) => {
        state.posts = state.posts.filter(p => p.id !== action.payload);
      });
  },
  initialState,
  name: 'forum',
  reducers: {
    resetCreatePostStatus: state => {
      state.createPostStatus = 'idle';
    },
    setSelectedTagId: (state, action: PayloadAction<number | null>) => {
      state.selectedTagId = action.payload;
    },
    startEditingPost: (state, action: PayloadAction<string>) => {
      state.editingPostId = action.payload;
    },
    stopEditingPost: state => {
      state.editingPostId = null;
    },
    incrementPostCommentCount: (state, action: PayloadAction<string>) => {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        post.commentCount = (post.commentCount ?? 0) + 1;
      }
    },
  },
});

export const {
  incrementPostCommentCount,
  resetCreatePostStatus,
  setSelectedTagId,
  startEditingPost,
  stopEditingPost,
} = forumSlice.actions;

export default forumSlice.reducer;
