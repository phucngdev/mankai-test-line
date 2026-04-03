import { useEffect, useRef, useState } from 'react';
import styles from './Listening.module.scss';
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
import type {
  ExamLessonWithMappingEntity,
  QuestionGroupEntity,
} from '#/api/requests';
import { QuestionEntity } from '#/api/requests';
import { getExamLessonByIdLession } from '#/shared/redux/thunk/ExamLesson';
import CryptoJS from 'crypto-js';
import { postExamReults } from '#/shared/redux/thunk/ExamReultsThunk';
import { useParams } from 'react-router-dom';
import type {
  DecryptedDataListen,
  ListeningProps,
  ShuffledGroup,
} from '#/api/requests/interface/Listening';
import { useTranslation } from 'react-i18next';

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}

export default function Listening({ lessonId, onClickNext }: ListeningProps) {
  const dataExamLesson = useSelector(
    (state: RootState) => state.examLesson.data,
  );
  const dataById = useSelector((state: RootState) => state.lession.dataById);
  const [decryptedData, setDecryptedData] = useState<DecryptedDataListen>({
    items: [],
  });
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledGroup[][]>(
    [],
  );
  const [checkResult, setCheckResult] = useState<null | 'correct' | 'wrong'>(
    null,
  );
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const correctGroupTracker = useRef<Set<string>>(new Set());
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const playerRef = useRef<ReactPlayer>(null);
  const [loading, setLoading] = useState(false);
  const { courseId } = useParams();
  const secretKey = import.meta.env.VITE_ENCRYPTION_KEY || 'your-secret-key';
  const dispatch = useAppDispatch();
  const [answeredGroupIds, setAnsweredGroupIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(`answeredGroupIds_${lessonId}`);
    return saved ? new Set(JSON.parse(saved) as string[]) : new Set();
  });
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
        const items: ExamLessonWithMappingEntity[] = Array.isArray(
          parsedData.items,
        )
          ? parsedData.items
          : [parsedData.items ?? parsedData];
        setDecryptedData({ items });

        const shuffled = items.map((item: ExamLessonWithMappingEntity) => {
          const mapping = item.exam.questionMapping as QuestionGroupEntity[];

          return mapping.map((group: QuestionGroupEntity) => ({
            ...group,
            questions: group.questions.map((q: QuestionEntity) => ({
              ...q,
              multipleChoiceAnswers:
                q.type === QuestionEntity.type.MULTIPLE_CHOICE
                  ? shuffleArray(q.multipleChoiceAnswers || [])
                  : q.multipleChoiceAnswers,
            })),
          }));
        });
        setShuffledQuestions(shuffled);
      } catch (error) {
        console.error('Decryption failed:', error);
        setDecryptedData({ items: [] });
        setShuffledQuestions([]);
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
    const loadVoices = () => speechSynthesis.getVoices();

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    loadVoices();
  }, [lessonId]);

  const currentItem = decryptedData.items[currentItemIndex];
  const currentGroup = shuffledQuestions[currentItemIndex]?.[currentGroupIndex];
  const totalGroups = decryptedData.items.reduce(
    (total, item) => total + (item.exam.questionMapping.length || 0),
    0,
  );

  const updateProgress = (groupId: string) => {
    if (!answeredGroupIds.has(groupId)) {
      const updatedSet = new Set(answeredGroupIds).add(groupId);
      setAnsweredGroupIds(updatedSet);

      // Lưu vào localStorage
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
    const questions = currentGroup.questions || [];
    let isAllCorrect = true;

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      if (question.type === QuestionEntity.type.MULTIPLE_CHOICE) {
        const selected = selectedAnswers[i];
        const correct = question.multipleChoiceAnswers.find(
          a => a.isCorrect,
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

  const getQuestionTypeLabel = (type: string | undefined) => {
    if (type === 'MULTIPLE_CHOICE') return 'Trắc nghiệm';
    if (type === 'SORTING') return 'Sắp xếp';
    return 'Không xác định';
  };

  if (loading || !currentItem || !currentGroup) return <Loading />;
  const videoUrl = dataById?.videoUrl || '';
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
                <div className={styles.boxListen}>
                  <div
                    className={styles.iconListen}
                    onClick={() => setIsPlaying(prev => !prev)}
                  >
                    <IconListen color="#fff" height={32} width={32} />
                  </div>
                </div>
                <div className={styles.audio}>
                  <ReactPlayer
                    playing={isPlaying}
                    ref={playerRef}
                    url={currentGroup.questions[0]?.audioUrl}
                  />
                </div>
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
                        {sub.multipleChoiceAnswers.map((answerObj, index) => {
                          const answer = answerObj.content;
                          const { isCorrect } = answerObj;
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
                              key={`${sub.id}-${index}`}
                              onClick={() =>
                                setSelectedAnswers(prev => ({
                                  ...prev,
                                  [subIndex]: answer,
                                }))
                              }
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
