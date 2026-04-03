import { useTranslation } from 'react-i18next';
import styles from './Courses.module.scss';
import CoursesSlider from '../Slider/Courses/CoursesSlider';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { useNavigate } from 'react-router-dom';
import { getClasByIdUser } from '#/shared/redux/thunk/ClassThunk';
import Cookies from 'js-cookie';

function Courses(): JSX.Element | null {
  const data = useSelector((state: RootState) => state.class.dataClass);
  const refreshToken = Cookies.get('refreshToken');
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    if (refreshToken) {
      dispatch(getClasByIdUser());
    }
  }, []);
  const navigate = useNavigate();

  return refreshToken ? (
    <section className={styles.courses}>
      <div className={styles.title}>
        <div className={styles.flex}>
          <h1 className={styles.text}>{t('courses.title')}</h1>
          <div className={styles.number}>
            <span>{data?.length}</span>
          </div>
        </div>
        <a
          className={styles.viewAll}
          onClick={() => {
            navigate('/list-course');
          }}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t('courses.viewAll')}
        </a>
      </div>
      <CoursesSlider />
    </section>
  ) : (
    <></>
  );
}

export default Courses;
