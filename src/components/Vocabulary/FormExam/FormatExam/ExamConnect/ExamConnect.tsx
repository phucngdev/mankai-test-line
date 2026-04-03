import { useEffect, useMemo, useState } from 'react';
import styles from './ExamConnect.module.scss';

import type { QuestionEntity, QuestionGroupEntity } from '#/api/requests';
import type { ExamConnectProps } from '#/api/requests/interface/Exam/ExamProps';
import { useTranslation } from 'react-i18next';
import { checkDropDownAnswer } from '#/src/components/Vocabulary/FormExam/utils/checkDropDownAnswer';

function shuffleArray<T>(array: T[]): T[] {
  return array
    .map(value => ({ sort: Math.random(), value }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export default function ExamConnect({
  data,
  totalGroups,
  onAnswerChange,
  currentGroupIndex,
  onSelectQuestion,
  reviewData,
  reviewMode,
}: ExamConnectProps) {
  const [correctPairs, setCorrectPairs] = useState<[string, string][]>([]);
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const [selected, setSelected] = useState({ left: '', right: '' });
  const [isChecking, setIsChecking] = useState(false);
  const [answerWordsLeft, setAnswerWordsLeft] = useState<string[]>([]);
  const [answerWordsRight, setAnswerWordsRight] = useState<string[]>([]);

  const isQuestionEntity = (
    item: QuestionEntity | QuestionGroupEntity,
  ): item is QuestionEntity => 'matchingAnswers' in item;

  const matchingPairs = useMemo(() => {
    if (isQuestionEntity(data)) {
      return data.matchingAnswers ?? [];
    }

    return [];
  }, [data]);
  const { t } = useTranslation();
  useEffect(() => {
    const left = shuffleArray(matchingPairs.map(p => p.left));
    const right = shuffleArray(matchingPairs.map(p => p.right));
    setAnswerWordsLeft(left);
    setAnswerWordsRight(right);
    setCorrectPairs([]);
    setWrongPair(null);
    setSelected({ left: '', right: '' });
  }, [data]);

  const handleSelect = (key: 'left' | 'right', value: string) => {
    if (isChecking) return;
    setSelected(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (selected.left && selected.right) {
      setIsChecking(true);

      const isCorrect = matchingPairs.some(
        pair => pair.left === selected.left && pair.right === selected.right,
      );

      if (isCorrect) {
        const alreadyExists = correctPairs.some(
          pair => pair[0] === selected.left && pair[1] === selected.right,
        );

        if (!alreadyExists) {
          const newPairs = [
            ...correctPairs,
            [selected.left, selected.right] as [string, string],
          ];
          setCorrectPairs(newPairs);

          onAnswerChange?.(
            newPairs.length === matchingPairs.length,
            newPairs.map(p => ({ left: p[0], right: p[1] })),
          );
        }

        setWrongPair(null);

        const timeout = setTimeout(() => {
          setSelected({ left: '', right: '' });
          setIsChecking(false);
        }, 100);

        return () => clearTimeout(timeout);
      }

      setWrongPair([selected.left, selected.right]);

      const timeout = setTimeout(() => {
        setWrongPair(null);
        setSelected({ left: '', right: '' });
        setIsChecking(false);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [selected, matchingPairs]);
  useEffect(() => {
    if (correctPairs.length === matchingPairs.length) {
      onAnswerChange?.(
        true,
        correctPairs.map(p => ({ left: p[0], right: p[1] })),
      );
    }
  }, [correctPairs, matchingPairs.length]);

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
    // đảm bảo opts là array và loại bỏ null/undefined
    const correct = (opts ?? []).filter(o => o?.isCorrect).map(o => o.content);

    const user = (userAnswers ?? []).filter(u => u != null).map(u => u.content);

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
    answerWordsLeft &&
    answerWordsRight && (
      <div className={styles.boxContent}>
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
                          className={questionClass}
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
                <p
                  className={styles.contentTitleAudio}
                  dangerouslySetInnerHTML={{ __html: data.content }}
                />
                <div className={styles.iconListen}>
                  {reviewMode && isQuestionEntity(data) && data.userAnswers
                    ? data.userAnswers.map((ans: any, idx: number) => (
                        <div className={styles.contentConnect} key={idx}>
                          <p
                            className={`${styles.textAnswer} ${
                              ans.isCorrect
                                ? styles.correctAnswer
                                : styles.incorrectAnswer
                            }`}
                          >
                            {ans.left}
                          </p>
                          <p
                            className={`${styles.textAnswer} ${
                              ans.isCorrect
                                ? styles.correctAnswer
                                : styles.incorrectAnswer
                            }`}
                          >
                            {ans.right}
                          </p>
                        </div>
                      ))
                    : correctPairs.map((pair, idx) => (
                        <div className={styles.contentConnect} key={idx}>
                          <p
                            className={`${styles.textAnswer} ${styles.correctAnswer}`}
                          >
                            {pair[0]}
                          </p>
                          <p
                            className={`${styles.textAnswer} ${styles.correctAnswer}`}
                          >
                            {pair[1]}
                          </p>
                        </div>
                      ))}
                </div>
              </div>

              {!reviewMode && (
                <div className={styles.answer}>
                  <div className={styles.answerContent}>
                    {answerWordsLeft.map((word, idx) => (
                      <div
                        className={`
              ${styles.boxContentAnswer}
              ${selected.left === word ? styles.isActive : ''}
              ${wrongPair?.[0] === word ? styles.isWrong : ''} 
              ${correctPairs.some(pair => pair[0] === word) ? styles.isHidden : ''}
            `}
                        key={`left-${idx}`}
                        onClick={() => handleSelect('left', word)}
                      >
                        <div className={styles.textContent}>
                          <p className={styles.textAnswer}>{word}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.answerContent}>
                    {answerWordsRight.map((word, idx) => (
                      <div
                        className={`
              ${styles.boxContentAnswer}
              ${selected.right === word ? styles.isActive : ''}
              ${wrongPair?.[1] === word ? styles.isWrong : ''}
              ${correctPairs.some(pair => pair[1] === word) ? styles.isHidden : ''}
            `}
                        key={`right-${idx}`}
                        onClick={() => handleSelect('right', word)}
                      >
                        <div className={styles.textContent}>
                          <p className={styles.textAnswer}>{word}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
}
