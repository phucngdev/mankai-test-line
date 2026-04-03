import {
  IconCheckFlash,
  IconListen,
  IconQuit,
  IconX,
  Warrning,
} from '#/assets/svg/externalIcon';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './LearnWord.module.scss';

import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { useSelector } from 'react-redux';
import {
  getFlashCardByIdLession,
  postFlashCardByIdLession,
} from '#/shared/redux/thunk/FlashCardThunk';
import {
  getLessionById,
  postLessionProgress,
} from '#/shared/redux/thunk/LessionThunk';
import { Modal } from 'antd';
import ImgMedal from '#/assets/images/GlobalVocabulary/medal.png';
import type { LearnWordProps } from '#/api/requests/interface/FlashCard/LearnWordProps';
import { updateLessionProgress } from '#/shared/redux/slices/LessionSlice';
import slow from 'src/assets/images/GlobalVocabulary/slow.png';

function LearnWord({ lessonId, onExit, onClickNext }: LearnWordProps) {
  const { data } = useSelector((state: RootState) => state.flashCard);
  const dispatch = useAppDispatch();
  const [flipped, setFlipped] = useState(false);
  const [animation, setAnimation] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [countLearned, setCountLearned] = useState(0);
  const [countUnlearned, setCountUnlearned] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    limit: 100,
    offset: 0,
  });

  const isDown = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);
  const isDragging = useRef(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDown.current = true;
    startY.current = e.pageY;
    scrollTop.current = e.currentTarget.scrollTop;
    isDragging.current = false;
    e.currentTarget.style.cursor = 'grabbing';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    isDown.current = false;
    e.currentTarget.style.cursor = 'grab';
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    isDown.current = false;
    e.currentTarget.style.cursor = 'grab';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDown.current) return;
    e.preventDefault();
    const y = e.pageY;
    const walk = (y - startY.current) * 1.5;

    if (Math.abs(y - startY.current) > 5) {
      isDragging.current = true;
    }

    e.currentTarget.scrollTop = scrollTop.current - walk;
  };

  const handleCardClick = () => {
    if (!isDragging.current) {
      setFlipped(!flipped);
    }
  };

  const toggleFlip = () => {
    setFlipped(prev => !prev);
  };

  const unlearnedCards = useMemo(
    () => data?.filter(item => !item.isLearned) ?? [],
    [data],
  );

  const currentCard = unlearnedCards[pagination.offset] || null;
  const totalCards = unlearnedCards.length;

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

  const handleNext = async (type: 'learned' | 'unlearned') => {
    if (type === 'learned') {
      setCountLearned(prev => prev + 1);
    } else {
      setCountUnlearned(prev => prev + 1);
    }

    const isLastCard = pagination.offset + 1 === totalCards;

    if (isLastCard) {
      if (lessonId) {
        dispatch(postLessionProgress({ lessonId, progress: 100 }));
        dispatch(updateLessionProgress({ lessonId, progress: 100 }));
        // const result = await dispatch(
        //   postLessionProgress({ lessonId, progress: 100 }),
        // );
        // if (result.payload.statusCode === 201) {
        //   dispatch(updateLessionProgress({ lessonId, progress: 100 }));
        // }
      }

      setIsFinishModalOpen(true);
      return;
    }

    setAnimation('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // 🔥 chặn lặp phím khi giữ

      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleClickUnlearned();
      }

      if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleClickLearned();
      }

      if (e.code === 'Space') {
        e.preventDefault();
        toggleFlip();
      }

      if (e.key.toLowerCase() === 'v' && currentCard) {
        e.preventDefault();
        const textToRead = currentCard.reading || currentCard.front;
        speakJapanese(textToRead);
      }

      if (e.key.toLowerCase() === 's' && currentCard) {
        e.preventDefault();
        const textToReadSlow = currentCard.reading || currentCard.front;
        speakJapanese(textToReadSlow, 0.4);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentCard]);

  const isProcessingRef = useRef(false);

  const handleClickLearned = async () => {
    if (!currentCard || isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      await dispatch(postFlashCardByIdLession({ id: currentCard.id }));
    } catch (err) {
      console.error('Error saving flashcard:', err);
      isProcessingRef.current = false;
      return;
    }

    setAnimation(styles.slideOutRight);

    setTimeout(() => {
      const isLastCard = pagination.offset + 1 === totalCards;
      handleNext('learned');

      if (!isLastCard) {
        setPagination(prev => ({
          ...prev,
          current: prev.current + 1,
          offset: prev.offset + 1,
        }));
      }

      isProcessingRef.current = false;
    }, 400);
  };

  const handleClickUnlearned = () => {
    if (!currentCard || isProcessingRef.current) return;
    isProcessingRef.current = true;

    setAnimation(styles.slideOutLeft);

    setTimeout(() => {
      handleNext('unlearned');
      setPagination(prev => ({
        ...prev,
        current: prev.current + 1,
        offset: prev.offset + 1,
      }));
      isProcessingRef.current = false;
    }, 400);
  };

  const handleRestart = async () => {
    // Reset pagination and state
    setPagination({
      current: 1,
      limit: 100,
      offset: 0,
    });
    setCountLearned(0);
    setCountUnlearned(0);
    setAnimation('');
    setFlipped(false);

    // Refetch flashcards to ensure data is up-to-date
    if (lessonId) {
      await dispatch(
        getFlashCardByIdLession({
          id: lessonId,
          limit: 100,
          offset: 0,
        }),
      );
    }
  };

  const getTextLengthCategory = (text: string) => {
    if (!text) return 'normal';
    const { length } = text;
    if (length > 200) return 'very-long';
    if (length > 100) return 'long';
    return 'normal';
  };

  const speakJapanese = (text: string, rate = 1) => {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    const jpVoice =
      voices.find(v => v.lang === 'ja-JP') ||
      voices.find(v => v.lang.startsWith('ja'));

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = rate;
    if (jpVoice) utterance.voice = jpVoice;

    synth.cancel();
    synth.speak(utterance);
  };

  return (
    <div className={styles.formFlashCard}>
      <div className={styles.iconQuit} onClick={() => setIsModalOpen(true)}>
        <IconQuit />
      </div>
      <div className={styles.shadowFlash} />
      <div className={styles.shadowFlash2} />
      <div className={styles.shadowFlash3} />

      {/* Nếu không còn flashcard chưa học */}
      {pagination.offset >= totalCards && !isFinishModalOpen ? (
        <div className={styles.allLearnedBox}>
          <p className={styles.allLearnedText}>
            Bạn đã thuộc hết rồi, hãy chuyển qua phần tiếp theo!
          </p>
          <div className={styles.btnContent} onClick={onExit}>
            <p className={styles.textContent}>Quay về</p>
          </div>
        </div>
      ) : (
        <div className={`${styles.boxFlash} ${animation}`}>
          {currentCard ? (
            <div className={styles.contentFlash}>
              <div
                className={`${styles.flashcard} ${flipped ? styles.flipped : ''}`}
              >
                <div
                  className={styles.front}
                  data-length={getTextLengthCategory(currentCard.front || '')}
                  onClick={handleCardClick}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  {currentCard.front}
                </div>
                <div
                  className={styles.back}
                  data-length={getTextLengthCategory(currentCard.back || '')}
                  onClick={handleCardClick}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  {currentCard.back}
                </div>
              </div>

              <div
                className={styles.voiceDefault}
                onClick={e => {
                  e.stopPropagation();
                  const textToReadSlow =
                    currentCard.reading || currentCard.front;
                  if (!currentCard) return;
                  speakJapanese(textToReadSlow);
                }}
              >
                <IconListen height={24} width={24} />
              </div>

              <div
                className={styles.voiceDefaultSlow}
                onClick={e => {
                  e.stopPropagation();
                  const textToReadSlow =
                    currentCard.reading || currentCard.front;
                  if (!currentCard) return;
                  speakJapanese(textToReadSlow, 0.4);
                }}
              >
                <img alt="" height={24} src={slow} width={24} />
              </div>
            </div>
          ) : null}

          <div className={styles.boxPage}>
            <button
              className={styles.iconX}
              disabled={!currentCard}
              onClick={handleClickUnlearned}
              type="button"
            >
              <div className={styles.content}>
                <IconX />
              </div>
              <p className={styles.text}>Chưa thuộc</p>
            </button>

            <p className={styles.textPage}>
              {pagination.current} / {totalCards}
            </p>

            <button
              className={styles.iconCheck}
              disabled={!currentCard}
              onClick={handleClickLearned}
              type="button"
            >
              <div className={styles.content}>
                <IconCheckFlash />
              </div>
              <p className={styles.text}>Đã thuộc</p>
            </button>
          </div>
        </div>
      )}

      {/* Modal thoát */}
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
              <p className={styles.title}>Thoát học từ mới</p>
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
                onExit();
              }}
            >
              <p className={styles.text}>Đồng ý</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal hoàn thành */}
      <Modal
        closable={false}
        footer={null}
        keyboard={false}
        maskClosable={false}
        onCancel={() => setIsFinishModalOpen(false)}
        open={isFinishModalOpen}
        width={Math.min(800, window.innerWidth * 0.9)}
      >
        <div className={styles.modalBox}>
          <div className={styles.modalImg}>
            <img alt="Medal" src={ImgMedal} />
          </div>
          <p className={styles.modalTitle}>Hoàn thành bài học!</p>
          <div className={styles.contentBox}>
            <div className={styles.modalContent}>
              <div className={styles.modalPoint}>
                <p className={styles.modalText}>Đã thuộc</p>
                <p className={styles.modalNumber}>{countLearned}</p>
              </div>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.modalPoint}>
                <p className={styles.modalText}>Chưa thuộc</p>
                <div className={styles.modalExp}>
                  <p className={styles.modalStar}>{countUnlearned}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.modalBtn}>
          <div
            className={styles.btnContent}
            onClick={() => {
              setIsFinishModalOpen(false);
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
              <p className={styles.textContent}>Học lại</p>
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

export default LearnWord;
