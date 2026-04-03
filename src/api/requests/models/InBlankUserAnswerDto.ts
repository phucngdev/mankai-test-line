/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { InBlankAnswerDto } from './InBlankAnswerDto';

export type InBlankUserAnswerDto = {
  questionId: string;
  questionType: InBlankUserAnswerDto.questionType;
  answer: Array<InBlankAnswerDto>;
};

export namespace InBlankUserAnswerDto {
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
