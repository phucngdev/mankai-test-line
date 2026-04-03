import styles from './ListCourse.module.scss';
import StartJourney from '#/src/components/StartJourney/StartJourney';
import { useTranslation } from 'react-i18next';
import {
  ArrowIconBack,
  ArrowIconNext,
  PlayIcon,
} from '#/assets/svg/externalIcon';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { useEffect, useState } from 'react';
import { getClasByIdUser } from '#/shared/redux/thunk/ClassThunk';
import Cookies from 'js-cookie';

function ListCourse(): JSX.Element | null {
  const data = useSelector((state: RootState) => state.class.dataClass);
  const [hasToken, setHasToken] = useState<boolean>(true);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getClasByIdUser());
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      const token = Cookies.get('accessToken');
      setHasToken(!!token);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const handleDetailCourse = (id: string) => {
    const selectedCourse = data.find(course => course.id === id);

    if (selectedCourse) {
      localStorage.setItem('classId', selectedCourse.classId);
    }

    navigate(`/detail-course/${id}`);
  };

  return (
    <>
      <div className={styles.home}>
        <main className={styles.main}>
          <div className={styles.listTop}>
            <div className={styles.arrowIcons}>
              <ArrowIconBack
                height={24}
                onClick={() => {
                  navigate(-1);
                }}
                width={24}
              />
              <ArrowIconNext
                height={24}
                onClick={() => {
                  navigate(+1);
                }}
                width={24}
              />
            </div>
            <p
              className={styles.homeText}
              onClick={() => {
                navigate('/');
              }}
            >
              {t('banner.homeText')}
            </p>
            <p>/</p>
            <p
              className={styles.courseText}
              onClick={() => {
                navigate('/');
              }}
            >
              {t('banner.courseText')}
            </p>
            <p>/</p>

            <p
              className={styles.topicText}
              onClick={() => {
                navigate(`/list-course`);
              }}
            >
              {t('banner.course')}
            </p>
          </div>

          <p className={styles.title}> {t('banner.course')}</p>

          <div className={styles.list}>
            {hasToken
              ? data.map(course => (
                  <div className={styles.courseCard} key={course.id}>
                    <div className={styles.courseImage}>
                      <img alt={course.title} src={course.thumbnailUrl} />
                    </div>
                    <div className={styles.courseInfo}>
                      <div>
                        <p className={styles.text}>
                          {t('coursesSlider.courseDetails.name')}
                        </p>{' '}
                        <h3 className={styles.courseName}>{course.title}</h3>
                        <p className={styles.allLessons}>
                          {course.sessonCount}{' '}
                          {t('coursesSlider.courseDetails.textCourse')}{' '}
                        </p>
                      </div>
                      <div
                        className={styles.cardButton}
                        onClick={() => handleDetailCourse(course.id)}
                      >
                        <PlayIcon color="#fff" />
                      </div>
                    </div>
                  </div>
                ))
              : null}
          </div>
          <StartJourney />
        </main>
      </div>
    </>
  );
}

export default ListCourse;
