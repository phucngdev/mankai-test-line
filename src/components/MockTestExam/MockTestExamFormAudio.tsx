import { useEffect, useMemo, useRef, useState } from 'react';
import { IconListen } from '#/assets/svg/externalIcon';
import styles from './MockTestExamFormAudio.module.scss';

import ReactPlayer from 'react-player';

import type { ExamAudioAdvProps } from '#/api/requests/interface/Exam/ExamProps';

export type MockTestExamFormAudioProps = Omit<
  ExamAudioAdvProps,
  'reviewData'
> & {
  reviewData?: ExamAudioAdvProps['reviewData'];
  hideQuestionList?: boolean;
  checkResult?: 'correct' | 'wrong' | null;
  initialAnswers?: Record<number, string>;
};
import type { QuestionEntity, QuestionGroupEntity } from '#/api/requests';
import { useTranslation } from 'react-i18next';

/** Pipe `|` optional: `hướng dẫn|đoạn có __`. Không có `|` thì cả chuỗi là đoạn điền. */
function fillInBlankSourceHtml(content: string): string {
  if (!content) return '';
  const parts = content.split('|');
  const body = parts.length >= 2 ? parts.slice(1).join('|') : content;
  return body
    .replace(/&nbsp;/g, ' ')
    .replace(/<\/?p>/g, '')
    .replace(/\uFF3F\uFF3F/g, '__');
}

