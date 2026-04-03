import ImgMedal from '#/assets/images/GlobalVocabulary/medal.png';
import iconStar from '#/assets/images/specialRanking/star.png';
import { IconCheck, IconWrong } from '#/assets/svg/externalIcon';
import { LoadingOutlined } from '@ant-design/icons';
import { Modal, Spin } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ExamResultSectionPractice.module.scss';

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
  showAnswer?: boolean;
  showSolution?: boolean;
  reviewMode?: boolean;
  currentGroup: any;
  isLoading?: boolean;
}

export default function ExamResultSectionPractice({
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
  showAnswer,
  showSolution,
  reviewMode,
  currentGroup,
  isLoading,
}: ExamResultSectionProps) {
  const { t } = useTranslation();
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (checkResult === null && hasSelectedAnswer && !isLoading) {
          onCheckAnswer?.();
        } else if (checkResult === 'correct' || checkResult === 'wrong') {
          onNextQuestion?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    checkResult,
    hasSelectedAnswer,
    onCheckAnswer,
    onNextQuestion,
    isLoading,
  ]);

  const isShowExplain =
    currentGroup && 'questions' in currentGroup
      ? false
      : (reviewMode || showSolution) && explanation;

  return (
    <>
      {isShowExplain ? (
        <div className={styles.contentExplain}>
          <div className={styles.boxExplain}>
            <>
              <p className={styles.explainTitle}>{t('mocktest.explain')}:</p>
              <p
                className={styles.explainText}
                dangerouslySetInnerHTML={{
                  __html: explanation ?? '',
                }}
              />
            </>
          </div>
        </div>
      ) : null}
      {checkResult === null && (
        <div className={styles.contentTitle}>
          <div className={styles.boxLeftBtn}>
            <div
              className={`${styles.btnSession} ${styles.activeBtn}`}
              onClick={onRestart}
            >
              <p className={styles.textSession}>{t('exam.reload')}</p>
            </div>
            {/* <button
              className={`${styles.btnSession} ${
                !questionIndex ? styles.disabledBtn : styles.activeBtn
              }`}
              disabled={!reviewMode}
              onClick={questionIndex > 0 ? onPrevQuestion : undefined}
            >
              <p className={styles.textSession}>{t('exam.previous')}</p>
            </button> */}
          </div>
          <div
            className={`${styles.btnSession} ${
              hasSelectedAnswer && !isLoading
                ? styles.activeBtn
                : styles.disabledBtn
            }`}
            onClick={
              hasSelectedAnswer && !isLoading ? onCheckAnswer : undefined
            }
          >
            {isLoading ? (
              <Spin
                indicator={
                  <LoadingOutlined
                    spin
                    style={{ color: '#000', fontSize: 24 }}
                  />
                }
              />
            ) : (
              <p className={styles.textSession}>{t('exam.check')}</p>
            )}
          </div>
        </div>
      )}
      {checkResult === 'correct' && (
        <div
          className={styles.contentNotification}
          style={
            showAnswer
              ? {
                  background: '#d1fadf',
                  borderTop: '1px solid var(--Success-400, #32d583)',
                }
              : {}
          }
        >
          {showAnswer ? (
            <div className={styles.boxNotification}>
              <div className={styles.iconCheck}>
                <IconCheck color="#12B76A" />
              </div>
              <div className={styles.textNotification}>
                <p className={styles.textSuccess}>{t('exam.textSuccess')}</p>
                <p className={styles.contentSuccess}>
                  {t('exam.contentSuccess')}
                </p>
              </div>
            </div>
          ) : null}
          <div className={styles.contentBtn} onClick={onNextQuestion}>
            <p className={styles.textBtn}>{t('exam.continue')}</p>
          </div>
        </div>
      )}

      {checkResult === 'wrong' && (
        <div
          className={styles.contentNotification}
          style={
            showAnswer
              ? {
                  background: '#FEF3F2',
                  borderTop: '1px solid var(--Error-500, #F04438)',
                }
              : {}
          }
        >
          {showAnswer ? (
            <div className={styles.boxNotification}>
              <div className={styles.iconCheck}>
                <IconWrong color="#F04438" />
              </div>
              <div className={styles.textNotification}>
                <p className={styles.textSuccess} style={{ color: '#F04438' }}>
                  {t('exam.textSuccessFasle')}
                </p>
                {/* <p className={styles.contentSuccess}>
                Hãy xem lời giải để hiểu bài nhé
              </p> */}
              </div>
            </div>
          ) : null}
          <div
            className={showAnswer ? styles.contentBtnWrong : styles.contentBtn}
            onClick={onNextQuestion}
          >
            <p className={styles.textBtn}>{t('exam.continue')}</p>
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
          <p className={styles.modalTitle}>{t('exam.modalTitle')}</p>
          <div className={styles.contentBox}>
            <div className={styles.modalContent}>
              <div className={styles.modalPoint}>
                <p className={styles.modalText}>{t('exam.modalText')}</p>
                <p className={styles.modalNumber}>
                  {`${correctAnswersCount}/${totalQuestions} `}
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
            <p className={styles.textContent}>{t('exam.reload')}</p>
          </div>
          <div className={styles.btnContent} onClick={onContinue}>
            <p className={styles.textContent}>{t('exam.continueStudying')}</p>
          </div>
        </div>
      </Modal>
    </>
  );
}
