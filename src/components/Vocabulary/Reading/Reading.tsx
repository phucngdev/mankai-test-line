import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './Reading.module.scss';
import TitleVideoVocabulary from '../TitleVideoVocabulary/TitleVideoVocabulary';
import { useAppDispatch } from '#/shared/redux/store';
import { useSelector } from 'react-redux';
import { postLessionProgress } from '#/shared/redux/thunk/LessionThunk';
import { updateLessionProgress } from '#/shared/redux/slices/LessionSlice';
import ExamResultSectionPractice from '../ExamResultSection/ExamResultSectionPractice';
import Loading from '#/shared/components/loading/Loading';
import { QuestionEntity } from '#/api/requests';
import type { RootState } from '#/shared/redux/store';
import 'ckeditor5/ckeditor5.css';
import CryptoJS from 'crypto-js';
import { postExamReults } from '#/shared/redux/thunk/ExamReultsThunk';
import { useParams } from 'react-router-dom';
import type {
  DecryptedDataReading,
  ReadingProps,
} from '#/api/requests/interface/Reading';
import { useTranslation } from 'react-i18next';

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function Reading({ lessonId, onClickNext }: ReadingProps) {
  const { t } = useTranslation();
  const dataById = useSelector((state: RootState) => state.lession.dataById);
  const dataExamLesson = useSelector(
    (state: RootState) => state.examLesson.data,
  );
  const [decryptedData, setDecryptedData] = useState<DecryptedDataReading>({
    items: [],
  });
  const [checkResult, setCheckResult] = useState<null | 'correct' | 'wrong'>(
    null,
  );
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const classId = localStorage.getItem('classId') || '';
  const dispatch = useAppDispatch();
  const secretKey = import.meta.env.VITE_ENCRYPTION_KEY || 'your-secret-key';
  const correctGroupTracker = useRef<Set<string>>(new Set());

  const { courseId } = useParams();
  const currentItem = decryptedData.items[currentItemIndex];
  const currentGroup = currentItem.exam.questionMapping[currentGroupIndex];

  const [answeredGroupIds, setAnsweredGroupIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(`answeredGroupIds_${lessonId}`);
    return saved ? new Set(JSON.parse(saved) as string[]) : new Set();
  });
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
        setDecryptedData({ items: [] });
      }
    }
  }, [dataExamLesson]);
  const totalGroups = decryptedData.items.reduce(
    (total, item) => total + (item.exam.questionMapping.length || 0),
    0,
  );

  const shuffledAnswers = useMemo(() => {
    const result: Record<number, string[]> = {};
    currentGroup.questions?.forEach((q: QuestionEntity, idx: number) => {
      if (q.type === QuestionEntity.type.MULTIPLE_CHOICE) {
        const answers = q.multipleChoiceAnswers.map(a => a.content) || [];
        result[idx] = shuffleArray(answers);
      }
    });
    return result;
  }, [currentGroup]);

  const updateProgress = (groupId: string) => {
    if (!answeredGroupIds.has(groupId)) {
      const updatedSet = new Set(answeredGroupIds).add(groupId);
      setAnsweredGroupIds(updatedSet);

      // Save to localStorage
      localStorage.setItem(
        `answeredGroupIds_${lessonId}`,
        JSON.stringify(Array.from(updatedSet)),
      );

      const progressPercent = Math.min(
        Math.round((updatedSet.size / totalGroups) * 100),
        100,
      );

      dispatch(postLessionProgress({ lessonId, progress: progressPercent }));
      dispatch(updateLessionProgress({ lessonId, progress: progressPercent }));
    }
  };

  const handleCheckAnswer = () => {
    if (!currentGroup) return;

    const questions = Array.isArray(currentGroup.questions)
      ? currentGroup.questions
      : [];
    let isAllCorrect = true;

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      if (question.type === QuestionEntity.type.MULTIPLE_CHOICE) {
        const selected = selectedAnswers[i];
        const correct = question.multipleChoiceAnswers?.find(
          (a: { isCorrect: boolean; content: string }) => a.isCorrect,
        )?.content;

        if (selected !== correct) {
          isAllCorrect = false;
        }
      }
    }

    setCheckResult(isAllCorrect ? 'correct' : 'wrong');

    const currentGroupId = `${currentItemIndex}-${currentGroupIndex}`;

    if (currentGroup) {
      updateProgress(currentGroup.id);
    }

    if (isAllCorrect && !correctGroupTracker.current.has(currentGroupId)) {
      correctGroupTracker.current.add(currentGroupId);
      const newCorrectCount = correctGroupTracker.current.size;
      setCorrectAnswersCount(newCorrectCount);

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

    setCheckResult(null);
    setSelectedAnswers({});
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

    setCheckResult(null);
    setSelectedAnswers({});
  };

  const handleRestart = () => {
    setCurrentItemIndex(0);
    setCurrentGroupIndex(0);
    setCheckResult(null);
    setSelectedAnswers({});
    setIsModalVisible(false);
    setCorrectAnswersCount(0);
    correctGroupTracker.current.clear();
  };

  const videoUrl = dataById?.videoUrl || '';

  const getQuestionTypeLabel = (type: string | undefined) => {
    if (type === 'MULTIPLE_CHOICE') return 'Trắc nghiệm';
    if (type === 'SORTING') return 'Sắp xếp';
    return 'Không xác định';
  };

  if (
    loading ||
    !currentItem ||
    !currentGroup ||
    !Array.isArray(currentGroup.questions)
  )
    return <Loading />;

  return (
    <>
      <TitleVideoVocabulary videoUrl={videoUrl} />
      <div className={styles.boxContent}>
        <div className={styles.titleContent}>
          <p className={styles.title}>Nội dung nhóm câu hỏi</p>
          <p className={styles.text}>
            {getQuestionTypeLabel(currentGroup.questions[0]?.type)}
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
              </div>
            </div>

            <div className={styles.formAnswer}>
              {currentGroup.questions.map(
                (sub: QuestionEntity, subIndex: number) => (
                  <div className={styles.contentAnswer} key={subIndex}>
                    <div className={styles.titleAnswer}>
                      <p>{subIndex + 1}.</p>
                      <div dangerouslySetInnerHTML={{ __html: sub.content }} />
                    </div>

                    {sub.type === QuestionEntity.type.MULTIPLE_CHOICE && (
                      <div className={styles.answer}>
                        {shuffledAnswers[subIndex].map((answer, index) => {
                          const isCorrect = sub.multipleChoiceAnswers.find(
                            a => a.content === answer && a.isCorrect,
                          );
                          let answerClass = styles.answerBox;

                          if (selectedAnswers[subIndex] === answer) {
                            answerClass += ` ${styles.active}`;
                          }

                          if (checkResult) {
                            if (isCorrect) {
                              answerClass += ` ${styles.correct}`;
                            } else if (
                              selectedAnswers[subIndex] === answer &&
                              checkResult === 'wrong'
                            ) {
                              answerClass += ` ${styles.incorrect}`;
                            }
                          }

                          return (
                            <div
                              className={answerClass}
                              key={`${sub.id}-${answer}`}
                              onClick={() => {
                                setSelectedAnswers(prev => ({
                                  ...prev,
                                  [subIndex]: answer,
                                }));
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
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* <ExamResultSectionPractice
          checkResult={checkResult}
          correctAnswersCount={correctAnswersCount}
          explanation={
            checkResult ? currentGroup.questions[0]?.explain || '' : ''
          }
          hasSelectedAnswer={Object.keys(selectedAnswers).length > 0}
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
