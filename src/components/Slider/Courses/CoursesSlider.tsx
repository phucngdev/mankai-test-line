import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick';
import styles from './CoursesSlider.module.scss';
import { ArrowIconV2Next, DotIcon } from '#/assets/svg/externalIcon';
import { useSelector } from 'react-redux';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { useNavigate } from 'react-router-dom';
import { getClasByIdUser } from '#/shared/redux/thunk/ClassThunk';

function CoursesSlider() {
  const data = useSelector((state: RootState) => state.class.dataClass);
  const sliderRef = useRef<Slider>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getClasByIdUser());
  }, []);

  const settings = {
    autoplay: false,
    autoplaySpeed: 3000,
    beforeChange: (next: number) => {
      setCurrentSlide(next);
    },
    centerMode: false,
    dots: false,
    focusOnSelect: true,
    infinite: data?.length > 1,
    responsive: [
      {
        breakpoint: 790,
        settings: {
          centerMode: true,
          centerPadding: '20px',
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          centerMode: true,
          centerPadding: '10px',
          slidesToShow: 1,
        },
      },
    ],
    slidesToScroll: 1,
    slidesToShow: data?.length > 1 ? 2 : 1,
    speed: 500,
  };

  const goToSlide = (index: number) => {
    sliderRef.current?.slickGoTo(index);
  };

  const handleDetailCourse = (id: string) => {
    const selectedCourse = data.find(course => course.id === id);

    if (selectedCourse) {
      localStorage.setItem('classId', selectedCourse.classId);
    }

    navigate(`/detail-course/${id}`);
  };

  return (
    <div className={styles.courseSlider}>
      <div className={styles.slider}>
        <Slider {...settings} ref={sliderRef}>
          {data?.map(course => (
            <div className={styles.courseCard} key={course.id}>
              <div className={styles.courseInfo}>
                <div className={styles.courseBoxInfo}>
                  <div className={styles.courseDetails}>
                    <p className={styles.title}>
                      {t('coursesSlider.courseDetails.name')}
                    </p>
                    <h2 className={styles.courseName}>{course.title}</h2>
                  </div>
                  <div className={styles.titleProcess}>
                    <div className={styles.progress}>
                      <div
                        className={styles.progressBar}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span className={styles.status}>
                      {course.progress.toFixed(0)}%
                    </span>
                    <DotIcon />
                    <p className={styles.status}>
                      {t('coursesSlider.courseDetails.contentOne')}{' '}
                      {course.pendingSesson}{' '}
                      {t('coursesSlider.courseDetails.contentTwo')}
                    </p>
                  </div>
                </div>
                <div className={styles.courseImage}>
                  <img alt={course.title} src={course.thumbnailUrl} />
                </div>
              </div>

              <div
                className={styles.continueBtn}
                onClick={() => {
                  handleDetailCourse(course.id);
                }}
              >
                <div className={styles.continue}>
                  <p>{t('coursesSlider.button.continue')}</p>
                  <ArrowIconV2Next className="svg-icon" />
                </div>
                <p className={styles.nextLesson}>
                  {t('coursesSlider.nextLesson')}
                </p>
              </div>
            </div>
          ))}
        </Slider>
      </div>
      <div className={styles.sliderDots}>
        {data?.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              backgroundColor: index === currentSlide ? '#F37142' : '#D0D5DD',
              border: 'none',
              borderRadius: '9999px',
              height: '0.625rem',
              transition: 'all 0.2s ease',
              width: index === currentSlide ? '1.5rem' : '0.625rem',
            }}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}

export default CoursesSlider;
