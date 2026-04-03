import type { TestCategoryEntity } from '#/api/requests';
import {
  ArrowIconBack,
  ArrowIconNext,
  ArrowRight,
  IconDot,
} from '#/assets/svg/externalIcon';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { fetchAllMocKTest } from '#/shared/redux/thunk/MockTestThunk';
import StartJourney from '#/src/components/StartJourney/StartJourney';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './ListMockTest.module.scss';

import { Tooltip } from 'antd';

function ListMockTest(): React.ReactElement {
  const data = useSelector((state: RootState) => state.mockTest.data);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const pagination = {
    current: 1,
    limit: 10,
    offset: 0,
  };

  const handleDetailCourse = (mockTest: TestCategoryEntity) => {
    navigate(`/detail-mock-test/${mockTest.id}`);
  };

  useEffect(() => {
    // lấy user từ localStorage
    const userStr = Cookies.get('user');
    const user = userStr ? JSON.parse(userStr) : null;

    let userId: string | undefined;

    if (user) {
      try {
        // const parsed = JSON.parse(user);
        userId = user?.id; // hoặc parsed.userId tuỳ theo key bạn lưu
      } catch (error) {
        console.error('Lỗi parse user từ localStorage:', error);
      }
    }

    if (userId) {
      dispatch(
        fetchAllMocKTest({
          limit: pagination.limit,
          offset: pagination.offset,
          userId,
        }),
      );
    }
  }, [dispatch, pagination.limit, pagination.offset]);

  const filteredData = Array.isArray(data)
    ? data.map(mock => ({ ...mock, key: mock.id }))
    : [];

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
              {t('banner.homeText')}{' '}
            </p>
            <p>/</p>
            <p
              className={styles.topicText}
              onClick={() => {
                navigate('/mock-test');
              }}
            >
              {t('banner.mocktest')}
            </p>
          </div>

          <p className={styles.title}>{t('banner.mocktest')}</p>

          <div className={styles.list}>
            {filteredData.map(mock => (
              <div className={styles.courseCard} key={mock.id}>
                <div className={styles.courseInfo}>
                  <div className={styles.courseBox}>
                    <div className={styles.boxTitle}>
                      <p className={styles.text}>{t('mocktest.exam')}</p>

                      <Tooltip
                        color="#fff"
                        overlayInnerStyle={{
                          color: '#3d3d3d',
                          padding: '8px 12px',
                          borderRadius: '8px',
                        }}
                        title={mock.name}
                        placement="topLeft"
                        mouseEnterDelay={0.5}
                      >
                        <h3 className={styles.courseName}>{mock.name}</h3>
                      </Tooltip>
                    </div>
                    <div className={styles.boxLesson}>
                      <p className={styles.allLessons}>
                        {mock.numberOfTests} {t('mocktest.examTest')}
                      </p>
                      <IconDot color="#F37142" />
                      <p className={styles.allLessons}>
                        {mock.numberOfParticipants} {t('mocktest.participants')}
                      </p>
                    </div>
                  </div>
                  <div className={styles.courseImage}>
                    <img alt={mock.name} src={mock.imageUrl} />
                  </div>
                </div>
                <div
                  className={styles.cardButton}
                  onClick={() => handleDetailCourse(mock)}
                >
                  <p>{t('mocktest.btnSub')}</p>
                  <ArrowRight color="#fff" />
                </div>
              </div>
            ))}
          </div>
          <StartJourney />
        </main>
      </div>
    </>
  );
}

export default ListMockTest;
