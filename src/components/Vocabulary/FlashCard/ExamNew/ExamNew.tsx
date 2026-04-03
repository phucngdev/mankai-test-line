import { IconQuit, Warrning } from '#/assets/svg/externalIcon';
import { Modal, Progress } from 'antd';
import styles from './ExamNew.module.scss';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { getQuizFlashCardByIdLession } from '#/shared/redux/thunk/QuizFlashCardThunk';
import {
  getLessionById,
  postLessionProgress,
} from '#/shared/redux/thunk/LessionThunk';
import ExamResultSectionPractice from '../../ExamResultSection/ExamResultSectionPractice';
import { updateLessionProgress } from '#/shared/redux/slices/LessionSlice';
import type { ExamNewProps } from '#/api/requests/interface/FlashCard/ExamNewProps';

function ExamNew({ lessonId, onExit }: ExamNewProps) {
  const { data } = useSelector((state: RootState) => state.quizflashCard);
  const dispatch = useAppDispatch();
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [activeAnswer, setActiveAnswer] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [checkResult, setCheckResult] = useState<null | 'correct' | 'wrong'>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    limit: 1,
    offset: 0,
  });

  const fetchData = async () => {
    if (lessonId) {
      await Promise.all([
        dispatch(
          getQuizFlashCardByIdLession({
            id: lessonId,
            limit: pagination.limit,
            offset: pagination.offset,
          }),
        ),
        dispatch(getLessionById(lessonId)),
      ]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lessonId, pagination]);

  const resetQuestionState = () => {
    setActiveAnswer(null);
    setIsModalVisible(false);
    setCheckResult(null);
    setPagination({
      current: 1,
      limit: 1,
      offset: 0,
    });
  };

  const handleCheckAnswer = () => {
    if (!data?.[0] || activeAnswer === null) return;

    const currentQuestion = data[0].questions[questionIndex];
    const selectedAnswer = currentQuestion.answers[activeAnswer];

    const isCorrect = selectedAnswer.isCorrect === true;

    if (isCorrect) {
      setCorrectAnswersCount(prev => prev + 1);
    }

    setCheckResult(isCorrect ? 'correct' : 'wrong');
    const totalQuestions = data[0]?.questions?.length || 0;
    const progressPercent = Math.round(
      ((correctAnswersCount + (isCorrect ? 1 : 0)) / totalQuestions) * 100,
    );
    dispatch(postLessionProgress({ lessonId, progress: progressPercent }));
    dispatch(updateLessionProgress({ lessonId, progress: progressPercent }));
  };

  const handleContinue = () => {
    onExit();
  };

  const handleNextQuestion = () => {
    if (!data?.[0] || activeAnswer === null) return;

    if (questionIndex < data[0].questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
      resetQuestionState();
    } else {
      setIsModalVisible(true);
    }
  };

  const handlePrevQuestion = () => {
    if (questionIndex > 0) {
      setQuestionIndex(prev => prev - 1);
      resetQuestionState();
    }
  };

  const handleRestart = () => {
    setCheckResult(null);
    setQuestionIndex(0);
    setIsModalVisible(false);
    setCorrectAnswersCount(0);
    resetQuestionState();
  };

  return (
    data?.[0] && (
      <>
        <div className={styles.formFlashCard}>
          <div className={styles.boxTimeExam}>
            <div className={styles.boxTime}>
              <p className={styles.title}>Kiểm tra</p>
              <div className={styles.contentProgress}>
                <Progress
                  percent={
                    ((questionIndex + 1) / data[0].questions.length) * 100
                  }
                  showInfo={false}
                  strokeColor={'#AD7415'}
                  trailColor={'#DDD'}
                />
              </div>
            </div>
            <div
              className={styles.iconQuit}
              onClick={() => setIsModalOpen(true)}
            >
              <IconQuit />
            </div>
          </div>

          <div className={styles.boxFlash}>
            <div className={styles.contentBox}>
              <p
                className={styles.text}
                dangerouslySetInnerHTML={{
                  __html: data[0].questions[questionIndex].question,
                }}
              />
            </div>
          </div>

          <div className={styles.answer}>
            {data[0].questions[questionIndex].answers.map((answer, index) => (
              <div
                className={`${styles.answerBox} ${activeAnswer === index ? styles.active : ''}`}
                key={index}
                onClick={() => setActiveAnswer(index)}
              >
                <div className={styles.contentBox}>
                  <p className={styles.text}>
                    {String.fromCharCode(65 + index)}
                  </p>
                </div>
                <div className={styles.contentText}>
                  <p className={styles.text}>{answer.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <ExamResultSectionPractice
          checkResult={checkResult}
          correctAnswersCount={correctAnswersCount}
          explanation={data[0]?.questions?.[questionIndex]?.explanation || ''}
          hasSelectedAnswer={activeAnswer !== null}
          isModalVisible={isModalVisible}
          onCheckAnswer={handleCheckAnswer}
          onContinue={handleContinue}
          onNextQuestion={handleNextQuestion}
          onPrevQuestion={handlePrevQuestion}
          onRestart={handleRestart}
          questionIndex={pagination.offset}
          setIsModalVisible={setIsModalVisible}
          totalQuestions={data[0]?.questions?.length}
        />
        <Modal
          closable={false}
          footer={null}
          maskClosable={false}
          open={isModalOpen}
        >
          <div className={styles.boxModal}>
            <div className={styles.contentModal}>
              <div className={styles.modalWarning}>
                <Warrning color="#DC6803" width={30} />
              </div>
              <div className={styles.boxTitle}>
                <p className={styles.title}>Thoát bài kiểm tra</p>
                <p className={styles.text}>
                  Bạn có chắc chắn muốn thoát học phần không?
                </p>
              </div>
            </div>
            <div className={styles.boxButton}>
              <div
                className={styles.btnExit}
                onClick={() => setIsModalOpen(false)}
              >
                <p className={styles.text}>Hủy</p>
              </div>
              <div
                className={styles.btnDone}
                onClick={() => {
                  setIsModalOpen(false);
                  onExit();
                }}
              >
                <p className={styles.text}>Đồng ý</p>
              </div>
            </div>
          </div>
        </Modal>
      </>
    )
  );
}

export default ExamNew;
