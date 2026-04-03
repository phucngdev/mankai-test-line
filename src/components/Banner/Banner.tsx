import { useTranslation } from 'react-i18next';
import styles from './Banner.module.scss';
import avatar from 'src/assets/images/header/avatardefault.jpg';
import cup from 'src/assets/images/banner/cup.png';
import star from 'src/assets/images/banner/star.png';
import {
  ArrowIconBack,
  ArrowIconNext,
  StreakIcon,
} from '#/assets/svg/externalIcon';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { useSelector } from 'react-redux';
import { getProfile } from '#/shared/redux/thunk/UserThunk';
import { useResetDataOnLogout } from '#/shared/hooks/useResetDataOnLogout';

function Banner(): JSX.Element {
  const { data } = useSelector((state: RootState) => state.user);
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!Cookies.get('refreshToken'),
  );

  return (
    <section className={styles.banner}>
      <div className={styles.bannerTop}>
        <div className={styles.arrowIcons}>
          <ArrowIconBack height={24} width={24} />
          <ArrowIconNext height={24} width={24} />
        </div>
        <p className={styles.homeText}>{t('banner.homeText')}</p>
        <p>/</p>
        <p className={styles.courseText}>{t('banner.courseText')}</p>
      </div>

      {isLoggedIn && data ? (
        <div className={styles.userInfo}>
          <div className={styles.userDetails}>
            <img
              alt={data.fullName}
              className={styles.userAvatar}
              src={data.avatarUrl || avatar}
            />
            <div className={styles.userText}>
              <div className={styles.userMajor}>
                <p className={styles.userName}>{data.fullName}</p>
                <div className={styles.detailMajor}>
                  <p>{data.level}</p>
                </div>
              </div>
              <div className={styles.userLocation}>
                <p>{data.email}</p> | <p>{data.address}</p>
              </div>
            </div>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statIcon}>
                <StreakIcon height={20} width={20} />
                <p className={styles.textIcon}>54</p>
              </div>
              <p>{t('banner.streaks')}</p>
            </div>
            <span className={styles.lineLeft}>|</span>
            <div className={styles.stat}>
              <div className={styles.statIcon}>
                <img alt="cup" src={cup} />
                <p className={styles.textIcon}>5</p>
              </div>
              <p>{t('banner.ranking')}</p>
            </div>
            <span className={styles.lineLeft}>|</span>
            <div className={styles.stat}>
              <div className={styles.statIcon}>
                <img alt="star" src={star} />
                <p className={styles.textIcon}>41</p>
              </div>
              <p>{t('banner.experiencePoints')}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Banner;
