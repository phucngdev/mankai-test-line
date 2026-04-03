/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MatchingAnswerDto } from './MatchingAnswerDto';

export type MatchingUserAnswerDto = {
  questionId: string;
  questionType: MatchingUserAnswerDto.questionType;
  answer: Array<MatchingAnswerDto>;
};

export namespace MatchingUserAnswerDto {
  export enum questionType {
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    SORTING = 'SORTING',
    MATCHING = 'MATCHING',
    MULTIPLE_CHOICE_HORIZONTAL = 'MULTIPLE_CHOICE_HORIZONTAL',
    FILL_IN_BLANK = 'FILL_IN_BLANK',
    CHOOSE_ANSWER_IN_BLANK = 'CHOOSE_ANSWER_IN_BLANK',
    DROP_DOWN_ANSWER = 'DROP_DOWN_ANSWER',
    ESSAY = 'ESSAY',
    RECORD = 'RECORD',
    HANDWRITING = 'HANDWRITING',
  }
}
