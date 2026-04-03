import type { ExamLessonWithMappingEntity } from '../models/ExamLessonWithMappingEntity';

export interface AudioProps {
  lessonId: string;
  onClickNext: () => void;
}

export interface DecryptedDataAudio {
  items: ExamLessonWithMappingEntity[];
}
