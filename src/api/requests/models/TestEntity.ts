/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TestDetailEntity } from './TestDetailEntity';

export type TestEntity = {
  id: string;
  name: string;
  testType: TestEntity.testType;
  description: string;
  randomAnswer: boolean;
  showSolution: boolean;
  alertRemainingTime: number;
  duration: number;
  status: TestEntity.status;
  numberOfParticipants: number;
  categoryId: string;
  testDetailIds: Array<string>;
  testDetails: Array<TestDetailEntity>;
};

export namespace TestEntity {
  export enum testType {
    TRY = 'TRY',
    REAL = 'REAL',
  }

  export enum status {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    CLOSED = 'CLOSED',
    PREVIEW = 'PREVIEW',
    DONE = 'DONE',
  }
}
