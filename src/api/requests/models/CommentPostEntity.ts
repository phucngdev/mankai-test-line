/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CommentPostEntity = {
  id: string;
  content: string;
  userLikeCount: number;
  postId: string;
  user: Record<string, any>;
  isLiked: boolean;
  children: Array<CommentPostEntity>;
  createdAt: string;
};
