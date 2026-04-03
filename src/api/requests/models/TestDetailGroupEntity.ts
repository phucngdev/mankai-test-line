/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TestDetailGroupEntity = {
  id: string;
  name: string;
  description: string;
  randomAnswer: boolean;
  status: TestDetailGroupEntity.status;
  duration: number;
  alertRemainingTime: number;
  numberOfParticipants: number;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
};

export namespace TestDetailGroupEntity {
  export enum status {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    CLOSED = 'CLOSED',
    PREVIEW = 'PREVIEW',
    DONE = 'DONE',
  }
}
