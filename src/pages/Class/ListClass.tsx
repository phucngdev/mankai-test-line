import { useEffect, useState } from 'react';
import styles from './ListClass.module.scss';
import { useSelector } from 'react-redux';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { getSessonSchedules } from '#/shared/redux/thunk/SessonScheduleThunk';
import { useNavigate } from 'react-router-dom';
import { resetData, setData } from '#/shared/redux/slices/SessonSchedulesSlice';
import { getExamReults } from '#/shared/redux/thunk/ExamReultsThunk';
import Loading from '#/shared/components/loading/Loading';
import { useTranslation } from 'react-i18next';

interface ListClassProps {
  selectedCourseId: string;
  classId: string;
}

export default function ListClass({
  selectedCourseId,
  classId,
}: ListClassProps) {
  const { data, totalElement } = useSelector(
    (state: RootState) => state.sessonSchedules,
  );
  const dataExamResult = useSelector(
    (state: RootState) => state.examResult.dataExamResult,
  );
  const [activeTab, setActiveTab] = useState<'lichhoc' | 'ketqua' | 'xephang'>(
    'lichhoc',
  );
  const { t } = useTranslation();

  const [openSessonIds, setOpenSessonIds] = useState<{
    [key: number]: string | null;
  }>({});
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    current: 1,
    limit: 400,
    offset: 0,
  });

  const [pendingScroll, setPendingScroll] = useState<null | {
    index: number;
    sessonId: string;
    lessonId: string;
  }>(null);

  const handleNavigate = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      return;
    }

    e.preventDefault();
    navigate(path);
  };

  const fetchaData = async (isLoadMore = false) => {
    if (!classId && !selectedCourseId) return;
    setLoading(true);

    try {
      const [sessonRes] = await Promise.all([
        dispatch(
          getSessonSchedules({
            classId,
            courseId: selectedCourseId,
            limit: pagination.limit,
            offset: pagination.offset,
          }),
        ),
        dispatch(
          getExamReults({
            classId,
            courseId: selectedCourseId,
          }),
        ),
      ]);

      if (isLoadMore && sessonRes.payload?.data) {
        dispatch(
          setData({
            data: [...data, ...sessonRes.payload.data],
            totalElement,
          }),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchaData(pagination.offset > 0);
  }, [classId, selectedCourseId, pagination.offset]);

  useEffect(() => {
    dispatch(resetData());
    setPagination({ current: 1, limit: 400, offset: 0 });
  }, [selectedCourseId]);

  useEffect(() => {
    const saved = sessionStorage.getItem('lastClassScroll');

    if (saved) {
      setPendingScroll(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (!pendingScroll) return;

    const { index, sessonId, lessonId } = pendingScroll;

    const hasData = data.some(item =>
      item.sessons.some(
        s => s.id === sessonId && s.lessons.some(l => l.id === lessonId),
      ),
    );

    if (!hasData && data.length < totalElement) {
      setPagination(prev => ({
        ...prev,
        current: prev.current + 1,
        offset: prev.offset + prev.limit,
      }));
      return;
    }

    if (hasData) {
      setOpenSessonIds(prev => ({ ...prev, [index]: sessonId }));
      setTimeout(() => {
        const el = document.getElementById(`class-item-${index}`);

        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      sessionStorage.removeItem('lastClassScroll');
      setPendingScroll(null);
    }
  }, [data, pendingScroll, totalElement]);

  const toggleSesson = (itemIndex: number, sessonId: string) => {
    setOpenSessonIds(prev => ({
      ...prev,
      [itemIndex]: prev[itemIndex] === sessonId ? null : sessonId,
    }));
  };

  if (loading) return <Loading />;
  return (
    <div className={styles.listClass}>
      <div className={styles.filterClass}>
        <a
          className={activeTab === 'lichhoc' ? styles.active : ''}
          href="#"
          onClick={e => {
            e.preventDefault();
            setActiveTab('lichhoc');
          }}
        >
          {t('class.room')}
        </a>
        <a
          className={activeTab === 'ketqua' ? styles.active : ''}
          href="#"
          onClick={e => {
            e.preventDefault();
            setActiveTab('ketqua');
          }}
        >
          {t('class.result')}
        </a>
      </div>

      {activeTab === 'lichhoc' && (
        <>
          <div className={styles.boxListClass}>
            {data.map((item, index) => {
              const date = new Date(item.dueDate);
              const formattedDate = date.toLocaleDateString('vi-VN');
              return (
                <div
                  className={styles.classItem}
                  id={`class-item-${index}`}
                  key={`${item.sessons[0]?.id}-${index}`}
                >
                  <p className={styles.title}>
                    {t('class.session')}{' '}
                    <span className={styles.number}>{index + 1}</span>
                  </p>
                  <div className={styles.content}>
                    <div className={styles.boxStatus}>
                      <p>
                        {t('class.date')}: {formattedDate}
                      </p>
                    </div>

                    <div className={styles.boxSesson}>
                      {item.sessons.map(sessons => (
                        <div key={`${sessons.id}-${index}`}>
                          <div
                            className={`${styles.classSesson} ${openSessonIds[index] === sessons.id ? styles.activeSesson : ''}`}
                            onClick={() => toggleSesson(index, sessons.id)}
                          >
                            <p>{sessons.title}</p>
                            <p
                              className={`${styles.status} ${
                                sessons.isCompleted
                                  ? sessons.isLated
                                    ? styles.statusCompletedLate
                                    : styles.statusCompleted
                                  : sessons.isLated
                                    ? styles.statusLate
                                    : styles.statusInProgress
                              }`}
                            >
                              <span style={{ color: 'black' }}>
                                {t('class.status')}:
                              </span>{' '}
                              {sessons.isCompleted
                                ? sessons.isLated
                                  ? t('class.completedLate')
                                  : t('class.doneTask')
                                : sessons.isLated
                                  ? t('class.late')
                                  : t('class.notDone')}
                            </p>
                          </div>
                          {openSessonIds[index] === sessons.id && (
                            <div className={styles.boxLesson}>
                              {sessons.lessons && sessons.lessons.length > 0 ? (
                                sessons.lessons.map(lesson => (
                                  <a
                                    className={styles.classLesson}
                                    href={`/vocabulary/${selectedCourseId}/${sessons.id}/${lesson.id}`}
                                    key={lesson.id}
                                    onClick={e => {
                                      sessionStorage.setItem(
                                        'lastClassScroll',
                                        JSON.stringify({
                                          index,
                                          lessonId: lesson.id,
                                          sessonId: sessons.id,
                                        }),
                                      );
                                      handleNavigate(
                                        e,
                                        `/vocabulary/${selectedCourseId}/${sessons.id}/${lesson.id}`,
                                      );
                                    }}
                                  >
                                    {lesson.title}
                                  </a>
                                ))
                              ) : (
                                <p className={styles.noLesson}>
                                  {t('class.noLesson')}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {activeTab === 'ketqua' && (
        <div className={styles.resultBox}>
          {dataExamResult && dataExamResult.length > 0 ? (
            dataExamResult.map((result, index) => (
              <div className={styles.resultItem} key={index}>
                <div className={styles.title}>
                  <p>{index + 1}</p>
                  <p>{result.examName}</p>
                </div>
                <p>{result.point.toFixed(2)}/10</p>
              </div>
            ))
          ) : (
            <p>{t('class.noResult')}.</p>
          )}
        </div>
      )}
    </div>
  );
}
