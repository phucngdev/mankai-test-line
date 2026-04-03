import { jsonAxios } from '#/api/axios/axios';
import type {
  CreateCommentPayload,
  CreatePostPayload,
  ForumPostListResponse,
  ForumPostSingleResponse,
  ForumRankingResponse,
  ForumRankingTagResponse,
  ForumTagListResponse,
  GetAllPostsParams,
  GetCommentsParams,
  GetForumRankingParams,
  PostCommentListResponse,
  PostCommentSingleResponse,
  ToggleCommentLikeResponse,
} from '#/api/requests/interface/Forum/Forum';

type PostReactionType = 'LIKE' | 'FLOWER';

export const getAllTagService = (limit: number, offset: number) =>
  jsonAxios.get<ForumTagListResponse>(
    `post-tag?limit=${limit}&offset=${offset}`,
  );

export const createPostService = (payload: CreatePostPayload) =>
  jsonAxios.post<ForumPostSingleResponse>('posts', payload);

export const updatePostService = (postId: string, payload: CreatePostPayload) =>
  jsonAxios.put<ForumPostSingleResponse>(`posts/${postId}`, payload);

export const deletePostService = (postId: string) =>
  jsonAxios.delete(`posts/${postId}`);

export const getAllPostsService = (params: GetAllPostsParams) => {
  const search = new URLSearchParams();
  search.set('limit', String(params.limit));
  search.set('offset', String(params.offset));

  if (params.tagIds?.length) {
    params.tagIds.forEach(id => search.append('tagIds', id));
  }

  return jsonAxios.get<ForumPostListResponse>(`posts?${search.toString()}`);
};

export const togglePostReactionService = (
  postId: string,
  type: PostReactionType,
) =>
  jsonAxios.put<ForumPostSingleResponse>(`posts/${postId}/toggle-reaction`, {
    type,
  });

export const togglePostLikeService = (postId: string) =>
  togglePostReactionService(postId, 'LIKE');

export const togglePostFlowerService = (postId: string) =>
  togglePostReactionService(postId, 'FLOWER');

export const getCommentsService = (params: GetCommentsParams) => {
  const search = new URLSearchParams();
  search.set('limit', String(params.limit));
  search.set('offset', String(params.offset));
  if (params.order) search.set('order', params.order);
  if (params.postId) search.set('postId', params.postId);
  return jsonAxios.get<PostCommentListResponse>(
    `comment-posts?${search.toString()}`,
  );
};

export const createCommentService = (payload: CreateCommentPayload) =>
  jsonAxios.post<PostCommentSingleResponse>('comment-posts', payload);

export const toggleCommentLikeService = (commentId: string) =>
  jsonAxios.put<ToggleCommentLikeResponse>(
    `comment-posts/${commentId}/toggle-like`,
  );

export const deleteCommentService = (commentId: string) =>
  jsonAxios.delete(`comment-posts/${commentId}`);

export const updateCommentService = (commentId: string, content: string) =>
  jsonAxios.put<PostCommentSingleResponse>(`comment-posts/${commentId}`, {
    content,
  });

export const getForumRankingService = (params: GetForumRankingParams) => {
  const search = new URLSearchParams();
  search.set('limit', String(params.limit));
  search.set('offset', String(params.offset));
  if (params.range) search.set('range', params.range);

  return jsonAxios.get<ForumRankingResponse>(
    `ranking/forum?${search.toString()}`,
  );
};

export const getAllRankingTagsService = () =>
  jsonAxios.get<ForumRankingTagResponse>(`ranking/post-tag`);
