export interface ForumTag {
  id: number;
  name: string;
}

export interface PostUser {
  id: string;
  userCode: number;
  email: string;
  avatarUrl: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  isActive: boolean;
  locale: string;
}

export interface ForumPost {
  id: string;
  user: PostUser;
  status: string;
  content: string;
  tagIds: string[];
  userLikeCount: number;
  userGiveFlowerCount?: number;
  isLiked: boolean;
  isFlower: boolean;
  commentCount: number;
  isDeleted: boolean;
  createdAt: string;
}

export interface GetAllPostsParams {
  limit: number;
  offset: number;
  tagIds?: string[];
}

export interface CreatePostPayload {
  content: string;
  tagIds: string[];
}

export interface PostComment {
  id: string;
  content: string;
  userLikeCount: number;
  postId: string;
  user: PostUser;
  isLiked: boolean;
  createdAt: string;
  parentCommentId?: string;
}

export interface GetCommentsParams {
  limit: number;
  offset: number;
  postId: string;
  order?: string;
}

export interface ForumRankingItem {
  avatarUrl: string;
  fullName: string;
  point: number;
  position: number;
}

export interface GetForumRankingParams {
  limit: number;
  offset: number;
  range?: string;
}

export interface CreateCommentPayload {
  content: string;
  postId: string;
  parentCommentId?: string;
}

export interface ForumRankingTag {
  id: number;
  name: string;
  position: number;
  totalPost: number;
  totalInteract: number;
}

export interface PaginatedItems<T> {
  items: T[];
  total?: number;
}

export interface ApiEnvelope<T> {
  data: T;
}

export type ForumTagListResponse = ApiEnvelope<PaginatedItems<ForumTag>>;

export type ForumPostListResponse = ApiEnvelope<PaginatedItems<ForumPost>>;

export type ForumPostSingleResponse = ApiEnvelope<ForumPost>;

export interface ForumRankingResponseData {
  top10: ForumRankingItem[];
  currentUserRanking?: ForumRankingItem;
}

export type ForumRankingResponse = ApiEnvelope<ForumRankingResponseData>;

export type ForumRankingTagResponse = ApiEnvelope<ForumRankingTag[]>;

export type PostCommentListResponse = ApiEnvelope<PaginatedItems<PostComment>>;

export type PostCommentSingleResponse = ApiEnvelope<PostComment>;

export interface ToggleCommentLikeResult {
  isLiked: boolean;
  userLikeCount: number;
}

export type ToggleCommentLikeResponse = ApiEnvelope<ToggleCommentLikeResult>;
