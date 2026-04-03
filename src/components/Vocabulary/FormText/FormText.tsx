import { useEffect, useState } from 'react';
import { DropArrow, IconBook } from '#/assets/svg/externalIcon';
import styles from './FormText.module.scss';
import FilterVocabulary from '../FilterVocabulary/FilterVocabulary';

import { useSelector } from 'react-redux';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { getTextByIdLession } from '#/shared/redux/thunk/TextThunk';
import {
  getLessionById,
  postLessionProgress,
} from '#/shared/redux/thunk/LessionThunk';
import TitleVocabulary from '../TitleVocabulary/TitleVocabulary';
import { updateLessionProgress } from '#/shared/redux/slices/LessionSlice';
import type { TextAdvProps } from '#/api/requests/interface/TextProps';
import { useTranslation } from 'react-i18next';

export default function FormText({ lessonId, onClickNext }: TextAdvProps) {
  const dataById = useSelector((state: RootState) => state.lession.dataById);
  const data = useSelector((state: RootState) => state.text.data);
  const [translateY, setTranslateY] = useState(0);
  const [startY, setStartY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isAnyCompleted = true;
  const [hasPostedProgress, setHasPostedProgress] = useState(false);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const fetchData = async () => {
    if (lessonId) {
      setHasPostedProgress(false); // Reset for new lesson
      await Promise.all([
        dispatch(getTextByIdLession({ id: lessonId, limit: 10, offset: 0 })),
        dispatch(getLessionById(lessonId)),
      ]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lessonId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartY(e.clientY);
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || startY === null) return;

      const deltaY = e.clientY - startY;
      const clamped = Math.min(
        0,
        Math.max(-250, isOpen ? -250 + deltaY : deltaY),
      );
      setTranslateY(clamped);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        if (translateY < -100) {
          setIsOpen(true);
          setTranslateY(-250);
        } else {
          setIsOpen(false);
          setTranslateY(0);
        }
      }

      setIsDragging(false);
      setStartY(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, translateY, isOpen]);

  useEffect(() => {
    const handleSubmitProgress = async () => {
      if (lessonId && data?.[0] && !hasPostedProgress) {
        await Promise.all([
          dispatch(postLessionProgress({ lessonId, progress: 100 })),
          dispatch(updateLessionProgress({ lessonId, progress: 100 })),
        ]);
        setHasPostedProgress(true);
      }
    };

    handleSubmitProgress();
  }, [lessonId, data, hasPostedProgress, dispatch]);

  return (
    data?.[0] && (
      <>
        <div className={styles.boxContent}>
          <TitleVocabulary
            description={t('titleVocabulary.descriptionPdf')}
            icon={<IconBook color="#F37142" />}
            isAnyCompleted={isAnyCompleted}
            onClickNext={onClickNext}
            title={dataById?.title}
          />
          <div className={styles.formText}>
            <div className={`${styles.boxText}`}>
              <div
                className={styles.headerText}
                dangerouslySetInnerHTML={{
                  __html: data ? data[0]?.content : '',
                }}
              />
            </div>
          </div>

          <div
            className={styles.contentTitle}
            style={{
              transform: `translateY(${translateY}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease',
            }}
          >
            <div className={styles.dropDown} onMouseDown={handleMouseDown}>
              <DropArrow />
            </div>
            <div className={styles.filterWrapper}>
              <FilterVocabulary data={data} dataComent={lessonId} />
            </div>
          </div>
        </div>
      </>
    )
  );
}
