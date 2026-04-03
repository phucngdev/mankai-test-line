import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import styles from './SpecialStreaks.module.scss';
import fire from 'src/assets/images/specialStreaks/fireStreaks.png';
import { IconNext, IconPrev } from '#/assets/svg/externalIcon';

function SpecialStreaks(): JSX.Element {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getWeekDays = (
    baseDate: Date,
  ): { date: number; day: string; isActive: boolean; fullDate: Date }[] => {
    const result = [];
    const weekdaysShort = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);

      result.push({
        date: date.getDate(),
        day: weekdaysShort[date.getDay()],
        fullDate: date,
        isActive: false,
      });
    }

    return result;
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const weekDays = getWeekDays(currentDate);
  const displayMonthYear = weekDays[0].fullDate.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={styles.streaksBox}>
      <div className={styles.contentBox}>
        <div className={styles.iconStreak}>
          <img alt={t('streak.fireAlt')} src={fire} />
          <p className={styles.text}> {t('streak.text')}</p>
        </div>

        <p className={styles.textDate}> {displayMonthYear}</p>
      </div>

      <div className={styles.dateTime}>
        <p className={styles.text}> {t('streak.week')}</p>
        <div className={styles.btnDate}>
          <div className={styles.btn} onClick={handlePrevWeek}>
            <IconPrev />
          </div>
          <div className={styles.btn} onClick={handleNextWeek}>
            <IconNext />
          </div>
        </div>
      </div>

      <div className={styles.dateBox}>
        {weekDays.map((dayInfo, index) => (
          <div
            className={`${styles.date} ${dayInfo.isActive ? styles.active : ''}`}
            key={index}
          >
            <p className={styles.textWeek}>{t(`weekDays.${dayInfo.day}`)}</p>
            <p className={styles.textNumber}>{dayInfo.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SpecialStreaks;
