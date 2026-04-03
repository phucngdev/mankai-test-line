import { useEffect, useRef, useState } from 'react';
import { IconListen } from '#/assets/svg/externalIcon';
import styles from './FormAudio.module.scss';

import ReactPlayer from 'react-player';

import type { ExamAudioAdvProps } from '#/api/requests/interface/Exam/ExamProps';
import type { QuestionEntity, QuestionGroupEntity } from '#/api/requests';
import { useTranslation } from 'react-i18next';
import { checkDropDownAnswer } from '#/src/components/Vocabulary/FormExam/utils/checkDropDownAnswer';

export default function FormAudio({
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
}: ExamAudioAdvProps & { checkResult?: 'correct' | 'wrong' | null }) {
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
    setSelectedAnswers({});
  }, [data]);

  useEffect(() => {
    let explanation = '';

    if ('questions' in data && data.questions[0]?.explain) {
      explanation = data.questions[0].explain;
    } else if ('explain' in data && typeof data.explain === 'string') {
      explanation = data.explain;
    }

    onSetExplanation?.(explanation);
  }, [data, onSetExplanation]);

  const correctAnswers =
    'type' in data && Array.isArray((data as any).fillInBlank)
      ? (data as any).fillInBlank.map((item: any) => item.correctAnswer)
      : [];

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
    <div className={styles.boxContent}>
      {data ? (
        <div className={styles.formAudio}>
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
          <div className={styles.boxAudio}>
            <p className={styles.headerAudio}>
              {t('historyExam.numberExam')} {(currentGroupIndex ?? 0) + 1} /{' '}
              {totalGroups}
            </p>
            <div className={styles.contentAudio}>
              <div className={styles.audioListen}>
                <p className={styles.contentTitleAudio}>
                  {data.content
                    .split('|')[0]
                    ?.replace(/&nbsp;/g, ' ')
                    ?.replace(/<\/?p>/g, '')}
                </p>
                {data.audioUrl ? (
                  <div
                    className={styles.iconListen}
                    onClick={() => setIsPlaying(prev => !prev)}
                  >
                    <IconListen color="#fff" height={32} width={32} />
                  </div>
                ) : null}
              </div>

              <div className={styles.audio} style={{ height: 1 }}>
                <ReactPlayer
                  height={0}
                  playing={isPlaying}
                  ref={playerRef}
                  url={data.audioUrl}
                  width={0}
                />
              </div>

              <div className={styles.textListen}>
                {data.content
                  .split('|')[1]
                  ?.replace(/&nbsp;/g, ' ')
                  ?.replace(/<\/?p>/g, '')
                  .split('__')
                  .map((part: string, i: number, arr: string[]) => {
                    const groupIndex = currentGroupIndex ?? 0;
                    const correctAnswer = correctAnswers[i] || '';
                    const userAnswer = reviewMode
                      ? reviewData?.data.examLesson.exam.questionMapping[
                          groupIndex
                        ]?.userAnswers?.find((ans: any) => ans.index === i)
                          ?.correctAnswer || ''
                      : selectedAnswers[i] || '';

                    return (
                      <span key={i}>
                        <span>{part}</span>
                        {i < arr.length - 1 &&
                          (reviewMode ? (
                            <span
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
                              {userAnswer !== correctAnswer && (
                                <span
                                  style={{
                                    color: '#F37142',
                                    marginLeft: 4,
                                  }}
                                >
                                  ({correctAnswer})
                                </span>
                              )}
                            </span>
                          ) : (
                            <input
                              className={styles.inputListen}
                              onChange={e =>
                                handleSelectAnswer(i, e.target.value)
                              }
                              placeholder="Nhập từ còn thiếu"
                              value={userAnswer}
                            />
                          ))}
                      </span>
                    );
                  })}

                {(reviewMode ||
                  (!reviewMode && showAnswer && checkResult !== null)) &&
                correctAnswers.length > 0 ? (
                  <div
                    style={{
                      background: '#fff3e6',
                      borderRadius: 6,
                      color: '#F37142',
                      fontWeight: 600,
                      marginTop: 12,
                      padding: '8px 12px',
                    }}
                  >
                    <div style={{ marginBottom: 6 }}>
                      Đáp án đúng:
                      {correctAnswers.map((ans: string, idx: number) => (
                        <span key={idx} style={{ marginRight: 8 }}>
                          {ans}
                        </span>
                      ))}
                    </div>

                    <div>
                      Đáp án bạn điền:
                      {correctAnswers.map((_: string, idx: number) => {
                        const groupIndex = currentGroupIndex ?? 0;
                        const userAnswer = reviewMode
                          ? reviewData?.data.examLesson.exam.questionMapping[
                              groupIndex
                            ]?.userAnswers?.find(
                              (ans: any) => ans.index === idx,
                            )?.correctAnswer || ''
                          : selectedAnswers[idx] || '';

                        return (
                          <span
                            key={idx}
                            style={{
                              color:
                                userAnswer === correctAnswers[idx]
                                  ? 'green'
                                  : 'red',
                              marginRight: 8,
                            }}
                          >
                            {userAnswer || '---'}
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
