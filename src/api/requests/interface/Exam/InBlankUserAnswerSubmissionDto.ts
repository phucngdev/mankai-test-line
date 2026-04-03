export interface InBlankUserAnswerSubmissionDto {
  questionId: string;
  questionType: InBlankUserAnswerSubmissionDto.questionType;
  answer: { index: number; content: string }[];
}

export namespace InBlankUserAnswerSubmissionDto {
  export enum questionType {
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    SORTING = 'SORTING',
    MATCHING = 'MATCHING',
    MULTIPLE_CHOICE_HORIZONTAL = 'MULTIPLE_CHOICE_HORIZONTAL',
    FILL_IN_BLANK = 'FILL_IN_BLANK',
    CHOOSE_ANSWER_IN_BLANK = 'CHOOSE_ANSWER_IN_BLANK',
    ESSAY = 'ESSAY',
  }
}
