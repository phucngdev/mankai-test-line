/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserBaseEntity } from './UserBaseEntity';

export type PostEntity = {
  id: string;
  user: UserBaseEntity;
  status: PostEntity.status;
  content: string;
  tagIds: Array<string>;
  userLikeCount: number;
  isLiked: boolean;
  commentCount: number;
  isDeleted: boolean;
  createdAt: string;
  isFlower: boolean;
  userGiveFlowerCount: number;
};

export namespace PostEntity {
  export enum status {
    PUBLISHED = 'PUBLISHED',
    BLOCKED = 'BLOCKED',
  }
}
