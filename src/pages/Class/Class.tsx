import { ArrowIconBack, ArrowIconNext } from '#/assets/svg/externalIcon';
import { useNavigate } from 'react-router-dom';
import styles from './Class.module.scss';
import { useTranslation } from 'react-i18next';
import { BookBookmark, CalendarCheck, User } from 'phosphor-react';
import { useEffect, useState } from 'react';
import ListClass from './ListClass';
import CourseClass from './CourseClass';
import sensei from 'src/assets/images/specialRanking/sensei.png';
import { useSelector } from 'react-redux';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { getAllClass, getClassById } from '#/shared/redux/thunk/ClassThunk';
import type { TabsProps } from 'antd';
import { Tabs } from 'antd';
import { resetDataClassById } from '#/shared/redux/slices/ClassSlice';
import Loading from '#/shared/components/loading/Loading';

export default function Class() {
  const data = useSelector((state: RootState) => state.class.dataAllClass);
  const dataClassById = useSelector(
    (state: RootState) => state.class.dataClassById,
  );

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [activeClassId, setActiveClassId] = useState<string>('');
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    dispatch(getAllClass())
      .unwrap()
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch]);

  useEffect(() => {
    const savedClassId = localStorage.getItem('activeClassId');

    if (savedClassId) {
      setActiveClassId(savedClassId);
    } else if (data[0]?.id) {
      setActiveClassId(data[0]?.id);
    }
  }, [data]);

  useEffect(() => {
    if (activeClassId) {
      localStorage.setItem('activeClassId', activeClassId);
      dispatch(getClassById({ id: activeClassId }))
        .unwrap()
        .then(res => {
          if (res.data?.courses?.length > 0) {
            const savedCourseId = localStorage.getItem('selectedCourseId');

            if (
              savedCourseId &&
              res.data.courses.some((c: any) => c.id === savedCourseId)
            ) {
              setSelectedCourseId(savedCourseId);
            } else {
              setSelectedCourseId(res.data.courses[0].id);
              localStorage.setItem('selectedCourseId', res.data.courses[0].id);
            }
          } else {
            setSelectedCourseId('');
          }
        });
    }
  }, [activeClassId, dispatch]);

  useEffect(() => {
    const savedCourseId = localStorage.getItem('selectedCourseId');

    if (
      savedCourseId &&
      dataClassById?.courses?.some(c => c.id === savedCourseId)
    ) {
      setSelectedCourseId(savedCourseId);
    } else if (dataClassById?.courses?.[0]?.id) {
      setSelectedCourseId(dataClassById.courses[0].id);
    } else {
      setSelectedCourseId('');
    }
  }, [dataClassById]);

  const onChange = (key: string) => {
    dispatch(resetDataClassById());
    setActiveClassId(key);
  };

  const items: TabsProps['items'] = data.map((classItem, index) => ({
    children: (
      <>
        <div className={styles.boxClass}>
          <div className={styles.content}>
            <p className={styles.titleClass}>
              {dataClassById?.name || 'Tên lớp'}
            </p>

            <div className={styles.formClass}>
              <div className={styles.iconClass}>
                <BookBookmark color="#f37142" size={24} weight="fill" />
                <div className={styles.contentClass}>
                  <p className={styles.title}>{t('teacher.ceremony')}:</p>
                  <p className={styles.time}>
                    {dataClassById?.startDate
                      ? `${new Date(dataClassById.startDate).toLocaleDateString('vi-VN')} `
                      : 'Chưa rõ'}
                  </p>
                </div>
              </div>
              <div className={styles.iconClass}>
                <CalendarCheck color="#f37142" size={24} weight="fill" />
                <div className={styles.contentClass}>
                  <p className={styles.title}>{t('teacher.end')}:</p>
                  <p className={styles.time}>
                    {dataClassById?.endDate
                      ? `${new Date(dataClassById.endDate).toLocaleDateString('vi-VN')} `
                      : 'Chưa rõ'}
                  </p>
                </div>
              </div>
              <div className={styles.iconClass}>
                <User color="#f37142" size={24} weight="fill" />
                <div className={styles.contentClass}>
                  <p className={styles.title}>{t('teacher.sensei')}:</p>
                  <p className={styles.content}>
                    {dataClassById?.teachers?.[0]?.fullName || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.imgClass}>
            <img alt="" src={sensei} width={250} />
          </div>
        </div>
        <div className={styles.course}>
          <CourseClass
            courses={
              dataClassById?.courses?.map(course => ({
                id: course.id,
                name: course.title || 'Không tên',
              })) || []
            }
            selectedCourseId={selectedCourseId}
            setSelectedCourseId={(id: string) => {
              setSelectedCourseId(id);
              localStorage.setItem('selectedCourseId', id);
            }}
          />
        </div>
      </>
    ),
    key: classItem.id,
    label: classItem.name || `Lớp ${index + 1}`,
  }));
  if (loading) return <Loading />;
  return (
    <div>
      <main className={styles.main}>
        <div className={styles.listTop}>
          <div className={styles.arrowIcons}>
            <ArrowIconBack
              height={24}
              onClick={() => navigate(-1)}
              width={24}
            />
            <ArrowIconNext
              height={24}
              onClick={() => navigate(+1)}
              width={24}
            />
          </div>
          <p className={styles.homeText} onClick={() => navigate(`/`)}>
            {t('banner.homeText')}
          </p>
          <p>/</p>
          {/* <p className={styles.topicText} onClick={() => navigate(`/class`)}>
            {t('header.class')}
          </p> */}
        </div>
        <Tabs
          activeKey={activeClassId}
          defaultActiveKey={data[0]?.id}
          items={items}
          onChange={onChange}
        />
        {dataClassById?.id && selectedCourseId ? (
          <ListClass
            classId={dataClassById?.id}
            selectedCourseId={selectedCourseId}
          />
        ) : null}
      </main>
    </div>
  );
}
