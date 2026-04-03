/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTestDto } from '../models/CreateTestDto';
import type { IBaseResponse } from '../models/IBaseResponse';
import type { JoinTestDto } from '../models/JoinTestDto';
import type { SaveTemporaryAnswerDto } from '../models/SaveTemporaryAnswerDto';
import type { SwitchTestDetailDto } from '../models/SwitchTestDetailDto';
import type { UpdateTestDto } from '../models/UpdateTestDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TestService {
  /**
   * Create new test
   * @param requestBody
   * @returns any
   * @throws ApiError
   */
  public static testControllerCreateTest(
    requestBody: CreateTestDto,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/test',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Get all tests
   * @param limit
   * @param offset
   * @param order Format: fieldName:[asc,desc]
   * @returns any
   * @throws ApiError
   */
  public static testControllerGetAllTests(
    limit: number = 10,
    offset: number,
    order?: string | null,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/test',
      query: {
        limit: limit,
        offset: offset,
        order: order,
      },
    });
  }

  /**
   * Join test
   * @param requestBody
   * @returns any
   * @throws ApiError
   */
  public static testControllerJoinTest(
    requestBody: JoinTestDto,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/test/join',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Switch test detail in test process
   * @param requestBody
   * @returns any
   * @throws ApiError
   */
  public static testControllerSwitchTestDetail(
    requestBody: SwitchTestDetailDto,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/test/switch-test-detail',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Save temporary answer
   * @param requestBody
   * @returns any
   * @throws ApiError
   */
  public static testControllerHandleTemporaryAnswer(
    requestBody: SaveTemporaryAnswerDto,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/test/temporary-answer',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Sync current test detail in test process
   * @returns any
   * @throws ApiError
   */
  public static testControllerGetCurrentTestDetailInTestProcess(): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/test/sync-current-test-detail',
    });
  }

  /**
   * Get tests by category id
   * @param categoryId
   * @param status
   * @param testType
   * @param limit
   * @param offset
   * @param order Format: fieldName:[asc,desc]
   * @returns any
   * @throws ApiError
   */
  public static testControllerGetTestsByCategory(
    categoryId: string,
    status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'PREVIEW' | 'DONE',
    testType: 'TRY' | 'REAL',
    limit: number = 10,
    offset: number,
    order?: string | null,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/test/{categoryId}',
      path: {
        categoryId: categoryId,
      },
      query: {
        status: status,
        testType: testType,
        limit: limit,
        offset: offset,
        order: order,
      },
    });
  }

  /**
   * Get tests by category id and user id of user
   * @param categoryId
   * @param userId
   * @param limit
   * @param offset
   * @param order Format: fieldName:[asc,desc]
   * @returns any
   * @throws ApiError
   */
  public static testControllerGetTestsByCategoryAndUser(
    categoryId: string,
    userId: string,
    limit: number = 10,
    offset: number,
    order?: string | null,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/test/category/{categoryId}/user/{userId}',
      path: {
        categoryId: categoryId,
        userId: userId,
      },
      query: {
        limit: limit,
        offset: offset,
        order: order,
      },
    });
  }

  /**
   * Get test by id
   * @param id
   * @returns any
   * @throws ApiError
   */
  public static testControllerGetTestById(
    id: string,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/test/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Update test by id
   * @param id
   * @param requestBody
   * @returns any
   * @throws ApiError
   */
  public static testControllerUpdateTest(
    id: string,
    requestBody: UpdateTestDto,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/test/{id}',
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Delete test by id
   * @param id
   * @returns any
   * @throws ApiError
   */
  public static testControllerDeleteTest(
    id: string,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/test/{id}',
      path: {
        id: id,
      },
    });
  }

  /**
   * Update test status by id
   * @param id
   * @returns any
   * @throws ApiError
   */
  public static testControllerUpdateTestStatus(
    id: string,
  ): CancelablePromise<IBaseResponse> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/test/{id}/status',
      path: {
        id: id,
      },
    });
  }
}
