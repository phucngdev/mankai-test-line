import { useEffect, useState } from 'react';
import styles from './Grammar.module.scss';
import TitleVideoVocabulary from '../TitleVideoVocabulary/TitleVideoVocabulary';
import { useSelector } from 'react-redux';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { fetchAllGrammarByIdLession } from '#/shared/redux/thunk/GrammarThunk';
import {
  getLessionById,
  postLessionProgress,
} from '#/shared/redux/thunk/LessionThunk';
import { updateLessionProgress } from '#/shared/redux/slices/LessionSlice';
import type { GrammarProps } from '#/api/requests/interface/PropVocabulary/PropVocabulary';
import { useTranslation } from 'react-i18next';

export default function Grammar({ lessonId }: GrammarProps) {
  const { data } = useSelector((state: RootState) => state.grammar) || {
    items: [],
  };
  const dataById = useSelector((state: RootState) => state.lession.dataById);
  const [hasPostedProgress, setHasPostedProgress] = useState(false);
  const dispatch = useAppDispatch();
  const limit = 100;
  const offset = 0;
  const { t } = useTranslation();

  const fetchData = async () => {
    if (lessonId) {
      await Promise.all([
        dispatch(fetchAllGrammarByIdLession({ id: lessonId, limit, offset })),
        dispatch(getLessionById(lessonId)),
      ]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lessonId]);

  useEffect(() => {
    fetchData();
  }, [lessonId]);

  useEffect(() => {
    const checkNoScrollNeeded = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (documentHeight <= windowHeight && !hasPostedProgress) {
        dispatch(postLessionProgress({ lessonId, progress: 100 }));
        dispatch(updateLessionProgress({ lessonId, progress: 100 }));
        setHasPostedProgress(true);
      }
    };

    const timeoutId = setTimeout(checkNoScrollNeeded, 500);
    return () => clearTimeout(timeoutId);
  }, [data, hasPostedProgress, lessonId]);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollY } = window;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollY + windowHeight >= documentHeight - 20 && !hasPostedProgress) {
        dispatch(postLessionProgress({ lessonId, progress: 100 }));
        dispatch(updateLessionProgress({ lessonId, progress: 100 }));
        setHasPostedProgress(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasPostedProgress, lessonId]);

  const videoUrl = dataById?.videoUrl || '';
  return (
    <>
      <TitleVideoVocabulary videoUrl={videoUrl} />

      <div className={styles.boxMain}>
        <div className={styles.contentMain}>
          <p className={styles.title}>Lý thuyết ngữ pháp</p>
        </div>
        <div
          className={styles.text}
          dangerouslySetInnerHTML={{ __html: data ? data[0]?.content : '' }}
        />
      </div>
    </>
  );
}
