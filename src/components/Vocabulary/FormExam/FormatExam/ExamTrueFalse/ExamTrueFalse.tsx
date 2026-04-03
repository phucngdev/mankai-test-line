import type { QuestionEntity, QuestionGroupEntity } from '#/api/requests';
import { QuestionEntity as QuestionEntityNs } from '#/api/requests';
import type { ExamProps } from '#/api/requests/interface/Exam/ExamProps';
import { IconListen } from '#/assets/svg/externalIcon';
import { checkDropDownAnswer } from '#/src/components/Vocabulary/FormExam/utils/checkDropDownAnswer';
import {
  getTrueFalseCorrectAnswer,
  getTrueFalseOptionClassName,
  getTrueFalseReviewSidebarClassKey,
  normalizeTrueFalseValue,
  parseStoredTrueFalseUserAnswer,
} from '#/src/components/Vocabulary/FormExam/utils/trueFalseCompare';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactPlayer from 'react-player';
import styles from '../Exam/Exam.module.scss';

function isQuestionEntity(
  d: QuestionEntity | QuestionGroupEntity,
): d is QuestionEntity {
  return 'type' in d;
}

export default function ExamTrueFalse({
  data,
  totalGroups,
  onAnswerChange,
  currentGroupIndex,
  onSetExplanation,
  onSelectQuestion,
  reviewMode,
  showAnswer,
  reviewData,
  checkResult,
  restartKey,
}: ExamProps & { checkResult: null | 'correct' | 'wrong' }) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const onAnswerChangeRef = useRef(onAnswerChange);
  onAnswerChangeRef.current = onAnswerChange;
  const { t } = useTranslation();

  const correctBool = isQuestionEntity(data)
    ? normalizeTrueFalseValue(getTrueFalseCorrectAnswer(data))
    : null;

  useEffect(() => {
    if (!isQuestionEntity(data)) {
      onSetExplanation?.('');
      return;
    }
    onSetExplanation?.(data.explain || data.trueFalse?.explain || '');
  }, [data.id, onSetExplanation]);

  useEffect(() => {
    setSelected(null);
    setIsPlaying(false);
    onAnswerChangeRef.current?.({ [data.id]: [] });
  }, [data.id, currentGroupIndex, restartKey]);

  useEffect(() => {
    if (reviewMode && isQuestionEntity(data)) {
      setSelected(parseStoredTrueFalseUserAnswer(data.userAnswers));
    }
  }, [reviewMode, data.id]);

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

  if (
    !isQuestionEntity(data) ||
    data.type !== QuestionEntityNs.type.TRUE_FALSE
  ) {
    return null;
  }

  const handlePick = (value: boolean) => {
    if (reviewMode || showAnswer) return;
    setSelected(value);
    onAnswerChange?.({ [data.id]: [String(value)] });
  };

  const reviewBool = reviewMode
    ? parseStoredTrueFalseUserAnswer(data.userAnswers)
    : null;

  const btnTfStyles = {
    answerBox: styles.answerBox,
    active: styles.active,
    correct: styles.correct,
    incorrect: styles.incorrect,
    missed: styles.missed,
  };

  const btnClass = (value: boolean) =>
    getTrueFalseOptionClassName(
      value,
      {
        correctBool,
        reviewBool,
        reviewMode: Boolean(reviewMode),
        selected,
        showAnswer: Boolean(showAnswer),
        checkResult,
      },
      btnTfStyles,
    );

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
                  type="button"
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
            <div
              className={btnClass(true)}
              onClick={() => handlePick(true)}
              role="presentation"
            >
              <div className={styles.contentText}>
                <p className={styles.text}>{t('exam.trueLabel')}</p>
              </div>
            </div>
            <div
              className={btnClass(false)}
              onClick={() => handlePick(false)}
              role="presentation"
            >
              <div className={styles.contentText}>
                <p className={styles.text}>{t('exam.falseLabel')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
