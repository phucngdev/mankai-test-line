export interface CardMergeProps {
  lessonId: string;
  onExit: () => void;
  onClickNext: () => void;
}

export interface CardItem {
  key: string;
  text: string;
  cardId: string;
}
