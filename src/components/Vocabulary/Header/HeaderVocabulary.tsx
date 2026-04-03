import {
  ArrowIconBackVocabulary,
  IconCupVocabulary,
} from '#/assets/svg/externalIcon';
import { useTranslation } from 'react-i18next';
import styles from './HeaderVocabulary.module.scss';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Progress } from 'antd';
import { useSelector } from 'react-redux';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { useEffect } from 'react';
import { getSessionById } from '#/shared/redux/thunk/SessionThunk';

export default function HeaderVocabulary() {
  const dataById = useSelector((state: RootState) => state.session.dataById);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id, courseId } = useParams();
  const dispatch = useAppDispatch();

  const handleDetailCourse = () => {
    navigate(`/detail-course/${courseId}`);
    //  else {
    //   navigate('/class');
    // }
  };

  const fetchData = async () => {
    if (id) {
      await dispatch(getSessionById(id));
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return (
    <div className={styles.header}>
      <div className={styles.leftContent}>
        <div className={styles.iconBtn} onClick={handleDetailCourse}>
          <ArrowIconBackVocabulary />
        </div>
        <p className={styles.text}>{dataById?.title}</p>
      </div>
      <div className={styles.rightContent}>
        <Progress
          format={percent =>
            percent === 100 ? (
              <IconCupVocabulary color="#F37142" />
            ) : (
              <IconCupVocabulary color="#CCCCCC" />
            )
          }
          percent={dataById?.progress}
          strokeColor="#F37142"
          strokeWidth={6}
          trailColor="#CCCCCC"
          type="circle"
          width={40}
        />
        <p className={styles.text}>{t('vocabulary.formVideo.progress')}</p>
      </div>
    </div>
  );
}
