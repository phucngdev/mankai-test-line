import type { QuestionEntity, QuestionGroupEntity } from '#/api/requests';
import type { ExamDragAdvProps } from '#/api/requests/interface/Exam/ExamProps';
import { IconListen } from '#/assets/svg/externalIcon';
import { checkDropDownAnswer } from '#/src/components/Vocabulary/FormExam/utils/checkDropDownAnswer';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactPlayer from 'react-player';
import styles from './ExamDrag.module.scss';

export default function ExamDrag({
  data,
  totalGroups,
  onAnswerChange,
  currentGroupIndex,
  onSetExplanation,
  onSelectQuestion,
  reviewData,
  showAnswer,
  reviewMode,
}: ExamDragAdvProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const { t } = useTranslation();
  const [activeBlank, setActiveBlank] = useState<number | null>(null);

  const isQuestionEntity = (
    d: QuestionEntity | QuestionGroupEntity,
  ): d is QuestionEntity => 'chooseAnswerInBlank' in d && 'options' in d;

  if (!isQuestionEntity(data)) return null;

  const blanks = data.chooseAnswerInBlank || [];
  const options = data.options || [];
  const sentence = data.content || '';
  useEffect(() => {
    const explanation = (isQuestionEntity(data) && data.explain) || '';
    onSetExplanation?.(explanation);
  }, [data, onSetExplanation]);

  useEffect(() => {
    setSelectedAnswers({});
  }, [data, currentGroupIndex]);

  const handleSelectAnswer = (blankIndex: number, answer?: string) => {
    if (selectedAnswers[blankIndex] && answer === undefined) {
      const updatedAnswers = { ...selectedAnswers };
      delete updatedAnswers[blankIndex];
      setSelectedAnswers(updatedAnswers);
      onAnswerChange?.(updatedAnswers);
      return;
    }

    if (answer) {
      const updatedAnswers = { ...selectedAnswers, [blankIndex]: answer };
      setSelectedAnswers(updatedAnswers);
      setActiveBlank(null);
      onAnswerChange?.(updatedAnswers);
    }
  };

  const renderSentenceWithBlanks = () => {
    const parts = sentence.split('__');

    return (
      <div className={styles.partContainer}>
        {parts.map((part, i) => (
          <span className={styles.partGroup} key={i}>
            <span
              className={styles.partText}
              dangerouslySetInnerHTML={{ __html: part }}
            />
            {i < blanks.length && (
              <span
                className={`${styles.blankSpan} ${
                  activeBlank === blanks[i].index ? styles.activeBlank : ''
                }`}
                onClick={e => {
                  e.stopPropagation();
                  if (reviewMode) return;

                  const currentAnswer = selectedAnswers[blanks[i].index];

                  if (currentAnswer) {
                    handleSelectAnswer(blanks[i].index);
                  } else {
                    setActiveBlank(blanks[i].index);
                  }
                }}
              >
                {reviewMode
                  ? (() => {
                      const userAnswer = (data?.userAnswers as any[])?.find(
                        (u: any) => u.index === blanks[i].index,
                      )?.correctAnswer;

                      return (
                        userAnswer ||
                        (showAnswer ? blanks[i].correctAnswer : '') ||
                        '........'
                      );
                    })()
                  : selectedAnswers[blanks[i].index] || '........'}
              </span>
            )}
          </span>
        ))}
      </div>
    );
  };

  function checkChooseAnswerInBlank(item: QuestionEntity) {
    if (!item.userAnswers || item.userAnswers.length === 0) return false;

    // chưa làm

    return item.chooseAnswerInBlank.every((blank: any) => {
      const userAnswer = (item.userAnswers as any[])?.find(
        (u: any) => u.index === blank.index,
      );
      const selected = userAnswer?.correctAnswer;

      return String(selected).trim() === String(blank.correctAnswer).trim();
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

  const renderQuestionList = () => {
    if (reviewMode && reviewData) {
      return reviewData.data.examLesson.exam.questionMapping.map(
        (item: any, index: number) => {
          let { questionClass } = styles;

          if ('questions' in item) {
            const isCorrect = checkGroup(item);
            questionClass = isCorrect ? styles.correct : styles.incorrect;
          } else if (item.type === 'CHOOSE_ANSWER_IN_BLANK') {
            const isCorrect = checkChooseAnswerInBlank(item);
            questionClass = isCorrect ? styles.correct : styles.incorrect;
          } else if (item.type === 'DROP_DOWN_ANSWER') {
            const isCorrect = checkDropDownAnswer(item);
            questionClass = isCorrect ? styles.correct : styles.incorrect;
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
                  (ans: string, idx: number) => ans === correctAnswers[idx],
                );

              questionClass = isAllCorrect ? styles.correct : styles.incorrect;
            }
          } else if (item.type === 'MATCHING') {
            const checkAnswer = checkMatchingAnswer(
              item.userAnswers,
              item.matchingAnswers,
            );
            questionClass = checkAnswer ? styles.correct : styles.incorrect;

            if (!item.userAnswers || item.userAnswers.length === 0) {
              questionClass = styles.missed;
            }
          } else if (!item.userAnswers || item.userAnswers.length === 0) {
            questionClass = styles.missed;
          } else {
            const isCorrect = checkAnswers(
              item.userAnswers,
              item.multipleChoiceHorizontal,
            );
            questionClass = isCorrect ? styles.correct : styles.incorrect;
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
      );
    }

    return Array.from({ length: totalGroups }, (_, i) => (
      <button
        className={`${styles.questionNumber} ${
          i === currentGroupIndex ? styles.activeQuestion : ''
        }`}
        disabled
        key={i}
        onClick={() => onSelectQuestion?.(i)}
        type="button"
      >
        {i + 1}
      </button>
    ));
  };

  return (
    <div className={styles.boxContent}>
      <div className={styles.formAudio}>
        <div className={styles.lboxQuestion}>
          <p className={styles.title}>{t('mocktest.listQuestion')}</p>
          <div className={styles.listQuestion}>{renderQuestionList()}</div>
        </div>

        <div className={styles.boxAudio}>
          <p className={styles.headerAudio}>
            {t('historyExam.numberExam')} {(currentGroupIndex ?? 0) + 1} /{' '}
            {totalGroups}
          </p>
          <div className={styles.contentAudio}>
            <div className={styles.audioListen}>
              <p className={styles.contentTitleAudio}>
                {t('exam.contentTitleAudio')}
              </p>
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
                  <div className={styles.audio} style={{ display: 'none' }}>
                    <ReactPlayer
                      playing={isPlaying}
                      ref={playerRef}
                      url={data.audioUrl}
                    />
                  </div>
                </>
              ) : null}
            </div>

            <div className={styles.textListen}>
              {renderSentenceWithBlanks()}

              {(reviewMode || (!reviewMode && showAnswer)) &&
              blanks.length > 0 ? (
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
                    {blanks.map((blank: any, idx: number) => (
                      <span key={idx} style={{ marginRight: 8 }}>
                        {blank.correctAnswer}
                      </span>
                    ))}
                  </div>

                  <div>
                    Đáp án bạn chọn:
                    {blanks.map((blank: any, idx: number) => {
                      const userAnswer = reviewMode
                        ? (data?.userAnswers as any[])?.find(
                            (u: any) => u.index === blank.index,
                          )?.correctAnswer
                        : selectedAnswers[blank.index];

                      const isCorrect =
                        String(userAnswer)?.trim().toLowerCase() ===
                        String(blank.correctAnswer)?.trim().toLowerCase();

                      return (
                        <span
                          key={idx}
                          style={{
                            color: isCorrect ? 'green' : 'red',
                            fontWeight: 600,
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

            <div className={styles.answer}>
              {!reviewMode &&
                options
                  .filter(
                    (opt: string) =>
                      !Object.values(selectedAnswers).includes(opt),
                  )
                  .map((answer: string, index: number) => (
                    <div
                      className={styles.answerBox}
                      key={index}
                      onClick={() => {
                        const firstUnselected = blanks.find(
                          b => !selectedAnswers[b.index],
                        );
                        if (firstUnselected) {
                          handleSelectAnswer(firstUnselected.index, answer);
                        }
                      }}
                    >
                      <div className={styles.contentText}>
                        <p className={styles.text}>{answer}</p>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
