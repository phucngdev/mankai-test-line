import { Repeat } from '#/assets/svg/externalIcon';
import styles from './Kanji.module.scss';
import { useTranslation } from 'react-i18next';
import { Empty, Pagination } from 'antd';
import TitleVideoVocabulary from '../TitleVideoVocabulary/TitleVideoVocabulary';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { useSelector } from 'react-redux';
import { fetchAllKanjiByIdLession } from '#/shared/redux/thunk/KanjiThunk';
import { useEffect, useState } from 'react';
import {
  getLessionById,
  postLessionProgress,
} from '#/shared/redux/thunk/LessionThunk';
import KanjiAPIComponent from './KanjiAnimation';
import { updateLessionProgress } from '#/shared/redux/slices/LessionSlice';
import type { KanjiProps } from '#/api/requests/interface/PropVocabulary/PropVocabulary';

export default function Kanji({ lessonId }: KanjiProps) {
  const { t } = useTranslation();
  const { data, totalElement } = useSelector(
    (state: RootState) => state.kanji,
  ) || {
    items: [],
  };
  const dataById = useSelector((state: RootState) => state.lession.dataById);
  const [repeatTriggerMap, setRepeatTriggerMap] = useState<
    Record<string, number>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 1;
  const offset = (currentPage - 1) * limit;
  const dispatch = useAppDispatch();

  const [hasPostedProgress, setHasPostedProgress] = useState(false);
  const totalPage = Math.ceil(totalElement / limit);

  const fetchData = async () => {
    if (lessonId) {
      await Promise.all([
        dispatch(fetchAllKanjiByIdLession({ id: lessonId, limit, offset })),
        dispatch(getLessionById(lessonId)),
      ]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lessonId, currentPage]);

  useEffect(() => {
    if (!hasPostedProgress && totalPage > 0) {
      const progress = Math.floor((currentPage / totalPage) * 100);

      if (progress >= 100) {
        dispatch(postLessionProgress({ lessonId, progress: 100 }));
        dispatch(updateLessionProgress({ lessonId, progress: 100 }));
        setHasPostedProgress(true);
      }
    }
  }, [currentPage, totalPage, hasPostedProgress, lessonId]);

  const filteredData = Array.isArray(data)
    ? data.map(topic => ({ ...topic, key: topic.id }))
    : [];

  const videoUrl = dataById?.videoUrl || '';
  return (
    <>
      <TitleVideoVocabulary videoUrl={videoUrl} />
      <div className={styles.boxMain}>
        {filteredData.length === 0 ? (
          <div className={styles.noData}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          filteredData.map(item => (
            <div className={styles.boxContentMain} key={item.id}>
              <div className={styles.boxLeft}>
                <KanjiAPIComponent
                  character={item.character}
                  repeatTrigger={repeatTriggerMap[item.id] || 0}
                />
                <div
                  className={styles.iconRepeat}
                  onClick={() =>
                    setRepeatTriggerMap(prev => ({
                      ...prev,
                      [item.id]: (prev[item.id] || 0) + 1,
                    }))
                  }
                >
                  <Repeat />
                </div>
              </div>
              <div className={styles.boxRight}>
                <div className={styles.contentVocabulary}>
                  <div className={styles.contentTitle}>
                    <p className={styles.titleTopic}>
                      {t('topic.titleVocabulary')}:
                    </p>
                    <div className={styles.imgHand}>
                      <img
                        alt=""
                        height={83}
                        src={item.descriptionImageUrl}
                        width={180}
                      />
                      <p className={styles.text}>{item.description}</p>
                    </div>
                  </div>
                </div>
                <div className={styles.listBox}>
                  <div className={styles.boxVocabulary}>
                    <p className={styles.title}>Âm Hán</p>
                    <p className={styles.text}>{item.sinoVietnamese}</p>
                  </div>
                  <div className={styles.boxVocabulary}>
                    <p className={styles.title}>Nghĩa</p>
                    <p className={styles.text}>{item.mean}</p>
                  </div>
                  <div className={styles.boxVocabulary}>
                    <p className={styles.title}>Onyomi</p>
                    <p className={styles.text}>{item.onyomi}</p>
                  </div>
                  <div className={styles.boxVocabulary}>
                    <p className={styles.title}>Kunyomi</p>
                    <p className={styles.text}>{item.kunyomi}</p>
                  </div>
                  <div className={styles.boxVocabulary}>
                    <p className={styles.title}>Ví dụ</p>
                    <p className={styles.text}>{item.example}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div className={styles.boxPage}>
          <Pagination
            current={currentPage}
            onChange={page => setCurrentPage(page)}
            pageSize={limit}
            simple={{ readOnly: true }}
            total={totalElement}
          />
        </div>
      </div>
    </>
  );
}
