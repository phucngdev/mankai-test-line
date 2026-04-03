import type {
  EssayAnswerEntity,
  SlideEntity,
  TextEntity,
  VideoUrlEntity,
} from '#/api/requests';

export interface CommentVocabularyProps {
  data:
    | TextEntity[]
    | VideoUrlEntity[]
    | SlideEntity[]
    | EssayAnswerEntity[]
    | null
    | undefined;
  lessonId: string;
}
