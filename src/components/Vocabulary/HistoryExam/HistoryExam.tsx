import type { ExamLessonWithMappingEntity } from '#/api/requests';
import type { DecryptedData } from '#/api/requests/interface/Exam/ExamProps';
import Loading from '#/shared/components/loading/Loading';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { getExamLessonByIdLession } from '#/shared/redux/thunk/ExamLesson';
import {
  getExamReultsDetailHistory,
  getExamReultsHistory,
} from '#/shared/redux/thunk/ExamReultsThunk';
import { getLessionById } from '#/shared/redux/thunk/LessionThunk';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import styles from './HistoryExam.module.scss';

export default function HistoryExam({
  onSelectReview,
}: {
  onSelectReview: (data: any) => void;
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { lessonId } = useParams();
  const [loading, setLoading] = useState(false);
  const userStr = Cookies.get('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const secretKey = import.meta.env.VITE_ENCRYPTION_KEY;

  const dataExamHistory = useSelector(
    (state: RootState) => state.examResult.dataExamResultHistory,
  ) || {
    items: [],
  };
  const dataExamLesson = useSelector(
    (state: RootState) => state.examLesson.data,
  );
  const [decryptedData, setDecryptedData] = useState<DecryptedData>({
    items: [],
  });

  useEffect(() => {
    if (dataExamLesson && 'data' in dataExamLesson) {
      try {
        const bytes = CryptoJS.AES.decrypt(
          dataExamLesson.data.toString(),
          secretKey,
        );
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        const parsedData = JSON.parse(decryptedString);

        const items: ExamLessonWithMappingEntity[] = Array.isArray(
          parsedData.items,
        )
          ? parsedData.items
          : [parsedData.items ?? parsedData];

        setDecryptedData({ items });
      } catch (error) {
        console.error('Decrypt error:', error);
      }
    }
  }, [dataExamLesson]);

  const fetchData = async () => {
    if (!lessonId) return;
    setLoading(true);
    await Promise.all([
      dispatch(getExamLessonByIdLession({ id: lessonId })),
      dispatch(getLessionById(lessonId)),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [lessonId]);

  useEffect(() => {
    if (user && decryptedData.items.length > 0) {
      const examId = decryptedData.items[0].exam.id;
      dispatch(getExamReultsHistory({ examId, userId: user.id }));
    }
  }, [dataExamLesson]);

  const handleViewResult = async (examResultId: string) => {
    setLoading(true);

    try {
      const res = await dispatch(getExamReultsDetailHistory({ examResultId }));

      if (res.payload) {
        onSelectReview(res.payload);

        window.scrollTo({
          behavior: 'smooth',
          top: 0,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className={styles.listHistory}>
      <p className={styles.title}>{t('historyExam.titleHistory')}</p>
      <div className={styles.boxList}>
        {dataExamHistory.length > 0 ? (
          dataExamHistory.map((exam: any) => (
            <div className={styles.content} key={exam.id}>
              <p className={styles.titleContent}>{exam.examName}</p>
              <div className={styles.mainContent}>
                <p className={styles.point}>
                  {Number(exam.point).toFixed(2)} {t('historyExam.point')}
                </p>
                <div className={styles.time}>
                  {new Date(exam.completionTime).toLocaleString('vi-VN', {
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </div>
                <div
                  className={styles.btnContent}
                  onClick={() => handleViewResult(exam.id)}
                >
                  {t('mocktest.view')}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>{t('historyExam.noTitleHistory')}</p>
        )}
      </div>
    </div>
  );
}
