import { useTranslation } from 'react-i18next';
import styles from './DetailTopic.module.scss';
import StartJourney from '#/src/components/StartJourney/StartJourney';
import {
  ArrowIconBack,
  ArrowIconNext,
  IconListen,
  IconMic,
  IconStar,
} from '#/assets/svg/externalIcon';

import { Modal, notification } from 'antd';
import { useEffect, useRef, useState } from 'react';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { useSelector } from 'react-redux';
import {
  getDetailTopicById,
  getTopicById,
} from '#/shared/redux/thunk/TopicThunk';
import { useNavigate, useParams } from 'react-router-dom';
import type { TopicVocabEntity } from '#/api/requests';

declare global {
  interface Window {
    webkitSpeechRecognition?: {
      new (): _SpeechRecognition;
    };
    SpeechRecognition?: {
      new (): _SpeechRecognition;
    };
  }
}

function DetailTopic(): JSX.Element {
  const vocabData = useSelector((state: RootState) => state.topicVocab.data);
  const { data } = useSelector((state: RootState) => state.topic);
  const [activeListenId, setActiveListenId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spokenWord, setSpokenWord] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const recognitionRef = useRef<_SpeechRecognition | null>(null);
  const [starCount, setStarCount] = useState(0);
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedVocab, setSelectedVocab] = useState<TopicVocabEntity | null>(
    null,
  );
  const [speechStatus, setSpeechStatus] = useState<
    'idle' | 'listening' | 'success' | 'error'
  >('idle');

  useEffect(() => {
    if (id) {
      dispatch(getDetailTopicById(id));
      dispatch(getTopicById(id));
    }
  }, [id, dispatch]);

  const filteredData: TopicVocabEntity[] = Array.isArray(vocabData)
    ? vocabData.map(topic => ({ ...topic, key: topic.id }))
    : [];

  const stopRecognition = () => {
    recognitionRef.current?.stop();
    setIsMicActive(false);
    setSpeechStatus('idle');
  };

  const showModal = (item: TopicVocabEntity) => {
    setSelectedVocab(item);
    setIsModalOpen(true);
    setSpeechStatus('idle');
    setSpokenWord('');
    setLiveTranscript('');
    setStarCount(0);
  };

  const handleCancel = () => {
    stopRecognition();
    setIsModalOpen(false);
    setSelectedVocab(null);
    setActiveListenId(null);
  };

  const playTargetWord = (vocab: TopicVocabEntity) => {
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

  const requestMicPermission = async (): Promise<boolean> => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (err) {
      notification.error({
        description:
          'Vui lòng cấp quyền sử dụng micro trong trình duyệt và thử lại.',
        message: 'Lỗi quyền truy cập',
      });
      return false;
    }
  };

  const toggleRecording = async () => {
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

    const hasPermission = await requestMicPermission();
    if (!hasPermission) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      notification.error({
        description: 'Trình duyệt không hỗ trợ nhận dạng giọng nói.',
        message: 'Không hỗ trợ',
      });
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

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsMicActive(false);
      setSpeechStatus('error');
      notification.error({
        description: `Đã xảy ra lỗi: ${event.error}. Vui lòng thử lại.`,
        message: 'Lỗi nhận dạng giọng nói',
      });
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsMicActive(false);

      if (!hasSuccess) {
        setSpeechStatus('error');
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      setSpeechStatus('error');
      notification.error({
        description: 'Không thể bắt đầu nhận dạng giọng nói. Vui lòng thử lại.',
        message: 'Lỗi khởi động',
      });
    }
  };

  const getReviewMessage = () => {
    if (starCount === 5) return 'Tuyệt vời!';
    if (starCount >= 3) return 'Tốt rồi!';
    return 'Cố gắng thêm nhé!';
  };

  return (
    <>
      <div className={styles.home}>
        <main className={styles.main}>
          <div className={styles.list}>
            <div className={styles.listTop}>
              <div className={styles.arrowIcons}>
                <ArrowIconBack
                  height={24}
                  onClick={() => navigate(-1)}
                  width={24}
                />
                <ArrowIconNext
                  height={24}
                  onClick={() => navigate(+1)}
                  width={24}
                />
              </div>
              <p className={styles.homeText}>{t('banner.homeText')}</p>
              <p>/</p>
              <p className={styles.courseText} onClick={() => navigate('/')}>
                {t('banner.courseText')}
              </p>
              <p>/</p>
              <p
                className={styles.courseText}
                onClick={() => navigate('/list-topic')}
              >
                {t('banner.topic')}
              </p>
              <p>/</p>
              <p
                className={styles.topicText}
                onClick={() => navigate(`/detail-topic/${id}`)}
              >
                {t('topic.title')} “{data?.name}”
              </p>
            </div>

            <p className={styles.title}>
              {t('topic.title')} “{data?.name}”
            </p>

            <div className={styles.topicBox}>
              {filteredData.map(item => (
                <div
                  className={styles.topicContent}
                  key={item.id}
                  onClick={() => showModal(item)}
                >
                  <div className={styles.contentTitle}>
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
                  <p className={styles.vocabulary}>{item.originText}</p>
                  <div className={styles.boxText}>
                    <p className={styles.textVocabulary}>
                      {item.japanesePronounce}
                    </p>
                    <p className={styles.textVocabulary}>
                      {item.vietnamesePronounce}
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
                  {liveTranscript || t('topic.voiceRun')}
                </p>
              </div>
            )}
            {speechStatus === 'success' && (
              <div className={styles.textMicComplete}>
                <div className={styles.resultMic}>
                  <p className={styles.titleResult}>
                    {' '}
                    {t('topic.resultVoice')}
                  </p>
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
                <p className={styles.colorMicError}>{t('topic.voiceFasle')}</p>
                <a className={styles.colorMicError} onClick={toggleRecording}>
                  {t('topic.retry')}
                </a>
              </div>
            )}

            <div className={styles.topicText}>
              <div className={styles.contentTitleBox}>
                <div className={styles.contentTitle}>
                  <p className={styles.titleTopic}>
                    {t('topic.titleVocabulary')}:
                  </p>
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
              <div className={styles.boxText}>
                <p className={styles.textVocabulary}>
                  {selectedVocab.japanesePronounce}
                </p>
                <p className={styles.textVocabulary}>
                  {selectedVocab.vietnamesePronounce}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

export default DetailTopic;