export default function MockTestExamFormAudio({
  data,
  totalGroups,
  onAnswerChange,
  currentGroupIndex,
  onSetExplanation,
  checkResult,
  onSelectQuestion,
  reviewData,
  showAnswer,
  reviewMode,
  hideQuestionList = false,
  initialAnswers,
}: MockTestExamFormAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const playerRef = useRef<ReactPlayer>(null);
  const { t } = useTranslation();

  const handleSelectAnswer = (blankIndex: number, answer: string) => {
    setSelectedAnswers(prev => {
      const updated = { ...prev, [blankIndex]: answer };
      onAnswerChange?.(updated);
      return updated;
    });
  };

  useEffect(() => {}, [data]);
  useEffect(() => {
    setSelectedAnswers(initialAnswers ?? {});
  }, [data, initialAnswers]);

  useEffect(() => {
    let explanation = '';

    if ('questions' in data && data.questions[0]?.explain) {
      explanation = data.questions[0].explain;
    } else if ('explain' in data && typeof data.explain === 'string') {
      explanation = data.explain;
    }

    onSetExplanation?.(explanation);
  }, [data, onSetExplanation]);

  const blankOrder = useMemo(() => {
    const q = data as QuestionEntity | undefined;
    const fb = q?.fillInBlank;
    if (!Array.isArray(fb) || fb.length === 0) return [];
    return [...fb].sort((a, b) => a.index - b.index);
  }, [data]);

  const fillInBlankBody = useMemo(
    () => fillInBlankSourceHtml((data as QuestionEntity)?.content ?? ''),
    [data],
  );

  const blankSlots = useMemo(() => {
    if (blankOrder.length > 0) return blankOrder;
    const n = Math.max(0, fillInBlankBody.split('__').length - 1);
    return Array.from({ length: n }, (_, i) => ({
      index: i,
      correctAnswer: '',
      explanation: null as string | null,
    }));
  }, [blankOrder, fillInBlankBody]);

  const correctAnswers = useMemo(
    () => blankSlots.map(b => b.correctAnswer ?? ''),
    [blankSlots],
  );

  function checkChooseAnswerInBlank(item: QuestionEntity) {
    if (!item.userAnswers || item.userAnswers.length === 0) return false;

    return item.chooseAnswerInBlank.every((blank: any) => {
      const userAnswer = (item.userAnswers as any[]).find(
        u => u.index === blank.index,
      )?.correctAnswer;

      return (
        String(userAnswer).trim().toLowerCase() ===
        String(blank.correctAnswer).trim().toLowerCase()
      );
    });
  }

  function checkAnswers(userAnswers: any[] = [], opts: any[] = []) {
    const correct = opts.filter(o => o.isCorrect).map(o => o.content);
    const user = userAnswers.map(u => u.content);
    return (
      user.length === correct.length && user.every(c => correct.includes(c))
    );
  }

  function checkGroup(group: QuestionGroupEntity) {
    return group.questions.every(q =>
      checkAnswers(q.userAnswers, q.multipleChoiceAnswers),
    );
  }

  function checkMatchingAnswer(
    userAnswers: { left: string; right: string }[],
    correctPairs: { left: string; right: string }[],
  ) {
    if (!userAnswers) return false;
    if (userAnswers.length !== correctPairs.length) return false;

    return userAnswers.every(ans =>
      correctPairs.some(
        pair => pair.left === ans.left && pair.right === ans.right,
      ),
    );
  }

  return (
    <div
      className={`${styles.boxContent} ${hideQuestionList ? styles.boxContentEmbed : ''}`}
    >
      {data ? (
        <div
          className={`${styles.formAudio} ${hideQuestionList ? styles.formAudioEmbed : ''}`}
        >
          {!hideQuestionList ? (
            <div className={styles.lboxQuestion}>
              <p className={styles.title}>{t('mocktest.listQuestion')}</p>
              <div className={styles.listQuestion}>
                {reviewMode
                  ? reviewData?.data.examLesson.exam.questionMapping.map(
                      (item: any, index: number) => {
                        let { questionClass } = styles;

                        if ('questions' in item) {
                          const isCorrect = checkGroup(item);
                          questionClass = isCorrect
                            ? styles.correct
                            : styles.incorrect;
                        } else if (item.type === 'CHOOSE_ANSWER_IN_BLANK') {
                          const isCorrect = checkChooseAnswerInBlank(item);
                          questionClass = isCorrect
                            ? styles.correct
                            : styles.incorrect;
                        } else if (item.type === 'FILL_IN_BLANK') {
                          if (
                            !item.userAnswers ||
                            item.userAnswers.length === 0
                          ) {
                            questionClass = styles.missed;
                          } else {
                            const correctAnswers = item.fillInBlank.map(
                              (f: any) => f.correctAnswer,
                            );
                            const userAnswers = item.userAnswers.map(
                              (u: any) => u.correctAnswer,
                            );

                            const isAllCorrect =
                              userAnswers.length === correctAnswers.length &&
                              userAnswers.every(
                                (ans: string, idx: number) =>
                                  ans === correctAnswers[idx],
                              );

                            questionClass = isAllCorrect
                              ? styles.correct
                              : styles.incorrect;
                          }
                        } else if (item.type === 'MATCHING') {
                          const checkAnswer = checkMatchingAnswer(
                            item.userAnswers,
                            item.matchingAnswers,
                          );
                          questionClass = checkAnswer
                            ? styles.correct
                            : styles.incorrect;

                          if (
                            !item.userAnswers ||
                            item.userAnswers.length === 0
                          ) {
                            questionClass = styles.missed;
                          }
                        } else if (
                          !item.userAnswers ||
                          item.userAnswers.length === 0
                        ) {
                          questionClass = styles.missed;
                        } else {
                          const isCorrect = checkAnswers(
                            item.userAnswers,
                            item.multipleChoiceHorizontal,
                          );
                          questionClass = isCorrect
                            ? styles.correct
                            : styles.incorrect;
                        }

                        return (
                          <div
                            className={
                              reviewMode ? questionClass : styles.questionClass
                            }
                            key={index}
                            onClick={() => onSelectQuestion?.(index)}
                          >
                            {index + 1}
                          </div>
                        );
                      },
                    )
                  : Array.from({ length: totalGroups }, (_, i) => (
                      <div
                        className={`${styles.questionNumber} ${
                          i === currentGroupIndex ? styles.activeQuestion : ''
                        }`}
                        key={i}
                        onClick={() => onSelectQuestion?.(i)}
                      >
                        {i + 1}
                      </div>
                    ))}
              </div>
            </div>
          ) : null}
          <div className={styles.boxAudio}>
            {!hideQuestionList ? (
              <p className={styles.headerAudio}>
                {t('historyExam.numberExam')} {(currentGroupIndex ?? 0) + 1} /{' '}
                {totalGroups}
              </p>
            ) : null}
            <div className={styles.contentAudio}>
              <div className={styles.audioListen}>
                {!hideQuestionList ? (
                  <p className={styles.contentTitleAudio}>
                    {data.content.split('|').length >= 2
                      ? data.content
                          .split('|')[0]
                          ?.replace(/&nbsp;/g, ' ')
                          ?.replace(/<\/?p>/g, '')
                      : ''}
                  </p>
                ) : null}
                {data.audioUrl ? (
                  <div
                    className={styles.iconListen}
                    onClick={() => setIsPlaying(prev => !prev)}
                  >
                    <IconListen color="#fff" height={32} width={32} />
                  </div>
                ) : null}
              </div>

              {data.audioUrl ? (
                <div className={styles.audioHidden}>
                  <ReactPlayer
                    height={0}
                    playing={isPlaying}
                    ref={playerRef}
                    url={data.audioUrl}
                    width={0}
                  />
                </div>
              ) : null}

              <div className={styles.textListen}>
                <div className={styles.fillBlankInlineWrap}>
                  {fillInBlankBody
                    .split('__')
                    .map((part: string, i: number, arr: string[]) => {
                      const groupIndex = currentGroupIndex ?? 0;
                      const blankIdx = blankSlots[i]?.index ?? i;
                      const correctAnswer = blankSlots[i]?.correctAnswer ?? '';
                      const userAnswerFromReview = reviewMode
                        ? reviewData?.data.examLesson.exam.questionMapping[
                            groupIndex
                          ]?.userAnswers?.find(
                            (ans: any) => ans.index === blankIdx,
                          )?.correctAnswer || ''
                        : '';
                      const userAnswerFromSelected =
                        selectedAnswers[blankIdx] || '';
                      const userAnswer =
                        userAnswerFromReview || userAnswerFromSelected;

                      return (
                        <span
                          className={styles.fillBlankSegment}
                          key={`fb-${blankIdx}-${i}`}
                        >
                          <span className={styles.fillBlankPart}>{part}</span>
                          {i < arr.length - 1 &&
                            (reviewMode ? (
                              <span
                                className={styles.fillBlankReviewInline}
                                style={{
                                  color:
                                    userAnswer === correctAnswer
                                      ? 'green'
                                      : 'red',
                                  fontWeight: 600,
                                  margin: '0 4px',
                                }}
                              >
                                {userAnswer || '---'}
                                {userAnswer !== correctAnswer &&
                                correctAnswer ? (
                                  <span className={styles.fillBlankReviewHint}>
                                    ({correctAnswer})
                                  </span>
                                ) : null}
                              </span>
                            ) : (
                              <input
                                className={styles.fillBlankInlineInput}
                                onChange={e =>
                                  handleSelectAnswer(blankIdx, e.target.value)
                                }
                                placeholder="…"
                                type="text"
                                value={userAnswer}
                              />
                            ))}
                        </span>
                      );
                    })}
                </div>

                {(reviewMode ||
                  (!reviewMode && showAnswer && checkResult !== null)) &&
                correctAnswers.length > 0 ? (
                  <div className={styles.fillBlankSummary}>
                    <div className={styles.fillBlankSummaryLine}>
                      Đáp án đúng:
                      {correctAnswers.map((ans: string, idx: number) => (
                        <span key={idx} className={styles.fillBlankSummaryTag}>
                          ({idx + 1}) {ans}
                        </span>
                      ))}
                    </div>

                    <div className={styles.fillBlankSummaryLine}>
                      Đáp án bạn điền:
                      {correctAnswers.map((_: string, idx: number) => {
                        const groupIndex = currentGroupIndex ?? 0;
                        const bIdx = blankSlots[idx]?.index ?? idx;
                        const userAnswerFromReview = reviewMode
                          ? reviewData?.data.examLesson.exam.questionMapping[
                              groupIndex
                            ]?.userAnswers?.find(
                              (ans: any) => ans.index === bIdx,
                            )?.correctAnswer || ''
                          : '';
                        const userAnswerFromSelected =
                          selectedAnswers[bIdx] || '';
                        const userAnswer =
                          userAnswerFromReview || userAnswerFromSelected;

                        return (
                          <span
                            key={bIdx}
                            className={styles.fillBlankSummaryTag}
                            style={{
                              color:
                                userAnswer === correctAnswers[idx]
                                  ? 'green'
                                  : 'red',
                            }}
                          >
                            ({idx + 1}){userAnswer || '---'}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
