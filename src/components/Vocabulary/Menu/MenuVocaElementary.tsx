import { useTranslation } from 'react-i18next';
import styles from './MenuVocaElementary.module.scss';
import type { PropVocabularyElementory } from '#/api/requests/interface/PropVocabulary/PropVocabulary';
import { IconDot } from '#/assets/svg/externalIcon';

export default function MenuVocaElementary({
  data,
  onSelect,
  selectedId,
}: PropVocabularyElementory) {
  const { t } = useTranslation();

  return (
    <div className={styles.menu}>
      <div className={styles.listTop}>
        <div className={styles.titleBox}>
          <p className={styles.titleCourse}>{t('detailCourse.listEle')}</p>
          <div className={styles.contentCourse}>
            <p className={styles.textCourse}>4 {t('detailCourse.video')}</p>
            <IconDot color="#FAFAFA" />
            <p className={styles.textCourse}>50 {t('detailCourse.time')}</p>
            <IconDot color="#FAFAFA" />
            <p className={styles.textCourse}>1 {t('detailCourse.session')}</p>
          </div>
        </div>
        <svg
          fill="none"
          height="171"
          style={{ left: '15%', position: 'absolute', top: 0 }}
          viewBox="0 0 141 171"
          width="141"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g opacity="0.3">
            <g style={{ mixBlendMode: 'soft-light' }}>
              <rect
                fill="#FBD3C4"
                height="202.565"
                transform="rotate(-27.1119 17.7229 -9.86328)"
                width="20.0521"
                x="17.7229"
                y="-9.86328"
              />
            </g>
            <g style={{ mixBlendMode: 'soft-light' }}>
              <rect
                fill="#FBD3C4"
                height="202.565"
                transform="rotate(-27.1119 44.9741 -9.86328)"
                width="3.63027"
                x="44.9741"
                y="-9.86328"
              />
            </g>
            <g style={{ mixBlendMode: 'soft-light' }}>
              <rect
                fill="#FBD3C4"
                height="202.565"
                transform="rotate(-27.1119 0.430664 -9.86328)"
                width="9.53088"
                x="0.430664"
                y="-9.86328"
              />
            </g>
          </g>
        </svg>
      </div>

      <div className={styles.boxMenu}>
        {data.map(item => {
          const isActive = selectedId === item.id;
          return (
            <div
              className={`${styles.contentMenu} ${isActive ? styles.activeMenu : ''}`}
              key={item.id}
              onClick={() => onSelect(item.id)}
            >
              <div className={styles.contentVideo}>
                <p className={styles.textVideo}>{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
