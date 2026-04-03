import { Modal } from 'antd';
import styles from './ExamResultSection.module.scss';
import ImgMedal from '#/assets/images/GlobalVocabulary/medal.png';
import iconStar from '#/assets/images/specialRanking/star.png';

interface ExamResultSectionProps {
  hasSelectedAnswer: boolean;
  onCheckAnswer?: () => void;
  explanation?: string;
  questionIndex: number;
  onPrevQuestion?: () => void;
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  correctAnswersCount: number;
  totalQuestions: number;
  onRestart?: () => void;
  onContinue?: () => void;
}

export default function ExamResultSectionConnect({
  hasSelectedAnswer,
  onCheckAnswer,
  questionIndex,
  onPrevQuestion,
  explanation,
  isModalVisible,
  setIsModalVisible,
  correctAnswersCount,
  totalQuestions,
  onRestart,
  onContinue,
}: ExamResultSectionProps) {
  return (
    <>
      <div className={styles.contentExplain}>
        <div className={styles.boxExplain}>
          <p className={styles.explainTitle}>Giải thích:</p>
          <p className={styles.explainText}>{explanation}</p>
        </div>
      </div>
      <div className={styles.contentTitle}>
        <div
          className={`${styles.btnSession} ${
            !questionIndex ? styles.disabledBtn : styles.activeBtn
          }`}
          onClick={questionIndex > 0 ? onPrevQuestion : undefined}
        >
          <p className={styles.textSession}>Câu trước</p>
        </div>
        <div
          className={`${styles.btnSession} ${
            hasSelectedAnswer ? styles.activeBtn : styles.disabledBtn
          }`}
          onClick={hasSelectedAnswer ? onCheckAnswer : undefined}
        >
          <p className={styles.textSession}>Chuyển phần</p>
        </div>
      </div>
      <Modal
        closable={false}
        footer={null}
        keyboard={false}
        maskClosable={false}
        onCancel={() => setIsModalVisible(false)}
        open={isModalVisible}
        width={800}
      >
        <div className={styles.modalBox}>
          <div className={styles.modalImg}>
            <img alt="" src={ImgMedal} />
          </div>
          <p className={styles.modalTitle}>Hoàn thành bài học!</p>
          <div className={styles.contentBox}>
            <div className={styles.modalContent}>
              <div className={styles.modalPoint}>
                <p className={styles.modalText}>Điểm của bạn</p>
                <p className={styles.modalNumber}>
                  {`${correctAnswersCount}/${totalQuestions}`}
                </p>
                {/* <p className={styles.modalText}>Tỷ lệ chính xác</p>
                <p className={styles.modalNumber}>{percent}%</p> */}
              </div>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.modalPoint}>
                <p className={styles.modalText}>Điểm KN</p>
                <div className={styles.modalExp}>
                  <img alt="" height={24} src={iconStar} width={31.652} />
                  <p className={styles.modalStar}>54</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.modalBtn}>
          <div className={styles.btnContent} onClick={onRestart}>
            <p className={styles.textContent}>Làm lại</p>
          </div>
          <div className={styles.btnContent} onClick={onContinue}>
            <p className={styles.textContent}>Học tiếp</p>
          </div>
        </div>
      </Modal>
    </>
  );
}
