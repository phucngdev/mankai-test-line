import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './GlobalCourses.module.scss';
import { PlayIcon } from '#/assets/svg/externalIcon';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';

import imgcourse from '#/assets/images/globalCourses/bannerCourse.png';
import { getClasByIdUser } from '#/shared/redux/thunk/ClassThunk';
import Cookies from 'js-cookie';

function GlobalCourses(): JSX.Element | null {
  const data = useSelector((state: RootState) => state.class.dataClass);
  const { t } = useTranslation();
  const refreshToken = Cookies.get('refreshToken');

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (refreshToken) {
      dispatch(getClasByIdUser());
    }
  }, []);

  const handleListCourse = () => {
    navigate('/list-course');
  };

  const handleDetailCourse = (id: string) => {
    const selectedCourse = data.find(course => course.id === id);

    if (selectedCourse) {
      localStorage.setItem('classId', selectedCourse.classId);
    }

    navigate(`/detail-course/${id}`);
  };

  return (
    <section className={styles.globalCourses}>
      <div className={styles.title}>
        <div className={styles.flex}>
          <h1 className={styles.text}>{t('courses.titleCourse')}</h1>
          <div className={styles.number}>
            <span>{data?.length + 1}</span>
          </div>
        </div>
        <button
          className={styles.viewAll}
          onClick={handleListCourse}
          type="button"
        >
          {t('courses.viewAll')}
        </button>
      </div>
      <div className={styles.list}>
        <div
          className={styles.courseCard}
          onClick={() => navigate('/Vocabulary-Elementary')}
        >
          <div className={styles.courseImage}>
            <img alt="course" src={imgcourse} />
          </div>
          <div className={styles.courseInfo}>
            <div>
              <p className={styles.text}>
                {t('coursesSlider.courseDetails.name')}
              </p>
              <h3 className={styles.courseName}>Sơ cấp</h3>
              <p className={styles.allLessons}>
                3 {t('coursesSlider.courseDetails.textCourse')}{' '}
              </p>
            </div>
            <div className={styles.cardButton}>
              <PlayIcon color="#fff" />
            </div>
          </div>
        </div>
        {data?.map(course => (
          <div
            className={styles.courseCard}
            key={course.id}
            onClick={() => handleDetailCourse(course.id)}
          >
            <div className={styles.courseImage}>
              <img alt={course.title} src={course.thumbnailUrl} />
            </div>
            <div className={styles.courseInfo}>
              <div>
                <p className={styles.text}>
                  {t('coursesSlider.courseDetails.name')}
                </p>
                <h3 className={styles.courseName}>{course.title}</h3>
                <p className={styles.allLessons}>
                  {course.sessonCount}{' '}
                  {t('coursesSlider.courseDetails.textCourse')}
                </p>
              </div>
              <div className={styles.cardButton}>
                <PlayIcon color="#fff" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default GlobalCourses;
