import type { ExamLessonWithMappingEntity } from '../models/ExamLessonWithMappingEntity';

export interface PracticeProps {
  lessonId: string;
  onClickNext: () => void;
}

export interface DecryptedDataPractice {
  items: ExamLessonWithMappingEntity[];
}
