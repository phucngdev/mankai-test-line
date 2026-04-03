import {
  IconBookNew,
  IconExamNew,
  IconGameCardMerge,
  IconListen,
  IconTabLeft,
  IconTabRight,
  PlayFlashCard,
} from '#/assets/svg/externalIcon';
import { useEffect, useRef, useState } from 'react';
import TitleVocabulary from '../TitleVocabulary/TitleVocabulary';
import styles from './FormFlashCard.module.scss';
import { useSelector } from 'react-redux';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { getFlashCardByIdLession } from '#/shared/redux/thunk/FlashCardThunk';
import { getLessionById } from '#/shared/redux/thunk/LessionThunk';
import { Pagination, Progress } from 'antd';
import LearnWord from './LearnWord/LearnWord';
import CardMerge from './CardMerge/CardMerge';
import ExamNew from './ExamNew/ExamNew';
import type { FlashCardProps } from '#/api/requests/interface/FlashCard/FlashCardProps';
import slow from 'src/assets/images/GlobalVocabulary/slow.png';
import { useTranslation } from 'react-i18next';

function FormFlashCard({ lessonId, onClickNext }: FlashCardProps) {
  const isAnyCompleted = true;
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useAppDispatch();
  const { data, totalElement } = useSelector(
    (state: RootState) => state.flashCard,
  );
  const [currentSection, setCurrentSection] = useState<
    'flashcard' | 'learn' | 'merge' | 'exam'
  >('flashcard');
  const [pagination, setPagination] = useState({
    current: 1,
    limit: 1,
    offset: 0,
  });
  const { t } = useTranslation();
  const isMicActive = false;
  const [flipped, setFlipped] = useState(false);
  const dataById = useSelector((state: RootState) => state.lession.dataById);
  const isDown = useRef(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);
  const isDragging = useRef(false);

  // Drag handlers
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
    const walk = (y - startY.current) * 1.5; // Scroll speed multiplier

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
    if (currentSection !== 'flashcard') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setFlipped(prev => !prev); // Lật flashcard
      }

      if (e.code === 'ArrowLeft') {
        e.preventDefault();

        if (pagination.current > 1) {
          handlePageChange(pagination.current - 1, pagination.limit);
        }
      }

      if (e.code === 'ArrowRight') {
        e.preventDefault();

        if (pagination.current < Math.ceil(totalElement / pagination.limit)) {
          handlePageChange(pagination.current + 1, pagination.limit);
        }
      }

      if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        const textToRead = filteredData[0]?.reading || filteredData[0]?.front;
        if (textToRead) speakJapanese(textToRead);
      }

      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        const textToReadSlow =
          filteredData[0]?.reading || filteredData[0]?.front;
        if (textToReadSlow) speakJapaneseSlow(textToReadSlow);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSection, pagination, totalElement]);

  useEffect(() => {
    fetchData();
  }, [lessonId, currentPage]);

  const handleSelectSection = (
    section: 'flashcard' | 'learn' | 'merge' | 'exam',
  ) => {
    setCurrentSection(section);
  };

  useEffect(() => {
    fetchData();
    setCurrentSection('flashcard');
    setFlipped(false);
  }, [lessonId]);

  useEffect(() => {
    fetchData();
  }, [currentPage]);
  const filteredData = Array.isArray(data)
    ? data.map(course => ({ ...course, key: course.id }))
    : [];

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }));
    setCurrentPage(page);
  };

  const speakJapanese = (text: string) => {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();

    const jpVoice =
      voices.find(v => v.lang === 'ja-JP') ||
      voices.find(v => v.lang.startsWith('ja'));

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    if (jpVoice) utterance.voice = jpVoice;

    synth.cancel();
    synth.speak(utterance);
  };

  const speakJapaneseSlow = (text: string) => {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();

    const jpVoice =
      voices.find(v => v.lang === 'ja-JP') ||
      voices.find(v => v.lang.startsWith('ja'));

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.4;
    if (jpVoice) utterance.voice = jpVoice;

    synth.cancel();
    synth.speak(utterance);
  };

  return (
    <div className={styles.boxContent} translate="no">
      <TitleVocabulary
        description={t('titleVocabulary.descriptionFl')}
        icon={<PlayFlashCard color="#F37142" />}
        isAnyCompleted={isAnyCompleted}
        onClickNext={onClickNext}
        title={dataById?.title}
      />

      {currentSection === 'flashcard' && filteredData.length > 0 && (
        <div className={styles.formFlashCard} key={filteredData[0].id}>
          <div className={styles.boxFlash}>
            <div className={styles.contentFlash}>
              <div className={styles.flashcard}>
                <div
                  className={`${styles.inner} ${flipped ? styles.flipped : ''}`}
                >
                  <div
                    className={styles.front}
                    onClick={handleCardClick}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  >
                    {filteredData[0].front}
                  </div>
                  <div
                    className={styles.back}
                    onClick={handleCardClick}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  >
                    {filteredData[0].back}
                  </div>
                </div>
              </div>
              <div
                className={`${styles.voiceDefault} `}
                onClick={e => {
                  e.stopPropagation();
                  if (isMicActive) return;

                  const textToRead =
                    filteredData[0]?.reading || filteredData[0]?.front;
                  if (!textToRead) return;

                  speakJapanese(textToRead);
                }}
              >
                <IconListen height={24} width={24} />
              </div>
              <div
                className={`${styles.voiceDefaultSlow} `}
                onClick={e => {
                  e.stopPropagation();
                  if (isMicActive) return;

                  const textToReadSlow =
                    filteredData[0]?.reading || filteredData[0]?.front;
                  if (!textToReadSlow) return;
                  speakJapaneseSlow(textToReadSlow);
                }}
              >
                <img alt="" height={24} src={slow} width={24} />
              </div>
            </div>
            <div className={styles.contentProgress}>
              <Progress
                percent={
                  (pagination.current /
                    (Math.ceil(totalElement / pagination.limit) || 1)) *
                  100
                }
                showInfo={false}
                strokeColor={'#AD7415'}
                trailColor={'#DDD'}
              />
            </div>
            <div className={styles.boxPage}>
              <Pagination
                current={pagination.current}
                onChange={handlePageChange}
                pageSize={pagination.limit}
                showSizeChanger={false}
                simple={{ readOnly: true }}
                style={{
                  display: 'flex',
                  gap: 24,
                }}
                total={totalElement}
              />
            </div>
          </div>
          <div className={styles.tabWrapper}>
            <div className={styles.tabLeft}>
              <IconTabLeft />
            </div>
            <div className={styles.tabRight}>
              <IconTabRight />
            </div>
            <div className={styles.tabLabel}>
              <p className={styles.text}>{t('titleVocabulary.game')}</p>
            </div>
            <div className={styles.tabPlayGame}>
              <div
                className={styles.boxPlay}
                onClick={() => handleSelectSection('learn')}
              >
                <IconBookNew />
                <p className={styles.text}>{t('titleVocabulary.booknew')}</p>
              </div>
              <div
                className={styles.boxPlay}
                onClick={() => handleSelectSection('merge')}
              >
                <IconGameCardMerge />
                <p className={styles.text}>{t('titleVocabulary.cardmerge')}</p>
              </div>
              <div
                className={styles.boxPlay}
                onClick={() => handleSelectSection('exam')}
              >
                <IconExamNew />
                <p className={styles.text}> {t('titleVocabulary.examNew')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentSection === 'learn' && (
        <LearnWord
          lessonId={lessonId}
          onClickNext={onClickNext}
          onExit={() => setCurrentSection('flashcard')}
        />
      )}

      {currentSection === 'merge' && (
        <CardMerge
          lessonId={lessonId}
          onClickNext={onClickNext}
          onExit={() => setCurrentSection('flashcard')}
        />
      )}
      {currentSection === 'exam' && (
        <ExamNew
          lessonId={lessonId}
          onExit={() => setCurrentSection('flashcard')}
        />
      )}
    </div>
  );
}

export default FormFlashCard;
