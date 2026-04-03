import { useTranslation } from 'react-i18next';
import styles from './StartJourney.module.scss';
import { ArrowUpRight } from '#/assets/svg/externalIcon';

function StartJourney(): JSX.Element {
  const { t } = useTranslation(); // Hook i18n

  return (
    <section className={styles.startJourney}>
      <div className={styles.left}>
        <p className={styles.title}>{t('startJourney.title')}</p>
        <p className={styles.description}>{t('startJourney.description')}</p>
      </div>
      <div className={styles.right}>
        <div className={styles.contact}>
          <p>{t('startJourney.contact')}</p>
        </div>
        <div className={styles.sales}>
          <p>{t('startJourney.sales.text')}</p>
          <ArrowUpRight />
        </div>
      </div>
    </section>
  );
}

export default StartJourney;
