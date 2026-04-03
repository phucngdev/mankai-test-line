import React, { useState, useEffect } from 'react';
import { Modal, Button, message } from 'antd';
import styles from './VideoQuestionPopup.module.scss';
import { QuestionEntity } from '#/api/requests';
import Exam from '../FormExam/FormatExam/Exam/Exam';
import ExamDrag from '../FormExam/FormatExam/ExamDrag/ExamDrag';
import ExamConnect from '../FormExam/FormatExam/ExamConnect/ExamConnect';
import ExamDropDownAnswer from '../FormExam/FormatExam/ExamDropDownAnswer/ExamDropDownAnswer';
import { useTranslation } from 'react-i18next';
import type { TimeQuestion } from '#/api/requests/interface/VideoProps';

interface VideoQuestionPopupProps {
  visible: boolean;
  questions: TimeQuestion[];
  onCorrect: (answeredIds: string[]) => void;
  onWrong: () => void;
  onRewatch: () => void;
}

const VideoQuestionPopup: React.FC<VideoQuestionPopupProps> = ({
  visible,
  questions,
  onCorrect,
  onWrong,
  onRewatch,
}) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentTimeQuestion = questions[currentIndex];
  const question = currentTimeQuestion?.idQuestion;

  // Reset state when question index or questions list changes
  useEffect(() => {
    setUserAnswer(null);
    setIsCorrect(null);
    setShowFeedback(false);
  }, [currentIndex, questions]);

  const handleAnswerChange = (val: any) => {
    setUserAnswer(val);
    setShowFeedback(false);
  };

  const checkAnswer = () => {
    if (!userAnswer) {
      message.warning(
        t('exam.please_select_answer', 'Vui lòng chọn hoặc nhập câu trả lời'),
      );
      return;
    }

    if (!question) return;

    let correct = false;

    switch (question.type) {
      case QuestionEntity.type.MULTIPLE_CHOICE_HORIZONTAL: {
        const selectedContents = userAnswer[question.id] || [];
        const correctAnswers =
          (question.multipleChoiceHorizontal as any[])
            ?.filter((a: any) => a.isCorrect)
            .map((a: any) => a.content) || [];
        correct =
          selectedContents.length === correctAnswers.length &&
          selectedContents.every((c: string) => correctAnswers.includes(c));
        break;
      }
      case QuestionEntity.type.CHOOSE_ANSWER_IN_BLANK: {
        const answers = userAnswer[question.id] || {};
        const correctAnswers = (question as any).chooseAnswerInBlank || [];
        correct = correctAnswers.every((blank: any) => {
          const uAns = answers[blank.index];
          return (
            String(uAns || '')
              .trim()
              .toLowerCase() ===
            String(blank.correctAnswer || '')
              .trim()
              .toLowerCase()
          );
        });
        break;
      }
      case QuestionEntity.type.DROP_DOWN_ANSWER: {
        const answers = userAnswer[question.id] || {};
        const rawDropDownAnswers =
          ((question as any).dropDownAnswers as any[]) ??
          ((question as any).dropdownAnswers as any[]) ??
          [];
        const sortedDropDownAnswers = [...rawDropDownAnswers].sort(
          (a, b) => Number(a.index) - Number(b.index),
        );
        const results = sortedDropDownAnswers.map((item: any) => {
          const correctAnswer =
            item?.arrAnswer?.find((answer: any) => answer?.isCorrect)
              ?.content ?? '';
          const uAns = answers[Number(item?.index)] ?? '';
          return (
            String(uAns).trim().toLowerCase() ===
            String(correctAnswer).trim().toLowerCase()
          );
        });
        correct = results.length > 0 && results.every(Boolean);
        break;
      }
      case QuestionEntity.type.TRUE_FALSE: {
        const uAns = userAnswer[question.id];
        const isTrue = String(uAns || '').toUpperCase() === 'TRUE';
        correct = isTrue === !!question.trueFalseAnswer;
        break;
      }
      case QuestionEntity.type.MATCHING: {
        if (Array.isArray(userAnswer)) {
          const correctPairs = question.matchingAnswers || [];
          correct =
            userAnswer.length === correctPairs.length &&
            userAnswer.every((ans: any) =>
              correctPairs.some(
                (pair: any) => pair.left === ans.left && pair.right === ans.right,
              ),
            );
        }
        break;
      }
      case QuestionEntity.type.FILL_IN_BLANK: {
        const answers = userAnswer || {};
        const correctAnswers = (question as any).fillInBlank || [];
        correct =
          correctAnswers.length > 0 &&
          correctAnswers.every((blank: any) => {
            const uAns = answers[blank.index - 1];
            return (
              String(uAns || '')
                .trim()
                .toLowerCase() ===
              String(blank.correctAnswer || '')
                .trim()
                .toLowerCase()
            );
          });
        break;
      }
      default:
        correct = true;
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      if (currentIndex < questions.length - 1) {
        message.success(
          t('exam.correct_next', 'Đúng rồi! Chuẩn bị sang câu tiếp theo nhé.'),
        );
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
        }, 1500);
      } else {
        message.success(
          t('exam.all_correct', 'Chúc mừng! Bạn đã hoàn thành tất cả câu hỏi.'),
        );
        setTimeout(() => {
          onCorrect(questions.map((q) => q._id));
        }, 1500);
      }
    } else {
      message.error(
        t(
          'exam.wrong_answer',
          'Rất tiếc, câu trả lời chưa chính xác. Vui lòng tua lại để xem nhé.',
        ),
      );
      setTimeout(() => {
        onWrong();
      }, 2000);
    }
  };

  const renderQuestion = () => {
    if (!question) return null;

    const commonProps = {
      data: question,
      totalGroups: 1,
      currentGroupIndex: 0,
      showAnswer: showFeedback,
      reviewMode: false,
      reviewData: null,
    };

    switch (question.type) {
      case QuestionEntity.type.MULTIPLE_CHOICE_HORIZONTAL:
        return (
          <Exam
            {...commonProps}
            checkResult={
              isCorrect === false
                ? 'wrong'
                : isCorrect === true
                  ? 'correct'
                  : null
            }
            onAnswerChange={handleAnswerChange}
          />
        );
      case QuestionEntity.type.CHOOSE_ANSWER_IN_BLANK:
        return (
          <ExamDrag
            {...commonProps}
            onAnswerChange={(val) => handleAnswerChange({ [question.id]: val })}
          />
        );
      case QuestionEntity.type.DROP_DOWN_ANSWER:
        return (
          <ExamDropDownAnswer
            {...commonProps}
            onAnswerChange={(val) => handleAnswerChange({ [question.id]: val })}
          />
        );
      case QuestionEntity.type.TRUE_FALSE: {
        const options = [
          { label: 'TRUE', value: 'TRUE' },
          { label: 'FALSE', value: 'FALSE' },
        ];
        return (
          <div className={styles.trueFalseContainer}>
            <p className={styles.questionContent}>{question.content}</p>
            <div className={styles.answerOptions}>
              {options.map((opt, index) => {
                const isSelected = userAnswer?.[question.id] === opt.value;
                let answerClass = styles.answerBox;

                if (isSelected) answerClass += ` ${styles.active}`;

                if (showFeedback) {
                  answerClass += ` ${styles.disabled}`;
                  const isCorrectOption =
                    (opt.value === 'TRUE') === !!question.trueFalseAnswer;
                  if (isCorrectOption) {
                    answerClass += ` ${styles.correct}`;
                  } else if (isSelected) {
                    answerClass += ` ${styles.incorrect}`;
                  }
                }

                return (
                  <div
                    className={answerClass}
                    key={opt.value}
                    onClick={() =>
                      !showFeedback &&
                      handleAnswerChange({ [question.id]: opt.value })
                    }
                  >
                    <div className={styles.contentBox}>
                      <p className={styles.text}>
                        {String.fromCharCode(65 + index)}
                      </p>
                    </div>
                    <div className={styles.contentText}>
                      <p className={styles.text}>{opt.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {showFeedback && (
              <div
                className={`${styles.feedback} ${
                  isCorrect ? styles.correct : styles.wrong
                }`}
              >
                {isCorrect
                  ? t('exam.correct', 'Đúng rồi!')
                  : t('exam.incorrect', 'Sai rồi!')}
                {!isCorrect && (
                  <div className={styles.correctAnswerLabel}>
                    {t('exam.correct_answer_is', 'Đáp án đúng là:')}{' '}
                    {question.trueFalseAnswer ? 'TRUE' : 'FALSE'}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }
      case QuestionEntity.type.MATCHING:
        return (
          <ExamConnect
            {...commonProps}
            onAnswerChange={(isComplete, pairs) => {
              if (isComplete) handleAnswerChange(pairs);
              else handleAnswerChange(null);
            }}
          />
        );
      case QuestionEntity.type.FILL_IN_BLANK: {
        const content = question.content || '';
        const parts = content.split('__');
        const correctAnswers = (question as any).fillInBlank || [];

        return (
          <div className={styles.fillInBlankContainer}>
            <div className={styles.questionContent}>
              {parts.map((part: string, index: number) => (
                <React.Fragment key={index}>
                  <span dangerouslySetInnerHTML={{ __html: part }} />
                  {index < parts.length - 1 && (
                    <input
                      className={`${styles.inputBlank} ${
                        showFeedback
                          ? userAnswer?.[index]?.trim().toLowerCase() ===
                            correctAnswers
                              .find((c: any) => c.index - 1 === index)
                              ?.correctAnswer?.trim()
                              .toLowerCase()
                            ? styles.correct
                            : styles.incorrect
                          : ''
                      }`}
                      disabled={showFeedback}
                      onChange={(e) => {
                        const newAnswers = {
                          ...(userAnswer || {}),
                          [index]: e.target.value,
                        };
                        handleAnswerChange(newAnswers);
                      }}
                      placeholder="..."
                      type="text"
                      value={userAnswer?.[index] || ''}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            {showFeedback && !isCorrect && (
              <div className={styles.correctAnswerSection}>
                <span className={styles.title}>
                  {t('exam.correct_answers', 'Đáp án đúng là:')}
                </span>
                {correctAnswers.map((blank: any) => (
                  <div className={styles.answerItem} key={blank.index}>
                    <span className={styles.index}>({blank.index})</span>
                    <span className={styles.text}>{blank.correctAnswer}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  return (
    <Modal
      centered
      className={styles.modalContent}
      closable={false}
      footer={null}
      maskClosable={false}
      open={visible}
      title={t('video.question_pause', 'Câu hỏi giữa video')}
      width={1000}
    >
      <div className={styles.questionWrapper}>
        {questions.length > 1 && (
          <div className={styles.progressInfo}>
            <span>{t('exam.question_progress', 'Câu hỏi')}:</span>
            {currentIndex + 1} / {questions.length}
          </div>
        )}

        {renderQuestion()}

        <div className={styles.footer}>
          <Button onClick={onRewatch} size="large">
            {t('video.rewatch', 'Xem lại')}
          </Button>
          <Button
            disabled={showFeedback}
            onClick={checkAnswer}
            size="large"
            type="primary"
          >
            {t('exam.check_answer', 'Kiểm tra đáp án')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default VideoQuestionPopup;
