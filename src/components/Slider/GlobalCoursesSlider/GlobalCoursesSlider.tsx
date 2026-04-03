import styles from './GlobalCoursesSlider.module.scss';
import Slider from 'react-slick';
import { useRef } from 'react';
import arrowleft from '/src/assets/images/banner/arrow-left.png';
import arrowright from '/src/assets/images/banner/arrow-right.png';
import imageCourse from 'src/assets/images/globalCourses/bannerCourse.png';

function GlobalCoursesSlider() {
  const sliderRef = useRef<Slider>(null);

  const settings = {
    autoplay: true,
    autoplaySpeed: 3000,
    centerMode: false,
    dots: false,
    focusOnSelect: true,
    infinite: true,
    slidesToScroll: 1,
    slidesToShow: 2, // This will display 3 cards per row
    speed: 500,
  };

  const data = [
    {
      allLesson: 54,
      id: 1,
      img: imageCourse,
      name: 'Tiếng Nhật sơ cấp',
    },
    {
      allLesson: 54,
      id: 2,
      img: imageCourse,
      name: 'Tiếng Nhật N5',
    },
    {
      allLesson: 54,
      id: 3,
      img: imageCourse,
      name: 'Tiếng Nhật sơ cấp',
    },
    {
      allLesson: 54,
      id: 4,
      img: imageCourse,
      name: 'Tiếng Nhật N5',
    },
    {
      allLesson: 54,
      id: 5,
      img: imageCourse,
      name: 'Tiếng Nhật sơ cấp',
    },
    {
      allLesson: 54,
      id: 6,
      img: imageCourse,
      name: 'Tiếng Nhật N5',
    },
  ];

  const goToPrev = () => {
    sliderRef.current?.slickPrev();
  };

  const goToNext = () => {
    sliderRef.current?.slickNext();
  };

  return (
    <>
      <div className={styles.globalCoursesSlider}>
        <div className={styles.slider}>
          <Slider {...settings} ref={sliderRef}>
            {data.map(course => (
              <div className={styles.courseCard} key={course.id}>
                <div className={styles.courseImage}>
                  <img alt={course.name} src={course.img} />
                </div>
                <div className={styles.courseInfo}>
                  <h3 className={styles.courseName}>{course.name}</h3>
                  <p className={styles.allLessons}>
                    {course.allLesson} bài học
                  </p>
                </div>
                <div className={styles.cardButton}>
                  <button className={styles.button} type="button">
                    Tiếp tục học
                  </button>
                </div>
              </div>
            ))}
          </Slider>
        </div>
        <div className={styles.arrowButtons}>
          <div className={styles.arrowLeft} onClick={goToPrev}>
            <img alt="Previous" src={arrowleft} />
          </div>
          <div className={styles.arrowRight} onClick={goToNext}>
            <img alt="Next" src={arrowright} />
          </div>
        </div>
      </div>
    </>
  );
}

export default GlobalCoursesSlider;
