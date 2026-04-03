/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type UpdateTestDto = {
  name: string;
  testType: UpdateTestDto.testType;
  description: string;
  randomAnswer: boolean;
  showSolution: boolean;
  alertRemainingTime: number;
  status: UpdateTestDto.status;
};

export namespace UpdateTestDto {
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
