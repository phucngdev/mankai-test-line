/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateCommentDto } from '../models/CreateCommentDto';
import type { IBaseResponse } from '../models/IBaseResponse';
import type { UpdateCommentDto } from '../models/UpdateCommentDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class PostCommentService {
  /**
   * Get all comments of post
   * @param postId
   * @param limit
   * @param offset
   * @param order Format: fieldName:[asc,desc]
   * @returns any
   * @throws ApiError
   */
  public static commentPostControllerGetAllCommentPost(
    postId: string,
    limit: number = 10,
    offset: number,
    order?: string | null,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/comment-posts',
      query: {
        limit: limit,
        offset: offset,
        postId: postId,
        order: order,
      },
    });
  }

  /**
   * Create post comment
   * @param requestBody
   * @returns any
   * @throws ApiError
   */
  public static commentPostControllerCreateCommentPost(
    requestBody: CreateCommentDto,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/comment-posts',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Update comment
   * @param id
   * @param requestBody
   * @returns any
   * @throws ApiError
   */
  public static commentPostControllerUpdateComment(
    id: string,
    requestBody: UpdateCommentDto,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/comment-posts/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Delete comment
   * @param id
   * @returns any
   * @throws ApiError
   */
  public static commentPostControllerDeleteComment(
    id: string,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/comment-posts/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Toggle like post comment
   * @param id
   * @returns any
   * @throws ApiError
   */
  public static commentPostControllerToggleLikeCommentPost(
    id: string,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/comment-posts/{id}/toggle-like',
      path: {
        id: id,
      },
    });
  }
}
