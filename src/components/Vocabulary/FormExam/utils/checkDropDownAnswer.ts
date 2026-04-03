/**
 * Review mode: true if every dropdown blank matches the option marked correct.
 * Payload may use `dropDownAnswers` or `dropdownAnswers` (API alias).
 */
export interface DropDownReviewQuestion {
  dropDownAnswers?: {
    index?: number;
    arrAnswer?: { content?: string; isCorrect?: boolean }[];
  }[];
  dropdownAnswers?: DropDownReviewQuestion['dropDownAnswers'];
  userAnswers?: { index?: number; correctAnswer?: string }[];
}

export function checkDropDownAnswer(item: DropDownReviewQuestion): boolean {
  const blanks = item.dropDownAnswers ?? item.dropdownAnswers ?? [];
  const userAnswers = item.userAnswers ?? [];
  if (!userAnswers.length) return false;

  return blanks.every(blank => {
    const correctAnswer =
      blank?.arrAnswer?.find(a => a?.isCorrect)?.content ?? '';
    const userAnswer = userAnswers.find(
      u => Number(u?.index) === Number(blank?.index),
    )?.correctAnswer;
    return (
      String(userAnswer).trim().toLowerCase() ===
      String(correctAnswer).trim().toLowerCase()
    );
  });
}
