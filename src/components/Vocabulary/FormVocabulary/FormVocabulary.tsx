import { IconListen, IconMic, IconStar } from '#/assets/svg/externalIcon';
import styles from './FormVocabulary.module.scss';
import { useTranslation } from 'react-i18next';
import { Empty, Modal, Pagination, notification } from 'antd';
import TitleVideoVocabulary from '../TitleVideoVocabulary/TitleVideoVocabulary';
import { useEffect, useRef, useState } from 'react';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { useSelector } from 'react-redux';
import { fetchAllVocabularyByIdLession } from '#/shared/redux/thunk/VocabularyThunk';
import {
  getLessionById,
  postLessionProgress,
} from '#/shared/redux/thunk/LessionThunk';
import type { CourseVocabEntity } from '#/api/requests';
import { updateLessionProgress } from '#/shared/redux/slices/LessionSlice';
import type { VocabProps } from '#/api/requests/interface/PropVocabulary/PropVocabulary';

export default function FormVocabulary({ lessonId }: VocabProps) {
  const { data, totalElement } = useSelector(
    (state: RootState) => state.vocab,
  ) || {
    items: [],
  };
  const dataById = useSelector((state: RootState) => state.lession.dataById);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState<CourseVocabEntity | null>(
    null,
  );

  const [spokenWord, setSpokenWord] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const recognitionRef = useRef<_SpeechRecognition | null>(null);
  const [activeListenId, setActiveListenId] = useState<string | null>(null);
  const [speechStatus, setSpeechStatus] = useState<
    'idle' | 'listening' | 'success' | 'error'
  >('idle');
  const [starCount, setStarCount] = useState(0);
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 1;
  const offset = (currentPage - 1) * limit;
  const dispatch = useAppDispatch();
  const totalPage = Math.ceil(totalElement / limit);
  const [hasPostedProgress, setHasPostedProgress] = useState(false);
  const filteredData = Array.isArray(data)
    ? data.map(topic => ({ ...topic, key: topic.id }))
    : [];

  const fetchData = async () => {
    if (lessonId) {
      await Promise.all([
        dispatch(
          fetchAllVocabularyByIdLession({ id: lessonId, limit, offset }),
        ),
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

  const showModal = (item: CourseVocabEntity) => {
    setSelectedVocab(item);
    setIsModalOpen(true);
    setSpeechStatus('idle');
    setSpokenWord('');
    setLiveTranscript('');
    setStarCount(0);
  };

  const stopRecognition = () => {
    recognitionRef.current?.stop();
    setIsMicActive(false);
    setSpeechStatus('idle');
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    stopRecognition();
  };

  const playTargetWord = (vocab: CourseVocabEntity) => {
    if (isMicActive) return;

    if (activeListenId === vocab.id && speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setActiveListenId(null);
      return;
    }

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(vocab.originText);
    utterance.lang = 'ja-JP';

    utterance.onend = () => {
      setActiveListenId(null);
    };

    speechSynthesis.speak(utterance);
    setActiveListenId(vocab.id);
  };

  const toggleRecording = () => {
    if (speechSynthesis.speaking) {
      notification.warning({
        description: 'Đang phát âm thanh, vui lòng chờ kết thúc trước khi nói.',
        message: 'Thông báo',
      });
      return;
    }

    if (speechStatus === 'listening') {
      stopRecognition();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Trình duyệt không hỗ trợ nhận dạng giọng nói');
      return;
    }

    setLiveTranscript('');
    setSpokenWord('');
    setSpeechStatus('idle');

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsMicActive(true);
      setSpeechStatus('listening');
    };

    let hasSuccess = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }

      setLiveTranscript(transcript);

      if (event.results[0].isFinal) {
        setSpokenWord(transcript);
        const correctAnswer = selectedVocab?.originText || '';
        const spokenWords = transcript.trim().split(/\s+/);
        const correctWords = correctAnswer.trim().split(/\s+/);

        const matchedCount = spokenWords.filter(word =>
          correctWords.includes(word),
        ).length;
        const star =
          correctWords.length === 0
            ? 0
            : Math.round((matchedCount / correctWords.length) * 5);
        const clampedStar = Math.min(5, Math.max(0, star));

        setStarCount(clampedStar);
        setSpeechStatus('success');
        hasSuccess = true;
      }
    };

    recognition.onend = () => {
      setIsMicActive(false);

      if (!hasSuccess) {
        setSpeechStatus('error');
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const getReviewMessage = () => {
    if (starCount === 5) return 'Tuyệt vời!';
    if (starCount >= 3) return 'Tốt rồi!';
    return 'Cố gắng thêm nhé!';
  };

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
                <img alt="" height={460} src={item.imageUrl} />
              </div>
              <div className={styles.boxRight}>
                <div className={styles.contentVocabulary}>
                  <div
                    className={styles.contentTitle}
                    onClick={() => showModal(item)}
                  >
                    <p className={styles.titleTopic}>
                      {t('topic.titleVocabulary')}:
                    </p>
                    <div className={styles.imgVoice}>
                      <div className={styles.borderImg}>
                        <IconMic color="#F37142" />
                      </div>
                      <div
                        className={`${styles.voiceDefault} ${
                          activeListenId === item.id ? styles.activeListen : ''
                        }`}
                        onClick={e => {
                          e.stopPropagation();
                          playTargetWord(item);
                        }}
                      >
                        <IconListen />
                      </div>
                    </div>
                  </div>
                  <div className={styles.textVocabulary}>
                    <p className={styles.text}>{item.originText}</p>
                  </div>
                </div>
                <div className={styles.listBox}>
                  <div className={styles.boxVocabulary}>
                    <p className={styles.title}>Nghĩa</p>
                    <p className={styles.text}>{item.sinoVietNamese}</p>
                  </div>
                  <div className={styles.boxVocabulary}>
                    <p className={styles.title}>Kanji</p>
                    <p className={styles.text}>{item.kanji}</p>
                  </div>
                  <div className={styles.boxVocabulary}>
                    <p className={styles.title}>Âm Hán</p>
                    <p className={styles.text}>{item.mean}</p>
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
      <Modal
        className="customModalSize"
        closable={false}
        footer={null}
        onCancel={handleCancel}
        open={isModalOpen}
        width={552}
      >
        {selectedVocab ? (
          <div className={styles.topicContent}>
            {speechStatus === 'listening' && (
              <div className={styles.textMic}>
                <p className={styles.fontMic}>
                  {liveTranscript || 'Đang nghe bạn nói...'}
                </p>
              </div>
            )}
            {speechStatus === 'success' && (
              <div className={styles.textMicComplete}>
                <div className={styles.resultMic}>
                  <p className={styles.titleResult}>Kết quả giọng nói:</p>
                  <p className={styles.contentResult}>{spokenWord}</p>
                </div>
                <div className={styles.review}>
                  <div className={styles.starReview}>
                    {[...Array(5)].map((_, i) => (
                      <IconStar
                        color={i < starCount ? '#FDB022' : '#CCCCCC'}
                        key={i}
                      />
                    ))}
                  </div>
                  <p className={styles.textReview}>{getReviewMessage()}</p>
                </div>
              </div>
            )}
            {speechStatus === 'error' && (
              <div className={styles.textMicError}>
                <p className={styles.colorMicError}>Không nghe được.</p>
                <a className={styles.colorMicError} onClick={toggleRecording}>
                  Thử lại
                </a>
              </div>
            )}

            <div className={styles.topicText}>
              <div className={styles.contentTitleBox}>
                <div className={styles.contentTitle}>
                  <p className={styles.titleTopic}>Từ vựng:</p>
                  <div className={styles.imgVoice}>
                    <div
                      className={`${styles.micDefault} ${isMicActive ? styles.activeMic : ''}`}
                      onClick={toggleRecording}
                    >
                      <IconMic />
                    </div>
                    <div
                      className={`${styles.voiceDefault} ${activeListenId === selectedVocab.id ? styles.activeListen : ''}`}
                      onClick={() =>
                        selectedVocab && playTargetWord(selectedVocab)
                      }
                    >
                      <IconListen />
                    </div>
                  </div>
                </div>
                <p className={styles.vocabulary}>{selectedVocab.originText}</p>
              </div>
              <div className={styles.listBox}>
                <div className={styles.boxVocabulary}>
                  <p className={styles.title}>Nghĩa</p>
                  <p className={styles.text}>{selectedVocab.sinoVietNamese}</p>
                </div>
                <div className={styles.boxVocabulary}>
                  <p className={styles.title}>Kanji</p>
                  <p className={styles.text}>{selectedVocab.kanji}</p>
                </div>
                <div className={styles.boxVocabulary}>
                  <p className={styles.title}>Âm Hán</p>
                  <p className={styles.text}>{selectedVocab.mean}</p>
                </div>
                <div className={styles.boxVocabulary}>
                  <p className={styles.title}>Ví dụ</p>
                  <p className={styles.text}>{selectedVocab.example}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
