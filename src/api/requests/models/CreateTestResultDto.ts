/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DropDownUserAnswerDto } from './DropDownUserAnswerDto';
import type { HandWritingUserAnswerDto } from './HandWritingUserAnswerDto';
import type { InBlankUserAnswerDto } from './InBlankUserAnswerDto';
import type { MatchingUserAnswerDto } from './MatchingUserAnswerDto';
import type { MultipleChoiceHorizontalUserAnswerDto } from './MultipleChoiceHorizontalUserAnswerDto';
import type { MultipleChoiceUserAnswerDto } from './MultipleChoiceUserAnswerDto';
import type { SortingUserAnswerDto } from './SortingUserAnswerDto';
import type { TrueFalseUserAnswerDto } from './TrueFalseUserAnswerDto';

export type CreateTestResultDto = {
  userId: string;
  testId: string;
  score: number;
  userAnswers: Array<
    | MultipleChoiceUserAnswerDto
    | MultipleChoiceHorizontalUserAnswerDto
    | SortingUserAnswerDto
    | MatchingUserAnswerDto
    | InBlankUserAnswerDto
    | DropDownUserAnswerDto
    | HandWritingUserAnswerDto
    | TrueFalseUserAnswerDto
  >;
};
