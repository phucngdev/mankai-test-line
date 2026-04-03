/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ManagerHasSubmittedEntity = {
  id: string;
  studentId: string;
  studentName: string;
  hasSubmitted: boolean;
  feedback: string;
  submittedExamUrls?: Array<string> | null;
  submittedText?: string | null;
  score?: number | null;
  gradedTest?: string | null;
  submittedAt?: string | null;
};
