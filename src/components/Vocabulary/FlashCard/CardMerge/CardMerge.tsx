import { IconQuit, Warrning } from '#/assets/svg/externalIcon';
import { useEffect, useRef, useState } from 'react';
import styles from './CardMerge.module.scss';
import {
  getLessionById,
  postLessionProgress,
} from '#/shared/redux/thunk/LessionThunk';
import { getFlashCardByIdLession } from '#/shared/redux/thunk/FlashCardThunk';
import { useSelector } from 'react-redux';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { Modal } from 'antd';
import ImgMedal from '#/assets/images/GlobalVocabulary/medal.png';
import type {
  CardItem,
  CardMergeProps,
} from '#/api/requests/interface/FlashCard/CardMergeProps';
import { updateLessionProgress } from '#/shared/redux/slices/LessionSlice';
import { useTranslation } from 'react-i18next';

function CardMerge({ lessonId, onExit, onClickNext }: CardMergeProps) {
  const { data } = useSelector((state: RootState) => state.flashCard);
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [shuffledItems, setShuffledItems] = useState<CardItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<CardItem[]>([]);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set());
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [finishTime, setFinishTime] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    limit: 10,
    offset: 0,
  });
  const { t } = useTranslation();

  const fetchData = async () => {
    if (lessonId) {
      await Promise.all([
        dispatch(
          getFlashCardByIdLession({
            id: lessonId,
            limit: pagination.limit,
            offset: pagination.offset,
          }),
        ),
        dispatch(getLessionById(lessonId)),
      ]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lessonId]);

  useEffect(() => {
    if (Array.isArray(data)) {
      const items = data.flatMap(card => [
        { cardId: card.id, key: `${card.id}-front`, text: card.front },
        { cardId: card.id, key: `${card.id}-back`, text: card.back },
      ]);

      const shuffled = [...items].sort(() => 0.5 - Math.random());
      setShuffledItems(shuffled);
    }
  }, [data]);
  useEffect(() => {
    if (
      Array.isArray(data) &&
      data.length > 0 &&
      matchedIds.size === data.length
    ) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setFinishTime(secondsElapsed);

      dispatch(postLessionProgress({ lessonId, progress: 100 }));
      dispatch(updateLessionProgress({ lessonId, progress: 100 }));
      setTimeout(() => {
        setIsFinishModalOpen(true);
      }, 300);
    }
  }, [matchedIds, data]);
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleClick = (item: CardItem) => {
    if (matchedIds.has(item.cardId)) return;
    if (selectedItems.find(i => i.key === item.key)) return;

    const updated = [...selectedItems, item];
    setSelectedItems(updated);

    if (updated.length === 2) {
      const [a, b] = updated;

      if (a.cardId === b.cardId && a.key !== b.key) {
        setMatchedIds(prev => new Set(prev).add(a.cardId));
      } else {
        setWrongIds(prev => new Set([...prev, a.key, b.key]));
        setTimeout(() => {
          setWrongIds(prev => {
            const copy = new Set(prev);
            copy.delete(a.key);
            copy.delete(b.key);
            return copy;
          });
        }, 1000);
      }

      setTimeout(() => setSelectedItems([]), 200);
    }
  };

  const handleRestart = () => {
    setPagination({
      current: 1,
      limit: 10,
      offset: 0,
    });

    setMatchedIds(new Set());
    setWrongIds(new Set());
    setSelectedItems([]);
    setSecondsElapsed(0);
    setFinishTime(0);
    setIsFinishModalOpen(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
  };

  return (
    <div className={styles.formFlashCard}>
      <div className={styles.boxTimeExam}>
        <div className={styles.boxTime}>
          <p className={styles.title}>{t('flashCard.cardMergeTitle')}</p>
          <div className={styles.content}>
            <p className={styles.text}>
              {formatTime(secondsElapsed)} {t('flashCard.second')}
            </p>
          </div>
        </div>
        <div className={styles.iconQuit} onClick={() => setIsModalOpen(true)}>
          <IconQuit />
        </div>
      </div>

      <div className={styles.boxFlash}>
        {shuffledItems.map(item => {
          const isMatched = matchedIds.has(item.cardId);
          const isWrong = wrongIds.has(item.key);
          const isSelected = selectedItems.some(i => i.key === item.key);
          const content = isMatched ? '' : item.text;

          return (
            <div
              className={`${styles.contentBox} ${isWrong ? styles.wrong : ''} ${isSelected ? styles.selected : ''} ${isMatched ? styles.matched : ''}`}
              key={item.key}
              onClick={() => !isMatched && handleClick(item)}
            >
              <p className={styles.text}>{content}</p>
            </div>
          );
        })}
      </div>
      <Modal
        closable={false}
        footer={null}
        maskClosable={false}
        open={isModalOpen}
      >
        <div className={styles.boxModal}>
          <div className={styles.contentModal}>
            <div className={styles.modalWarning}>
              <Warrning color="#DC6803" width={30} />
            </div>
            <div className={styles.boxTitle}>
              <p className={styles.title}>Thoát trò chơi ghép thẻ</p>
              <p className={styles.text}>
                Bạn có chắc chắn muốn thoát học phần không?
              </p>
            </div>
          </div>
          <div className={styles.boxButton}>
            <div
              className={styles.btnExit}
              onClick={() => setIsModalOpen(false)}
            >
              <p className={styles.text}>Hủy</p>
            </div>
            <div
              className={styles.btnDone}
              onClick={() => {
                setIsModalOpen(false);
                onExit(); // Đồng ý
              }}
            >
              <p className={styles.text}>Đồng ý</p>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        closable={false}
        footer={null}
        keyboard={false}
        maskClosable={false}
        onCancel={() => setIsFinishModalOpen(false)}
        open={isFinishModalOpen}
        width={800}
      >
        <div className={styles.modalBox}>
          <div className={styles.modalImg}>
            <img alt="" src={ImgMedal} />
          </div>
          <p className={styles.modalTitle}>Hoàn thành bài học!</p>
          <div className={styles.contentBox}>
            <div className={styles.modalContent}>
              <div className={styles.modalPoint}>
                <p className={styles.modalText}>Kết quả</p>
                <p className={styles.modalNumber}>{matchedIds.size}</p>
              </div>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.modalPoint}>
                <p className={styles.modalText}>Kỷ lục</p>
                <div className={styles.modalExp}>
                  <p className={styles.modalStar}>{formatTime(finishTime)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.modalBtn}>
          <div
            className={styles.btnContent}
            onClick={() => {
              setIsModalOpen(false);
              onExit();
            }}
          >
            <p className={styles.textContent}>Quay về</p>
          </div>
          <div
            className=""
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: '10px',
            }}
          >
            <div
              className={styles.btnContent}
              onClick={() => {
                setIsFinishModalOpen(false);
                handleRestart();
              }}
            >
              <p className={styles.textContent}>Làm lại</p>
            </div>
            <div className={styles.btnContent} onClick={onClickNext}>
              <p className={styles.textContent}>Bài tiếp theo</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CardMerge;
