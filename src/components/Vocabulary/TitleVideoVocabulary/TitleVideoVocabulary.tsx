import styles from './TitleVideoVocabulary.module.scss';
import {
  Pause,
  PlayIcon,
  PlayVideo,
  Volume,
  Zoom,
} from '#/assets/svg/externalIcon';
import { useEffect, useRef, useState } from 'react';
import { Slider } from 'antd';
import ReactPlayer from 'react-player';

interface TitleVideoVocabularyProps {
  videoUrl: string;
}

export default function TitleVideoVocabulary({
  videoUrl,
}: TitleVideoVocabularyProps) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [hasWatchedOnce, setHasWatchedOnce] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    setPlayedSeconds(state.playedSeconds);
  };

  const handleSeek = (seconds: number) => {
    setIsPlaying(false);
    playerRef.current?.seekTo(seconds, 'seconds');
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

  const cleanVideoUrl = videoUrl.replace(/&?list=[^&]+/, '');
  if (!videoUrl[0]) return null;
  return (
    <div className={styles.boxContent}>
      <div className={styles.content}>
        <div className={styles.boxTitle}>
          <div className={styles.iconVideo}>
            <PlayVideo color="#F37142" />
          </div>
          <div className={styles.contentVideo}>
            <p className={styles.nameTitle}>Video bài giảng</p>
            <p className={styles.textTitle}>
              Khám phá các khóa học Tiếng Nhật đa cấp độ, từ cơ bản đến nâng cao
            </p>
          </div>
        </div>
        <div
          className={`${styles.btnSession} ${styles.activeBtn}`}
          onClick={() => setIsFormVisible(prev => !prev)}
        >
          <p className={styles.textSession}>Xem video</p>
          <div className={styles.iconSession}>
            <PlayIcon color="#F37142" />
          </div>
        </div>
      </div>

      {isFormVisible ? (
        <div className={styles.formVideo}>
          <div className={styles.frameVideo}>
            <div className={styles.videoContainer} ref={videoContainerRef}>
              <ReactPlayer
                config={{
                  youtube: {
                    playerVars: {
                      autoplay: 0,
                      cc_load_policy: 0,
                      controls: 0,
                      disablekb: 1,
                      fs: 0,
                      iv_load_policy: 3,
                      listType: '',
                      modestbranding: 1,
                      playlist: undefined,
                      rel: 0,
                      showinfo: 0,
                    },
                  },
                }}
                controls={false}
                height="100%"
                key={cleanVideoUrl}
                onDuration={d => setDuration(d)}
                onEnded={() => {
                  setIsPlaying(false);
                  setHasWatchedOnce(true);
                }}
                onProgress={handleProgress}
                onSeek={handleSeek}
                playing={isPlaying}
                ref={playerRef}
                style={{
                  objectFit: isFullscreen ? 'contain' : 'cover',
                }}
                url={cleanVideoUrl}
                volume={volume}
                width="100%"
              />
            </div>
          </div>

          <div className={styles.customControls}>
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
                open: hasWatchedOnce,
              }}
              trackStyle={{
                backgroundColor: '#F97316',
                height: 4,
              }}
              value={playedSeconds}
            />

            <div className={styles.volumeControl}>
              <Volume color="#fff" />
              <input
                max={1}
                min={0}
                onChange={e => setVolume(parseFloat(e.target.value))}
                step={0.01}
                style={{
                  background: `linear-gradient(to right, #f97316 0%, #f97316 ${
                    volume * 100
                  }%, #ccc ${volume * 100}%, #ccc 100%)`,
                }}
                type="range"
                value={volume}
              />
            </div>
            <div className={styles.fullscreenButton} onClick={toggleFullscreen}>
              {isFullscreen ? <Zoom /> : <Zoom />}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
