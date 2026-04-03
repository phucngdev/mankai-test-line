/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MultipleChoiceAnswerDto } from './MultipleChoiceAnswerDto';

export type DropDownAnswerDto = {
  index: number;
  explanation: string | null;
  arrAnswer: Array<MultipleChoiceAnswerDto>;
};
