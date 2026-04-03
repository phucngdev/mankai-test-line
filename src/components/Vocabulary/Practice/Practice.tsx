import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './Practice.module.scss';
import TitleVideoVocabulary from '../TitleVideoVocabulary/TitleVideoVocabulary';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { useSelector } from 'react-redux';
import ExamResultSectionPractice from '../ExamResultSection/ExamResultSectionPractice';
import 'ckeditor5/ckeditor5.css';
import { IconListen } from '#/assets/svg/externalIcon';
import {
  getLessionById,
  postLessionProgress,
} from '#/shared/redux/thunk/LessionThunk';
import ReactPlayer from 'react-player';
import Loading from '#/shared/components/loading/Loading';
import { updateLessionProgress } from '#/shared/redux/slices/LessionSlice';
import { QuestionEntity } from '#/api/requests';
import { getExamLessonByIdLession } from '#/shared/redux/thunk/ExamLesson';
import type {
  DecryptedDataPractice,
  PracticeProps,
} from '#/api/requests/interface/Practice';
import { postExamReults } from '#/shared/redux/thunk/ExamReultsThunk';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Practice({ lessonId, onClickNext }: PracticeProps) {
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];

    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }

    return newArray;
  };

  const dataExamLesson = useSelector(
    (state: RootState) => state.examLesson.data,
  );
  const dataById = useSelector((state: RootState) => state.lession.dataById);
  const [decryptedData, setDecryptedData] = useState<DecryptedDataPractice>({
    items: [],
  });
  const [checkResult, setCheckResult] = useState<null | 'correct' | 'wrong'>(
    null,
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSortingAnswers, setSelectedSortingAnswers] = useState<
    Record<number, string[]>
  >({});
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [answeredGroupIds, setAnsweredGroupIds] = useState<Set<string>>(
    new Set(),
  );
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [answerStatus, setAnswerStatus] = useState<
    Record<number, { isCorrect: boolean; correctAnswer?: string }>
  >({});
  const playerRef = useRef<ReactPlayer>(null);
  const [answeredCorrectGroups, setAnsweredCorrectGroups] = useState<
    Set<string>
  >(new Set());
  const secretKey = import.meta.env.VITE_ENCRYPTION_KEY || 'your-secret-key';
  const dispatch = useAppDispatch();
  const currentItem = decryptedData.items[currentItemIndex];
  const currentGroup = currentItem.exam.questionMapping[currentGroupIndex];
  const { courseId } = useParams();
  const { t } = useTranslation();
  useEffect(() => {
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

        const items = Array.isArray(parsedData.items)
          ? parsedData.items
          : [parsedData.items ?? parsedData];

        setDecryptedData({ items });
      } catch (error) {
        console.error('Decryption failed:', error);
        setDecryptedData({ items: [] });
      }
    }
  }, [dataExamLesson]);

  useEffect(() => {
    if (lessonId) {
      setLoading(true);
      Promise.all([
        dispatch(getExamLessonByIdLession({ id: lessonId })),
        dispatch(getLessionById(lessonId)),
      ]).finally(() => setLoading(false));
    }
  }, [lessonId]);

  useEffect(() => {
    const loadVoices = () => {
      speechSynthesis.getVoices();
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    loadVoices();
  }, [lessonId]);
  const totalGroups = useMemo(
    () =>
      decryptedData.items.reduce(
        (total, item) => total + (item.exam.questionMapping.length || 0),
        0,
      ),
    [decryptedData],
  );

  const updateProgress = (groupKey: string) => {
    if (!lessonId) return;

    if (!answeredGroupIds.has(groupKey)) {
      const updatedSet = new Set(answeredGroupIds).add(groupKey);
      setAnsweredGroupIds(updatedSet);

      const progressPercent = Math.min(
        Math.round((updatedSet.size / totalGroups) * 100),
        100,
      );

      dispatch(postLessionProgress({ lessonId, progress: progressPercent }));
      dispatch(updateLessionProgress({ lessonId, progress: progressPercent }));
    }
  };

  const handleCheckAnswer = () => {
    let allCorrect = true;
    const newAnswerStatus: Record<
      number,
      { isCorrect: boolean; correctAnswer?: string }
    > = {};

    questionsToRender.forEach((question, subIndex) => {
      if (question.type === QuestionEntity.type.MULTIPLE_CHOICE) {
        const selected = selectedAnswers[subIndex];
        const correct = question.multipleChoiceAnswers.find(
          a => a.isCorrect,
        )?.content;
        newAnswerStatus[subIndex] = {
          correctAnswer: correct,
          isCorrect: selected === correct,
        };

        if (selected !== correct) {
          allCorrect = false;
        }
      } else if (question.type === QuestionEntity.type.SORTING) {
        const selectedList = selectedSortingAnswers[subIndex] || [];
        const correctOrder = [...(question.sortingAnswers || [])]
          .sort((a, b) => a.index - b.index)
          .map(a => a.content);

        const isCorrect =
          selectedList.length === correctOrder.length &&
          selectedList.every((ans, idx) => ans === correctOrder[idx]);

        newAnswerStatus[subIndex] = { isCorrect };

        if (!isCorrect) {
          allCorrect = false;
        }
      }
    });

    setAnswerStatus(newAnswerStatus);
    setCheckResult(allCorrect ? 'correct' : 'wrong');

    if (currentGroup) {
      updateProgress(currentGroup.id);
    }

    if (allCorrect) {
      const key = `${currentItemIndex}-${currentGroupIndex}`;

      if (!answeredCorrectGroups.has(key)) {
        const newCorrectCount = correctAnswersCount + 1;
        setCorrectAnswersCount(newCorrectCount);

        setAnsweredCorrectGroups(prev => new Set(prev).add(key));

        const classId = localStorage.getItem('classId') || '';
        const point = (newCorrectCount / totalGroups) * 10;

        if (courseId && classId && currentItem.exam.id) {
          dispatch(
            postExamReults({
              classId,
              courseId,
              examId: currentItem.exam.id,
              point: parseFloat(point.toFixed(2)),
              userAnswers: [],
            }),
          );
        }
      }
    }
  };

  const handleNextQuestion = () => {
    if (!currentItem) return;

    if (currentGroupIndex < currentItem.exam.questionMapping.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
    } else if (currentItemIndex < decryptedData.items.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
      setCurrentGroupIndex(0);
    } else {
      setIsModalVisible(true);
      return;
    }

    setSelectedSortingAnswers({});
    setCheckResult(null);
    setSelectedAnswers({});
    setAnswerStatus({});
  };

  const handlePrevQuestion = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(prev => prev - 1);
    } else if (currentItemIndex > 0) {
      const prevItemIndex = currentItemIndex - 1;
      const lastGroupIndex =
        decryptedData.items[prevItemIndex].exam.questionMapping.length - 1;
      setCurrentItemIndex(prevItemIndex);
      setCurrentGroupIndex(lastGroupIndex);
    } else {
      return;
    }

    setSelectedSortingAnswers({});
    setCheckResult(null);
    setSelectedAnswers({});
    setAnswerStatus({});
  };

  const handleRestart = () => {
    setCurrentItemIndex(0);
    setCurrentGroupIndex(0);
    setCheckResult(null);
    setSelectedAnswers({});
    setSelectedSortingAnswers({});
    setIsModalVisible(false);
    setCorrectAnswersCount(0);
    setAnsweredCorrectGroups(new Set(answeredGroupIds));
    setAnswerStatus({});
  };

  const shuffledAnswersMap = useMemo(() => {
    const map = new Map();
    decryptedData.items.forEach((item, itemIndex) => {
      item.exam.questionMapping.forEach((group, groupIndex) => {
        if (Array.isArray(group.questions)) {
          group.questions.forEach((question, qIndex) => {
            if (question.type === QuestionEntity.type.MULTIPLE_CHOICE) {
              const key = `${itemIndex}-${groupIndex}-${qIndex}`;
              map.set(key, shuffleArray(question.multipleChoiceAnswers || []));
            }
          });
        }
      });
    });
    return map;
  }, [decryptedData]);

  const questionsToRender: QuestionEntity[] =
    currentGroup && Array.isArray(currentGroup.questions)
      ? currentGroup.questions
      : currentGroup
        ? [currentGroup as QuestionEntity]
        : [];
  if (loading || !currentItem || !currentGroup) return <Loading />;
  const videoUrl = dataById?.videoUrl || '';

  const getQuestionTypeLabel = (type: string | undefined) => {
    if (type === 'MULTIPLE_CHOICE') return 'Trắc nghiệm';
    if (type === 'SORTING') return 'Sắp xếp';
    return 'Không xác định';
  };

  return (
    <>
      <TitleVideoVocabulary videoUrl={videoUrl} />

      <div className={styles.boxContent}>
        <div className={styles.titleContent}>
          <p className={styles.title}>Nội dung nhóm câu hỏi</p>
          <p className={styles.text}>
            {getQuestionTypeLabel(currentGroup.questions?.[0].type)}
          </p>
        </div>

        <div className={styles.formListeningReading}>
          <div className={styles.boxListeningReading}>
            <div className={styles.formListen}>
              <p className={styles.text}>
                Nhóm câu {currentGroupIndex + 1} /{' '}
                {currentItem.exam.questionMapping.length}
              </p>
              <div className={styles.contentListen}>
                <div
                  className={styles.text}
                  dangerouslySetInnerHTML={{ __html: currentGroup.content }}
                />
                {currentGroup.audioUrl ? (
                  <div className={styles.boxListen}>
                    <div
                      className={styles.iconListen}
                      onClick={() => setIsPlaying(prev => !prev)}
                    >
                      <IconListen color="#fff" height={32} width={32} />
                    </div>
                  </div>
                ) : null}
                <div
                  className={styles.audio}
                  style={{ display: 'none', height: 1 }}
                >
                  <ReactPlayer
                    playing={isPlaying}
                    ref={playerRef}
                    url={currentGroup.audioUrl}
                  />
                </div>
              </div>

              {questionsToRender.some(
                (q: QuestionEntity) => q.type === QuestionEntity.type.SORTING,
              ) ? (
                <div className={styles.boxResultSort}>
                  {questionsToRender.map(
                    (sub: QuestionEntity, subIndex: number) =>
                      sub.type === QuestionEntity.type.SORTING && (
                        <div className={styles.contentAnswer} key={subIndex}>
                          <div className={styles.titleAnswer}>
                            <p className={styles.title}>Kết quả sắp xếp:</p>
                          </div>
                          <div className={styles.answer}>
                            {(selectedSortingAnswers[subIndex] || []).map(
                              (answer, index) => (
                                <div
                                  className={`${styles.answerBox} ${
                                    checkResult &&
                                    answerStatus[subIndex].isCorrect
                                      ? styles.correct
                                      : checkResult &&
                                          !answerStatus[subIndex].isCorrect
                                        ? styles.incorrect
                                        : ''
                                  }`}
                                  key={index}
                                  onClick={() => {
                                    if (!checkResult) {
                                      setSelectedSortingAnswers(prev => {
                                        const updated = (
                                          prev[subIndex] || []
                                        ).filter(a => a !== answer);
                                        return {
                                          ...prev,
                                          [subIndex]: updated,
                                        };
                                      });
                                    }
                                  }}
                                >
                                  <div className={styles.contentBox}>
                                    <p className={styles.text}>
                                      {String.fromCharCode(65 + index)}
                                    </p>
                                  </div>
                                  <div className={styles.contentText}>
                                    <p className={styles.text}>{answer}</p>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      ),
                  )}
                </div>
              ) : null}
            </div>

            <div className={styles.formAnswer}>
              {questionsToRender.map((sub, subIndex) => {
                const isSorting = sub.type === QuestionEntity.type.SORTING;
                const isMultipleChoice =
                  sub.type === QuestionEntity.type.MULTIPLE_CHOICE;

                return (
                  <div className={styles.contentAnswer} key={subIndex}>
                    <div className={styles.titleAnswer}>
                      <div className={styles.title}>
                        <p>{subIndex + 1}.</p>
                      </div>
                      <div
                        className={styles.text}
                        dangerouslySetInnerHTML={{ __html: sub.content }}
                      />
                    </div>

                    {/* MULTIPLE CHOICE */}
                    {isMultipleChoice ? (
                      <div className={styles.answer}>
                        {(
                          shuffledAnswersMap.get(
                            `${currentItemIndex}-${currentGroupIndex}-${subIndex}`,
                          ) || []
                        ).map((answerObj: QuestionEntity, index: number) => {
                          const answer = answerObj.content;
                          const isSelected =
                            selectedAnswers[subIndex] === answer;
                          const isCorrectAnswer =
                            answerStatus[subIndex].correctAnswer === answer;
                          return (
                            <div
                              className={`${styles.answerBox} ${
                                isSelected ? styles.active : ''
                              } ${
                                checkResult &&
                                isSelected &&
                                answerStatus[subIndex].isCorrect
                                  ? styles.correct
                                  : checkResult &&
                                      isSelected &&
                                      !answerStatus[subIndex].isCorrect
                                    ? styles.incorrect
                                    : checkResult && isCorrectAnswer
                                      ? styles.correct
                                      : ''
                              }`}
                              key={`${sub.id}-${index}`}
                              onClick={() => {
                                if (!checkResult) {
                                  setSelectedAnswers(prev => ({
                                    ...prev,
                                    [subIndex]: answer,
                                  }));
                                }
                              }}
                            >
                              <div className={styles.contentBox}>
                                <p className={styles.text}>
                                  {String.fromCharCode(65 + index)}
                                </p>
                              </div>
                              <div className={styles.contentText}>
                                <p className={styles.text}>{answer}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}

                    {/* SORTING */}
                    {isSorting ? (
                      <div className={styles.answer}>
                        {sub.sortingAnswers.map((answerObj, index) => {
                          const answer = answerObj.content;
                          const isSelected = (
                            selectedSortingAnswers[subIndex] || []
                          ).includes(answer);
                          return (
                            <div
                              className={`${styles.answerBox} ${
                                isSelected ? styles.active : ''
                              } ${
                                checkResult && answerStatus[subIndex].isCorrect
                                  ? styles.correct
                                  : checkResult &&
                                      isSelected &&
                                      !answerStatus[subIndex].isCorrect
                                    ? styles.incorrect
                                    : ''
                              }`}
                              key={`${sub.id}-${index}`}
                              onClick={() => {
                                if (!checkResult) {
                                  setSelectedSortingAnswers(prev => {
                                    const current = prev[subIndex] || [];
                                    if (current.includes(answer)) return prev;
                                    return {
                                      ...prev,
                                      [subIndex]: [...current, answer],
                                    };
                                  });
                                }
                              }}
                            >
                              <div className={styles.contentBox}>
                                <p className={styles.text}>
                                  {String.fromCharCode(65 + index)}
                                </p>
                              </div>
                              <div className={styles.contentText}>
                                <p className={styles.text}>{answer}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* <ExamResultSectionPractice
          checkResult={checkResult}
          correctAnswersCount={correctAnswersCount}
          explanation={checkResult ? questionsToRender[0]?.explain || '' : ''}
          hasSelectedAnswer={
            Object.keys(selectedAnswers).length > 0 ||
            Object.values(selectedSortingAnswers).some(ans => ans.length > 0)
          }
          isModalVisible={isModalVisible}
          onCheckAnswer={handleCheckAnswer}
          onContinue={onClickNext}
          onNextQuestion={handleNextQuestion}
          onPrevQuestion={handlePrevQuestion}
          onRestart={handleRestart}
          questionIndex={currentGroupIndex}
          setIsModalVisible={setIsModalVisible}
          totalQuestions={currentItem.exam.questionMapping.length}
        /> */}
      </div>
    </>
  );
}
