import type { QuestionEntity, QuestionGroupEntity } from '#/api/requests';
import type { ExamDragAdvProps } from '#/api/requests/interface/Exam/ExamProps';
import { IconListen } from '#/assets/svg/externalIcon';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactPlayer from 'react-player';
import { checkDropDownAnswer } from '#/src/components/Vocabulary/FormExam/utils/checkDropDownAnswer';
import baseStyles from '../ExamDrag/ExamDrag.module.scss';
import styles from './ExamDropDownAnswer.module.scss';

type DropDownAnswerItem = {
  index: number;
  explanation?: string;
  arrAnswer: Array<{ content: string; isCorrect?: boolean }>;
};

export default function ExamDropDownAnswer({
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

  const isQuestionEntity = (
    d: QuestionEntity | QuestionGroupEntity,
  ): d is QuestionEntity => 'type' in d;

  if (!isQuestionEntity(data)) return null;

  const sentence = data.content || '';
  const dropDownAnswers: DropDownAnswerItem[] = useMemo(
    () =>
      (((data as any).dropDownAnswers as DropDownAnswerItem[]) ??
        ((data as any).dropdownAnswers as DropDownAnswerItem[]) ??
        []) as DropDownAnswerItem[],
    [data],
  );

  const blanks = dropDownAnswers.map(item => ({
    correctAnswer:
      item.arrAnswer?.find(answer => answer?.isCorrect)?.content?.trim() || '',
    index: Number(item.index),
  }));

  const getOptionsByBlank = (blankIndex: number): string[] => {
    const item = dropDownAnswers.find(
      answerItem => Number(answerItem.index) === Number(blankIndex),
    );
    return (item?.arrAnswer ?? [])
      .map(answer => answer?.content?.trim())
      .filter(Boolean) as string[];
  };

  const getDisplayValue = (blankIndex: number) => {
    if (reviewMode) {
      return (
        (data?.userAnswers as any[])?.find(
          (u: any) => Number(u.index) === Number(blankIndex),
        )?.correctAnswer || ''
      );
    }

    return selectedAnswers[blankIndex] || '';
  };

  useEffect(() => {
    onSetExplanation?.(data.explain || '');
  }, [data, onSetExplanation]);

  useEffect(() => {
    setSelectedAnswers({});
  }, [data, currentGroupIndex]);

  const handleSelectAnswer = (blankIndex: number, answer: string) => {
    if (!answer) {
      const updatedAnswers = { ...selectedAnswers };
      delete updatedAnswers[blankIndex];
      setSelectedAnswers(updatedAnswers);
      onAnswerChange?.(updatedAnswers);
      return;
    }

    const updatedAnswers = { ...selectedAnswers, [blankIndex]: answer };
    setSelectedAnswers(updatedAnswers);
    onAnswerChange?.(updatedAnswers);
  };

  const renderSentenceWithBlanks = () => {
    const parts = sentence.split('__');

    return (
      <div className={baseStyles.partContainer}>
        {parts.map((part, i) => (
          <span className={baseStyles.partGroup} key={i}>
            <span
              className={baseStyles.partText}
              dangerouslySetInnerHTML={{ __html: part }}
            />
            {i < blanks.length && (
              <span className={styles.inlineSelectWrap}>
                <select
                  className={`${styles.inlineSelect} ${
                    showAnswer || reviewMode
                      ? getDisplayValue(blanks[i].index)
                        ? getDisplayValue(blanks[i].index)
                            .trim()
                            .toLowerCase() ===
                          blanks[i].correctAnswer.trim().toLowerCase()
                          ? styles.correctSelect
                          : styles.wrongSelect
                        : styles.emptySelect
                      : ''
                  }`}
                  disabled={reviewMode}
                  onChange={e =>
                    handleSelectAnswer(blanks[i].index, e.target.value)
                  }
                  value={getDisplayValue(blanks[i].index)}
                >
                  <option value="">
                    {t('common.select', { defaultValue: 'Chon dap an' })}
                  </option>
                  {getOptionsByBlank(blanks[i].index).map(
                    (option: string, optionIdx: number) => (
                      <option key={optionIdx} value={option}>
                        {option}
                      </option>
                    ),
                  )}
                </select>
                {(showAnswer || reviewMode) &&
                getDisplayValue(blanks[i].index).trim().toLowerCase() !==
                  blanks[i].correctAnswer.trim().toLowerCase() ? (
                  <span className={styles.correctHint}>
                    {blanks[i].correctAnswer}
                  </span>
                ) : null}
              </span>
            )}
          </span>
        ))}
      </div>
    );
  };

  const checkAnswers = (userAnswers: any[] = [], opts: any[] = []) => {
    const correct = (opts ?? []).filter(o => o?.isCorrect).map(o => o.content);
    const user = (userAnswers ?? []).filter(u => u != null).map(u => u.content);
    return (
      user.length === correct.length && user.every(c => correct.includes(c))
    );
  };

  const checkGroup = (group: QuestionGroupEntity) => {
    return group.questions.every(q =>
      checkAnswers(q.userAnswers, q.multipleChoiceAnswers),
    );
  };

  const checkChooseAnswerInBlank = (item: QuestionEntity) => {
    if (!item.userAnswers || item.userAnswers.length === 0) return false;
    return item.chooseAnswerInBlank.every((blank: any) => {
      const userAnswer = (item.userAnswers as any[])?.find(
        (u: any) => u.index === blank.index,
      )?.correctAnswer;
      return (
        String(userAnswer).trim().toLowerCase() ===
        String(blank.correctAnswer).trim().toLowerCase()
      );
    });
  };

  const checkMatchingAnswer = (
    userAnswers: { left: string; right: string }[],
    correctPairs: { left: string; right: string }[],
  ) => {
    if (!userAnswers) return false;
    if (userAnswers.length !== correctPairs.length) return false;

    return userAnswers.every(ans =>
      correctPairs.some(
        pair => pair.left === ans.left && pair.right === ans.right,
      ),
    );
  };

  const renderQuestionList = () => {
    if (reviewMode && reviewData) {
      return reviewData.data.examLesson.exam.questionMapping.map(
        (item: any, index: number) => {
          let { questionClass } = baseStyles;

          if ('questions' in item) {
            const isCorrect = checkGroup(item);
            questionClass = isCorrect
              ? baseStyles.correct
              : baseStyles.incorrect;
          } else if (item.type === 'CHOOSE_ANSWER_IN_BLANK') {
            const isCorrect = checkChooseAnswerInBlank(item);
            questionClass = isCorrect
              ? baseStyles.correct
              : baseStyles.incorrect;
          } else if (item.type === 'DROP_DOWN_ANSWER') {
            const isCorrect = checkDropDownAnswer(item);
            questionClass = isCorrect
              ? baseStyles.correct
              : baseStyles.incorrect;
          } else if (item.type === 'FILL_IN_BLANK') {
            if (!item.userAnswers || item.userAnswers.length === 0) {
              questionClass = baseStyles.missed;
            } else {
              const correctAnswers = item.fillInBlank.map(
                (f: any) => f.correctAnswer,
              );
              const userAnswerValues = item.userAnswers.map(
                (u: any) => u.correctAnswer,
              );
              const isAllCorrect =
                userAnswerValues.length === correctAnswers.length &&
                userAnswerValues.every(
                  (ans: string, idx: number) => ans === correctAnswers[idx],
                );
              questionClass = isAllCorrect
                ? baseStyles.correct
                : baseStyles.incorrect;
            }
          } else if (item.type === 'MATCHING') {
            const isCorrect = checkMatchingAnswer(
              item.userAnswers,
              item.matchingAnswers,
            );
            questionClass = isCorrect
              ? baseStyles.correct
              : baseStyles.incorrect;
            if (!item.userAnswers || item.userAnswers.length === 0) {
              questionClass = baseStyles.missed;
            }
          } else if (!item.userAnswers || item.userAnswers.length === 0) {
            questionClass = baseStyles.missed;
          } else {
            const isCorrect = checkAnswers(
              item.userAnswers,
              item.multipleChoiceHorizontal,
            );
            questionClass = isCorrect
              ? baseStyles.correct
              : baseStyles.incorrect;
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
        className={`${baseStyles.questionNumber} ${
          i === currentGroupIndex ? baseStyles.activeQuestion : ''
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
    <div className={baseStyles.boxContent}>
      <div className={baseStyles.formAudio}>
        <div className={baseStyles.lboxQuestion}>
          <p className={baseStyles.title}>{t('mocktest.listQuestion')}</p>
          <div className={baseStyles.listQuestion}>{renderQuestionList()}</div>
        </div>

        <div className={baseStyles.boxAudio}>
          <p className={baseStyles.headerAudio}>
            {t('historyExam.numberExam')} {(currentGroupIndex ?? 0) + 1} /{' '}
            {totalGroups}
          </p>
          <div className={baseStyles.contentAudio}>
            <div className={baseStyles.audioListen}>
              <p className={baseStyles.contentTitleAudio}>
                {t('exam.contentTitleAudio')}
              </p>
              {data.audioUrl ? (
                <>
                  <div
                    className={baseStyles.iconListen}
                    onClick={() => setIsPlaying(prev => !prev)}
                    style={{
                      transform: isPlaying ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <IconListen color="#fff" height={32} width={32} />
                  </div>
                  <div className={baseStyles.audio} style={{ display: 'none' }}>
                    <ReactPlayer
                      playing={isPlaying}
                      ref={playerRef}
                      url={data.audioUrl}
                    />
                  </div>
                </>
              ) : null}
            </div>

            <div className={baseStyles.textListen}>
              {renderSentenceWithBlanks()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
