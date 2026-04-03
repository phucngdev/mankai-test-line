import { Modal } from 'antd';
import { IconCheck, IconWrong } from '#/assets/svg/externalIcon';
import ImgMedal from '#/assets/images/GlobalVocabulary/medal.png';
import iconStar from '#/assets/images/specialRanking/star.png';
import styles from './ExamResultSection.module.scss';

interface ExamResultSectionProps {
  hasSelectedAnswer: boolean;
  checkResult?: 'correct' | 'wrong' | null;
  questionIndex: number;
  totalQuestions: number;
  onPrevQuestion?: () => void;
  onCheckAnswer?: () => void;
  onNextQuestion?: () => void;
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  explanation?: string;
  onRestart?: () => void;
  onContinue?: () => void;
  correctAnswersCount: number;
}

export default function ExamResultSectionAudio({
  hasSelectedAnswer,
  checkResult,
  questionIndex,
  totalQuestions,
  onPrevQuestion,
  onCheckAnswer,
  onNextQuestion,
  isModalVisible,
  setIsModalVisible,
  explanation,
  onRestart,
  onContinue,
  correctAnswersCount,
}: ExamResultSectionProps) {
  // const percent = Math.round((correctAnswersCount / totalQuestions) * 100);
  return (
    <>
      <div className={styles.contentExplain}>
        <div className={styles.boxExplain}>
          <p className={styles.explainTitle}>Giải thích:</p>
          <p className={styles.explainText}>{explanation}</p>
        </div>
      </div>
      {checkResult === null && (
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
            <p className={styles.textSession}>Kiểm tra</p>
          </div>
        </div>
      )}

      {checkResult === 'correct' && (
        <div
          className={styles.contentNotification}
          style={{
            background: '#d1fadf',
            borderTop: '1px solid var(--Success-400, #32d583)',
          }}
        >
          <div className={styles.boxNotification}>
            <div className={styles.iconCheck}>
              <IconCheck color="#12B76A" />
            </div>
            <div className={styles.textNotification}>
              <p className={styles.textSuccess}>Chính xác! Làm tốt lắm</p>
              <p className={styles.contentSuccess}>Hãy tiếp tục phát huy</p>
            </div>
          </div>
          <div className={styles.contentBtn} onClick={onNextQuestion}>
            <p className={styles.textBtn}>Tiếp tục</p>
          </div>
        </div>
      )}

      {checkResult === 'wrong' && (
        <div
          className={styles.contentNotification}
          style={{
            background: '#FEF3F2',
            borderTop: '1px solid var(--Error-500, #F04438)',
          }}
        >
          <div className={styles.boxNotification}>
            <div className={styles.iconCheck}>
              <IconWrong color="#F04438" />
            </div>
            <div className={styles.textNotification}>
              <p className={styles.textSuccess} style={{ color: '#F04438' }}>
                Chưa chính xác!
              </p>
              {/* <p className={styles.contentSuccess}>
                Hãy xem lời giải để hiểu bài nhé
              </p> */}
            </div>
          </div>
          <div className={styles.contentBtnWrong} onClick={onNextQuestion}>
            <p className={styles.textBtn}>Tiếp tục</p>
          </div>
        </div>
      )}

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
