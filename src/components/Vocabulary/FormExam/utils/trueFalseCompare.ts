export function normalizeTrueFalseValue(value: unknown): boolean | null {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;

  if (typeof value === 'string') {
    const t = value.trim().toLowerCase();
    if (t === 'true' || t === '1') return true;
    if (t === 'false' || t === '0') return false;
  }

  return null;
}

interface StoredTrueFalseAnswerRow {
  content?: string;
  trueFalseAnswer?: boolean;
  isCorrect?: boolean;
}

export function parseStoredTrueFalseUserAnswer(
  userAnswers: unknown[] | undefined | null,
): boolean | null {
  if (!userAnswers?.length) return null;

  const u = userAnswers[0] as StoredTrueFalseAnswerRow;

  if (typeof u.isCorrect === 'boolean') return u.isCorrect;
  if (typeof u.trueFalseAnswer === 'boolean') return u.trueFalseAnswer;

  return normalizeTrueFalseValue(u.content);
}

export interface TrueFalseQuestionLike {
  trueFalse?: { trueFalseAnswer?: unknown } | null;
  trueFalseAnswer?: unknown;
}

export function getTrueFalseCorrectAnswer(q: TrueFalseQuestionLike): unknown {
  const nested = q.trueFalse?.trueFalseAnswer;

  if (nested !== undefined && nested !== null) return nested;

  const flat = q.trueFalseAnswer;

  if (flat !== undefined && flat !== null) return flat;

  return null;
}

export function isTrueFalseAnswerMatch(
  userRaw: unknown,
  correctRaw: unknown,
): boolean {
  const userVal = Array.isArray(userRaw) ? userRaw[0] : userRaw;
  const u = normalizeTrueFalseValue(userVal);
  const c = normalizeTrueFalseValue(correctRaw);

  return u !== null && c !== null && u === c;
}

export function isTrueFalseQuestionCorrect(
  userRaw: unknown,
  question: TrueFalseQuestionLike,
): boolean {
  return isTrueFalseAnswerMatch(userRaw, getTrueFalseCorrectAnswer(question));
}

export type TrueFalseReviewSidebarKey = 'correct' | 'incorrect' | 'missed';

export function getTrueFalseReviewSidebarClassKey(
  item: TrueFalseQuestionLike & { userAnswers?: unknown[] },
): TrueFalseReviewSidebarKey {
  const userBool = parseStoredTrueFalseUserAnswer(item.userAnswers);
  const correct = normalizeTrueFalseValue(getTrueFalseCorrectAnswer(item));

  if (userBool === null) return 'missed';
  if (correct === null) return 'incorrect';

  return userBool === correct ? 'correct' : 'incorrect';
}

export interface TrueFalseButtonStyles {
  answerBox: string;
  active: string;
  correct: string;
  incorrect: string;
  missed: string;
}

export interface TrueFalseOptionClassOptions {
  correctBool: boolean | null;
  /** Đáp án user khi review (null = chưa làm). */
  reviewBool: boolean | null;
  reviewMode: boolean;
  selected: boolean | null;
  showAnswer: boolean;
  checkResult: null | 'correct' | 'wrong';
}

function joinClasses(base: string, extra: string): string {
  return `${base} ${extra}`;
}

interface ReviewModeButtonParams {
  correctBool: boolean | null;
  reviewBool: boolean | null;
  styles: TrueFalseButtonStyles;
  value: boolean;
}

function classNamesForReviewMode(p: ReviewModeButtonParams): string {
  const { correctBool, reviewBool, styles: s, value } = p;
  let out = s.answerBox;

  if (reviewBool === null) {
    if (correctBool !== null && value === correctBool) {
      out = joinClasses(out, s.missed);
    }

    return out;
  }

  if (reviewBool === value) {
    return joinClasses(out, value === correctBool ? s.correct : s.incorrect);
  }

  if (correctBool !== null && value === correctBool) {
    return joinClasses(out, s.correct);
  }

  return out;
}

interface ExamModeButtonParams {
  checkResult: null | 'correct' | 'wrong';
  correctBool: boolean | null;
  selected: boolean | null;
  showAnswer: boolean;
  styles: TrueFalseButtonStyles;
  value: boolean;
}

/** Làm bài (+ có thể bật hiện đáp án sau khi kiểm tra). */
function classNamesForExamMode(p: ExamModeButtonParams): string {
  const {
    checkResult,
    correctBool,
    selected,
    showAnswer,
    styles: s,
    value,
  } = p;
  let out = s.answerBox;

  if (selected === value) {
    out = joinClasses(out, s.active);
  }

  if (!showAnswer || correctBool === null) {
    return out;
  }

  if (value === correctBool) {
    return joinClasses(out, s.correct);
  }

  if (selected === value && checkResult === 'wrong') {
    return joinClasses(out, s.incorrect);
  }

  return out;
}

export function getTrueFalseOptionClassName(
  value: boolean,
  opts: TrueFalseOptionClassOptions,
  s: TrueFalseButtonStyles,
): string {
  const {
    correctBool,
    reviewBool,
    reviewMode,
    selected,
    showAnswer,
    checkResult,
  } = opts;

  return reviewMode
    ? classNamesForReviewMode({
        correctBool,
        reviewBool,
        styles: s,
        value,
      })
    : classNamesForExamMode({
        checkResult,
        correctBool,
        selected,
        showAnswer,
        styles: s,
        value,
      });
}
