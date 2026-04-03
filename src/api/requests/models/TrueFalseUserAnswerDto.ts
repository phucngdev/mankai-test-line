/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TrueFalseUserAnswerDto = {
  questionId: string;
  questionType: 'TRUE_FALSE';
  answer: Array<{ isCorrect: boolean }>;
};
