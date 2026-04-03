import type {
  EssayAnswerEntity,
  SlideEntity,
  TextEntity,
  VideoUrlEntity,
} from '#/api/requests';

export interface DescribeVocabularyProps {
  data:
    | TextEntity[]
    | VideoUrlEntity[]
    | SlideEntity[]
    | EssayAnswerEntity[]
    | null
    | undefined;
}
