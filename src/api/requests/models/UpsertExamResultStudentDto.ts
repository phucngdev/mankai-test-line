/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DropDownUserAnswerDto } from './DropDownUserAnswerDto';
import type { InBlankUserAnswerDto } from './InBlankUserAnswerDto';
import type { MatchingUserAnswerDto } from './MatchingUserAnswerDto';
import type { MultipleChoiceHorizontalUserAnswerDto } from './MultipleChoiceHorizontalUserAnswerDto';
import type { MultipleChoiceUserAnswerDto } from './MultipleChoiceUserAnswerDto';
import type { SortingUserAnswerDto } from './SortingUserAnswerDto';

export type UpsertExamResultStudentDto = {
  point: number;
  examId: string;
  courseId: string;
  classId: string;
  userAnswers: Array<
    | MultipleChoiceUserAnswerDto
    | MultipleChoiceHorizontalUserAnswerDto
    | SortingUserAnswerDto
    | MatchingUserAnswerDto
    | InBlankUserAnswerDto
    | DropDownUserAnswerDto
  >;
};
