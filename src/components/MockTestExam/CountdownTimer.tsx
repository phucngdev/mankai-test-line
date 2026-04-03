import { useEffect, useRef, useState } from 'react';
import styles from './CountdownTimer.module.scss';

export function CountdownTimer({
  timeLimit, // phút
  initialSeconds, // ✅ thời gian còn lại nếu có
  onTimeUp,
  disabled = false,
  onTick,
  /** Phút: cảnh báo khi thời gian còn lại ≤ giá trị này (theo cấu hình đề thi). */
  alertRemainingMinutes,
  warningLabel,
}: {
  timeLimit: number;
  initialSeconds?: number;
  onTimeUp?: () => void;
  disabled?: boolean;
  onTick?: (remain: number) => void;
  alertRemainingMinutes?: number;
  warningLabel?: string;
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    initialSeconds ?? timeLimit * 60,
  );
  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (initialSeconds !== undefined) {
      setRemainingSeconds(initialSeconds);
    }
  }, [initialSeconds]);

  useEffect(() => {
    if (disabled) return;

    if (remainingSeconds <= 0) {
      if (!hasCalledRef.current) {
        hasCalledRef.current = true;
        onTimeUp?.();
      }

      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        const next = prev > 0 ? prev - 1 : 0;
        onTick?.(next); // ✅ báo về parent
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds, onTimeUp, disabled, onTick]);

  const formatTime = (totalSeconds: number) => {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      '0',
    );
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const thresholdSec =
    alertRemainingMinutes != null && alertRemainingMinutes > 0
      ? alertRemainingMinutes * 60
      : null;
  const isWarning =
    thresholdSec != null &&
    remainingSeconds <= thresholdSec &&
    remainingSeconds > 0;

  return (
    <div className={styles.wrap}>
      <p className={`${styles.time} ${isWarning ? styles.warning : ''}`}>
        {formatTime(remainingSeconds)}
      </p>
      {isWarning && warningLabel ? (
        <p className={styles.warningText}>{warningLabel}</p>
      ) : null}
    </div>
  );
}
