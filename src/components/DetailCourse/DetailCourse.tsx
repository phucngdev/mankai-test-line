import { useTranslation } from 'react-i18next';
import styles from './DetailCourse.module.scss';
import StartJourney from '#/src/components/StartJourney/StartJourney';
import {
  ArrowIconBack,
  ArrowIconNext,
  IconDot,
} from '#/assets/svg/externalIcon';
import { Pagination, Progress, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchAllSessionByIdCourse } from '#/shared/redux/thunk/SessionThunk';
import { getCourseById } from '#/shared/redux/thunk/CourseThunk';
import { LockOutlined } from '@ant-design/icons';

function DetailCourse(): JSX.Element {
  const { data, totalElement } = useSelector(
    (state: RootState) => state.session,
  );

  const courseById = useSelector((state: RootState) => state.course.dataById);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 12;

  const fetchData = async (page = 1) => {
    if (id) {
      const offset = (page - 1) * limit;
      await Promise.all([
        dispatch(fetchAllSessionByIdCourse({ id, limit, offset })),
        dispatch(getCourseById(id)),
      ]);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [id, currentPage]);

  const filteredData = Array.isArray(data)
    ? data.map(topic => ({ ...topic, key: topic.id }))
    : [];

  const handleVocabulary = (
    sessionId: string,
    lessonId?: string,
    sessionTitle?: string,
  ) => {
    if (!lessonId) {
      message.warning(`Chưa có bài học cho "${sessionTitle}" này!`);
      return;
    }

    navigate(`/vocabulary/${id}/${sessionId}/${lessonId}`, {
      state: { from: `/detail-course/${id}` },
    });
  };

  const lockIndex = filteredData.findIndex(
    item => item.isRequired && item.progress < 100,
  );

  return (
    <div className={styles.home}>
      <main className={styles.main}>
        <div className={styles.list}>
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
                navigate(`/`);
              }}
            >
              {t('banner.homeText')}
            </p>
            <p>/</p>
            <p
              className={styles.courseText}
              onClick={() => {
                navigate(`/list-course`);
              }}
            >
              {t('banner.courseText')}
            </p>
            <p>/</p>
            <p className={styles.topicText}>
              {t('detailCourse.nameCourse')} ”{courseById?.title}”
            </p>
          </div>
          <p className={styles.title}>
            {t('detailCourse.nameCourse')} ”{courseById?.title}”
          </p>
          <div className={styles.courseBox}>
            {filteredData.map((item, index) => {
              const isLocked = lockIndex !== -1 && index > lockIndex;

              return (
                <div
                  className={`${styles.courseContent} ${isLocked ? styles.disabled : ''}`}
                  key={index}
                  onClick={() => {
                    if (isLocked) {
                      message.warning(
                        'Bạn cần hoàn thành 100% chương trước để tiếp tục!',
                      );
                      return;
                    }

                    handleVocabulary(item.id, item.firstLessonId, item.title);
                  }}
                  style={{
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                  }}
                >
                  <div className={styles.titleBox}>
                    <p className={styles.titleCourse}>{courseById?.title}</p>
                    <div className={styles.sessionBox}>
                      <p className={styles.session}>{item.title}</p>
                      {isLocked ? (
                        <LockOutlined style={{ color: '#F37142' }} />
                      ) : null}
                    </div>
                  </div>
                  <div className={styles.boxComplete}>
                    <div className={styles.contentCourse}>
                      <p className={styles.textCourse}>
                        {item.videos} {t('detailCourse.video')}
                      </p>
                      <IconDot />
                      <p className={styles.textCourse}>
                        {item.duration} {t('detailCourse.time')}
                      </p>
                      <IconDot />
                      <p className={styles.textCourse}>
                        {item.tests} {t('detailCourse.session')}
                      </p>
                    </div>
                    <div className={styles.boxProgress}>
                      <Progress
                        className={styles.progress}
                        percent={item.progress}
                        showInfo={false}
                        strokeColor={'#F37142'}
                      />
                      <p className={styles.textComplete}>
                        {item.progress.toFixed(0)}% {t('detailCourse.complete')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div
          style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}
        >
          <Pagination
            current={currentPage}
            onChange={page => setCurrentPage(page)}
            pageSize={limit}
            total={totalElement}
            showSizeChanger={false}
          />
        </div>
        <StartJourney />
      </main>
    </div>
  );
}

export default DetailCourse;
