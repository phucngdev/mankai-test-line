/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ForumRankingUserEntity } from './ForumRankingUserEntity';

export type ForumRankingEntity = {
  top10: Array<ForumRankingUserEntity>;
  currentUser: ForumRankingUserEntity;
};
