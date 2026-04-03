import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import styles from './MenuVocabulary.module.scss';
import { Progress, Tooltip } from 'antd';
import tick from '#/assets/images/menuVocabulary/tick-circle.png';
import type { PropVocabulary } from '#/api/requests/interface/PropVocabulary/PropVocabulary';
import { IconDot } from '#/assets/svg/externalIcon';

export default function MenuVocabulary({
  data,
  onSelect,
  selectedId,
}: PropVocabulary) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (selectedId && itemRefs.current[selectedId]) {
      itemRefs.current[selectedId].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [selectedId]);

  return (
    <div className={styles.menu}>
      <div className={styles.listTop}>
        <div className={styles.titleBox}>
          <p className={styles.titleCourse}>{t('detailCourse.list')}</p>
          <div className={styles.contentCourse}>
            <p className={styles.textCourse}>4 {t('detailCourse.video')}</p>
            <IconDot color="#FAFAFA" />
            <p className={styles.textCourse}>50 {t('detailCourse.time')}</p>
            <IconDot color="#FAFAFA" />
            <p className={styles.textCourse}>1 {t('detailCourse.session')}</p>
          </div>
        </div>
        <button
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className={styles.toggleButton}
          onClick={toggleMenu}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className={`${styles.boxMenu} ${isMenuOpen ? styles.open : ''}`}>
        {data.map(item => {
          const isActive = selectedId === item.rawId;

          return (
            <div
              className={`${styles.contentMenu} ${isActive ? styles.activeMenu : ''}`}
              key={item.rawId}
              onClick={() => {
                onSelect(item.rawId);
                setIsMenuOpen(false);
              }}
              ref={el => (itemRefs.current[item.rawId] = el)}
            >
              <div className={styles.contentVideo}>
                <div className={styles.icon}>{item.icon}</div>
                <Tooltip title={item.label}>
                  <p className={styles.textVideo}>{item.label}</p>
                </Tooltip>
              </div>
              <div>
                {item.percent === 100 ? (
                  <img alt="Hoàn thành" src={tick} />
                ) : (
                  <Progress
                    className={styles.progress}
                    percent={item.percent}
                    strokeColor={isActive ? '#F37142' : '#F37142'}
                    strokeWidth={12}
                    trailColor={isActive ? '#CCCCCC' : '#CCCCCC'}
                    type="circle"
                    width={20}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
