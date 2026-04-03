import type { MatchingAnswerDto, QuestionGroupEntity } from '#/api/requests';
import { MultipleChoiceUserAnswerDto, QuestionEntity } from '#/api/requests';
import type {
  AllUserAnswerDto,
  AnswerGroup,
  DecryptedData,
  ExamFormProps,
} from '#/api/requests/interface/Exam/ExamProps';
import { IconExam } from '#/assets/svg/externalIcon';
import Loading from '#/shared/components/loading/Loading';
import { updateLessionProgress } from '#/shared/redux/slices/LessionSlice';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { getExamLessonByIdLession } from '#/shared/redux/thunk/ExamLesson';
import {
  getExamReultsHistory,
  postExamReults,
} from '#/shared/redux/thunk/ExamReultsThunk';
import {
  getLessionById,
  postLessionProgress,
} from '#/shared/redux/thunk/LessionThunk';
import { formatTimeEstimateSeconds } from '#/shared/utils/formatTimeEstimate';
import ExamRecord from '#/src/components/Vocabulary/FormExam/FormatExam/ExamRecord/ExamRecord';
import { ClockCircleOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import ExamResultSectionPractice from '../ExamResultSection/ExamResultSectionPractice';
import KanjiCanvas from '../KanjiCanvas/KanjiCanvas';
import TitleVocabulary from '../TitleVocabulary/TitleVocabulary';
import Exam from './FormatExam/Exam/Exam';
import ExamConnect from './FormatExam/ExamConnect/ExamConnect';
import ExamDrag from './FormatExam/ExamDrag/ExamDrag';
import ExamDropDownAnswer from './FormatExam/ExamDropDownAnswer/ExamDropDownAnswer';
import ExamFile from './FormatExam/ExamFile/ExamFile';
import ExamTrueFalse from './FormatExam/ExamTrueFalse/ExamTrueFalse';
import FormAudio from './FormatExam/FormAudio/FormAudio';
import FormListeningReading from './FormatExam/FormListeningReading/FormListeningReading';
import styles from './FormExam.module.scss';
import {
  isTrueFalseQuestionCorrect,
  normalizeTrueFalseValue,
} from './utils/trueFalseCompare';

export default function FormExam({
  onClickNext,
  isAnyCompleted,
  reviewData,
}: ExamFormProps) {
  const dataById = useSelector((state: RootState) => state.lession.dataById);
  const dataExamLesson = useSelector(
    (state: RootState) => state.examLesson.data,
  );
  const { lessonId, courseId } = useParams();
  const [decryptedData, setDecryptedData] = useState<DecryptedData>({
    items: [],
  });
  const { t } = useTranslation();
  const [isReviewMode, setIsReviewMode] = useState(reviewData);
  const [hasSelectedAnswer, setHasSelectedAnswer] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const secretKey = import.meta.env.VITE_ENCRYPTION_KEY || 'your-secret-key';
  const userStr = Cookies.get('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [answersGroup, setAnswersGroup] = useState<AnswerGroup[]>([]);
  const [scoredGroupIds, setScoredGroupIds] = useState<Set<number>>(new Set());
  const [answeredGroupIds, setAnsweredGroupIds] = useState<Set<string>>(
    new Set(),
  );
  const [allUserAnswers, setAllUserAnswers] = useState<AllUserAnswerDto[]>([]);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [answersFile, setAnswersFile] = useState<
    Record<number, string | boolean>
  >({});
  const [checkResult, setCheckResult] = useState<null | 'correct' | 'wrong'>(
    null,
  );
  const [restartKey, setRestartKey] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answersPair, setAnswersPair] = useState<
    Record<number, string | string[] | MatchingAnswerDto[]>
  >({});
  useEffect(() => {
    if (reviewData) {
      setIsReviewMode(true);
    } else {
      setIsReviewMode(false);
    }
  }, [reviewData]);

  const fetcData = async () => {
    if (!lessonId) return;
    setLoading(true);
    await Promise.all([
      dispatch(getExamLessonByIdLession({ id: lessonId })),
      dispatch(getLessionById(lessonId)),
    ]);
    setLoading(false);
  };

  const mapToUserAnswerType = (
    type: QuestionEntity.type,
  ): MultipleChoiceUserAnswerDto.questionType => {
    switch (type) {
      case QuestionEntity.type.MULTIPLE_CHOICE:
        return MultipleChoiceUserAnswerDto.questionType.MULTIPLE_CHOICE;
      case QuestionEntity.type.MULTIPLE_CHOICE_HORIZONTAL:
        return MultipleChoiceUserAnswerDto.questionType
          .MULTIPLE_CHOICE_HORIZONTAL;
      case QuestionEntity.type.FILL_IN_BLANK:
        return MultipleChoiceUserAnswerDto.questionType.FILL_IN_BLANK;
      case QuestionEntity.type.CHOOSE_ANSWER_IN_BLANK:
        return MultipleChoiceUserAnswerDto.questionType.CHOOSE_ANSWER_IN_BLANK;
      case QuestionEntity.type.DROP_DOWN_ANSWER:
        return MultipleChoiceUserAnswerDto.questionType.DROP_DOWN_ANSWER;
      case QuestionEntity.type.ESSAY:
        return MultipleChoiceUserAnswerDto.questionType.ESSAY;
      case QuestionEntity.type.MATCHING:
        return MultipleChoiceUserAnswerDto.questionType.MATCHING;
      case QuestionEntity.type.HANDWRITING:
        return MultipleChoiceUserAnswerDto.questionType.HANDWRITING;
      case QuestionEntity.type.RECORD:
        return MultipleChoiceUserAnswerDto.questionType.RECORD;
      case QuestionEntity.type.TRUE_FALSE:
        return MultipleChoiceUserAnswerDto.questionType.TRUE_FALSE;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  };

  const buildUserAnswers = (): AllUserAnswerDto[] => {
    const allAnswers: AllUserAnswerDto[] = [];

    decryptedData.items.forEach(item => {
      item.exam.questionMapping.forEach((q: any) => {
        // Nếu là group câu hỏi (không có type)
        if (!('type' in q)) {
          (q.questions || []).forEach((sub: QuestionEntity) => {
            const userAns = answersGroup.find(a => a.id === sub.id);

            if (userAns) {
              if (sub.type === QuestionEntity.type.TRUE_FALSE) {
                const b = normalizeTrueFalseValue(userAns.answer);
                if (b !== null) {
                  allAnswers.push({
                    answer: [{ isCorrect: b }],
                    questionId: sub.id,
                    questionType: mapToUserAnswerType(sub.type),
                  });
                }
              } else {
                allAnswers.push({
                  answer: [
                    {
                      content: userAns.answer,
                      isCorrect: false,
                    },
                  ],
                  questionId: sub.id,
                  questionType: mapToUserAnswerType(sub.type),
                });
              }
            }
          });
        } else {
          // Câu hỏi đơn lẻ
          let ans: any[] = [];
          const userAns = answers[q.id];

          switch (q.type) {
            case QuestionEntity.type.MULTIPLE_CHOICE_HORIZONTAL:
            case QuestionEntity.type.MULTIPLE_CHOICE:
              if (userAns) {
                ans = (Array.isArray(userAns) ? userAns : [userAns]).map(
                  content => ({
                    content,
                    isCorrect: false,
                  }),
                );
              }

              break;

            case QuestionEntity.type.FILL_IN_BLANK:
              if (userAns) {
                const entries = Array.isArray(userAns)
                  ? userAns.map((u: any) => [u.index, u.content])
                  : typeof userAns === 'object'
                    ? Object.entries(userAns)
                    : [];

                ans = entries.map(([index, content]) => ({
                  correctAnswer: String(content ?? '').trim(),
                  index: Number(index),
                  isCorrect: false,
                }));
              }

              break;

            case QuestionEntity.type.CHOOSE_ANSWER_IN_BLANK:
              if (userAns) {
                const entries = Array.isArray(userAns)
                  ? userAns.map((content, i) => [i + 1, content])
                  : Object.entries(userAns);

                ans = entries.map(([index, content]) => ({
                  correctAnswer: String(content ?? '').trim(),
                  index: Number(index),
                  isCorrect: false,
                }));
              }

              break;
            case QuestionEntity.type.DROP_DOWN_ANSWER:
              if (userAns) {
                const entries = Array.isArray(userAns)
                  ? userAns.map((content, i) => [i + 1, content])
                  : Object.entries(userAns);

                ans = entries.map(([index, content]) => ({
                  correctAnswer: String(content ?? '').trim(),
                  index: Number(index),
                  isCorrect: false,
                }));
              }

              break;

            case QuestionEntity.type.ESSAY:
              const essayAns = answersFile[q.id];
              ans = [
                {
                  content: essayAns ? 'Đã nộp file' : '',
                  isCorrect: false,
                },
              ];
              break;

            case QuestionEntity.type.MATCHING:
              const userPairs = answersPair[q.id];

              if (Array.isArray(userPairs)) {
                ans = (userPairs as MatchingAnswerDto[]).map(pair => ({
                  isCorrect: false,
                  left: pair.left,
                  right: pair.right,
                }));
              }

              break;

            case QuestionEntity.type.TRUE_FALSE:
              if (userAns !== undefined && userAns !== null && userAns !== '') {
                const raw = Array.isArray(userAns) ? userAns[0] : userAns;
                const b = normalizeTrueFalseValue(raw);
                if (b !== null) {
                  ans = [{ isCorrect: b }];
                }
              }

              break;

            default:
              break;
          }

          if (ans.length > 0) {
            allAnswers.push({
              answer: ans,
              questionId: q.id,
              questionType: mapToUserAnswerType(q.type),
            });
          }
        }
      });
    });

    return allAnswers;
  };

  const handleReset = () => {
    setDecryptedData({ items: [] });
    setCurrentItemIndex(0);
    setCurrentGroupIndex(0);
    setCorrectAnswersCount(0);
    setCheckResult(null);
    setHasSelectedAnswer(false);
    setAnswers({});
    setAnswersGroup([]);
    setExplanation('');
    setIsModalVisible(false);
    setScoredGroupIds(new Set());
  };

  useEffect(() => {
    setLoading(true);
    handleReset();
    fetcData();
    setLoading(false);
  }, [lessonId]);

  function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];

    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  }

  useEffect(() => {
    if (isReviewMode && reviewData) {
      const rawData = reviewData.data ? [reviewData.data.examLesson] : [];
      setDecryptedData({ items: rawData });
      setCurrentItemIndex(0);
      setCurrentGroupIndex(0);
      return;
    }

    const processItems = (items: any[]) =>
      items.map(item => {
        const shouldShuffleAnswers =
          item?.randomAnswer === true || item?.exam?.randomAnswer === true;
        const shouldShuffleQuestions =
          item?.randomQuestion === true || item?.exam?.randomQuestion === true;

        let newQuestionMapping = item?.exam?.questionMapping || [];

        if (shouldShuffleQuestions) {
          newQuestionMapping = shuffleArray(newQuestionMapping);
        }

        if (shouldShuffleAnswers) {
          newQuestionMapping = newQuestionMapping.map((q: any) => {
            if (!('type' in q)) {
              const newQuestions = (q?.questions || []).map((sub: any) => ({
                ...sub,
                multipleChoiceAnswers: Array.isArray(sub?.multipleChoiceAnswers)
                  ? shuffleArray(sub.multipleChoiceAnswers)
                  : sub?.multipleChoiceAnswers,
              }));
              return { ...q, questions: newQuestions };
            }

            if (q.type === QuestionEntity.type.MULTIPLE_CHOICE_HORIZONTAL) {
              return {
                ...q,
                multipleChoiceHorizontal: Array.isArray(
                  q?.multipleChoiceHorizontal,
                )
                  ? shuffleArray(q.multipleChoiceHorizontal)
                  : q?.multipleChoiceHorizontal,
              };
            }

            if (Array.isArray(q?.multipleChoiceAnswers)) {
              return {
                ...q,
                multipleChoiceAnswers: shuffleArray(q.multipleChoiceAnswers),
              };
            }

            return q;
          });
        }

        return {
          ...item,
          exam: { ...item.exam, questionMapping: newQuestionMapping },
        };
      });

    if (
      dataExamLesson &&
      'encrypted' in dataExamLesson &&
      'data' in dataExamLesson
    ) {
      try {
        const bytes = CryptoJS.AES.decrypt(
          dataExamLesson.data.toString(),
          secretKey,
        );
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        const parsedData = JSON.parse(decryptedString);

        const rawItems = Array.isArray(parsedData.items)
          ? parsedData.items
          : [parsedData.items ?? parsedData];

        const items = processItems(rawItems);
        setDecryptedData({ items });
      } catch (error) {
        console.error('Decryption failed:', error);
        setDecryptedData({ items: [] });
      }
    } else {
      console.warn('⚠️ Condition not matched, skipping decrypt');
    }
  }, [dataExamLesson, secretKey, reviewData, isReviewMode]);

  useEffect(() => {
    setAnswers({});
    setAnswersGroup([]);
    setAnswersFile({});
    setCheckResult(null);
    setHasSelectedAnswer(false);
  }, [currentGroupIndex, currentItemIndex]);

  const currentItem = decryptedData.items[currentItemIndex];
  const currentGroup = currentItem?.exam?.questionMapping[currentGroupIndex];
  const currentGroupType =
    currentGroup && 'type' in currentGroup ? currentGroup.type : undefined;
  const isCountdownEnabled =
    currentGroupType !== QuestionEntity.type.ESSAY &&
    currentGroupType !== QuestionEntity.type.RECORD;
  const totalQuestions = decryptedData.items.reduce(
    (total, item) =>
      total +
      item.exam.questionMapping.reduce((groupTotal: number, group: any) => {
        if (!('type' in group) && Array.isArray(group.questions)) {
          return groupTotal + group.questions.length;
        }

        return groupTotal + 1;
      }, 0),
    0,
  );

  const totalGroups = decryptedData.items.reduce(
    (total, item) => total + (item.exam.questionMapping.length || 0),
    0,
  );

  const [isChecking, setIsChecking] = useState(false);

  const timeUpSubmittedRef = useRef(false);

  useEffect(() => {
    timeUpSubmittedRef.current = false;
  }, [lessonId]);

  const submitExamResultsAndShowModal = useCallback(() => {
    const classId = localStorage.getItem('classId') || '';
    const point =
      totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 10 : 0;
    if (courseId && classId && currentItem?.exam?.id) {
      dispatch(
        postExamReults({
          classId,
          courseId,
          examId: currentItem.exam.id,
          point,
          userAnswers: allUserAnswers,
        }),
      );
    }
    setIsModalVisible(true);
  }, [
    correctAnswersCount,
    totalQuestions,
    allUserAnswers,
    currentItem,
    courseId,
    dispatch,
  ]);

  const updateProgress = async (groupId: string) => {
    if (!lessonId) return;

    if (!answeredGroupIds.has(groupId)) {
      const updatedSet = new Set(answeredGroupIds).add(groupId);
      setAnsweredGroupIds(updatedSet);
      const progressPercent = Math.min(
        Math.round((updatedSet.size / totalGroups) * 100),
        100,
      );
      await Promise.all([
        dispatch(postLessionProgress({ lessonId, progress: progressPercent })),
        dispatch(
          updateLessionProgress({ lessonId, progress: progressPercent }),
        ),
      ]);
    }
  };

  const handleCheckAnswer = async () => {
    if (!currentGroup) return;
    setIsChecking(true);

    try {
      const userAnswers = buildUserAnswers();
      const currentAnswer = userAnswers.find(
        ans => ans.questionId === currentGroup.id,
      );

      if (currentAnswer) {
        setAllUserAnswers(prev => [
          ...prev.filter(a => a.questionId !== currentAnswer.questionId),
          currentAnswer,
        ]);
      }

      let isCorrect = false;
      let correctQuestionsCount = 0;

      if (!('type' in currentGroup)) {
        const subQuestions = currentGroup.questions || [];
        const allCorrect = subQuestions.every((sub: QuestionEntity) => {
          const userAnswer = answersGroup.find(a => a.id === sub.id)?.answer;
          if (sub.type === QuestionEntity.type.TRUE_FALSE) {
            return isTrueFalseQuestionCorrect(userAnswer, sub);
          }
          const correctAnswer = sub.multipleChoiceAnswers.find(
            a => a.isCorrect,
          )?.content;
          return userAnswer === correctAnswer;
        });
        isCorrect = allCorrect;
        subQuestions.forEach((sub: QuestionEntity) => {
          const userAnswer = answersGroup.find(a => a.id === sub.id)?.answer;
          if (sub.type === QuestionEntity.type.TRUE_FALSE) {
            if (isTrueFalseQuestionCorrect(userAnswer, sub)) {
              correctQuestionsCount += 1;
            }
            return;
          }
          const correctAnswer = sub.multipleChoiceAnswers.find(
            a => a.isCorrect,
          )?.content;

          if (userAnswer === correctAnswer) {
            correctQuestionsCount += 1;
          }
        });
      } else {
        const questionId = currentGroup.id;

        if (currentGroup.type === QuestionEntity.type.CHOOSE_ANSWER_IN_BLANK) {
          const correctAnswers = currentGroup.chooseAnswerInBlank.map(
            (a: any) => a.correctAnswer.trim(),
          );
          const userAnswers = Object.values(answers[currentGroup.id] || {}).map(
            a => a.trim(),
          );
          isCorrect =
            userAnswers.length === correctAnswers.length &&
            userAnswers.every((ans, idx) => ans === correctAnswers[idx]);
          correctQuestionsCount = userAnswers.filter(
            (ans, idx) => ans === correctAnswers[idx],
          ).length;
        } else if (currentGroup.type === QuestionEntity.type.DROP_DOWN_ANSWER) {
          const rawDropDownAnswers =
            ((currentGroup as any).dropDownAnswers as any[]) ??
            ((currentGroup as any).dropdownAnswers as any[]) ??
            [];

          const sortedDropDownAnswers = [...rawDropDownAnswers].sort(
            (a, b) => Number(a.index) - Number(b.index),
          );

          const userAnswerByIndex = Object.entries(
            answers[questionId] || {},
          ).reduce(
            (acc, [index, content]) => {
              acc[Number(index)] = String(content ?? '').trim();
              return acc;
            },
            {} as Record<number, string>,
          );

          const results = sortedDropDownAnswers.map(item => {
            const correctAnswer =
              item?.arrAnswer?.find((answer: any) => answer?.isCorrect)
                ?.content ?? '';
            const userAnswer = userAnswerByIndex[Number(item?.index)] ?? '';
            return (
              String(userAnswer).trim().toLowerCase() ===
              String(correctAnswer).trim().toLowerCase()
            );
          });

          isCorrect = results.length > 0 && results.every(Boolean);
          correctQuestionsCount = results.filter(Boolean).length;
        } else if (currentGroup.type === QuestionEntity.type.FILL_IN_BLANK) {
          const correctAnswers = currentGroup.fillInBlank?.map((a: any) =>
            a.correctAnswer.trim(),
          );
          const userAnswers = Object.values(answers[questionId] || {}).map(a =>
            a.trim(),
          );
          isCorrect =
            userAnswers.length === correctAnswers.length &&
            userAnswers.every((ans, idx) => ans === correctAnswers[idx]);

          correctQuestionsCount = userAnswers.filter(
            (ans, idx) => ans === correctAnswers[idx],
          ).length;
        } else if (currentGroup.type === QuestionEntity.type.MATCHING) {
          isCorrect = true;

          correctQuestionsCount = 1;
        } else if (
          currentGroup.type === QuestionEntity.type.MULTIPLE_CHOICE_HORIZONTAL
        ) {
          const correctAnswers =
            currentGroup.multipleChoiceHorizontal
              ?.filter((a: { isCorrect: boolean }) => a.isCorrect)
              .map((a: { content: string }) => a.content) || [];
          const userAnswers = Array.isArray(answers[questionId])
            ? answers[questionId]
            : [answers[questionId]];
          isCorrect =
            userAnswers.length === correctAnswers.length &&
            correctAnswers.every((ca: any) => userAnswers.includes(ca));

          correctQuestionsCount = userAnswers.filter((ans: string) =>
            correctAnswers.includes(ans),
          ).length;
        } else if (currentGroup.type === QuestionEntity.type.ESSAY) {
          isCorrect = answersFile[questionId] === true;
          correctQuestionsCount = isCorrect ? 1 : 0;
        } else if (currentGroup.type === QuestionEntity.type.HANDWRITING) {
          isCorrect = true;
          correctQuestionsCount = 1;
        } else if (currentGroup.type === QuestionEntity.type.TRUE_FALSE) {
          const userRaw = answers[questionId];
          isCorrect = isTrueFalseQuestionCorrect(userRaw, currentGroup);
          correctQuestionsCount = isCorrect ? 1 : 0;
        } else {
          isCorrect = true;
          correctQuestionsCount = isCorrect ? 1 : 0;
        }
      }

      setCheckResult(isCorrect ? 'correct' : 'wrong');
      setHasSelectedAnswer(true);
      if (currentItem.showAnswer) setShowAnswer(true);
      if (currentGroup) await updateProgress(currentGroup.id);

      if (currentGroup && !scoredGroupIds.has(currentGroup.id)) {
        setCorrectAnswersCount(prev => prev + correctQuestionsCount);
        setScoredGroupIds(prev => new Set(prev).add(currentGroup.id));
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleNextQuestion = () => {
    const nextGroupIndex = currentGroupIndex + 1;
    const currentItemQuestionLength =
      currentItem.exam.questionMapping.length || 0;

    if (nextGroupIndex < currentItemQuestionLength) {
      setCurrentGroupIndex(nextGroupIndex);
    } else if (currentItemIndex + 1 < decryptedData.items.length) {
      setCurrentItemIndex(prev => prev + 1);
      setCurrentGroupIndex(0);
    } else {
      submitExamResultsAndShowModal();
    }

    setCheckResult(null);
    setHasSelectedAnswer(false);
    setShowAnswer(false);
  };

  const handlePrevQuestion = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(prev => prev - 1);
    } else if (currentItemIndex > 0) {
      const prevItem = decryptedData.items[currentItemIndex - 1];
      const lastGroupIndex = prevItem.exam.questionMapping.length || 1;
      setCurrentItemIndex(prev => prev - 1);
      setCurrentGroupIndex(lastGroupIndex - 1);
    }

    setCheckResult(null);
    setHasSelectedAnswer(false);
    setShowAnswer(false);
  };

  const handleRestart = () => {
    const examId = currentItem?.exam?.id;
    if (user && examId) {
      dispatch(getExamReultsHistory({ examId, userId: user.id }));
    }

    setRestartKey(prev => prev + 1);
    setRemainingSeconds(null);
    pausedRemainingSecondsRef.current = null;
    setCurrentItemIndex(0);
    setCurrentGroupIndex(0);
    setCorrectAnswersCount(0);
    setIsModalVisible(false);
    setCheckResult(null);
    setHasSelectedAnswer(false);
    setAnswers({});
    setAnswersGroup([]);
    setScoredGroupIds(new Set());
    setIsReviewMode(false);
    // Prevent the "time up" effect from firing once again while we wait
    // for the countdown useEffect to reset `remainingSeconds`.
    timeUpSubmittedRef.current = true;
  };

  const renderByType = (record: QuestionEntity | QuestionGroupEntity) => {
    const type = 'type' in record ? String(record.type) : 'group';

    switch (type) {
      case QuestionEntity.type.MULTIPLE_CHOICE_HORIZONTAL:
        return (
          <Exam
            checkResult={checkResult}
            currentGroupIndex={currentGroupIndex}
            data={record}
            key={`${currentItemIndex}-${currentGroupIndex}`}
            onAnswerChange={val => {
              if (!isReviewMode) {
                setAnswers(val);
                setHasSelectedAnswer(true);
              }
            }}
            onSelectQuestion={(index: number) => {
              setCurrentItemIndex(0);
              setCurrentGroupIndex(index);
              setCheckResult(null);
              setHasSelectedAnswer(false);
              setShowAnswer(false);
            }}
            onSetExplanation={setExplanation}
            restartKey={restartKey}
            reviewData={reviewData}
            reviewMode={isReviewMode}
            showAnswer={showAnswer}
            totalGroups={totalGroups}
          />
        );
      case 'group':
        return (
          <FormListeningReading
            checkResult={checkResult}
            currentGroupIndex={currentGroupIndex}
            data={record}
            onAnswerChange={val => {
              setAnswersGroup(val);
              setHasSelectedAnswer(true);
              setExplanation('');
              val.forEach(a => {
                const sub =
                  'questions' in record && record.questions
                    ? record.questions.find(q => q.id === a.id)
                    : undefined;
                const tf =
                  sub?.type === QuestionEntity.type.TRUE_FALSE
                    ? normalizeTrueFalseValue(a.answer)
                    : null;
                const newAnswer: AllUserAnswerDto = {
                  answer:
                    sub?.type === QuestionEntity.type.TRUE_FALSE && tf !== null
                      ? [{ isCorrect: tf }]
                      : [{ content: a.answer, isCorrect: false }],
                  questionId: a.id,
                  questionType: sub
                    ? mapToUserAnswerType(sub.type)
                    : MultipleChoiceUserAnswerDto.questionType.MULTIPLE_CHOICE,
                };
                setAllUserAnswers(prev => [
                  ...prev.filter(
                    ans => ans.questionId !== newAnswer.questionId,
                  ),
                  newAnswer,
                ]);
              });
            }}
            onSelectQuestion={(index: number) => {
              setCurrentItemIndex(0);
              setCurrentGroupIndex(index);
              setCheckResult(null);
              setHasSelectedAnswer(false);
            }}
            reviewData={reviewData}
            reviewMode={isReviewMode}
            showAnswer={showAnswer}
            totalGroups={totalGroups}
            userAnswers={allUserAnswers}
          />
        );
      case QuestionEntity.type.CHOOSE_ANSWER_IN_BLANK:
        return (
          <ExamDrag
            currentGroupIndex={currentGroupIndex}
            data={record}
            onAnswerChange={val => {
              setAnswers(prev => ({ ...prev, [record.id]: val }));
              setHasSelectedAnswer(true);
            }}
            onSelectQuestion={(index: number) => {
              setCurrentItemIndex(0);
              setCurrentGroupIndex(index);
              setCheckResult(null);
              setHasSelectedAnswer(false);
            }}
            onSetExplanation={setExplanation}
            reviewData={reviewData}
            reviewMode={isReviewMode}
            showAnswer={showAnswer}
            totalGroups={totalGroups}
          />
        );
      case QuestionEntity.type.DROP_DOWN_ANSWER:
        return (
          <ExamDropDownAnswer
            currentGroupIndex={currentGroupIndex}
            data={record}
            onAnswerChange={val => {
              setAnswers(prev => ({ ...prev, [record.id]: val }));
              setHasSelectedAnswer(true);
            }}
            onSelectQuestion={(index: number) => {
              setCurrentItemIndex(0);
              setCurrentGroupIndex(index);
              setCheckResult(null);
              setHasSelectedAnswer(false);
            }}
            onSetExplanation={setExplanation}
            reviewData={reviewData}
            reviewMode={isReviewMode}
            showAnswer={showAnswer}
            totalGroups={totalGroups}
          />
        );
      case QuestionEntity.type.MATCHING:
        return (
          <ExamConnect
            currentGroupIndex={currentGroupIndex}
            data={record}
            onAnswerChange={(
              isComplete: boolean,
              pairs?: MatchingAnswerDto[],
            ) => {
              setHasSelectedAnswer(isComplete);

              if (pairs) {
                setAnswersPair(prev => ({ ...prev, [record.id]: pairs }));
                const newAnswer: AllUserAnswerDto = {
                  answer: pairs.map(pair => ({
                    left: pair.left,
                    right: pair.right,
                  })),
                  questionId: record.id,
                  questionType:
                    MultipleChoiceUserAnswerDto.questionType.MATCHING,
                };

                setAllUserAnswers(prev => [
                  ...prev.filter(ans => ans.questionId !== record.id),
                  newAnswer,
                ]);
              }
            }}
            onSelectQuestion={index => setCurrentGroupIndex(index)}
            reviewData={reviewData}
            reviewMode={isReviewMode}
            showAnswer={showAnswer}
            totalGroups={totalGroups}
          />
        );
      case QuestionEntity.type.FILL_IN_BLANK:
        return (
          <FormAudio
            checkResult={checkResult}
            currentGroupIndex={currentGroupIndex}
            data={record}
            onAnswerChange={val => {
              setAnswers(prev => ({ ...prev, [record.id]: val }));
              setHasSelectedAnswer(true);

              if ('fillInBlank' in record && record.fillInBlank) {
                const correctAnswers = record.fillInBlank.map((a: any) =>
                  a.correctAnswer.trim(),
                );
                const userAnswers = Object.values(val).map(a => a.trim());
                const isCorrect =
                  userAnswers.length === correctAnswers.length &&
                  userAnswers.every((ans, idx) => ans === correctAnswers[idx]);

                const newAnswer: AllUserAnswerDto = {
                  answer: Object.entries(val).map(([index, content]) => ({
                    content: String(content).trim(),
                    index: Number(index),
                  })),
                  questionId: record.id,
                  questionType:
                    MultipleChoiceUserAnswerDto.questionType.FILL_IN_BLANK,
                };

                setAllUserAnswers(prev => [
                  ...prev.filter(
                    ans => ans.questionId !== newAnswer.questionId,
                  ),
                  newAnswer,
                ]);

                if (
                  isCorrect &&
                  currentGroup &&
                  !scoredGroupIds.has(currentGroup.id)
                ) {
                  setCorrectAnswersCount(prev => prev + 1);
                  setScoredGroupIds(prev => new Set(prev).add(currentGroup.id));
                }
              }
            }}
            onSelectQuestion={(index: number) => {
              setCurrentItemIndex(0);
              setCurrentGroupIndex(index);
              setCheckResult(null);
              setHasSelectedAnswer(false);
            }}
            onSetExplanation={setExplanation}
            reviewData={reviewData}
            reviewMode={isReviewMode}
            showAnswer={showAnswer}
            totalGroups={totalGroups}
          />
        );
      case QuestionEntity.type.ESSAY:
        return (
          <ExamFile
            currentItem={currentItem}
            data={record}
            onAnswerChange={val => {
              setAnswersFile(prev => ({ ...prev, [currentGroup.id]: val }));
              setHasSelectedAnswer(true);
              if (!lessonId) return;

              if (val && !scoredGroupIds.has(currentGroup.id)) {
                setCorrectAnswersCount(prev => {
                  const newCount = prev + 1;
                  const progressPercent = Math.round(
                    (newCount / totalGroups) * 100,
                  );

                  dispatch(
                    postLessionProgress({
                      lessonId,
                      progress: progressPercent,
                    }),
                  );
                  dispatch(
                    updateLessionProgress({
                      lessonId,
                      progress: progressPercent,
                    }),
                  );

                  return newCount;
                });

                setScoredGroupIds(prev => new Set(prev).add(currentGroup.id));
              }
            }}
            totalGroups={totalGroups}
          />
        );

      case QuestionEntity.type.RECORD:
        return (
          <ExamRecord
            currentItem={currentItem}
            data={record}
            onAnswerChange={val => {
              setAnswersFile(prev => ({ ...prev, [currentGroup.id]: val }));
              setHasSelectedAnswer(true);
              if (!lessonId) return;

              if (val && !scoredGroupIds.has(currentGroup.id)) {
                setCorrectAnswersCount(prev => {
                  const newCount = prev + 1;
                  const progressPercent = Math.round(
                    (newCount / totalGroups) * 100,
                  );

                  dispatch(
                    postLessionProgress({
                      lessonId,
                      progress: progressPercent,
                    }),
                  );
                  dispatch(
                    updateLessionProgress({
                      lessonId,
                      progress: progressPercent,
                    }),
                  );

                  return newCount;
                });

                setScoredGroupIds(prev => new Set(prev).add(currentGroup.id));
              }
            }}
            totalGroups={totalGroups}
          />
        );
      case QuestionEntity.type.HANDWRITING:
        return (
          <KanjiCanvas
            currentItem={currentItem}
            data={record}
            onAnswerChange={val => {
              setAnswers(prev => ({ ...prev, [record.id]: val }));
              setHasSelectedAnswer(true);
              handleCheckAnswer();
            }}
            currentGroupIndex={currentGroupIndex}
            onSelectQuestion={index => setCurrentGroupIndex(index)}
            onSetExplanation={setExplanation}
          />
        );
      case QuestionEntity.type.TRUE_FALSE:
        return (
          <ExamTrueFalse
            checkResult={checkResult}
            currentGroupIndex={currentGroupIndex}
            data={record}
            key={`${currentItemIndex}-${currentGroupIndex}`}
            onAnswerChange={val => {
              if (!isReviewMode) {
                setAnswers(val);
                setHasSelectedAnswer(true);
              }
            }}
            onSelectQuestion={(index: number) => {
              setCurrentItemIndex(0);
              setCurrentGroupIndex(index);
              setCheckResult(null);
              setHasSelectedAnswer(false);
              setShowAnswer(false);
            }}
            onSetExplanation={setExplanation}
            restartKey={restartKey}
            reviewData={reviewData}
            reviewMode={isReviewMode}
            showAnswer={showAnswer}
            totalGroups={totalGroups}
          />
        );
      default:
        return null;
    }
  };

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // When countdown is paused (ESSAY/RECORD), we freeze the remaining time here.
  const pausedRemainingSecondsRef = useRef<number | null>(null);
  const remainingSecondsRef = useRef<number | null>(null);
  const examCountdownIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    remainingSecondsRef.current = remainingSeconds;
  }, [remainingSeconds]);

  useEffect(() => {
    // Reset countdown state when exam session changes.
    if (examCountdownIntervalRef.current) {
      window.clearInterval(examCountdownIntervalRef.current);
      examCountdownIntervalRef.current = null;
    }
    setRemainingSeconds(null);
    pausedRemainingSecondsRef.current = null;
  }, [dataById?.id, restartKey]);

  // Used to ensure "time up" only triggers when countdown transitions
  // from a positive value down to 0 (not just because `remainingSeconds`
  // was still 0 for one render during reset).
  const prevRemainingSecondsRef = useRef<number | null>(null);

  // Freeze timer on ESSAY/RECORD: clear React state so the interval effect cleans up.
  useEffect(() => {
    if (isCountdownEnabled) return;
    const v = remainingSecondsRef.current;
    if (v != null) pausedRemainingSecondsRef.current = v;
    setRemainingSeconds(null);
    timeUpSubmittedRef.current = true;
  }, [isCountdownEnabled]);

  useEffect(() => {
    if (loading) {
      if (examCountdownIntervalRef.current) {
        window.clearInterval(examCountdownIntervalRef.current);
        examCountdownIntervalRef.current = null;
      }
      const v = remainingSecondsRef.current;
      if (v != null) pausedRemainingSecondsRef.current = v;
      setRemainingSeconds(null);
      timeUpSubmittedRef.current = true;
      return;
    }

    if (dataById?.timeEstimate == null) {
      if (examCountdownIntervalRef.current) {
        window.clearInterval(examCountdownIntervalRef.current);
        examCountdownIntervalRef.current = null;
      }
      setRemainingSeconds(null);
      timeUpSubmittedRef.current = true;
      pausedRemainingSecondsRef.current = null;
      return;
    }

    if (isReviewMode) {
      if (examCountdownIntervalRef.current) {
        window.clearInterval(examCountdownIntervalRef.current);
        examCountdownIntervalRef.current = null;
      }
      timeUpSubmittedRef.current = true;
      setRemainingSeconds(Math.max(0, Math.floor(dataById.timeEstimate)));
      pausedRemainingSecondsRef.current = null;
      return;
    }

    // Countdown only runs for non-ESSAY / non-RECORD screens.
    if (!isCountdownEnabled) return;

    if (examCountdownIntervalRef.current) return;

    const start =
      pausedRemainingSecondsRef.current ??
      Math.max(0, Math.floor(dataById.timeEstimate));
    pausedRemainingSecondsRef.current = null;
    timeUpSubmittedRef.current = false;
    setRemainingSeconds(start);

    if (start === 0) return;
    const id = window.setInterval(() => {
      setRemainingSeconds(prev => {
        const p = prev ?? 0;
        if (p <= 1) {
          if (examCountdownIntervalRef.current === id) {
            examCountdownIntervalRef.current = null;
          }
          window.clearInterval(id);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    examCountdownIntervalRef.current = id;
    return () => {
      window.clearInterval(id);
      if (examCountdownIntervalRef.current === id) {
        examCountdownIntervalRef.current = null;
      }
    };
  }, [
    loading,
    dataById?.id,
    dataById?.timeEstimate,
    isReviewMode,
    isCountdownEnabled,
    currentGroupType,
    restartKey,
  ]);

  useEffect(() => {
    const prev = prevRemainingSecondsRef.current;
    prevRemainingSecondsRef.current = remainingSeconds;

    if (loading || isReviewMode) return;
    if (!isCountdownEnabled) return;
    if (dataById?.timeEstimate == null || dataById.timeEstimate <= 0) return;
    if (remainingSeconds !== 0) return;
    if (isModalVisible) return;
    if (!currentItem?.exam?.id) return;

    // Prevent submit/more modal immediately after reset,
    // when `remainingSeconds` might still be `0` from the previous run.
    if (prev == null || prev <= 0) return;

    if (timeUpSubmittedRef.current) return;
    timeUpSubmittedRef.current = true;
    submitExamResultsAndShowModal();
    setCheckResult(null);
    setHasSelectedAnswer(false);
    setShowAnswer(false);
  }, [
    remainingSeconds,
    loading,
    isReviewMode,
    dataById?.timeEstimate,
    isCountdownEnabled,
    isModalVisible,
    currentItem?.exam?.id,
    submitExamResultsAndShowModal,
  ]);

  if (loading) return <Loading />;

  return (
    <div className={styles.boxContent}>
      <TitleVocabulary
        description={t('titleVocabulary.descriptionExam')}
        icon={<IconExam color="#F37142" />}
        isAnyCompleted={isAnyCompleted}
        onClickNext={onClickNext}
        title={dataById?.title}
      />
      {isCountdownEnabled && remainingSeconds != null ? (
        <div className={styles.boxTimeEstimate}>
          <Tag color={remainingSeconds === 0 ? 'red' : 'blue'}>
            <ClockCircleOutlined />{' '}
            {formatTimeEstimateSeconds(remainingSeconds)}
          </Tag>
        </div>
      ) : null}
      {currentGroup
        ? renderByType(currentGroup as QuestionGroupEntity | QuestionEntity)
        : null}
      <ExamResultSectionPractice
        checkResult={checkResult}
        correctAnswersCount={correctAnswersCount}
        currentGroup={currentGroup}
        explanation={
          (isReviewMode || checkResult !== null) && explanation
            ? explanation
            : undefined
        }
        hasSelectedAnswer={hasSelectedAnswer}
        isLoading={isChecking}
        isModalVisible={isModalVisible}
        onCheckAnswer={handleCheckAnswer}
        onContinue={() => {
          setIsModalVisible(false);
          onClickNext();
        }}
        onNextQuestion={handleNextQuestion}
        onPrevQuestion={handlePrevQuestion}
        onRestart={handleRestart}
        questionIndex={currentGroupIndex}
        reviewMode={isReviewMode}
        setIsModalVisible={setIsModalVisible}
        showAnswer={currentItem?.showAnswer}
        showSolution={currentItem?.showSolution}
        totalQuestions={totalQuestions}
      />
    </div>
  );
}
