/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IBaseResponse } from '../models/IBaseResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class RankingService {
  /**
   * Get ranking of forum
   * @param range
   * @param limit
   * @param offset
   * @returns any
   * @throws ApiError
   */
  public static rankingControllerGetForumRanking(
    range?: string,
    limit: number = 10,
    offset: number,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/ranking/forum',
      query: {
        range: range,
        limit: limit,
        offset: offset,
      },
    });
  }

  /**
   * Get ranking of post tag
   * @returns any
   * @throws ApiError
   */
  public static rankingControllerGetPostTagRanking(): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/ranking/post-tag',
    });
  }

  /**
   * Get ranking of post
   * @param limit
   * @param offset
   * @param range
   * @returns any
   * @throws ApiError
   */
  public static rankingControllerGetPostRanking(
    limit: number = 10,
    offset: number,
    range?: string,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/ranking/post',
      query: {
        limit: limit,
        offset: offset,
        range: range,
      },
    });
  }

  /**
   * Get my point of forum
   * @returns any
   * @throws ApiError
   */
  public static rankingControllerGetMyPostPoint(): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/ranking/forum/my-point',
    });
  }
}
