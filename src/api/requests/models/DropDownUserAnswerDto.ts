/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DropDownAnswerDto } from './DropDownAnswerDto';

export type DropDownUserAnswerDto = {
  questionId: string;
  questionType: DropDownUserAnswerDto.questionType;
  answer: Array<DropDownAnswerDto>;
};

export namespace DropDownUserAnswerDto {
  export enum questionType {
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    SORTING = 'SORTING',
    MATCHING = 'MATCHING',
    MULTIPLE_CHOICE_HORIZONTAL = 'MULTIPLE_CHOICE_HORIZONTAL',
    FILL_IN_BLANK = 'FILL_IN_BLANK',
    CHOOSE_ANSWER_IN_BLANK = 'CHOOSE_ANSWER_IN_BLANK',
    ESSAY = 'ESSAY',
    DROP_DOWN_ANSWER = 'DROP_DOWN_ANSWER',
    RECORD = 'RECORD',
    HANDWRITING = 'HANDWRITING',
  }
}
