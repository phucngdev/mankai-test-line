import type { LessonEntity } from '../../models/LessonEntity';

export interface VocabularyItem {
  icon: JSX.Element;
  label: string;
  percent: number;
  type: LessonEntity.type;
  rawId: string;
  isRequired: boolean;
}

export interface VocabularyElementory {
  id: number;
  label: string;
  type: LessonEntity.type;
}

export interface PropVocabularyElementory {
  data: VocabularyElementory[];
  onSelect: (id: number) => void;
  selectedId: number;
}

export interface PropVocabulary {
  data: VocabularyItem[];
  onSelect: (id: string) => void;
  selectedId: string;
}

export interface FormVideoProps {
  data: VocabularyItem[];
  onSelectNext: () => void;
  selectedId: number;
}

export interface FormSlideProps {
  data: VocabularyItem[];
  onSelectNext: () => void;
  selectedId?: number;
}

export interface FormHinagaProps {
  data: VocabularyItem[];
  onSelectNext: () => void;
}

export interface FormTextProps {
  data: VocabularyItem[];
  onSelectNext: () => void;
  selectedId: number;
}

export interface FormAudioProps {
  data: VocabularyItem[];
  onSelectNext: () => void;
  selectedId: number;
}

export interface ExamDragProps {
  data: VocabularyItem[];
  onSelectNext: () => void;
  selectedId: number;
}

export interface VocabProps {
  lessonId: string;
}

export interface GrammarProps {
  lessonId: string;
}

export interface KanjiProps {
  lessonId: string;
}

export interface TitleVocabularyProps {
  isAnyCompleted: boolean;
  title?: string;
  description?: string;
  icon?: JSX.Element;
  onClickNext?: () => void;
}
