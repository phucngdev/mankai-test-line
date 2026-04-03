/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SortingAnswerDto } from './SortingAnswerDto';

export type SortingUserAnswerDto = {
  questionId: string;
  questionType: SortingUserAnswerDto.questionType;
  answer: Array<SortingAnswerDto>;
};

export namespace SortingUserAnswerDto {
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
