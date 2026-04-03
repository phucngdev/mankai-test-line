import { useEffect, useState } from 'react';
import styles from './CourseClass.module.scss';
import { useTranslation } from 'react-i18next';

export default function CourseClass({
  selectedCourseId,
  setSelectedCourseId,
  courses,
}: CourseClassProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId, setSelectedCourseId]);

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  const handleSelectCourse = (id: string) => {
    setSelectedCourseId(id);
    setIsOpen(false);
  };

  return (
    <div className={`${styles.course} ${isOpen ? styles.open : ''}`}>
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <p className={styles.title}>{t('coursesSlider.courseDetails.name')}</p>

        <button
          className={`${styles.hamburger} ${isOpen ? styles.active : ''}`}
          onClick={toggleMenu}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={styles.content}>
        {courses.map(course => (
          <p
            className={styles.boxContent}
            key={course.id}
            onClick={() => handleSelectCourse(course.id)}
            style={{
              border: `1px solid ${
                selectedCourseId === course.id ? '#f37142' : '#DDD'
              }`,
              color: selectedCourseId === course.id ? '#f37142' : 'black',
              cursor: 'pointer',
              fontWeight: selectedCourseId === course.id ? 'bold' : 'normal',
            }}
          >
            {course.name}
          </p>
        ))}
      </div>
    </div>
  );
}
