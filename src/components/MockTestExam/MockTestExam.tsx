import type { GroupedTestDetailEntity } from '#/api/requests';
import { QuestionEntity } from '#/api/requests';
import type { CreateTestResultDto } from '#/api/requests/models/CreateTestResultDto';
import type { HandWritingAnswerPayload } from '#/api/requests/models/HandWritingUserAnswerDto';
import ImgMedal from '#/assets/images/GlobalVocabulary/medal.png';
import {
  ArrowDown,
  ArrowIconBack,
  ArrowIconNext,
  ArrowUpRight,
  IconListen,
  Line,
  SupportSolid,
  TickCircle,
} from '#/assets/svg/externalIcon';
import { baseUrlConfig } from '#/configs/index';
import Loading from '#/shared/components/loading/Loading';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import {
  deleteTestProcess,
  getTestDetailByIdTest,
  getTestResult,
  joinTest,
  postTestResult,
  saveTemporaryAnswer,
  switchTestDetail,
} from '#/shared/redux/thunk/MockTestThunk';
import { createEssay } from '#/shared/redux/thunk/EssayTestThunk';
import Header from '#/src/components/Header/Header';
import { Modal, Spin, Tooltip, message } from 'antd';
import * as CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactPlayer from 'react-player';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { CountdownTimer } from './CountdownTimer';
import styles from './MockTestExam.module.scss';
import MockTestExamConnect from './MockTestExamConnect';
import MockTestExamDropDown from './MockTestExamDropDown';
import MockTestExamDrag from './MockTestExamDrag';
import {
  MockTestExamEssay,
  type MockTestEssayAnswerPayload,
} from './MockTestExamEssay';
import MockTestExamFormAudio from './MockTestExamFormAudio';
import MockTestExamHandWriting from './MockTestExamHandWriting';
import {
  MockTestExamRecording,
  type MockTestRecordingAnswerPayload,
} from './MockTestExamRecording';
import { MockTestExamSorting } from './MockTestExamSorting';

interface ExpandedStates {
  [key: string]: boolean;
}

interface ActiveAnswers {
  [key: string]: number | null;
}

interface DecryptedData {
  items: GroupedTestDetailEntity[];
}

type TestAnswerEntry = {
  questionType: QuestionEntity['type'];
  answer: unknown;
};

function formatQuestionTypeLabel(
  type: QuestionEntity['type'],
  t: (key: string, options?: { defaultValue?: string }) => string,
): string {
  return t(`mocktest.questionType.${type}`, { defaultValue: type });
}

function isQuestionAnswerComplete(
  question: QuestionEntity,
  ta: TestAnswerEntry | undefined,
): boolean {
  if (!ta) return false;
  switch (question.type) {
    case QuestionEntity.type.MULTIPLE_CHOICE: {
      const a = ta.answer as { content?: string }[];
      return a?.length > 0 && typeof a[0]?.content === 'string';
    }
    case QuestionEntity.type.SORTING: {
      const order = ta.answer as { index: number; content: string }[];
      return order.length === (question.sortingAnswers?.length ?? 0);
    }
    case QuestionEntity.type.MATCHING: {
      const pairs = ta.answer as { left: string; right: string }[];
      return pairs.length === (question.matchingAnswers?.length ?? 0);
    }
    case QuestionEntity.type.FILL_IN_BLANK: {
      const arr = ta.answer as { index: number; correctAnswer: string }[];
      return (
        arr.length >= (question.fillInBlank?.length ?? 0) &&
        arr.every(a => String(a.correctAnswer ?? '').trim().length > 0)
      );
    }
    case QuestionEntity.type.CHOOSE_ANSWER_IN_BLANK: {
      const arr = ta.answer as { index: number; correctAnswer: string }[];
      return (
        arr.length >= (question.chooseAnswerInBlank?.length ?? 0) &&
        arr.every(a => String(a.correctAnswer ?? '').trim().length > 0)
      );
    }
    case QuestionEntity.type.DROP_DOWN_ANSWER: {
      const arr = ta.answer as { index: number; selectedContent: string }[];
      return (
        arr.length >= (question.dropDownAnswers?.length ?? 0) &&
        arr.every(a => String(a.selectedContent ?? '').trim().length > 0)
      );
    }
    case QuestionEntity.type.ESSAY: {
      const a = ta.answer as MockTestEssayAnswerPayload;
      return (
        String(a?.text ?? '').trim().length > 0 ||
        String(a?.fileUrl ?? '').trim().length > 0
      );
    }
    case QuestionEntity.type.RECORD: {
      const a = ta.answer as MockTestRecordingAnswerPayload;
      return String(a?.recordUrl ?? '').trim().length > 0;
    }
    case QuestionEntity.type.HANDWRITING: {
      const a = ta.answer as HandWritingAnswerPayload;
      return typeof a?.isCorrect === 'boolean';
    }
    case QuestionEntity.type.TRUE_FALSE: {
      const a = ta.answer as { isCorrect?: boolean }[];
      return typeof a[0]?.isCorrect === 'boolean';
    }
    default:
      return false;
  }
}

function isQuestionCorrectMock(
  question: QuestionEntity,
  ta: TestAnswerEntry,
): boolean {
  switch (question.type) {
    case QuestionEntity.type.MULTIPLE_CHOICE: {
      const a = ta.answer as { isCorrect?: boolean }[];
      return a[0]?.isCorrect === true;
    }
    case QuestionEntity.type.SORTING: {
      const order = ta.answer as { index: number; content: string }[];
      const correct = question.sortingAnswers || [];
      return (
        correct.length === order.length &&
        correct.every(
          (c, i) =>
            order[i]?.index === c.index && order[i]?.content === c.content,
        )
      );
    }
    case QuestionEntity.type.MATCHING: {
      const pairs = ta.answer as { left: string; right: string }[];
      const correct = question.matchingAnswers || [];
      if (pairs.length !== correct.length) return false;
      return correct.every(c =>
        pairs.some(p => p.left === c.left && p.right === c.right),
      );
    }
    case QuestionEntity.type.FILL_IN_BLANK: {
      const arr = ta.answer as { index: number; correctAnswer: string }[];
      const blanks = question.fillInBlank || [];
      return blanks.every((b, i) => {
        const u = arr.find(x => x.index === b.index) ?? arr[i];
        return (
          u &&
          String(u.correctAnswer).trim().toLowerCase() ===
            String(b.correctAnswer).trim().toLowerCase()
        );
      });
    }
    case QuestionEntity.type.CHOOSE_ANSWER_IN_BLANK: {
      const arr = ta.answer as { index: number; correctAnswer: string }[];
      const blanks = question.chooseAnswerInBlank || [];
      return blanks.every((b, i) => {
        const u = arr.find(x => x.index === b.index) ?? arr[i];
        return (
          u &&
          String(u.correctAnswer).trim().toLowerCase() ===
            String(b.correctAnswer).trim().toLowerCase()
        );
      });
    }
    case QuestionEntity.type.DROP_DOWN_ANSWER: {
      const arr = ta.answer as { index: number; selectedContent: string }[];
      const dds = question.dropDownAnswers || [];
      return dds.every((b, i) => {
        const correct = b.arrAnswer?.find(x => x.isCorrect)?.content;
        const u = arr.find(x => x.index === b.index) ?? arr[i];
        return (
          u &&
          String(u.selectedContent).trim().toLowerCase() ===
            String(correct ?? '')
              .trim()
              .toLowerCase()
        );
      });
    }
    case QuestionEntity.type.ESSAY:
      return false;
    case QuestionEntity.type.RECORD:
      return false;
    case QuestionEntity.type.HANDWRITING: {
      const a = ta.answer as HandWritingAnswerPayload;
      return a?.isCorrect === true;
    }
    case QuestionEntity.type.TRUE_FALSE: {
      const a = ta.answer as { isCorrect?: boolean }[];
      const userPick = a[0]?.isCorrect;
      if (typeof userPick !== 'boolean') return false;
      return userPick === question.trueFalseAnswer;
    }
    default:
      return false;
  }
}

