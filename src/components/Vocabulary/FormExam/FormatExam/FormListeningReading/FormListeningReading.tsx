import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './FormListeningReading.module.scss';
import 'ckeditor5/ckeditor5.css';
import { IconListen } from '#/assets/svg/externalIcon';
import ReactPlayer from 'react-player';
import type {
  MultipleChoiceAnswerDto,
  QuestionGroupEntity,
} from '#/api/requests';
import { QuestionEntity } from '#/api/requests';
import type {
  AllUserAnswerDto,
  AnswerGroup,
  ExamListeningReadingProps,
} from '#/api/requests/interface/Exam/ExamProps';
import { useTranslation } from 'react-i18next';
import { checkDropDownAnswer } from '#/src/components/Vocabulary/FormExam/utils/checkDropDownAnswer';
import {
  getTrueFalseCorrectAnswer,
  getTrueFalseReviewSidebarClassKey,
  normalizeTrueFalseValue,
} from '#/src/components/Vocabulary/FormExam/utils/trueFalseCompare';

export default function FormListeningReading({
  data,
  totalGroups,
  onAnswerChange,
  currentGroupIndex,
  checkResult,
  onSelectQuestion,
  reviewMode,
  userAnswers,
  showAnswer,
  reviewData,
}: ExamListeningReadingProps & {
  checkResult: null | 'correct' | 'wrong';
  reviewData: any;
}) {
  const [selectedAnswers, setSelectedAnswers] = useState<AnswerGroup[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const [showExplainMap, setShowExplainMap] = useState<Record<number, boolean>>(
    {},
  );
  const [activeAnswers, setActiveAnswers] = useState<AllUserAnswerDto[]>([]);
  const { t } = useTranslation();
  useEffect(() => {
    if (reviewMode && userAnswers) {
      setActiveAnswers(userAnswers);
    } else {
      setActiveAnswers([]);
    }
  }, [reviewMode, data, userAnswers]);
  useEffect(() => {
    setSelectedAnswers([]);
    setShowExplainMap({});
  }, [data]);

  const shuffledData = useMemo(() => {
    if ('questions' in data) {
      return {
        ...data,
        questions: data.questions.map(question => ({
          ...question,
          multipleChoiceAnswers: question.multipleChoiceAnswers || [],
        })),
      };
    }

    return data;
  }, [data]);

  const toggleExplanation = (index: number) => {
    setShowExplainMap(prev => ({ ...prev, [index]: !prev[index] }));
  };

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
    const correct = (opts ?? []).filter(o => o?.isCorrect).map(o => o.content);

    const user = (userAnswers ?? []).filter(u => u != null).map(u => u.content);

    return (
      user.length === correct.length && user.every(c => correct.includes(c))
    );
  }

  function checkGroup(group: QuestionGroupEntity) {
    return group.questions.every(q => {
      if (q.type === QuestionEntity.type.TRUE_FALSE) {
        return getTrueFalseReviewSidebarClassKey(q) === 'correct';
      }
      return checkAnswers(q.userAnswers, q.multipleChoiceAnswers);
    });
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
    <>
      {data ? (
        <div className={styles.boxContent} key={data.id}>
          <div className={styles.titleContent}>
            <p className={styles.title}>{t('mocktest.contentQuestion')}</p>
            <p className={styles.text}>Trắc nghiệm</p>
          </div>

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
                      } else if (item.type === 'DROP_DOWN_ANSWER') {
                        const isCorrect = checkDropDownAnswer(item);
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
                      } else if (item.type === 'TRUE_FALSE') {
                        questionClass =
                          styles[getTrueFalseReviewSidebarClassKey(item)];
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

          <div className={styles.formListeningReading}>
            <div className={styles.boxListeningReading}>
              <div className={styles.formListen}>
                <p className={styles.text}>
                  {t('historyExam.numberExam')} {(currentGroupIndex ?? 0) + 1} /{' '}
                  {totalGroups}
                </p>
                <div className={styles.contentListen}>
                  <div
                    className={styles.text}
                    dangerouslySetInnerHTML={{
                      __html: data.content,
                    }}
                  />
                  {data.audioUrl ? (
                    <div className={styles.boxListen}>
                      <div
                        className={styles.iconListen}
                        onClick={() => setIsPlaying(prev => !prev)}
                      >
                        <IconListen color="#fff" height={32} width={32} />
                      </div>
                    </div>
                  ) : null}
                  <div className={styles.audio} style={{ height: 1 }}>
                    <ReactPlayer
                      height={1}
                      playing={isPlaying}
                      ref={playerRef}
                      url={data.audioUrl}
                      width={1}
                    />
                  </div>
                </div>
              </div>

              {/* Phần trả lời */}
              <div className={styles.formAnswer}>
                {'questions' in shuffledData &&
                  shuffledData.questions.map((sub, subIndex) => {
                    const selectedAnswer = selectedAnswers.find(
                      a => a.id === sub.id,
                    )?.answer;

                    return (
                      <div className={styles.contentAnswer} key={subIndex}>
                        <div className={styles.titleAnswer}>
                          <div className={styles.title}>
                            <p className={styles.text}>{subIndex + 1}.</p>
                          </div>
                          <div
                            className={styles.text}
                            dangerouslySetInnerHTML={{ __html: sub.content }}
                          />
                        </div>

                        {sub.type === QuestionEntity.type.MULTIPLE_CHOICE && (
                          <div className={styles.answer}>
                            {sub.multipleChoiceAnswers.map(
                              (answerObj, index) => {
                                const answer = answerObj.content;
                                const { isCorrect } = answerObj;
                                let answerClass = styles.answerBox;

                                if (reviewMode) {
                                  const userAnswer = activeAnswers.find(
                                    a => a.questionId === sub.id,
                                  );

                                  if (!userAnswer?.answer.length) {
                                    if (isCorrect)
                                      answerClass += ` ${styles.missed}`;
                                  } else if (
                                    userAnswer.answer.some(
                                      (a: any): a is MultipleChoiceAnswerDto =>
                                        'content' in a && a.content === answer,
                                    ) &&
                                    isCorrect
                                  ) {
                                    answerClass += ` ${styles.correct}`;
                                  } else if (
                                    userAnswer.answer.some(
                                      (a: any): a is MultipleChoiceAnswerDto =>
                                        'content' in a && a.content === answer,
                                    ) &&
                                    !isCorrect
                                  ) {
                                    answerClass += ` ${styles.incorrect}`;
                                  } else if (isCorrect) {
                                    answerClass += ` ${styles.correct}`;
                                  }
                                } else {
                                  if (selectedAnswer === answer) {
                                    answerClass += ` ${styles.active}`;
                                  }

                                  if (showAnswer) {
                                    if (isCorrect) {
                                      answerClass += ` ${styles.correct}`;
                                    } else if (
                                      selectedAnswer === answer &&
                                      checkResult === 'wrong'
                                    ) {
                                      answerClass += ` ${styles.incorrect}`;
                                    }
                                  }
                                }

                                return (
                                  <div
                                    className={answerClass}
                                    key={`${sub.id}-${index}`}
                                    onClick={() => {
                                      if (reviewMode) return;
                                      const updatedAnswers = [
                                        ...selectedAnswers.filter(
                                          a => a.id !== sub.id,
                                        ),
                                        { answer, id: sub.id },
                                      ];
                                      setSelectedAnswers(updatedAnswers);
                                      onAnswerChange?.(updatedAnswers);
                                    }}
                                  >
                                    <div className={styles.contentBox}>
                                      <p className={styles.text}>
                                        {String.fromCharCode(65 + index)}
                                      </p>
                                    </div>
                                    <div className={styles.contentText}>
                                      <p className={styles.text}>{answer}</p>
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        )}

                        {sub.type === QuestionEntity.type.TRUE_FALSE && (
                          <div className={styles.answer}>
                            {[true, false].map(value => {
                              const answerLabel = value
                                ? t('exam.trueLabel')
                                : t('exam.falseLabel');
                              const correctTf = normalizeTrueFalseValue(
                                getTrueFalseCorrectAnswer(sub),
                              );
                              const isCorrectTf =
                                correctTf !== null && value === correctTf;
                              let answerClass = styles.answerBox;

                              if (reviewMode) {
                                const userAnswer = activeAnswers.find(
                                  a => a.questionId === sub.id,
                                );

                                if (!userAnswer?.answer.length) {
                                  if (isCorrectTf) {
                                    answerClass += ` ${styles.missed}`;
                                  }
                                } else if (
                                  userAnswer.answer.some((a: any) => {
                                    if (typeof a?.isCorrect === 'boolean') {
                                      return a.isCorrect === value;
                                    }
                                    return (
                                      'content' in a &&
                                      a.content === String(value)
                                    );
                                  }) &&
                                  isCorrectTf
                                ) {
                                  answerClass += ` ${styles.correct}`;
                                } else if (
                                  userAnswer.answer.some((a: any) => {
                                    if (typeof a?.isCorrect === 'boolean') {
                                      return a.isCorrect === value;
                                    }
                                    return (
                                      'content' in a &&
                                      a.content === String(value)
                                    );
                                  }) &&
                                  !isCorrectTf
                                ) {
                                  answerClass += ` ${styles.incorrect}`;
                                } else if (isCorrectTf) {
                                  answerClass += ` ${styles.correct}`;
                                }
                              } else {
                                if (selectedAnswer === String(value)) {
                                  answerClass += ` ${styles.active}`;
                                }

                                if (showAnswer) {
                                  if (isCorrectTf) {
                                    answerClass += ` ${styles.correct}`;
                                  } else if (
                                    selectedAnswer === String(value) &&
                                    checkResult === 'wrong'
                                  ) {
                                    answerClass += ` ${styles.incorrect}`;
                                  }
                                }
                              }

                              return (
                                <div
                                  className={answerClass}
                                  key={`${sub.id}-tf-${String(value)}`}
                                  onClick={() => {
                                    if (reviewMode) return;
                                    const updatedAnswers = [
                                      ...selectedAnswers.filter(
                                        a => a.id !== sub.id,
                                      ),
                                      { answer: String(value), id: sub.id },
                                    ];
                                    setSelectedAnswers(updatedAnswers);
                                    onAnswerChange?.(updatedAnswers);
                                  }}
                                >
                                  <div className={styles.contentText}>
                                    <p className={styles.text}>{answerLabel}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {(reviewMode || checkResult !== null) && sub.explain ? (
                          <div className={styles.explanationToggle}>
                            <div
                              className={styles.explainButton}
                              onClick={() => toggleExplanation(subIndex)}
                            >
                              {showExplainMap[subIndex]
                                ? 'Ẩn giải thích'
                                : 'Hiển thị giải thích'}
                            </div>
                            {showExplainMap[subIndex] ? (
                              <div
                                className={styles.explanationContent}
                                dangerouslySetInnerHTML={{
                                  __html: sub.explain,
                                }}
                              />
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
