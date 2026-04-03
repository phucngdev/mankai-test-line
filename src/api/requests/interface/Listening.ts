import type { ExamLessonWithMappingEntity } from '../models/ExamLessonWithMappingEntity';
import type { QuestionEntity } from '../models/QuestionEntity';
import type { QuestionGroupEntity } from '../models/QuestionGroupEntity';

export interface ListeningProps {
  lessonId: string;
  onClickNext: () => void;
}

export interface DecryptedDataListen {
  items: ExamLessonWithMappingEntity[];
}

export interface ShuffledGroup extends Omit<QuestionGroupEntity, 'questions'> {
  questions: QuestionEntity[];
}