function buildSortingPayload(
  question: QuestionEntity,
  ordered: string[],
): { index: number; content: string }[] {
  const ans = question.sortingAnswers || [];
  return ordered.map((content, i) => ({
    index: ans[i].index,
    content,
  }));
}

function fillInBlankPayload(
  question: QuestionEntity,
  val: Record<number, string>,
): { index: number; correctAnswer: string }[] {
  const blanks = question.fillInBlank || [];
  return blanks.map(b => ({
    index: b.index,
    correctAnswer: String(val[b.index] ?? '').trim(),
  }));
}

function chooseInBlankPayload(
  question: QuestionEntity,
  val: Record<number, string>,
): { index: number; correctAnswer: string }[] {
  const blanks = question.chooseAnswerInBlank || [];
  return blanks.map(b => ({
    index: b.index,
    correctAnswer: String(val[b.index] ?? '').trim(),
  }));
}

function dropDownPayload(
  question: QuestionEntity,
  val: Record<number, string>,
): { index: number; selectedContent: string }[] {
  const rows = question.dropDownAnswers || [];
  return [...rows]
    .sort((a, b) => a.index - b.index)
    .map(b => ({
      index: b.index,
      selectedContent: String(val[b.index] ?? '').trim(),
    }));
}

function MockTestExam(): JSX.Element {
  const { data } = useSelector((state: RootState) => state.mockTestDetail);
  const [decryptedData, setDecryptedData] = useState<DecryptedData>({
    items: [],
  });
  const [expandedStates, setExpandedStates] = useState<ExpandedStates>({});
  const [activeAnswers, setActiveAnswers] = useState<ActiveAnswers>({});

  const [activeAnswersResult, setActiveAnswersResult] = useState<ActiveAnswers>(
    {},
  );
  const [currentTestDetailProcess, setCurrentTestDetailProcess] =
    useState<any>(null);
  const [activeQuestions, setActiveQuestions] = useState<Set<string>>(
    new Set(),
  );
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalSuccess, setIsModalSuccess] = useState(false);
  const [modalType, setModalType] = useState<'quit' | 'next' | 'submit'>(
    'next',
  );
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const secretKey = import.meta.env.VITE_ENCRYPTION_KEY || 'your-secret-key';
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const [loading, setLoading] = useState(false);
  const [pagination] = useState({
    current: 1,
    limit: 200,
    offset: 0,
  });
  const [timeLeftByDetail, setTimeLeftByDetail] = useState<
    Record<string, number | undefined>
  >({});

  const [testAnswersByQuestionId, setTestAnswersByQuestionId] = useState<
    Record<string, TestAnswerEntry>
  >({});

  const filteredData = Array.isArray(decryptedData.items)
    ? decryptedData.items
    : [];

  const totalPoints = useMemo(() => {
    let sum = 0;
    for (const detail of filteredData[0]?.details ?? []) {
      const p = detail.point ?? 1;
      for (const qg of detail.questionGroups) {
        for (const q of qg.questions) {
          const ta = testAnswersByQuestionId[q.id];
          if (ta && isQuestionCorrectMock(q, ta)) sum += p;
        }
      }
    }
    return sum;
  }, [testAnswersByQuestionId, filteredData]);
  const currentDetail = filteredData[0]?.details?.[currentGroupIndex];
  const currentDetailId = currentDetail?.id;
  const alertMinutes = filteredData[0]?.testId?.alertRemainingTime;
  const alertThresholdSeconds =
    alertMinutes != null && alertMinutes > 0 ? alertMinutes * 60 : null;
  const timeAlertShownRef = useRef<Record<string, boolean>>({});
  const filterRef = useRef<HTMLDivElement>(null);
  const [explainVisible, setExplainVisible] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleExplain = (key: string) => {
    setExplainVisible(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const scrollFilter = (direction: 'left' | 'right') => {
    if (filterRef.current) {
      const boxExam = filterRef.current.querySelector(
        `.${styles.boxExam}`,
      ) as HTMLElement;

      if (!boxExam) return;
      const scrollAmount = boxExam.offsetWidth * 3;
      filterRef.current.scrollBy({
        behavior: 'smooth',
        left: direction === 'left' ? -scrollAmount : scrollAmount,
      });
    }
  };

  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  useEffect(() => {
    const processItems = (items: any[]) => {
      if (items[0]?.testId?.randomAnswer) {
        return items.map(group => ({
          ...group,
          details: group.details?.map((detail: any) => ({
            ...detail,
            questionGroups: detail.questionGroups.map((qGroup: any) => ({
              ...qGroup,
              questions: qGroup.questions.map((q: any) => ({
                ...q,
                multipleChoiceAnswers: shuffleArray(
                  q.multipleChoiceAnswers || [],
                ),
              })),
            })),
          })),
        }));
      }

      return items;
    };

    if (typeof data === 'string') {
      try {
        const bytes = CryptoJS.AES.decrypt(data, secretKey);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        const parsedData = JSON.parse(decryptedString);

        let items = Array.isArray(parsedData.items)
          ? parsedData.items
          : parsedData;

        items = processItems(items);

        setDecryptedData({ items });
      } catch (error) {
        console.error('Decryption failed:', error);
        setDecryptedData({ items: [] });
      }
    } else if (Array.isArray(data)) {
      const items = processItems(data);
      setDecryptedData({ items });
    } else {
      setDecryptedData({ items: [] });
    }
  }, [data, secretKey]);

  useEffect(() => {
    if (isReviewMode || !alertThresholdSeconds || !currentDetailId) return;
    const remain = timeLeftByDetail[currentDetailId];
    if (remain === undefined || remain === null) return;
    if (remain <= alertThresholdSeconds && remain > 0) {
      if (!timeAlertShownRef.current[currentDetailId]) {
        timeAlertShownRef.current[currentDetailId] = true;
        message.warning(t('mocktest.timeRunningOut'));
      }
    }
  }, [
    isReviewMode,
    alertThresholdSeconds,
    currentDetailId,
    timeLeftByDetail,
    t,
  ]);

  useEffect(() => {
    if (!Cookies.get('accessToken')) {
      navigate('/auth');
    }
  }, [navigate]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    let controller = new AbortController();

    const initData = async () => {
      try {
        if (!isReviewMode) {
          await dispatch(joinTest({ testId: id })).unwrap();
        }
        await dispatch(
          getTestDetailByIdTest({
            id,
            limit: pagination.limit,
            offset: pagination.offset,
          }),
        ).unwrap();
        if (!isReviewMode) {
          const accessToken = Cookies.get('accessToken');
          const response = await fetch(
            `${baseUrlConfig.baseUrl}test/sync-current-test-detail`,
            {
              headers: {
                Accept: 'text/event-stream',
                Authorization: `Bearer ${accessToken}`,
              },
              signal: controller.signal,
            },
          );

          if (response.body) {
            const reader = response.body
              .pipeThrough(new TextDecoderStream())
              .getReader();

            const processStream = async () => {
              try {
                while (true) {
                  const { value, done } = await reader.read();
                  if (done) break;

                  const lines = value.split('\n');
                  for (const line of lines) {
                    if (line.startsWith('data: ')) {
                      try {
                        const jsonStr = line.replace('data: ', '').trim();
                        if (jsonStr) {
                          const res = JSON.parse(jsonStr);
                          const processDetails = res.data || res;
                          setCurrentTestDetailProcess(processDetails);

                          if (
                            processDetails?.timeLeft !== undefined &&
                            processDetails?.testDetailId
                          ) {
                            setTimeLeftByDetail(prev => ({
                              ...prev,
                              [processDetails.testDetailId]: Math.floor(
                                processDetails.timeLeft / 1000,
                              ),
                            }));
                          }
                        }
                      } catch (parseError) {
                        console.error('Error parsing SSE data:', parseError);
                      }
                    }
                  }
                }
              } catch (streamError) {
                if ((streamError as Error).name !== 'AbortError') {
                  console.error('SSE Stream Error:', streamError);
                }
              }
            };

            // Start processing the stream without blocking `initData` completely.
            processStream();
          }
        }
      } catch (error) {
        console.error(
          'Failed to sync current test process or fetch details:',
          error,
        );
      } finally {
        setLoading(false);
      }

      const userStr = Cookies.get('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id;

      dispatch(
        getTestResult({
          limit: pagination.limit,
          offset: pagination.offset,
          testId: id,
          userId,
        }),
      );
    };

    initData();

    return () => {
      controller.abort();
    };
  }, [dispatch, id, pagination, isReviewMode]);

  useEffect(() => {
    if (!isReviewMode && currentTestDetailProcess?.currentIndex !== undefined) {
      if (currentTestDetailProcess.currentIndex !== currentGroupIndex) {
        setCurrentGroupIndex(currentTestDetailProcess.currentIndex);
      }
    }
  }, [currentTestDetailProcess, isReviewMode]);

  useEffect(() => {
    const newExpandedStates: ExpandedStates = {};
    filteredData[0]?.details?.forEach((detail, detailIndex) => {
      detail.questionGroups.forEach((qGroup, qGroupIndex) => {
        qGroup.questions.forEach((_, questionIndex) => {
          const key = `${detailIndex}-${qGroupIndex}-${questionIndex}`;
          newExpandedStates[key] = false;
        });
      });
    });
    setExpandedStates(newExpandedStates);
  }, [filteredData]);

  useEffect(() => {
    if (
      !isReviewMode &&
      filteredData?.[0]?.details &&
      currentTestDetailProcess?.userSaveAnswers &&
      Array.isArray(currentTestDetailProcess.userSaveAnswers)
    ) {
      const allPartsSaved = currentTestDetailProcess.userSaveAnswers;
      const testDetails = filteredData[0].details;

      const newActiveAnswers: ActiveAnswers = {};
      const newActiveQuestions = new Set<string>();
      const newActiveAnswersResult: ActiveAnswers = {};

      allPartsSaved.forEach((part: any) => {
        const dIdx = part.currentIndex;
        const detailAnswers = part.answers;
        const testDetail = testDetails[dIdx];

        if (testDetail && Array.isArray(detailAnswers)) {
          detailAnswers.forEach((ans: any) => {
            testDetail.questionGroups.forEach((qGroup: any, gIdx: number) => {
              const qIdx = qGroup.questions.findIndex(
                (q: any) => q.id === ans.questionId,
              );

              if (qIdx !== -1) {
                const questionKey = `${dIdx}-${gIdx}-${qIdx}`;
                const question = qGroup.questions[qIdx] as QuestionEntity;
                const answerType = ans.questionType as QuestionEntity['type'];
                const answerPayload = ans.answer;

                if (
                  answerType === QuestionEntity.type.MULTIPLE_CHOICE &&
                  answerPayload?.content !== undefined
                ) {
                  const chooseIndex =
                    question.multipleChoiceAnswers?.findIndex(
                      (a: any) => a.content === answerPayload?.content,
                    ) ?? -1;
                  if (chooseIndex < 0) return;
                  newActiveAnswers[questionKey] = chooseIndex;
                  newActiveQuestions.add(questionKey);
                  newActiveAnswersResult[questionKey] = chooseIndex;

                  const selectedAns =
                    question.multipleChoiceAnswers?.[chooseIndex];

                  if (selectedAns) {
                    setTestAnswersByQuestionId(prev => ({
                      ...prev,
                      [question.id]: {
                        questionType: answerType,
                        answer: [
                          {
                            content: selectedAns.content,
                            isCorrect: selectedAns.isCorrect,
                          },
                        ],
                      },
                    }));
                  }
                  return;
                }

                if (answerType === QuestionEntity.type.TRUE_FALSE) {
                  if (typeof answerPayload?.isCorrect === 'boolean') {
                    newActiveQuestions.add(questionKey);
                    setTestAnswersByQuestionId(prev => ({
                      ...prev,
                      [question.id]: {
                        questionType: QuestionEntity.type.TRUE_FALSE,
                        answer: [{ isCorrect: answerPayload.isCorrect }],
                      },
                    }));
                  }
                  return;
                }

                if (answerType === QuestionEntity.type.MATCHING) {
                  const pairs = Array.isArray(answerPayload?.pairs)
                    ? answerPayload.pairs
                    : [];
                  if (pairs.length > 0) {
                    newActiveQuestions.add(questionKey);
                    setTestAnswersByQuestionId(prev => ({
                      ...prev,
                      [question.id]: {
                        questionType: QuestionEntity.type.MATCHING,
                        answer: pairs,
                      },
                    }));
                  }
                  return;
                }

                if (answerType === QuestionEntity.type.SORTING) {
                  const orders = Array.isArray(answerPayload?.orders)
                    ? answerPayload.orders
                    : [];
                  if (orders.length > 0) {
                    newActiveQuestions.add(questionKey);
                    setTestAnswersByQuestionId(prev => ({
                      ...prev,
                      [question.id]: {
                        questionType: QuestionEntity.type.SORTING,
                        answer: orders,
                      },
                    }));
                  }
                  return;
                }

                if (
                  answerType === QuestionEntity.type.FILL_IN_BLANK ||
                  answerType === QuestionEntity.type.CHOOSE_ANSWER_IN_BLANK
                ) {
                  const blanks = Array.isArray(answerPayload?.blanks)
                    ? answerPayload.blanks
                    : [];
                  if (blanks.length > 0) {
                    newActiveQuestions.add(questionKey);
                    setTestAnswersByQuestionId(prev => ({
                      ...prev,
                      [question.id]: {
                        questionType: answerType,
                        answer: blanks,
                      },
                    }));
                  }
                  return;
                }

                if (answerType === QuestionEntity.type.DROP_DOWN_ANSWER) {
                  const dropDowns = Array.isArray(answerPayload?.dropDowns)
                    ? answerPayload.dropDowns
                    : [];
                  if (dropDowns.length > 0) {
                    newActiveQuestions.add(questionKey);
                    setTestAnswersByQuestionId(prev => ({
                      ...prev,
                      [question.id]: {
                        questionType: answerType,
                        answer: dropDowns.map((d: any) => ({
                          index: d.index,
                          selectedContent: String(
                            d.selectedContent ?? '',
                          ).trim(),
                        })),
                      },
                    }));
                  }
                  return;
                }

                if (answerType === QuestionEntity.type.HANDWRITING) {
                  if (typeof answerPayload?.isCorrect === 'boolean') {
                    newActiveQuestions.add(questionKey);
                    setTestAnswersByQuestionId(prev => ({
                      ...prev,
                      [question.id]: {
                        questionType: answerType,
                        answer: {
                          isCorrect: Boolean(answerPayload?.isCorrect),
                        } as HandWritingAnswerPayload,
                      },
                    }));
                  }
                  return;
                }

                if (answerType === QuestionEntity.type.ESSAY) {
                  const essay = {
                    text: String(answerPayload?.text ?? ''),
                    fileUrl: String(answerPayload?.fileUrl ?? ''),
                  } as MockTestEssayAnswerPayload;
                  if (
                    essay.text.trim().length > 0 ||
                    essay.fileUrl.trim().length > 0
                  ) {
                    newActiveQuestions.add(questionKey);
                    setTestAnswersByQuestionId(prev => ({
                      ...prev,
                      [question.id]: {
                        questionType: QuestionEntity.type.ESSAY,
                        answer: essay,
                      },
                    }));
                  }
                  return;
                }

                if (answerType === QuestionEntity.type.RECORD) {
                  const record = {
                    recordUrl: String(answerPayload?.recordUrl ?? ''),
                  } as MockTestRecordingAnswerPayload;
                  if (record.recordUrl.trim().length > 0) {
                    newActiveQuestions.add(questionKey);
                    setTestAnswersByQuestionId(prev => ({
                      ...prev,
                      [question.id]: {
                        questionType: QuestionEntity.type.RECORD,
                        answer: record,
                      },
                    }));
                  }
                }
              }
            });
          });
        }
      });

      setActiveAnswers(prev => ({ ...prev, ...newActiveAnswers }));
      setActiveQuestions(
        prev =>
          new Set([...Array.from(prev), ...Array.from(newActiveQuestions)]),
      );
      setActiveAnswersResult(prev => ({ ...prev, ...newActiveAnswersResult }));
    }
  }, [filteredData, currentTestDetailProcess, isReviewMode]);

  const toggleExpand = (key: string) =>
    setExpandedStates(prev => ({ ...prev, [key]: !prev[key] }));

  const persistTemporaryAnswer = (
    questionId: string,
    questionType: QuestionEntity['type'],
    answer: unknown,
  ) => {
    if (isReviewMode || !currentDetailId) return;
    dispatch(
      saveTemporaryAnswer({
        testDetailId: currentDetailId,
        answer: {
          questionId,
          questionType,
          answer,
        },
      }),
    );
  };

  const selectAnswer = (
    key: string,
    answerIndex: number,
    questionId?: string,
    answerContent?: string,
    isCorrect?: boolean,
    answerQuestionType: QuestionEntity.type.MULTIPLE_CHOICE = QuestionEntity
      .type.MULTIPLE_CHOICE,
  ) => {
    setActiveAnswers(prev => ({ ...prev, [key]: answerIndex }));
    setActiveQuestions(prev => new Set(prev).add(key));
    setActiveAnswersResult(prev => ({ ...prev, [key]: answerIndex }));

    if (questionId && answerContent !== undefined && isCorrect !== undefined) {
      const entry: TestAnswerEntry = {
        questionType: answerQuestionType,
        answer: [{ content: answerContent, isCorrect }],
      };
      setTestAnswersByQuestionId(prev => ({
        ...prev,
        [questionId]: entry,
      }));
    }

    if (questionId && answerContent) {
      persistTemporaryAnswer(questionId, answerQuestionType, {
        content: answerContent,
        isCorrect: Boolean(isCorrect),
      });
    }
  };

  const handleSubmitResult = () => {
    if (!filteredData.length) return;

    const userStr = Cookies.get('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const userId = user?.id;
    const testId = filteredData[0]?.testId?.id;

    if (userId && testId) {
      const questionMap: Record<string, any> = {};

      for (const detail of filteredData[0]?.details ?? []) {
        for (const qg of detail?.questionGroups ?? []) {
          for (const q of qg?.questions ?? []) {
            if (q?.id) questionMap[String(q.id)] = q;
          }
        }
      }

      const userAnswers = Object.entries(testAnswersByQuestionId)
        .filter(([questionId, ta]) => {
          const resolvedType =
            (questionMap[questionId]?.type as QuestionEntity['type']) ??
            ta.questionType;
          return (
            resolvedType !== QuestionEntity.type.ESSAY &&
            resolvedType !== QuestionEntity.type.RECORD
          );
        })
        .map(([questionId, ta]) => {
          const { answer: taAnswer } = ta;
          let answer: unknown = taAnswer;

          if (ta.questionType === QuestionEntity.type.DROP_DOWN_ANSWER) {
            const rows = taAnswer as {
              index: number;
              selectedContent: string;
            }[];
            const ddQuestion = questionMap[questionId];
            const blanks = ddQuestion?.dropDownAnswers ?? [];

            answer = [...rows]
              .sort((a, b) => a.index - b.index)
              .map(r => {
                const selectedContent = String(r.selectedContent ?? '').trim();

                const blank = blanks.find(
                  (b: any) => Number(b.index) === Number(r.index),
                );
                const selectedOpt = blank?.arrAnswer?.find((opt: any) => {
                  const optContent = String(opt?.content ?? '').trim();
                  return (
                    optContent &&
                    optContent.toLowerCase() === selectedContent.toLowerCase()
                  );
                });

                return {
                  arrAnswer: selectedContent
                    ? [
                        {
                          content: selectedContent,
                          isCorrect: Boolean(selectedOpt?.isCorrect),
                        },
                      ]
                    : [],
                  index: r.index,
                };
              });
          }

          return {
            answer,
            questionId,
            questionType:
              (questionMap[questionId]?.type as QuestionEntity['type']) ??
              ta.questionType,
          };
        });

      const payload: CreateTestResultDto = {
        score: totalPoints,
        testId,
        userAnswers:
          userAnswers as unknown as CreateTestResultDto['userAnswers'],
        userId,
      };

      dispatch(postTestResult({ data: payload }));

      // Besides `test-result`, submit ESSAY / RECORD into `essay-test`
      // (mock/test context => pass `testDetailId` + `questionId`).
      const questionIdToTestDetailId: Record<string, string> = {};
      filteredData[0]?.details?.forEach(detail => {
        detail?.questionGroups?.forEach(qGroup => {
          qGroup?.questions?.forEach(q => {
            if (q?.id && detail?.id) {
              questionIdToTestDetailId[String(q.id)] = String(detail.id);
            }
          });
        });
      });

      const essayOrRecordEntries = Object.entries(
        testAnswersByQuestionId,
      ).filter(
        ([_, ta]) =>
          ta.questionType === QuestionEntity.type.ESSAY ||
          ta.questionType === QuestionEntity.type.RECORD,
      );

      const essaySubmits = essayOrRecordEntries.map(([questionId, ta]) => {
        const testDetailId = questionIdToTestDetailId[questionId];
        if (!testDetailId) return Promise.resolve();

        if (ta.questionType === QuestionEntity.type.ESSAY) {
          const a = ta.answer as MockTestEssayAnswerPayload;
          const submittedExamUrls = String(a.fileUrl ?? '').trim()
            ? [String(a.fileUrl ?? '').trim()]
            : [];
          const submittedText = String(a.text ?? '').trim()
            ? String(a.text ?? '').trim()
            : undefined;

          if (submittedExamUrls.length === 0 && !submittedText) {
            return Promise.resolve();
          }

          return dispatch(
            createEssay({
              userId,
              testDetailId,
              questionId,
              submittedExamUrls: submittedExamUrls as any,
              ...(submittedText ? { submittedText } : {}),
            } as any),
          ).unwrap();
        }

        const r = ta.answer as MockTestRecordingAnswerPayload;
        const recordUrl = String(r.recordUrl ?? '').trim();
        if (!recordUrl) return Promise.resolve();

        return dispatch(
          createEssay({
            userId,
            testDetailId,
            questionId,
            submittedExamUrls: [recordUrl] as any,
          } as any),
        ).unwrap();
      });

      void Promise.allSettled(essaySubmits).catch(err => {
        // Do not block the main submit flow
        // eslint-disable-next-line no-console
        console.warn('Failed to submit essay-test for some items:', err);
      });
    }
  };

  const handleTransfer = async () => {
    setIsModalVisible(false);
    const maxSections = filteredData[0]?.details?.length || 0;
    const testId = filteredData[0]?.testId?.id;
    const currentTestDetailId =
      filteredData[0]?.details?.[currentGroupIndex]?.id;

    if (
      modalType === 'submit' ||
      (modalType === 'next' && currentGroupIndex + 1 >= maxSections)
    ) {
      handleSubmitResult();
      setTimeout(() => setIsModalSuccess(true), 300);
      window.scrollTo({ behavior: 'smooth', top: 0 });
    } else if (modalType === 'next') {
      const nextIndex = currentGroupIndex + 1;

      try {
        if (!isReviewMode && testId && currentTestDetailId) {
          const res = await dispatch(
            switchTestDetail({ testId, currentTestDetailId }),
          ).unwrap();
          const nextTestDetail = res.data || res;
          console.log(nextTestDetail);

          if (
            nextTestDetail?.timeLeft !== undefined &&
            nextTestDetail?.testDetailId
          ) {
            setTimeLeftByDetail(prev => ({
              ...prev,
              [nextTestDetail.testDetailId]: Math.floor(
                nextTestDetail.timeLeft / 1000,
              ),
            }));
          }

          if (nextTestDetail?.currentIndex !== undefined) {
            setCurrentGroupIndex(nextTestDetail.currentIndex);
          } else {
            setCurrentGroupIndex(nextIndex);
          }
        } else {
          setCurrentGroupIndex(nextIndex);
        }
      } catch (error) {
        console.error('Failed to switch test detail api:', error);
        setCurrentGroupIndex(nextIndex);
      }

      if (!isReviewMode) {
        const newExpandedStates: ExpandedStates = {};
        filteredData[0].details[nextIndex].questionGroups.forEach(
          (qGroup, qGroupIndex) => {
            qGroup.questions.forEach((_, questionIndex) => {
              const key = `${nextIndex}-${qGroupIndex}-${questionIndex}`;
              newExpandedStates[key] = false;
            });
          },
        );
        setExpandedStates(newExpandedStates);
      }

      window.scrollTo({ behavior: 'smooth', top: 0 });
    } else if (modalType === 'quit') {
      navigate(-1);
    }
  };

  if (loading) return <Loading />;
  return (
    <>
      <Header />
      <div className={styles.home}>
        <main className={styles.main}>
          <Spin
            spinning={!isReviewMode && !currentTestDetailProcess}
            size="large"
            tip={t('banner.loading')}
          >
            <div className={styles.list}>
              <div className={styles.listBox}>
                <div className={styles.listTop}>
                  <div className={styles.arrowIcons}>
                    <ArrowIconBack
                      height={24}
                      onClick={() => {
                        navigate(-1);
                      }}
                      width={24}
                    />
                    <ArrowIconNext
                      height={24}
                      onClick={() => {
                        navigate(+1);
                      }}
                      width={24}
                    />
                  </div>
                  <p
                    className={styles.homeText}
                    onClick={() => {
                      navigate('/');
                    }}
                  >
                    {t('banner.homeText')}
                  </p>
                  <p>/</p>
                  <p
                    className={styles.courseText}
                    onClick={() => {
                      navigate('/mock-test');
                    }}
                  >
                    {t('banner.mocktest')}
                  </p>
                  <p>/</p>
                  {filteredData &&
                  filteredData.length > 0 &&
                  filteredData[0].testId ? (
                    <p className={styles.topicText}>
                      {filteredData[0].testId.name}
                    </p>
                  ) : (
                    <p> {t('banner.loading')}...</p>
                  )}
                </div>

                <div className={styles.titleBox}>
                  <p className={styles.title}>
                    {filteredData[0]?.testId?.name || '...'}
                  </p>
                  {filteredData[0]?.details &&
                  currentGroupIndex === filteredData[0].details.length - 1 &&
                  !isReviewMode ? (
                    <div
                      className={styles.btnCom}
                      onClick={() => {
                        setModalType('submit');
                        setIsModalVisible(true);
                      }}
                    >
                      <p className={styles.textBtn}>{t('banner.btnSub')}</p>
                      <ArrowUpRight />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className={styles.filterWrapper}>
                <button
                  className={styles.scrollBtn}
                  onClick={() => scrollFilter('left')}
                >
                  ←
                </button>

                <div className={styles.filterExam} ref={filterRef}>
                  {filteredData[0]?.details.map((detail, index) => {
                    const isDone = isReviewMode
                      ? true
                      : index < currentGroupIndex;
                    const isCurrent = index === currentGroupIndex;
                    const isLast = index === filteredData[0].details.length - 1;

                    return (
                      <div
                        className={styles.boxExam}
                        key={index}
                        onClick={() => {
                          if (isReviewMode) {
                            setCurrentGroupIndex(index);
                          }
                        }}
                        style={{ cursor: isReviewMode ? 'pointer' : 'default' }}
                      >
                        <div
                          className={`${styles.examIcon} ${
                            isCurrent
                              ? styles.borderBlue
                              : isDone
                                ? styles.borderGreen
                                : ''
                          }`}
                        >
                          {(isReviewMode || isModalSuccess) && isDone ? (
                            <TickCircle color="#12B76A" />
                          ) : null}

                          <p className={styles.examText}>{detail.name}</p>
                        </div>
                        {!isLast && (
                          <Line
                            color={
                              isDone
                                ? '#12B76A'
                                : isCurrent
                                  ? '#2F80ED'
                                  : '#E0E0E0'
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  className={styles.scrollBtn}
                  onClick={() => scrollFilter('right')}
                >
                  →
                </button>
              </div>
            </div>

            {filteredData.length > 0 && (
              <div
                className={styles.contentMockTest}
                key={filteredData[0].details[currentGroupIndex].id}
              >
                <div className={styles.boxMockTest}>
                  {filteredData[0].details[
                    currentGroupIndex
                  ].questionGroups.map((qGroup, qGroupIndex) => (
                    <div
                      className={styles.mockTestLeft}
                      key={`group-${qGroupIndex}`}
                    >
                      <div className={styles.mockTestTitle}>
                        <p className={styles.title}>
                          {t('mocktest.contentQuestion')} {qGroupIndex + 1}
                        </p>
                        {qGroup.content ? (
                          <p
                            className={styles.text}
                            dangerouslySetInnerHTML={{ __html: qGroup.content }}
                          />
                        ) : null}
                        <div className={styles.mockTestFormat}>
                          {qGroup.audioUrl ? (
                            <>
                              <div
                                className={styles.iconListen}
                                onClick={() => setIsPlaying(prev => !prev)}
                              >
                                <IconListen
                                  color="#fff"
                                  height={32}
                                  width={32}
                                />
                              </div>
                              <div className={styles.hiddenAudioPlayer}>
                                <ReactPlayer
                                  height="0"
                                  playing={isPlaying}
                                  ref={playerRef}
                                  url={qGroup.audioUrl}
                                  width="0"
                                />
                              </div>
                            </>
                          ) : null}
                          {qGroup.imageUrl ? (
                            <div className={styles.contentImg}>
                              <img
                                alt=""
                                className={styles.contentImg}
                                src={qGroup.imageUrl}
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className={styles.boxContent}>
                        {qGroup.questions.map((question, qIndex) => {
                          const questionKey = `${currentGroupIndex}-${qGroupIndex}-${qIndex}`;
                          return (
                            <div
                              className={styles.questionContent}
                              id={`question-${questionKey}`}
                              key={question.id}
                            >
                              <div
                                className={styles.boxQuestionContent}
                                onClick={() => {
                                  toggleExpand(questionKey);
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className={styles.questionHeading}>
                                  <span className={styles.questionIndex}>
                                    {qIndex + 1}.
                                  </span>
                                  <span className={styles.questionTypeBadge}>
                                    {formatQuestionTypeLabel(question.type, t)}
                                  </span>
                                </div>
                                <p
                                  className={styles.questionTitle}
                                  dangerouslySetInnerHTML={{
                                    __html: question.content,
                                  }}
                                />
                                <div className={styles.boxArrow}>
                                  <ArrowDown />
                                </div>
                              </div>

                              <div
                                className={`${styles.answer} ${
                                  expandedStates[questionKey]
                                    ? styles.collapse
                                    : styles.expand
                                }`}
                              >
                                {question.type ===
                                QuestionEntity.type.CHOOSE_ANSWER_IN_BLANK ? (
                                  <div className={styles.embeddedExam}>
                                    <MockTestExamDrag
                                      currentGroupIndex={0}
                                      data={question}
                                      hideQuestionList
                                      initialAnswers={
                                        testAnswersByQuestionId[question.id]
                                          ?.questionType ===
                                        QuestionEntity.type
                                          .CHOOSE_ANSWER_IN_BLANK
                                          ? (
                                              testAnswersByQuestionId[
                                                question.id
                                              ].answer as {
                                                index: number;
                                                correctAnswer: string;
                                              }[]
                                            ).reduce(
                                              (acc, item) => ({
                                                ...acc,
                                                [item.index]:
                                                  item.correctAnswer ?? '',
                                              }),
                                              {} as Record<number, string>,
                                            )
                                          : {}
                                      }
                                      onAnswerChange={val => {
                                        const payload = chooseInBlankPayload(
                                          question,
                                          val,
                                        );
                                        const entry: TestAnswerEntry = {
                                          questionType:
                                            QuestionEntity.type
                                              .CHOOSE_ANSWER_IN_BLANK,
                                          answer: payload,
                                        };
                                        setTestAnswersByQuestionId(prev => ({
                                          ...prev,
                                          [question.id]: entry,
                                        }));
                                        if (
                                          isQuestionAnswerComplete(
                                            question,
                                            entry,
                                          )
                                        ) {
                                          setActiveQuestions(prev =>
                                            new Set(prev).add(questionKey),
                                          );
                                        }
                                        persistTemporaryAnswer(
                                          question.id,
                                          QuestionEntity.type
                                            .CHOOSE_ANSWER_IN_BLANK,
                                          { blanks: payload },
                                        );
                                      }}
                                      onSelectQuestion={() => {}}
                                      onSetExplanation={() => {}}
                                      reviewData={undefined}
                                      reviewMode={isReviewMode}
                                      showAnswer={false}
                                      totalGroups={1}
                                    />
                                  </div>
                                ) : question.type ===
                                  QuestionEntity.type.MATCHING ? (
                                  <div className={styles.embeddedExam}>
                                    <MockTestExamConnect
                                      currentGroupIndex={0}
                                      data={question}
                                      hideQuestionList
                                      shuffleEnabled={Boolean(
                                        filteredData?.[0]?.testId?.randomAnswer,
                                      )}
                                      initialPairs={
                                        testAnswersByQuestionId[question.id]
                                          ?.questionType ===
                                        QuestionEntity.type.MATCHING
                                          ? (testAnswersByQuestionId[
                                              question.id
                                            ].answer as {
                                              left: string;
                                              right: string;
                                            }[])
                                          : []
                                      }
                                      onAnswerChange={(_complete, pairs) => {
                                        if (!pairs) return;
                                        const entry: TestAnswerEntry = {
                                          questionType:
                                            QuestionEntity.type.MATCHING,
                                          answer: pairs,
                                        };
                                        setTestAnswersByQuestionId(prev => ({
                                          ...prev,
                                          [question.id]: entry,
                                        }));
                                        if (
                                          isQuestionAnswerComplete(
                                            question,
                                            entry,
                                          )
                                        ) {
                                          setActiveQuestions(prev =>
                                            new Set(prev).add(questionKey),
                                          );
                                        }
                                        persistTemporaryAnswer(
                                          question.id,
                                          QuestionEntity.type.MATCHING,
                                          { pairs },
                                        );
                                      }}
                                      onSelectQuestion={() => {}}
                                      reviewData={undefined}
                                      reviewMode={isReviewMode}
                                      showAnswer={false}
                                      totalGroups={1}
                                    />
                                  </div>
                                ) : question.type ===
                                  QuestionEntity.type.FILL_IN_BLANK ? (
                                  <div className={styles.embeddedExam}>
                                    <MockTestExamFormAudio
                                      checkResult={null}
                                      currentGroupIndex={0}
                                      data={question}
                                      hideQuestionList
                                      initialAnswers={
                                        testAnswersByQuestionId[question.id]
                                          ?.questionType ===
                                        QuestionEntity.type.FILL_IN_BLANK
                                          ? (
                                              testAnswersByQuestionId[
                                                question.id
                                              ].answer as {
                                                index: number;
                                                correctAnswer: string;
                                              }[]
                                            ).reduce(
                                              (acc, item) => ({
                                                ...acc,
                                                [item.index]:
                                                  item.correctAnswer ?? '',
                                              }),
                                              {} as Record<number, string>,
                                            )
                                          : {}
                                      }
                                      onAnswerChange={val => {
                                        const payload = fillInBlankPayload(
                                          question,
                                          val,
                                        );
                                        const entry: TestAnswerEntry = {
                                          questionType:
                                            QuestionEntity.type.FILL_IN_BLANK,
                                          answer: payload,
                                        };
                                        setTestAnswersByQuestionId(prev => ({
                                          ...prev,
                                          [question.id]: entry,
                                        }));
                                        if (
                                          isQuestionAnswerComplete(
                                            question,
                                            entry,
                                          )
                                        ) {
                                          setActiveQuestions(prev =>
                                            new Set(prev).add(questionKey),
                                          );
                                        }
                                        persistTemporaryAnswer(
                                          question.id,
                                          QuestionEntity.type.FILL_IN_BLANK,
                                          { blanks: payload },
                                        );
                                      }}
                                      onSelectQuestion={() => {}}
                                      onSetExplanation={() => {}}
                                      reviewData={undefined}
                                      reviewMode={isReviewMode}
                                      showAnswer={false}
                                      totalGroups={1}
                                    />
                                  </div>
                                ) : question.type ===
                                  QuestionEntity.type.DROP_DOWN_ANSWER ? (
                                  <div className={styles.embeddedExam}>
                                    <MockTestExamDropDown
                                      disabled={isReviewMode}
                                      initialAnswers={
                                        testAnswersByQuestionId[question.id]
                                          ?.questionType ===
                                        QuestionEntity.type.DROP_DOWN_ANSWER
                                          ? (
                                              testAnswersByQuestionId[
                                                question.id
                                              ].answer as {
                                                index: number;
                                                selectedContent: string;
                                              }[]
                                            ).reduce(
                                              (acc, item) => ({
                                                ...acc,
                                                [item.index]:
                                                  item.selectedContent ?? '',
                                              }),
                                              {} as Record<number, string>,
                                            )
                                          : {}
                                      }
                                      onAnswerChange={val => {
                                        const payload = dropDownPayload(
                                          question,
                                          val,
                                        );
                                        const entry: TestAnswerEntry = {
                                          questionType:
                                            QuestionEntity.type
                                              .DROP_DOWN_ANSWER,
                                          answer: payload,
                                        };
                                        setTestAnswersByQuestionId(prev => ({
                                          ...prev,
                                          [question.id]: entry,
                                        }));
                                        if (
                                          isQuestionAnswerComplete(
                                            question,
                                            entry,
                                          )
                                        ) {
                                          setActiveQuestions(prev =>
                                            new Set(prev).add(questionKey),
                                          );
                                        }
                                        persistTemporaryAnswer(
                                          question.id,
                                          QuestionEntity.type.DROP_DOWN_ANSWER,
                                          { dropDowns: payload },
                                        );
                                      }}
                                      question={question}
                                      reviewMode={isReviewMode}
                                    />
                                  </div>
                                ) : question.type ===
                                  QuestionEntity.type
                                    .HANDWRITING ? (
                                  <div className={styles.embeddedExam}>
                                    <MockTestExamHandWriting
                                      disabled={isReviewMode}
                                      initialAnswer={
                                        testAnswersByQuestionId[question.id]
                                          ?.questionType ===
                                        QuestionEntity.type.HANDWRITING
                                          ? (testAnswersByQuestionId[
                                              question.id
                                            ]
                                              .answer as HandWritingAnswerPayload)
                                          : null
                                      }
                                      onAnswerChange={payload => {
                                        const entry: TestAnswerEntry = {
                                          questionType:
                                            QuestionEntity.type.HANDWRITING,
                                          answer: payload,
                                        };
                                        setTestAnswersByQuestionId(prev => ({
                                          ...prev,
                                          [question.id]: entry,
                                        }));
                                        if (
                                          isQuestionAnswerComplete(
                                            question,
                                            entry,
                                          )
                                        ) {
                                          setActiveQuestions(prev =>
                                            new Set(prev).add(questionKey),
                                          );
                                        }
                                        persistTemporaryAnswer(
                                          question.id,
                                          QuestionEntity.type.HANDWRITING,
                                          payload,
                                        );
                                      }}
                                      question={question}
                                      reviewMode={isReviewMode}
                                    />
                                  </div>
                                ) : question.type ===
                                  QuestionEntity.type.ESSAY ? (
                                  <div className={styles.embeddedExam}>
                                    <MockTestExamEssay
                                      disabled={isReviewMode}
                                      onSubmit={payload => {
                                        const entry: TestAnswerEntry = {
                                          questionType:
                                            QuestionEntity.type.ESSAY,
                                          answer: payload,
                                        };
                                        setTestAnswersByQuestionId(prev => ({
                                          ...prev,
                                          [question.id]: entry,
                                        }));
                                        if (
                                          isQuestionAnswerComplete(
                                            question,
                                            entry,
                                          )
                                        ) {
                                          setActiveQuestions(prev =>
                                            new Set(prev).add(questionKey),
                                          );
                                        }
                                        persistTemporaryAnswer(
                                          question.id,
                                          QuestionEntity.type.ESSAY,
                                          payload,
                                        );
                                      }}
                                      question={question}
                                      reviewMode={isReviewMode}
                                      savedAnswer={
                                        testAnswersByQuestionId[question.id]
                                          ?.questionType ===
                                        QuestionEntity.type.ESSAY
                                          ? (testAnswersByQuestionId[
                                              question.id
                                            ]
                                              .answer as MockTestEssayAnswerPayload)
                                          : null
                                      }
                                    />
                                  </div>
                                ) : question.type ===
                                  QuestionEntity.type.RECORD ? (
                                  <div className={styles.embeddedExam}>
                                    <MockTestExamRecording
                                      disabled={isReviewMode}
                                      onSubmit={payload => {
                                        const entry: TestAnswerEntry = {
                                          questionType:
                                            QuestionEntity.type.RECORD,
                                          answer: payload,
                                        };
                                        setTestAnswersByQuestionId(prev => ({
                                          ...prev,
                                          [question.id]: entry,
                                        }));
                                        if (
                                          isQuestionAnswerComplete(
                                            question,
                                            entry,
                                          )
                                        ) {
                                          setActiveQuestions(prev =>
                                            new Set(prev).add(questionKey),
                                          );
                                        }
                                        persistTemporaryAnswer(
                                          question.id,
                                          QuestionEntity.type.RECORD,
                                          payload,
                                        );
                                      }}
                                      question={question}
                                      reviewMode={isReviewMode}
                                      savedAnswer={
                                        testAnswersByQuestionId[question.id]
                                          ?.questionType ===
                                        QuestionEntity.type.RECORD
                                          ? (testAnswersByQuestionId[
                                              question.id
                                            ]
                                              .answer as MockTestRecordingAnswerPayload)
                                          : null
                                      }
                                    />
                                  </div>
                                ) : question.type ===
                                  QuestionEntity.type.SORTING ? (
                                  <MockTestExamSorting
                                    disabled={isReviewMode}
                                    ordered={
                                      testAnswersByQuestionId[question.id]
                                        ?.questionType ===
                                      QuestionEntity.type.SORTING
                                        ? (
                                            testAnswersByQuestionId[question.id]
                                              .answer as {
                                              content: string;
                                            }[]
                                          ).map(x => x.content)
                                        : []
                                    }
                                    onChange={ordered => {
                                      const orders = buildSortingPayload(
                                        question,
                                        ordered,
                                      );
                                      const entry: TestAnswerEntry = {
                                        questionType:
                                          QuestionEntity.type.SORTING,
                                        answer: orders,
                                      };
                                      setTestAnswersByQuestionId(prev => ({
                                        ...prev,
                                        [question.id]: entry,
                                      }));
                                      if (
                                        isQuestionAnswerComplete(
                                          question,
                                          entry,
                                        )
                                      ) {
                                        setActiveQuestions(prev =>
                                          new Set(prev).add(questionKey),
                                        );
                                      }
                                      persistTemporaryAnswer(
                                        question.id,
                                        QuestionEntity.type.SORTING,
                                        { orders },
                                      );
                                    }}
                                    question={question}
                                  />
                                ) : question.type ===
                                  QuestionEntity.type.TRUE_FALSE ? (
                                  <div className={styles.embeddedExam}>
                                    <div className={styles.tfChoiceRow}>
                                      {([true, false] as const).map(
                                        tfVal => {
                                          const taTf =
                                            testAnswersByQuestionId[
                                              question.id
                                            ];
                                          const userPick =
                                            taTf?.questionType ===
                                              QuestionEntity.type.TRUE_FALSE &&
                                            Array.isArray(taTf.answer)
                                              ? (taTf.answer[0] as {
                                                  isCorrect?: boolean;
                                                })?.isCorrect
                                              : undefined;
                                          const correct =
                                            question.trueFalseAnswer;
                                          let tfClass = styles.tfChoiceBtn;
                                          if (isReviewMode) {
                                            if (tfVal === correct) {
                                              tfClass += ` ${styles.tfCorrect}`;
                                            } else if (
                                              userPick === tfVal &&
                                              tfVal !== correct
                                            ) {
                                              tfClass += ` ${styles.tfWrong}`;
                                            }
                                          } else if (userPick === tfVal) {
                                            tfClass += ` ${styles.tfChoiceActive}`;
                                          }

                                          return (
                                            <button
                                              className={tfClass}
                                              disabled={isReviewMode}
                                              key={String(tfVal)}
                                              onClick={() => {
                                                const entry: TestAnswerEntry = {
                                                  questionType:
                                                    QuestionEntity.type
                                                      .TRUE_FALSE,
                                                  answer: [
                                                    { isCorrect: tfVal },
                                                  ],
                                                };
                                                setTestAnswersByQuestionId(
                                                  prev => ({
                                                    ...prev,
                                                    [question.id]: entry,
                                                  }),
                                                );
                                                if (
                                                  isQuestionAnswerComplete(
                                                    question,
                                                    entry,
                                                  )
                                                ) {
                                                  setActiveQuestions(prev =>
                                                    new Set(prev).add(
                                                      questionKey,
                                                    ),
                                                  );
                                                }
                                                persistTemporaryAnswer(
                                                  question.id,
                                                  QuestionEntity.type.TRUE_FALSE,
                                                  { isCorrect: tfVal },
                                                );
                                              }}
                                              type="button"
                                            >
                                              {tfVal
                                                ? t('exam.trueLabel', {
                                                    defaultValue: 'Đúng',
                                                  })
                                                : t('exam.falseLabel', {
                                                    defaultValue: 'Sai',
                                                  })}
                                            </button>
                                          );
                                        },
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  (question.multipleChoiceAnswers ?? []).map(
                                    (answer, answerIndex) => {
                                      const taForQuestion =
                                        testAnswersByQuestionId[question.id];
                                      const userAnswerIndex = isReviewMode
                                        ? (() => {
                                            const userArr =
                                              taForQuestion?.answer as
                                                | { content?: string }[]
                                                | undefined;
                                            const userContent = String(
                                              userArr?.[0]?.content ?? '',
                                            ).trim();
                                            if (!userContent) return -1;

                                            return (
                                              question.multipleChoiceAnswers?.findIndex(
                                                a =>
                                                  String(a.content ?? '')
                                                    .trim()
                                                    .toLowerCase() ===
                                                  userContent.toLowerCase(),
                                              ) ?? -1
                                            );
                                          })()
                                        : activeAnswersResult[questionKey];
                                      const correctAns =
                                        question.multipleChoiceAnswers.findIndex(
                                          a => a.isCorrect,
                                        );

                                      let answerClass = '';

                                      if (isReviewMode) {
                                        if (answerIndex === correctAns) {
                                          answerClass = styles.correct;
                                        } else if (
                                          userAnswerIndex === answerIndex &&
                                          userAnswerIndex !== correctAns
                                        ) {
                                          answerClass = styles.incorrect;
                                        }
                                      } else if (
                                        activeAnswers[questionKey] ===
                                        answerIndex
                                      ) {
                                        answerClass = styles.active;
                                      }

                                      return (
                                        <div
                                          className={`${styles.answerBox} ${answerClass}`}
                                          key={answerIndex}
                                          onClick={() => {
                                            if (!isReviewMode) {
                                              selectAnswer(
                                                questionKey,
                                                answerIndex,
                                                question.id,
                                                answer.content,
                                                answer.isCorrect,
                                              );
                                            }
                                          }}
                                        >
                                          <div className={styles.contentBox}>
                                            <p className={styles.text}>
                                              {String.fromCharCode(
                                                65 + answerIndex,
                                              )}
                                            </p>
                                          </div>
                                          <div className={styles.contentText}>
                                            <p className={styles.text}>
                                              {answer.content}
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    },
                                  )
                                )}
                              </div>
                              {isReviewMode && question.explain ? (
                                <div className={styles.explainBox}>
                                  <button
                                    className={styles.explainBtn}
                                    onClick={() => toggleExplain(questionKey)}
                                  >
                                    {explainVisible[questionKey]
                                      ? t('mocktest.noneExplain')
                                      : t('mocktest.showExplain')}
                                  </button>

                                  {explainVisible[questionKey] ? (
                                    <div
                                      className={styles.explainContent}
                                      dangerouslySetInnerHTML={{
                                        __html: question.explain,
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
                  ))}
                </div>

                <div className={styles.mockTestRight}>
                  <div className={styles.timeMockTest}>
                    {!isReviewMode ? (
                      <>
                        <p className={styles.text}>{t('mocktest.timer')}:</p>
                        <CountdownTimer
                          alertRemainingMinutes={
                            alertMinutes != null && alertMinutes > 0
                              ? alertMinutes
                              : undefined
                          }
                          disabled={isReviewMode}
                          initialSeconds={timeLeftByDetail[currentDetailId]}
                          onTick={remainSeconds => {
                            if (!currentDetailId) return;
                            setTimeLeftByDetail(prev => ({
                              ...prev,
                              [currentDetailId]: remainSeconds,
                            }));
                          }}
                          onTimeUp={() => {
                            const isLast =
                              currentGroupIndex ===
                              filteredData[0].details.length - 1;
                            setModalType(isLast ? 'submit' : 'next');
                            handleTransfer();
                          }}
                          timeLimit={currentDetail.timeLimit ?? 0}
                          warningLabel={
                            alertThresholdSeconds
                              ? t('mocktest.timeRunningOut')
                              : undefined
                          }
                        />
                      </>
                    ) : null}
                  </div>

                  <div className={styles.listMockTest}>
                    <p className={styles.title}>{t('mocktest.listQuestion')}</p>

                    {filteredData[0]?.details?.[
                      currentGroupIndex
                    ]?.questionGroups.map((qGroup, qGroupIndex) => (
                      <div className={styles.boxList} key={qGroupIndex}>
                        <p>
                          {t('mocktest.groupQuestion')}
                          {qGroupIndex + 1}
                        </p>
                        <div className={styles.boxNumber}>
                          {qGroup.questions.map((question, qIndex) => {
                            const questionKey = `${currentGroupIndex}-${qGroupIndex}-${qIndex}`;
                            const ta = testAnswersByQuestionId[question.id];

                            let statusClass = '';

                            if (isReviewMode) {
                              const q = question as QuestionEntity;
                              if (q.type === QuestionEntity.type.ESSAY) {
                                const sub = ta?.answer as
                                  | MockTestEssayAnswerPayload
                                  | undefined;
                                statusClass =
                                  String(sub?.text ?? '').trim().length > 0 ||
                                  String(sub?.fileUrl ?? '').trim().length > 0
                                    ? styles.correctNumber
                                    : styles.incorrectNumber;
                              } else if (
                                q.type === QuestionEntity.type.RECORD
                              ) {
                                const sub = ta?.answer as
                                  | MockTestRecordingAnswerPayload
                                  | undefined;
                                statusClass =
                                  String(sub?.recordUrl ?? '').trim().length > 0
                                    ? styles.correctNumber
                                    : styles.incorrectNumber;
                              } else if (ta && isQuestionCorrectMock(q, ta)) {
                                statusClass = styles.correctNumber;
                              } else {
                                statusClass = styles.incorrectNumber;
                              }
                            } else {
                              const isActive = activeQuestions.has(questionKey);
                              if (isActive) statusClass = styles.isActive;
                            }

                            return (
                              <div
                                className={`${styles.number} ${statusClass}`}
                                key={questionKey}
                                onClick={() => {
                                  const el = document.getElementById(
                                    `question-${questionKey}`,
                                  );

                                  if (el) {
                                    el.scrollIntoView({
                                      behavior: 'smooth',
                                      block: 'center',
                                    });
                                  }
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                <p className={styles.text}>{qIndex + 1}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.boxBtn}>
                    <div
                      className={styles.btnQuit}
                      onClick={() => {
                        setModalType('quit');
                        setIsModalVisible(true);
                      }}
                    >
                      <p className={styles.textQuit}> {t('mocktest.exit')}</p>
                    </div>

                    {!isReviewMode && (
                      <div
                        className={styles.btnNext}
                        onClick={() => {
                          setModalType('next');
                          setIsModalVisible(true);
                        }}
                      >
                        <p className={styles.textNext}>
                          {t('mocktest.changeNext')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Spin>
        </main>
      </div>

      <Modal
        closable={false}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        open={isModalVisible}
        width={600}
      >
        <div className={styles.boxModal}>
          <div className={styles.boxMess}>
            <div className={styles.iconModal}>
              <SupportSolid color="#F3A41D" />
            </div>
            <div className={styles.messModal}>
              {modalType === 'next' && (
                <>
                  <p className={styles.textTitle}>
                    {t('mocktest.titleWaringNext')}
                  </p>
                  <p className={styles.textMess}>{t('mocktest.textMess')}</p>
                </>
              )}
              {modalType === 'quit' && (
                <>
                  <p className={styles.textTitle}>
                    {t('mocktest.titleWaringExam')}
                  </p>
                  <p className={styles.textMess}>
                    {t('mocktest.textMessExam')}
                  </p>
                </>
              )}
              {modalType === 'submit' && (
                <>
                  <p className={styles.textTitle}>
                    {t('mocktest.titleWaringSub')}
                  </p>
                  <p className={styles.textMess}>{t('mocktest.textMessSub')}</p>
                </>
              )}
            </div>
          </div>

          <div className={styles.boxBtn}>
            <div
              className={styles.btnQuit}
              onClick={async () => {
                if (modalType === 'quit') {
                  if (id) {
                    try {
                      await dispatch(
                        deleteTestProcess({ testId: id }),
                      ).unwrap();
                    } catch {
                      // Phiên làm bài có thể đã hết cache — vẫn cho thoát
                    }
                  }
                  setIsModalVisible(false);
                  navigate(-1);
                } else {
                  setIsModalVisible(false);
                }
              }}
            >
              <p className={styles.textQuit}>
                {modalType === 'next' || modalType === 'submit'
                  ? t('mocktest.btnExit')
                  : t('mocktest.exit')}
              </p>
            </div>
            <div
              className={styles.btnNext}
              onClick={() => {
                if (modalType === 'quit') {
                  setIsModalVisible(false);
                } else {
                  handleTransfer();
                }
              }}
            >
              <p className={styles.textNext}>
                {modalType === 'next' || modalType === 'submit'
                  ? t('mocktest.btnDone')
                  : t('mocktest.next')}
              </p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal closable={false} footer={null} open={isModalSuccess} width={800}>
        <div className={styles.modalBox}>
          <div className={styles.modalImg}>
            <img alt="Medal" src={ImgMedal} />
          </div>
          <p className={styles.modalScore}>
            {t('mocktest.point')}: {totalPoints}
          </p>

          <div className={styles.contentBox}>
            {filteredData[0]?.details?.map((detail, idx) => {
              const allQuestionIds =
                detail.questionGroups.flatMap((group: any) =>
                  group.questions.map((q: any) => q.id),
                ) || [];

              const totalQuestions = allQuestionIds.length;

              const correctCount = allQuestionIds.filter(qid => {
                const q = detail.questionGroups
                  .flatMap((g: any) => g.questions)
                  .find((x: QuestionEntity) => x.id === qid);
                const ta = testAnswersByQuestionId[qid];
                return (
                  q && ta && isQuestionCorrectMock(q as QuestionEntity, ta)
                );
              }).length;

              return (
                <div className={styles.modalContent} key={idx}>
                  <div className={styles.modalPoint}>
                    <Tooltip title={detail.name}>
                      <p className={styles.modalText}>{detail.name}</p>
                    </Tooltip>
                    <p className={styles.modalNumber}>
                      {correctCount}/{totalQuestions}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.modalBtn}>
          <div
            className={styles.btnContent}
            onClick={() => {
              setIsModalSuccess(false);
              navigate('/');
            }}
          >
            <p className={styles.textContent}> {t('mocktest.home')}</p>
          </div>
          <div className={styles.boxSubmit}>
            <div
              className={styles.btnContent}
              onClick={() => {
                setIsModalSuccess(false);
                setIsReviewMode(true);
              }}
            >
              <p className={styles.textContent}> {t('mocktest.view')}</p>
            </div>
            <div
              className={styles.btnContent}
              onClick={() => {
                setIsModalSuccess(false);
                navigate('/mock-test', { replace: true });
              }}
            >
              <p className={styles.textContent}>{t('mocktest.backNavigate')}</p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default MockTestExam;
