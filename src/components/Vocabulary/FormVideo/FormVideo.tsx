import { useEffect, useRef, useState } from 'react';
import { Pause, PlayVideo, Volume, Zoom } from '#/assets/svg/externalIcon';
import styles from './FormVideo.module.scss';
import { Result, Slider, message } from 'antd';
import FilterVocabulary from '../FilterVocabulary/FilterVocabulary';
import TitleVocabulary from '../TitleVocabulary/TitleVocabulary';
import ReactPlayer from 'react-player';
import { shallowEqual, useSelector } from 'react-redux';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { getVideoByIdLession } from '#/shared/redux/thunk/VideoThunk';
import {
  getLessionById,
} from '#/shared/redux/thunk/LessionThunk';
import { updateLessionProgress } from '#/shared/redux/slices/LessionSlice';
import type { VideoProps } from '#/api/requests/interface/VideoProps';
import { CloseOutlined, RedoOutlined, UndoOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { SubtitleItem } from '#/api/requests/interface/VideoProps';
import { postLessionProgressService } from '#/api/services/lession.service';
import type { AxiosError } from 'axios';
import VideoQuestionPopup from './VideoQuestionPopup';
import type { TimeQuestion } from '#/api/requests/interface/VideoProps';

export default function FormVideo({
  lessonId,
  onClickNext,
  subtitles,
}: VideoProps) {
  const videoData = useSelector(
    (state: RootState) => state.video.data,
    shallowEqual,
  );
  const lessonData = useSelector((state: RootState) => state.lession.dataById);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const playerRef = useRef<ReactPlayer>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [hasPostedProgress, setHasPostedProgress] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'play' | 'pause' | 'forward' | 'rewind' | null;
    id: number;
  }>({ id: 0, type: null });

  const [showSubtitles, setShowSubtitles] = useState(true);

  const [activeLang, setActiveLang] = useState<'vn' | 'jp'>('vn');
  const subtitleContainerRef = useRef<HTMLDivElement>(null);

  const [activeTimeQuestions, setActiveTimeQuestions] = useState<TimeQuestion[]>([]);
  const [answeredTimeQuestionIds, setAnsweredTimeQuestionIds] = useState<Set<string>>(new Set());

  const subtitlesToUse: SubtitleItem[] = (videoData?.[0] as any)?.subtitle || subtitles || [];

  const activeSubtitleIndex = subtitlesToUse.findIndex(
    s => playedSeconds >= s.startTime && playedSeconds <= s.endTime,
  );

  const timeQuestions: TimeQuestion[] = (videoData?.[0] as any)?.timeQuestion || [];

  useEffect(() => {
    if (timeQuestions.length === 0 || activeTimeQuestions.length > 0) return;

    const currentSecond = Math.floor(playedSeconds);
    const questionsToTrigger = timeQuestions.filter(
      (q) => q.timer === currentSecond && !answeredTimeQuestionIds.has(q._id)
    );

    if (questionsToTrigger.length > 0) {
      setIsPlaying(false);
      setActiveTimeQuestions(questionsToTrigger);
    }
  }, [playedSeconds, timeQuestions, answeredTimeQuestionIds, activeTimeQuestions]);

  const handleRewind = () => {
    if (activeTimeQuestions.length === 0) return;
    const sortedQuestions = [...timeQuestions].sort((a, b) => a.timer - b.timer);
    // Use the first question of the current batch to find the previous timer
    const currentIndex = sortedQuestions.findIndex(q => q._id === activeTimeQuestions[0]._id);
    const previousTimer = currentIndex > 0 ? sortedQuestions[currentIndex - 1].timer : 0;
    
    playerRef.current?.seekTo(previousTimer, 'seconds');
    setPlayedSeconds(previousTimer);
    setActiveTimeQuestions([]);
    
    // If the rewind target is before the current question, start playing
    // Otherwise (e.g. first question at 0s), stay paused to re-trigger the popup properly
    if (previousTimer < activeTimeQuestions[0].timer) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (activeSubtitleIndex !== -1 && subtitleContainerRef.current) {
      const activeElement = subtitleContainerRef.current.children[
        activeSubtitleIndex
      ] as HTMLElement;
      if (activeElement) {
        const container = subtitleContainerRef.current;
        if (
          activeElement.offsetTop < container.scrollTop ||
          activeElement.offsetTop + activeElement.offsetHeight >
            container.scrollTop + container.clientHeight
        ) {
          activeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      }
    }
  }, [activeSubtitleIndex]);

  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const cleanVideoUrl = videoData?.[0]?.videoUrl?.trim();

  useEffect(() => {
    if (!lessonId) return;
    dispatch(getVideoByIdLession({ id: lessonId, limit: 10, offset: 0 }));
    dispatch(getLessionById(lessonId));

    const reset = () => {
      setPlayedSeconds(0);
      setDuration(0);
      setIsPlaying(false);
      setHasPostedProgress(false);
    };

    return () => reset();
  }, [lessonId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  useEffect(() => {
    let seekInterval: NodeJS.Timeout | null = null;
    let seekStep = 5;
    let keyHold = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }

      if (!playerRef.current) return;

      const isMobileLandscape = isFullscreen && window.innerWidth <= 767;

      const isSeekForward = isMobileLandscape
        ? e.code === 'ArrowDown'
        : e.code === 'ArrowRight';
      const isSeekBackward = isMobileLandscape
        ? e.code === 'ArrowUp'
        : e.code === 'ArrowLeft';

      const isVolUp = isMobileLandscape
        ? e.code === 'ArrowRight'
        : e.code === 'ArrowUp';
      const isVolDown = isMobileLandscape
        ? e.code === 'ArrowLeft'
        : e.code === 'ArrowDown';

      if (isSeekForward || isSeekBackward) {
        e.preventDefault();

        if (!keyHold) {
          keyHold = true;

          setPlayedSeconds(prev => {
            const newTime = isSeekForward ? prev + 5 : Math.max(prev - 5, 0);
            playerRef.current?.seekTo(newTime, 'seconds');
            return newTime;
          });

          seekStep = 5;
          seekInterval = setInterval(() => {
            setPlayedSeconds(prev => {
              const newTime = isSeekForward
                ? prev + seekStep
                : Math.max(prev - seekStep, 0);
              playerRef.current?.seekTo(newTime, 'seconds');
              return newTime;
            });

            if (seekStep < 20) {
              seekStep += 1;
            }
          }, 200);
        }
      }

      if (isVolUp) {
        e.preventDefault();
        setVolume(prev => Math.min(prev + 0.05, 1));
      } else if (isVolDown) {
        e.preventDefault();
        setVolume(prev => Math.max(prev - 0.05, 0));
      }

      if (e.code === 'KeyM') {
        e.preventDefault();
        setVolume(prev => (prev > 0 ? 0 : 0.5));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const isMobileLandscape = isFullscreen && window.innerWidth <= 767;
      const isSeek = isMobileLandscape
        ? e.code === 'ArrowDown' || e.code === 'ArrowUp'
        : e.code === 'ArrowRight' || e.code === 'ArrowLeft';

      if (isSeek) {
        keyHold = false;

        if (seekInterval) {
          clearInterval(seekInterval);
          seekInterval = null;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      if (seekInterval) clearInterval(seekInterval);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isFullscreen]);

  useEffect(() => {
    const handleOrientationChange = () => {
      if (
        window.innerWidth <= 767 &&
        window.matchMedia('(orientation: landscape)').matches
      ) {
        if (!document.fullscreenElement && mainContainerRef.current) {
          mainContainerRef.current.requestFullscreen().catch(err => {
            console.error('Failed to enter fullscreen:', err);
          });
        }
      } else if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () =>
      window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    setPlayedSeconds(state.playedSeconds);
  };

  const handleSeek = (seconds: number) => {
    setIsPlaying(false);
    playerRef.current?.seekTo(seconds, 'seconds');
  };

  const toggleFullscreen = async () => {
    try {
      if (!isMobile) {
        if (!document.fullscreenElement) {
          if (mainContainerRef.current) {
            await mainContainerRef.current.requestFullscreen();
          }

          setIsFullscreen(true);
        } else {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      } else if (!isFullscreen) {
        setIsFullscreen(true);

        if (mainContainerRef.current) {
          mainContainerRef.current.classList.add(styles.mobileLandscape);
          mainContainerRef.current.classList.add(styles.manualFullscreen);
        }
      } else {
        setIsFullscreen(false);

        if (mainContainerRef.current) {
          mainContainerRef.current.classList.remove(styles.mobileLandscape);
          mainContainerRef.current.classList.remove(styles.manualFullscreen);
        }
      }
    } catch (err) {
      console.error('Fullscreen/Orientation error:', err);
      setIsFullscreen(!isFullscreen);
    }
  };

  const formatTime = (time?: number) => {
    if (typeof time !== 'number') return '';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const showFeedback = (type: 'play' | 'pause' | 'forward' | 'rewind') => {
    setActionFeedback({ id: Date.now(), type });
  };

  const handleVideoMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !videoContainerRef.current) return;

    const rect = videoContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const { width } = rect;

    // Determine zone
    let zone: 'left' | 'right' | 'center' = 'center';
    if (x < width * 0.3) zone = 'left';
    else if (x > width * 0.7) zone = 'right';

    if (zone === 'center') return;

    holdTimeoutRef.current = setTimeout(() => {
      isLongPress.current = true;
      // Start seeking
      holdIntervalRef.current = setInterval(() => {
        setPlayedSeconds(prev => {
          const seekTime = zone === 'left' ? -2 : 2;
          const newTime = Math.max(Math.min(prev + seekTime, duration), 0);
          playerRef.current?.seekTo(newTime, 'seconds');
          showFeedback(zone === 'left' ? 'rewind' : 'forward');
          return newTime;
        });
      }, 200);
    }, 300); // Wait 300ms before treating as hold
  };

  const handleVideoMouseUp = () => {
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    // Note: isLongPress reset is handled in Click to prevent immediate click trigger
    setTimeout(() => {
      isLongPress.current = false;
    }, 0);
  };

  const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }

    if (!videoContainerRef.current) return;

    const rect = videoContainerRef.current.getBoundingClientRect();
    const isMobileLandscape = isFullscreen && isMobile;

    let dimension = 0;

    if (isMobileLandscape) {
      dimension = window.innerHeight;

      dimension = window.innerHeight;
      const relativeY = e.clientY;

      if (relativeY < dimension * 0.3) {
        const newTime = Math.max(playedSeconds - 5, 0);
        setPlayedSeconds(newTime);
        playerRef.current?.seekTo(newTime, 'seconds');
        showFeedback('rewind');
        return;
      }

      if (relativeY > dimension * 0.7) {
        const newTime = Math.min(playedSeconds + 5, duration);
        setPlayedSeconds(newTime);
        playerRef.current?.seekTo(newTime, 'seconds');
        showFeedback('forward');
        return;
      }

      const nextState = !isPlaying;
      setIsPlaying(nextState);
      showFeedback(nextState ? 'play' : 'pause');
      return;
    }

    const x = e.clientX - rect.left;
    const { width } = rect;

    if (x < width * 0.3) {
      const newTime = Math.max(playedSeconds - 5, 0);
      setPlayedSeconds(newTime);
      playerRef.current?.seekTo(newTime, 'seconds');
      showFeedback('rewind');
    } else if (x > width * 0.7) {
      const newTime = Math.min(playedSeconds + 5, duration);
      setPlayedSeconds(newTime);
      playerRef.current?.seekTo(newTime, 'seconds');
      showFeedback('forward');
    } else {
      const nextState = !isPlaying;
      setIsPlaying(nextState);
      showFeedback(nextState ? 'play' : 'pause');
    }
  };

  const handleError = () => {
    setError(true);
  };

  const playbackRates = [0.5, 0.75, 1, 1.5, 2, 4];
  const isMobile = window.innerWidth <= 767;

  return (
    <div className={styles.boxContent}>
      <TitleVocabulary
        description={t('titleVocabulary.descriptionVideo')}
        icon={<PlayVideo color="#F37142" />}
        isAnyCompleted={true}
        onClickNext={onClickNext}
        title={lessonData?.title}
      />
      <div className={styles.formVideo} ref={mainContainerRef}>
        <div className={styles.videoLayout}>
          <div className={styles.frameVideo}>
            <div
              className={styles.videoContainer}
              onClick={handleVideoClick}
              onContextMenu={e => e.preventDefault()}
              onMouseDown={handleVideoMouseDown}
              onMouseLeave={handleVideoMouseUp}
              onMouseUp={handleVideoMouseUp}
              ref={videoContainerRef}
            >
              {actionFeedback.type ? (
                <div className={styles.feedbackOverlay} key={actionFeedback.id}>
                  {actionFeedback.type === 'play' && (
                    <PlayVideo height={32} width={32} />
                  )}
                  {actionFeedback.type === 'pause' && (
                    <Pause height={32} width={32} />
                  )}
                  {actionFeedback.type === 'forward' && <span>+5s</span>}
                  {actionFeedback.type === 'rewind' && <span>-5s</span>}
                </div>
              ) : null}
              {isFullscreen ? (
                <button
                  className={styles.closeFullscreenButton}
                  onClick={e => {
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                >
                  <CloseOutlined />
                </button>
              ) : null}
              {error ? (
                <div className="">
                  <Result
                    title={
                      <>
                        <p style={{ color: '#fff' }}>
                          {t('titleVocabulary.errorVideo')}
                        </p>
                      </>
                    }
                  />
                </div>
              ) : (
                <ReactPlayer
                  config={{
                    youtube: {
                      embedOptions: {
                        host: 'https://www.youtube-nocookie.com',
                      },
                      playerVars: {
                        // ẩn annotation
                        autoplay: 0,

                        cc_load_policy: 0,

                        controls: 1,
                        disablekb: 1,
                        enablejsapi: 1,

                        endscreenEnable: false,
                        fs: 0,

                        iv_load_policy: 3,

                        modestbranding: 1,

                        origin:
                          typeof window !== 'undefined'
                            ? window.location.origin
                            : undefined,

                        playsinline: 1,

                        rel: 0,
                        showinfo: 0,
                      },
                    },
                  }}
                  controls={false}
                  height="100%"
                  key={cleanVideoUrl}
                  onDuration={(d: number) => setDuration(d)}
                  onEnded={async () => {
                    setIsPlaying(false);

                    if (!hasPostedProgress) {
                      try {
                        await postLessionProgressService({
                          lessonId,
                          progress: 100,
                        });
                        dispatch(
                          updateLessionProgress({ lessonId, progress: 100 }),
                        );
                        setHasPostedProgress(true);
                      } catch (error) {
                        const err = error as AxiosError;
                        console.log('Error posting lesson progress:', err);
                        message.error(
                          `Lỗi khi gửi tiến trình học (10s):  `,
                          10,
                        );
                      }
                    }
                  }}
                  onError={handleError}
                  onProgress={handleProgress}
                  onSeek={handleSeek}
                  playbackRate={playbackRate}
                  playing={isPlaying}
                  progressInterval={10}
                  ref={playerRef}
                  style={{
                    height: '100%',
                    left: 0,
                    objectFit: isFullscreen || isMobile ? 'contain' : 'cover',
                    position: 'absolute',
                    top: 0,
                    width: '100%',
                  }}
                  url={cleanVideoUrl}
                  volume={volume}
                  width="100%"
                />
              )}
            </div>
          </div>

          {showSubtitles && (
            <div className={styles.subtitleSection}>
              <div className={styles.subtitleHeader}>
                <div className={styles.title}>
                  {t('titleVocabulary.subtitle', 'Phụ đề')}
                </div>
                <div className={styles.langSwitch}>
                  <button
                    className={activeLang === 'vn' ? styles.active : ''}
                    onClick={() => setActiveLang('vn')}
                  >
                    VN
                  </button>
                  <button
                    className={activeLang === 'jp' ? styles.active : ''}
                    disabled
                    onClick={() => setActiveLang('jp')}
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    title="Chưa hỗ trợ"
                  >
                    JP
                  </button>
                </div>
              </div>
              <div
                className={styles.subtitleContainer}
                ref={subtitleContainerRef}
              >
                {subtitlesToUse.map((sub, index) => (
                  <div
                    className={`${styles.subtitleItem} ${
                      index === activeSubtitleIndex
                        ? styles.activeSubtitleItem
                        : ''
                    }`}
                    key={sub.id}
                    onClick={() => handleSeek(sub.startTime)}
                  >
                    {activeLang === 'vn' ? sub.textVn : sub.textJp}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className={`${styles.customControls} ${
            !isPlaying ? styles.paused : ''
          }`}
        >
          <div className={styles.controlsContent}>
            <button
              className={styles.playButton}
              onClick={() => setIsPlaying(prev => !prev)}
            >
              {isPlaying ? <Pause /> : <PlayVideo />}
            </button>

            <div className={styles.timeDisplay}>
              {formatTime(playedSeconds)} / {formatTime(duration)}
            </div>

            <Slider
              handleStyle={{
                backgroundColor: '#F97316',
                borderColor: '#F97316',
              }}
              max={duration}
              min={0}
              onChange={value => {
                setPlayedSeconds(value);
                playerRef.current?.seekTo(value, 'seconds');
              }}
              railStyle={{ backgroundColor: '#ffffff', height: 4 }}
              step={0.1}
              style={{ width: '100%' }}
              tooltip={{
                formatter: formatTime,
              }}
              trackStyle={{
                backgroundColor: '#F97316',
                height: 4,
              }}
              value={playedSeconds}
            />

            <button
              className={styles.seekButton}
              onClick={() => {
                const newTime = Math.max(playedSeconds - 10, 0);
                setPlayedSeconds(newTime);
                playerRef.current?.seekTo(newTime, 'seconds');
              }}
            >
              <UndoOutlined />
            </button>

            <button
              className={styles.seekButton}
              onClick={() => {
                const newTime = Math.min(playedSeconds + 10, duration);
                setPlayedSeconds(newTime);
                playerRef.current?.seekTo(newTime, 'seconds');
              }}
            >
              <RedoOutlined />
            </button>

            <div className={styles.volumeControl}>
              <div
                className={styles.volumeIcon}
                onClick={() => setShowVolumeSlider(prev => !prev)}
              >
                <Volume color="#fff" />
              </div>
              {showVolumeSlider ? (
                <input
                  className={styles.verticalSlider}
                  max={1}
                  min={0}
                  onChange={e => setVolume(parseFloat(e.target.value))}
                  step={0.01}
                  style={{
                    background: `linear-gradient(to right, #f97316 ${(volume * 100).toFixed(0)}%, #fff ${(volume * 100).toFixed(0)}%)`,
                    borderRadius: '2px',
                    height: '4px',
                  }}
                  type="range"
                  value={volume}
                />
              ) : null}
            </div>

            <div className={styles.timeSpeed}>
              <select
                onChange={e => setPlaybackRate(Number(e.target.value))}
                value={playbackRate}
              >
                {playbackRates.map(rate => (
                  <option key={rate} value={rate}>
                    x{rate}
                  </option>
                ))}
              </select>
            </div>

            <div
              className={`${styles.ccButton} ${!showSubtitles ? styles.inactive : ''}`}
              onClick={() => setShowSubtitles(prev => !prev)}
              title={showSubtitles ? 'Hide Subtitles' : 'Show Subtitles'}
            >
              CC
            </div>

            <div className={styles.fullscreenButton} onClick={toggleFullscreen}>
              {isFullscreen ? <Zoom /> : <Zoom />}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentTitle}>
        {videoData?.length ? (
          <FilterVocabulary data={videoData} dataComent={lessonId} />
        ) : (
          <p style={{ color: '#999' }}>Đang tải nội dung...</p>
        )}
      </div>

      {activeTimeQuestions.length > 0 && (
        <VideoQuestionPopup
          onCorrect={answeredIds => {
            setAnsweredTimeQuestionIds(prev => {
              const next = new Set(prev);
              answeredIds.forEach(id => next.add(id));
              return next;
            });
            setActiveTimeQuestions([]);
            setIsPlaying(true);
          }}
          onRewatch={handleRewind}
          onWrong={handleRewind}
          questions={activeTimeQuestions}
          visible={activeTimeQuestions.length > 0}
        />
      )}
    </div>
  );
}
