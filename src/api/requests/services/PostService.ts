/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePostDto } from '../models/CreatePostDto';
import type { IBaseResponse } from '../models/IBaseResponse';
import type { ToggleReactionDto } from '../models/ToggleReactionDto';
import type { UpdatePostDto } from '../models/UpdatePostDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class PostService {
  /**
   * Get all posts
   * @param limit
   * @param offset
   * @param userId Filter by user id
   * @param content Search by content
   * @param status
   * @param tagIds Filter by post tag id
   * @param order Format: fieldName:[asc,desc]
   * @returns any
   * @throws ApiError
   */
  public static postControllerGetMany(
    limit: number = 10,
    offset: number,
    userId?: string | null,
    content?: string | null,
    status?: 'PUBLISHED' | 'BLOCKED' | null,
    tagIds?: string | null,
    order?: string | null,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/posts',
      query: {
        limit: limit,
        offset: offset,
        userId: userId,
        content: content,
        status: status,
        tagIds: tagIds,
        order: order,
      },
    });
  }

  /**
   * Create new post
   * @param requestBody
   * @returns any
   * @throws ApiError
   */
  public static postControllerCreate(
    requestBody: CreatePostDto,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/posts',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Get post by id
   * @param id
   * @returns any
   * @throws ApiError
   */
  public static postControllerGetPostById(
    id: string,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/posts/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Update post by id
   * @param id
   * @param requestBody
   * @returns any
   * @throws ApiError
   */
  public static postControllerUpdate(
    id: string,
    requestBody: UpdatePostDto,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/posts/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Delete post by id
   * @param id
   * @returns any
   * @throws ApiError
   */
  public static postControllerDelete(
    id: string,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/posts/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Toggle reaction post
   * @param id
   * @param requestBody
   * @returns any
   * @throws ApiError
   */
  public static postControllerToggleReactionPost(
    id: string,
    requestBody: ToggleReactionDto,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/posts/{id}/toggle-reaction',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
