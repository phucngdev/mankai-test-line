import { useEffect, useMemo, useState } from 'react';
import styles from './MockTestExamConnect.module.scss';

import type { QuestionEntity, QuestionGroupEntity } from '#/api/requests';
import type { ExamConnectProps } from '#/api/requests/interface/Exam/ExamProps';

export type MockTestExamConnectProps = Omit<ExamConnectProps, 'reviewData'> & {
  reviewData?: ExamConnectProps['reviewData'];
  hideQuestionList?: boolean;
  initialPairs?: { left: string; right: string }[];
  shuffleEnabled?: boolean;
};
import { useTranslation } from 'react-i18next';

function shuffleArray<T>(array: T[]): T[] {
  return array
    .map(value => ({ sort: Math.random(), value }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export default function MockTestExamConnect({
  data,
  totalGroups,
  onAnswerChange,
  currentGroupIndex,
  onSelectQuestion,
  reviewData,
  reviewMode,
  hideQuestionList = false,
  initialPairs,
  shuffleEnabled = true,
}: MockTestExamConnectProps) {
  const [pairedPairs, setPairedPairs] = useState<[string, string][]>([]);
  const [selected, setSelected] = useState({ left: '', right: '' });
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
    const leftSource = matchingPairs.map(p => p.left);
    const rightSource = matchingPairs.map(p => p.right);
    const left = shuffleEnabled ? shuffleArray(leftSource) : leftSource;
    const right = shuffleEnabled ? shuffleArray(rightSource) : rightSource;
    setAnswerWordsLeft(left);
    setAnswerWordsRight(right);
    setPairedPairs([]);
    setSelected({ left: '', right: '' });
  }, [data, shuffleEnabled, matchingPairs]);

  useEffect(() => {
    const mapped = (initialPairs ?? []).map(
      p => [p.left, p.right] as [string, string],
    );
    if (mapped.length === 0) return;

    // Hydrate sau F5 khi temporary answer về trễ, nhưng không đè lúc user đang ghép.
    setPairedPairs(prev => (prev.length === 0 ? mapped : prev));
  }, [data, initialPairs]);

  const handleSelect = (key: 'left' | 'right', value: string) => {
    setSelected(prev => ({ ...prev, [key]: value }));
  };

  const handleResetPairs = () => {
    setPairedPairs([]);
    setSelected({ left: '', right: '' });
    onAnswerChange?.(false, []);
  };

  useEffect(() => {
    if (!selected.left || !selected.right) return;

    const left = selected.left;
    const right = selected.right;

    setPairedPairs(prev => {
      const alreadyExists = prev.some(
        pair => pair[0] === left && pair[1] === right,
      );
      if (alreadyExists) return prev;

      return [...prev, [left, right] as [string, string]];
    });

    setSelected({ left: '', right: '' });
  }, [selected.left, selected.right]);

  useEffect(() => {
    if (pairedPairs.length === 0) return;
    const payload = pairedPairs.map(p => ({ left: p[0], right: p[1] }));
    onAnswerChange?.(pairedPairs.length === matchingPairs.length, payload);
  }, [pairedPairs, matchingPairs.length]);

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
      <div
        className={`${styles.boxContent} ${hideQuestionList ? styles.boxContentEmbed : ''}`}
      >
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
                  <p
                    className={styles.contentTitleAudio}
                    dangerouslySetInnerHTML={{ __html: data.content }}
                  />
                ) : null}
                <div className={styles.iconListen}>
                  {reviewMode && isQuestionEntity(data) && data.userAnswers
                    ? data.userAnswers.map((ans: any, idx: number) => (
                        <div
                          className={`${styles.contentConnect} ${
                            ans.isCorrect
                              ? styles.pairReviewOk
                              : styles.pairReviewBad
                          }`}
                          key={idx}
                        >
                          <p className={styles.textAnswer}>{ans.left}</p>
                          <p className={styles.textAnswer}>{ans.right}</p>
                        </div>
                      ))
                    : pairedPairs.map((pair, idx) => (
                        <div className={styles.contentConnect} key={idx}>
                          <p className={styles.textAnswer}>{pair[0]}</p>
                          <p className={styles.textAnswer}>{pair[1]}</p>
                        </div>
                      ))}
                </div>
              </div>

              {!reviewMode && pairedPairs.length > 0 ? (
                <button
                  className={styles.resetMatchingBtn}
                  onClick={handleResetPairs}
                  type="button"
                >
                  {t('mocktest.resetMatchingPairs')}
                </button>
              ) : null}

              {!reviewMode && (
                <div className={styles.answer}>
                  <div className={styles.answerContent}>
                    {answerWordsLeft.map((word, idx) => (
                      <div
                        className={`
              ${styles.boxContentAnswer}
              ${selected.left === word ? styles.isActive : ''}
              ${pairedPairs.some(pair => pair[0] === word) ? styles.isHidden : ''}
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
              ${pairedPairs.some(pair => pair[1] === word) ? styles.isHidden : ''}
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
