import type { QuestionEntity } from '#/api/requests';
import { uploadFileToS3 } from '#/shared/components/upload/uploadFileToS3';
import { CheckCircleFilled } from '@ant-design/icons';
import { Modal, message } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MockTestExamRecording.module.scss';

export type MockTestRecordingAnswerPayload = {
  recordUrl: string;
};

export type MockTestExamRecordingProps = {
  question: QuestionEntity;
  disabled?: boolean;
  reviewMode?: boolean;
  savedAnswer?: MockTestRecordingAnswerPayload | null;
  onSubmit: (payload: MockTestRecordingAnswerPayload) => void;
};

function pickSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return '';
}

function formatDuration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0
    ? `${m}:${String(r).padStart(2, '0')}`
    : `0:${String(r).padStart(2, '0')}`;
}

export function MockTestExamRecording({
  question,
  disabled = false,
  reviewMode = false,
  savedAnswer,
  onSubmit,
}: MockTestExamRecordingProps): JSX.Element {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'recording' | 'recorded'>(
    'idle',
  );
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [localSubmitted, setLocalSubmitted] = useState(
    String(savedAnswer?.recordUrl ?? '').trim().length > 0,
  );
  const [submittedRecordUrl, setSubmittedRecordUrl] = useState(
    savedAnswer?.recordUrl ?? '',
  );
  const [submitting, setSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const urlRef = useRef<string | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const startTimeRef = useRef<number>(0);
  const mimeTypeRef = useRef<string>('');

  const locked = disabled || reviewMode || localSubmitted || submitting;

  useEffect(() => {
    if (savedAnswer?.recordUrl) {
      setLocalSubmitted(true);
      setSubmittedRecordUrl(savedAnswer.recordUrl);
    }
  }, [savedAnswer?.recordUrl]);

  const revokeUrl = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setAudioUrl(null);
  }, []);

  useEffect(
    () => () => {
      revokeUrl();
      streamRef.current?.getTracks().forEach(tr => tr.stop());
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          /* noop */
        }
      }
    },
    [revokeUrl],
  );

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(tr => tr.stop());
    streamRef.current = null;
  };

  const startRecording = async () => {
    if (locked) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      message.error(t('mocktest.recordingNotSupported'));
      return;
    }
    setError(null);
    revokeUrl();
    chunksRef.current = [];
    setDurationMs(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;
      const mime = pickSupportedMimeType();
      mimeTypeRef.current = mime || 'audio/webm';

      const mr = new MediaRecorder(
        stream,
        mime ? { mimeType: mime } : undefined,
      );
      mediaRecorderRef.current = mr;

      mr.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        stopStream();
        const blob = new Blob(chunksRef.current, {
          type: mimeTypeRef.current || 'audio/webm',
        });
        blobRef.current = blob;
        const elapsed = Date.now() - startTimeRef.current;
        setDurationMs(elapsed);
        const u = URL.createObjectURL(blob);
        urlRef.current = u;
        setAudioUrl(u);
        setStatus('recorded');
        mediaRecorderRef.current = null;
      };

      startTimeRef.current = Date.now();
      mr.start(200);
      setStatus('recording');
    } catch {
      setError(t('mocktest.recordingMicDenied'));
      setStatus('idle');
      stopStream();
    }
  };

  const stopRecording = () => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state === 'recording') {
      mr.stop();
    }
  };

  const clearRecording = () => {
    if (disabled || reviewMode || localSubmitted) return;
    revokeUrl();
    setDurationMs(0);
    setStatus('idle');
    chunksRef.current = [];
    blobRef.current = null;
  };

  const minDurationMs = 300;

  const doSubmit = async () => {
    if (!audioUrl || durationMs < minDurationMs) {
      message.warning(t('mocktest.recordingNeedAudio'));
      return;
    }
    const recordBlob = blobRef.current;
    if (!recordBlob) {
      message.warning(t('mocktest.recordingNeedAudio'));
      return;
    }
    const fileExt = (mimeTypeRef.current || 'audio/webm').includes('mp4')
      ? 'm4a'
      : 'webm';
    const uploadFile = new File(
      [recordBlob],
      `record-${Date.now()}.${fileExt}`,
      { type: mimeTypeRef.current || 'audio/webm' },
    );
    const uploaded = await uploadFileToS3(uploadFile);
    const payload: MockTestRecordingAnswerPayload = {
      recordUrl: uploaded.publicUrl,
    };
    setSubmittedRecordUrl(uploaded.publicUrl);
    setLocalSubmitted(true);
    onSubmit(payload);
    message.success(t('mocktest.recordingSubmitOk'));
  };

  const handleSubmit = () => {
    if (!audioUrl || durationMs < minDurationMs) {
      message.warning(t('mocktest.recordingNeedAudio'));
      return;
    }
    Modal.confirm({
      cancelText: t('mocktest.confirmCancel'),
      okText: t('mocktest.confirmSubmit'),
      title: t('mocktest.recordConfirmTitle'),
      content: t('mocktest.recordConfirmBody'),
      onOk: async () => {
        try {
          setSubmitting(true);
          await doSubmit();
        } catch {
          message.error(t('mocktest.recordUploadFail'));
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const canSubmit = Boolean(audioUrl && durationMs >= minDurationMs) && !locked;

  return (
    <div className={styles.root} data-question-id={question.id}>
      <p className={styles.label}>{t('mocktest.recordingInstructions')}</p>

      {error ? <p className={styles.error}>{error}</p> : null}

      {!localSubmitted ? (
        <div className={styles.controls}>
          {status !== 'recording' ? (
            <button
              className={styles.btnRecord}
              disabled={locked}
              onClick={startRecording}
              type="button"
            >
              <span className={styles.recDot} />
              {t('mocktest.recordingStart')}
            </button>
          ) : (
            <button
              className={styles.btnStop}
              onClick={stopRecording}
              type="button"
            >
              {t('mocktest.recordingStop')}
            </button>
          )}

          {status === 'recording' ? (
            <span className={styles.recordingBadge}>
              {t('mocktest.recordingInProgress')}
            </span>
          ) : null}
        </div>
      ) : null}

      {durationMs > 0 && status !== 'recording' ? (
        <p className={styles.duration}>
          {t('mocktest.recordingDuration')}: {formatDuration(durationMs)}
        </p>
      ) : null}

      {audioUrl && !localSubmitted ? (
        <div className={styles.playerWrap}>
          <p className={styles.playerLabel}>
            {t('mocktest.recordingPlayback')}
          </p>
          <audio
            className={styles.audio}
            controls
            controlsList="nodownload"
            preload="metadata"
            src={audioUrl}
          />
        </div>
      ) : null}

      {audioUrl && !locked && !localSubmitted ? (
        <button
          className={styles.btnGhost}
          onClick={clearRecording}
          type="button"
        >
          {t('mocktest.recordingClear')}
        </button>
      ) : null}

      {reviewMode && savedAnswer?.recordUrl ? (
        <p className={styles.reviewNote}>{t('mocktest.recordingReviewNote')}</p>
      ) : null}

      <button
        className={`${styles.btnSubmit} ${localSubmitted ? styles.btnSubmitDone : ''}`}
        disabled={localSubmitted || !canSubmit || submitting}
        onClick={handleSubmit}
        type="button"
      >
        {localSubmitted ? (
          <>
            <CheckCircleFilled /> {t('mocktest.submittedLabel')}
          </>
        ) : (
          t('mocktest.recordingSubmitQuestion')
        )}
      </button>

      {localSubmitted && submittedRecordUrl ? (
        <div className={styles.submittedAudioWrap}>
          <p className={styles.playerLabel}>
            {t('mocktest.recordSubmittedAudio')}
          </p>
          <audio
            className={styles.audio}
            controls
            controlsList="nodownload"
            preload="metadata"
            src={submittedRecordUrl}
          />
        </div>
      ) : null}

      <p className={styles.hint}>{t('mocktest.recordingLocalHint')}</p>
    </div>
  );
}
