import type {
  EssayAnswerEntity,
  SlideEntity,
  TextEntity,
  VideoUrlEntity,
} from '#/api/requests';

export interface DocumentVocabularyProps {
  data:
    | TextEntity[]
    | VideoUrlEntity[]
    | SlideEntity[]
    | EssayAnswerEntity[]
    | null
    | undefined;
}
