import type { TestEntity } from '#/api/requests';
import {
  ArrowIconBack,
  ArrowIconNext,
  ArrowUpRight,
  IconClock,
  IconDot,
  IconPeople,
} from '#/assets/svg/externalIcon';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import {
  getByIdMockTest,
  getTestByIdMockTest,
  joinTest,
} from '#/shared/redux/thunk/MockTestThunk';
import StartJourney from '#/src/components/StartJourney/StartJourney';
import { Modal, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './DetailMockTest.module.scss';

function DetailMockTest(): JSX.Element {
  const { dataById, dataMockTest } = useSelector(
    (state: RootState) => state.mockTest,
  );
  const [selectedTest, setSelectedTest] = useState<TestEntity | null>(null);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const pagination = {
    current: 1,
    limit: 20,
    offset: 0,
  };

  const fetchData = async () => {
    if (id) {
      await Promise.all([
        dispatch(
          getTestByIdMockTest({
            id,
            limit: pagination.limit,
            offset: pagination.offset,
            status: 'PUBLISHED',
          }),
        ),
        dispatch(
          getByIdMockTest({
            id,
          }),
        ),
      ]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleNavigate = async (mockTest: TestEntity) => {
    try {
      await dispatch(joinTest({ testId: mockTest.id })).unwrap();
    } catch (error) {
      console.error('Failed to join test:', error);
    }
    navigate(`/mock-test-exam/${mockTest.id}`);
  };

  const filteredData = Array.isArray(dataById)
    ? dataById.map(mock => ({ ...mock, key: mock.id }))
    : [];

  return (
    <>
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
                  navigate('/');
                }}
              >
                {t('banner.homeText')}
              </p>
              <p className={styles.slash}>/</p>
              <p
                className={styles.courseText}
                onClick={() => {
                  navigate('/mock-test');
                }}
              >
                {t('banner.mocktest')}
              </p>

              <p className={styles.slash}>/</p>
              <Tooltip
                color="#fff"
                overlayInnerStyle={{
                  color: '#3d3d3d',
                  padding: '8px 12px',
                  borderRadius: '8px',
                }}
                title={dataMockTest?.name}
                placement="bottomLeft"
                mouseEnterDelay={0.5}
              >
                <p className={styles.topicText}>{dataMockTest?.name}</p>
              </Tooltip>
            </div>

            <p className={styles.title}>
              {t('banner.examTest')} "{dataMockTest?.name}"
            </p>

            <div className={styles.courseBox}>
              {filteredData.map((item, index) => (
                <div className={styles.courseContent} key={index}>
                  <div className={styles.titleBox}>
                    <Tooltip
                      color="#fff"
                      overlayInnerStyle={{
                        color: '#3d3d3d',
                        padding: '8px 12px',
                        borderRadius: '8px',
                      }}
                      title={dataMockTest?.name}
                      placement="topLeft"
                      mouseEnterDelay={0.5}
                    >
                      <p className={styles.titleCourse}>{dataMockTest?.name}</p>
                    </Tooltip>
                    <Tooltip
                      color="#fff"
                      overlayInnerStyle={{
                        color: '#3d3d3d',
                        padding: '8px 12px',
                        borderRadius: '8px',
                      }}
                      title={item.name}
                      placement="topLeft"
                      mouseEnterDelay={0.5}
                    >
                      <p className={styles.session}>{item.name}</p>
                    </Tooltip>
                    <div className={styles.contentCourse}>
                      <div className={styles.iconCouse}>
                        <IconPeople color="#676767" />
                        <p className={styles.textCourse}>
                          {item.numberOfParticipants}{' '}
                          {t('mocktest.participants')}
                        </p>
                      </div>
                      <div className={styles.iconCouse}>
                        <IconClock color="#676767" />
                        <p className={styles.textCourse}>
                          {item.duration} {t('mocktest.time')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={styles.boxBtn}
                    onClick={() => setSelectedTest(item)}
                  >
                    <p className={styles.textBtn}>
                      {t('mocktest.btnTestExam')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <StartJourney />
        </main>
      </div>
      <Modal
        closable={false}
        footer={null}
        onCancel={() => setSelectedTest(null)}
        open={!!selectedTest}
        width={563}
      >
        {selectedTest ? (
          <div className={styles.boxModal}>
            <div className={styles.titleModal}>
              <div className={styles.titleBox}>
                <Tooltip
                  color="#fff"
                  overlayInnerStyle={{
                    color: '#3d3d3d',
                    padding: '8px 12px',
                    borderRadius: '8px',
                  }}
                  title={dataMockTest?.name}
                  placement="topLeft"
                  mouseEnterDelay={0.5}
                >
                  <p className={styles.titleCourse}>{dataMockTest?.name}</p>
                </Tooltip>
                <Tooltip
                  color="#fff"
                  overlayInnerStyle={{
                    color: '#3d3d3d',
                    padding: '8px 12px',
                    borderRadius: '8px',
                  }}
                  title={selectedTest.name}
                  placement="topLeft"
                  mouseEnterDelay={0.5}
                >
                  <p className={styles.session}>{selectedTest.name}</p>
                </Tooltip>
              </div>
              <div className={styles.contentCourse}>
                <div className={styles.iconCouse}>
                  <IconPeople color="#676767" />
                  <p className={styles.textCourse}>
                    {selectedTest.numberOfParticipants}{' '}
                    {t('mocktest.participants')}
                  </p>
                </div>
                <div className={styles.iconCouse}>
                  <IconClock color="#676767" />
                  <p className={styles.textCourse}>
                    {selectedTest.duration} {t('mocktest.time')}
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.boxStructure}>
              <p className={styles.titleStructure}>{t('mocktest.structure')}</p>
              <div className={styles.mainStructure}>
                {selectedTest.testDetails.map((item, idx) => (
                  <div className={styles.contentStructure} key={idx}>
                    <p className={styles.textStructure}>
                      {item.name ?? 'Không có tên phần thi'}
                    </p>
                    <div className={styles.boxLesson}>
                      <p className={styles.allLessons}>
                        {t('mocktest.timeTitle')}: {item.timeLimit ?? '--'}{' '}
                        {t('mocktest.time')}
                      </p>
                      <IconDot color="#F37142" />
                      <p className={styles.allLessons}>
                        {t('mocktest.numberQuestion')}:{' '}
                        {item.numberOfQuestions ?? '--'} {t('mocktest.number')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.boxBtnModal}>
              <div
                className={styles.btnBack}
                onClick={() => setSelectedTest(null)}
              >
                <p className={styles.textBack}>{t('mocktest.back')}</p>
              </div>
              <div
                className={styles.btnNext}
                onClick={() => handleNavigate(selectedTest)}
              >
                <p className={styles.textNext}>{t('mocktest.btnSubmitNow')}</p>
                <ArrowUpRight />
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

export default DetailMockTest;
