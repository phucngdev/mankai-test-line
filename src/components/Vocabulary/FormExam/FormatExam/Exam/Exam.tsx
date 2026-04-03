import type { QuestionEntity, QuestionGroupEntity } from '#/api/requests';
import type { ExamProps } from '#/api/requests/interface/Exam/ExamProps';
import { IconListen } from '#/assets/svg/externalIcon';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactPlayer from 'react-player';
import { checkDropDownAnswer } from '#/src/components/Vocabulary/FormExam/utils/checkDropDownAnswer';
import { getTrueFalseReviewSidebarClassKey } from '#/src/components/Vocabulary/FormExam/utils/trueFalseCompare';
import styles from './Exam.module.scss';

export default function Exam({
  data,
  totalGroups,
  onAnswerChange,
  currentGroupIndex,
  onSetExplanation,
  checkResult,
  restartKey,
  reviewMode,
  onSelectQuestion,
  showAnswer,
  reviewData,
}: ExamProps & { checkResult: null | 'correct' | 'wrong' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const { t } = useTranslation();
  const [activeAnswers, setActiveAnswers] = useState<number[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<
    Record<number, boolean>
  >({});
  const [questionResults, setQuestionResults] = useState<
    Record<number, 'correct' | 'wrong' | null>
  >({});

  const shuffledAnswers = useMemo(() => {
    if ('multipleChoiceHorizontal' in data) {
      return data.multipleChoiceHorizontal || [];
    }

    return [];
  }, [data]);

  useEffect(() => {
    setActiveAnswers([]);

    if (onAnswerChange) {
      onAnswerChange({ [data.id]: [] });
    }

    setQuestionResults({});
    setAnsweredQuestions({});
  }, [restartKey]);

  useEffect(() => {
    setActiveAnswers([]);
    setIsPlaying(false);

    if (onAnswerChange) {
      onAnswerChange({ [data.id]: [] });
    }
  }, [data, currentGroupIndex]);

  useEffect(() => {
    let explanation = '';

    if ('questions' in data && data.questions[0]?.explain) {
      explanation = data.questions[0].explain;
    } else if ('explain' in data && typeof data.explain === 'string') {
      explanation = data.explain;
    }

    onSetExplanation?.(explanation);
  }, [data, onSetExplanation]);

  const defaultActiveAnswers = useMemo(() => {
    if (reviewMode) {
      const userSelectedContents =
        (data as any).userAnswers?.map((u: any) => u.content) || [];
      return userSelectedContents
        .map((content: string) =>
          shuffledAnswers.findIndex(
            (a: { content: string }) => a.content === content,
          ),
        )
        .filter((i: number) => i !== -1);
    }

    return [];
  }, [reviewMode, shuffledAnswers, data]);

  useEffect(() => {
    if (reviewMode) {
      setActiveAnswers(defaultActiveAnswers);
    }
  }, [defaultActiveAnswers, reviewMode]);

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
      if (q.type === 'TRUE_FALSE') {
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

  const toggleAnswer = (index: number, content: string) => {
    setActiveAnswers(prev => {
      let newSelected: number[];

      if (prev.includes(index)) {
        newSelected = prev.filter(i => i !== index);
      } else {
        newSelected = [...prev, index];
      }

      if (onAnswerChange) {
        const selectedContents = newSelected.map(
          i => shuffledAnswers[i]?.content,
        );
        onAnswerChange({ [data.id]: selectedContents });

        if (currentGroupIndex !== undefined) {
          const correctAnswers = shuffledAnswers
            .filter(a => a.isCorrect)
            .map(a => a.content);
          const isCorrect =
            selectedContents.length === correctAnswers.length &&
            selectedContents.every(c => correctAnswers.includes(c));

          setQuestionResults(prevState => ({
            ...prevState,
            [currentGroupIndex]: isCorrect ? 'correct' : 'wrong',
          }));

          setAnsweredQuestions(prevState => ({
            ...prevState,
            [currentGroupIndex]: selectedContents.length > 0,
          }));
        }
      }

      return newSelected;
    });
  };

  return (
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
                    if (!item.userAnswers || item.userAnswers.length === 0) {
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

                    if (!item.userAnswers || item.userAnswers.length === 0) {
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
                <button
                  className={`${styles.questionNumber}  ${
                    i === currentGroupIndex ? styles.activeQuestion : ''
                  }`}
                  disabled
                  key={i}
                  onClick={() => onSelectQuestion?.(i)}
                >
                  {i + 1}
                </button>
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
            <p className={styles.contentTitleAudio}>{t('exam.contentTitle')}</p>

            {data.imageUrl ? (
              <img alt="" className={styles.contentImg} src={data.imageUrl} />
            ) : null}

            {data.audioUrl ? (
              <>
                <div
                  className={styles.iconListen}
                  onClick={() => setIsPlaying(prev => !prev)}
                  style={{
                    transform: isPlaying ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <IconListen color="#fff" height={32} width={32} />
                </div>
                <div
                  className={styles.audio}
                  style={{ display: 'none', height: 1 }}
                >
                  <ReactPlayer
                    playing={isPlaying}
                    ref={playerRef}
                    url={data.audioUrl}
                  />
                </div>
              </>
            ) : null}

            <div
              className={styles.textListen}
              dangerouslySetInnerHTML={{ __html: data.content }}
            />
          </div>

          <div className={styles.answer}>
            {shuffledAnswers.map((answer, index) => {
              let answerClass = styles.answerBox;

              if (reviewMode) {
                const hasUserAnswer =
                  Array.isArray((data as any).userAnswers) &&
                  (data as any).userAnswers.length > 0;

                if (!hasUserAnswer) {
                  if (answer.isCorrect) {
                    answerClass += ` ${styles.missed}`; // màu cam
                  }
                } else if (activeAnswers.includes(index) && answer.isCorrect) {
                  answerClass += ` ${styles.correct}`;
                } else if (activeAnswers.includes(index) && !answer.isCorrect) {
                  answerClass += ` ${styles.incorrect}`;
                } else if (answer.isCorrect) {
                  answerClass += ` ${styles.correct}`;
                }
              } else {
                if (activeAnswers.includes(index)) {
                  answerClass += ` ${styles.active}`;
                }

                if (showAnswer) {
                  if (answer.isCorrect) {
                    answerClass += ` ${styles.correct}`;
                  } else if (
                    activeAnswers.includes(index) &&
                    checkResult === 'wrong'
                  ) {
                    answerClass += ` ${styles.incorrect}`;
                  }
                }
              }

              return (
                <div
                  className={answerClass}
                  key={index}
                  onClick={() => {
                    if (!reviewMode && !showAnswer) {
                      toggleAnswer(index, answer.content);
                    }
                  }}
                >
                  <div className={styles.contentBox}>
                    <p className={styles.text}>
                      {String.fromCharCode(65 + index)}
                    </p>
                  </div>
                  <div className={styles.contentText}>
                    <p className={styles.text}>{answer.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
