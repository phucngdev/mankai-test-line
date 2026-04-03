/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { QuestionEntity } from './QuestionEntity';
import type { QuestionGroupEntity } from './QuestionGroupEntity';

export type ExamEntity = {
  id: string;
  name: string;
  q: string;
  questionGroups: Array<QuestionGroupEntity>;
  questions: Array<QuestionEntity>;
};
