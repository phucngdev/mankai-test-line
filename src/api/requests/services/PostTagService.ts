/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePostTagDto } from '../models/CreatePostTagDto';
import type { IBaseResponse } from '../models/IBaseResponse';
import type { UpdatePostTagDto } from '../models/UpdatePostTagDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class PostTagService {
  /**
   * Get all post tags
   * @param limit
   * @param offset
   * @param name Search by name
   * @param order Format: fieldName:[asc,desc]
   * @returns any
   * @throws ApiError
   */
  public static postTagControllerGetMany(
    limit: number = 10,
    offset: number,
    name?: string | null,
    order?: string | null,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/post-tag',
      query: {
        limit: limit,
        offset: offset,
        name: name,
        order: order,
      },
    });
  }

  /**
   * Create new post tag
   * @param requestBody
   * @returns any
   * @throws ApiError
   */
  public static postTagControllerCreate(
    requestBody: CreatePostTagDto,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/post-tag',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Get post tag by id
   * @param id
   * @returns any
   * @throws ApiError
   */
  public static postTagControllerGetById(
    id: string,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/post-tag/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Update post tag by id
   * @param id
   * @param requestBody
   * @returns any
   * @throws ApiError
   */
  public static postTagControllerUpdate(
    id: string,
    requestBody: UpdatePostTagDto,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/post-tag/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Delete post tag by id
   * @param id
   * @returns any
   * @throws ApiError
   */
  public static postTagControllerDelete(
    id: string,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/post-tag/{id}',
      path: {
        id: id,
      },
    });
  }
}
