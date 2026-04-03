import type { TitleVocabularyProps } from '#/api/requests/interface/PropVocabulary/PropVocabulary';
import { ArrowRight } from '#/assets/svg/externalIcon';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import styles from './TitleVocabulary.module.scss';

export default function TitleVocabulary({
  isAnyCompleted,
  title = 'Tên bài học',
  description,
  icon,
  onClickNext,
}: TitleVocabularyProps) {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ behavior: 'smooth', top: 0 });
  }, [location.pathname]);
  return (
    <div className={styles.content}>
      <div className={styles.boxVideo}>
        <div className={styles.iconVideo}>{icon}</div>
        <div className={styles.contentVideo}>
          <p className={styles.nameTitle}>{title}</p>
          <p className={styles.textTitle}>
            {description ?? t('vocabulary.formVideo.textTitle')}
          </p>
        </div>
      </div>
      <div className={styles.boxButton}>
        {/* <div
          className={`${styles.btnSession} ${
            !isAnyCompleted ? styles.disabledBtn : styles.activeBtn
          }`}
          onClick={isAnyCompleted ? onClickNext : undefined}
        >
          <p className={styles.textSession}>Lịch sử bài làm</p>
        </div> */}
        <div
          className={`${styles.btnSession} ${
            !isAnyCompleted ? styles.disabledBtn : styles.activeBtn
          }`}
          onClick={isAnyCompleted ? onClickNext : undefined}
        >
          <p className={styles.textSession}>
            {t('vocabulary.formVideo.textSession')}
          </p>
          <div className={styles.iconSession}>
            <ArrowRight />
          </div>
        </div>
      </div>
    </div>
  );
}
