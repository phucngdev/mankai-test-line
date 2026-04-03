import type { ExamLessonWithMappingEntity } from '../models/ExamLessonWithMappingEntity';

export interface ReadingProps {
  lessonId: string;
  onClickNext: () => void;
}

export interface DecryptedDataReading {
  items: ExamLessonWithMappingEntity[];
}
