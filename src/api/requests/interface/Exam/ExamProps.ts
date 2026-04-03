import type { ExamLessonWithMappingEntity } from '../../models/ExamLessonWithMappingEntity';
import type { InBlankUserAnswerDto } from '../../models/InBlankUserAnswerDto';
import type { MatchingUserAnswerDto } from '../../models/MatchingUserAnswerDto';
import type { MultipleChoiceHorizontalUserAnswerDto } from '../../models/MultipleChoiceHorizontalUserAnswerDto';
import type { MultipleChoiceUserAnswerDto } from '../../models/MultipleChoiceUserAnswerDto';
import type { QuestionEntity } from '../../models/QuestionEntity';
import type { QuestionGroupEntity } from '../../models/QuestionGroupEntity';
import type { SortingUserAnswerDto } from '../../models/SortingUserAnswerDto';

export interface ExamProps {
  data: QuestionEntity | QuestionGroupEntity;
  totalGroups: any;
  onAnswerChange?: (answer: Record<number, string[]>) => void;
  currentGroupIndex?: number;
  onSetExplanation?: (explanation: string) => void;
  selectedAnswers?: string[];
  restartKey?: number;
  onSelectQuestion?: (index: number) => void;
  showAnswer: boolean;
  reviewMode?: boolean;
  reviewData: any;
}

export type AllUserAnswerDto =
  | MatchingUserAnswerDto
  | MultipleChoiceUserAnswerDto
  | MultipleChoiceHorizontalUserAnswerDto
  | InBlankUserAnswerDto
  | SortingUserAnswerDto;

export interface ExamFormProps {
  lessonId: string;
  onClickNext: () => void;
  isAnyCompleted: boolean;
  reviewData?: any;
}

export interface AnswerGroup {
  id: string;
  answer: string;
}

export interface DecryptedData {
  items: ExamLessonWithMappingEntity[];
}

export interface ExamConnectProps {
  data: QuestionEntity | QuestionGroupEntity;
  totalGroups: any;
  onAnswerChange?: (
    isComplete: boolean,
    pairs?: { left: string; right: string }[],
  ) => void;
  currentGroupIndex?: number;
  onSelectQuestion?: (index: number) => void;
  reviewMode?: boolean;
  reviewData: any;
  showAnswer?: boolean;
}

export interface ExamDragAdvProps {
  data: QuestionEntity | QuestionGroupEntity;
  totalGroups: any;
  onAnswerChange?: (answer: Record<number, string>) => void;
  currentGroupIndex?: number;
  onSetExplanation?: (explanation: string) => void;
  onSelectQuestion?: (index: number) => void;
  reviewMode?: boolean;
  reviewData: any;
  showAnswer?: boolean;
}

export interface ExamAudioAdvProps {
  data: QuestionEntity | QuestionGroupEntity;
  totalGroups: any;
  onAnswerChange?: (answer: Record<number, string>) => void;
  currentGroupIndex?: number;
  onSelectQuestion?: (index: number) => void;
  onSetExplanation?: (explanation: string) => void;
  reviewMode?: boolean;
  reviewData: any;
  showAnswer?: boolean;
}

export interface ExamFileProps {
  data: QuestionEntity | QuestionGroupEntity;
  totalGroups: any;
  currentItem: ExamLessonWithMappingEntity;
  onAnswerChange?: (val: boolean) => void;
}

export interface ExamRecordProps {
  data: QuestionEntity | QuestionGroupEntity;
  totalGroups: any;
  currentItem: ExamLessonWithMappingEntity;
  onAnswerChange?: (val: boolean) => void;
}

export interface ExamListeningReadingProps {
  data: QuestionGroupEntity | QuestionEntity;
  totalGroups: any;
  onAnswerChange?: (answer: AnswerGroup[]) => void;
  currentGroupIndex?: number;
  onSetExplanation?: (explanation: string) => void;
  onSelectQuestion?: (index: number) => void;
  reviewMode?: boolean;
  userAnswers?: AllUserAnswerDto[];
  showAnswer?: boolean;
}

export interface AnswerGroup {
  id: string;
  answer: string;
}
