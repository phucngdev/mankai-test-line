/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type HandWritingAnswerPayload = {
  isCorrect: boolean;
};

export type HandWritingUserAnswerDto = {
  questionId: string;
  questionType: 'HANDWRITING';
  answer: HandWritingAnswerPayload;
};
