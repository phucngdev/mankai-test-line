import type { QuestionEntity } from '#/api/requests';
import { uploadFileToS3 } from '#/shared/components/upload/uploadFileToS3';
import { CheckCircleFilled } from '@ant-design/icons';
import { Modal, message } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MockTestExamEssay.module.scss';

export type MockTestEssayAnswerPayload = {
  text: string;
  fileUrl: string;
};

export type MockTestExamEssayProps = {
  question: QuestionEntity;
  disabled?: boolean;
  reviewMode?: boolean;
  savedAnswer?: MockTestEssayAnswerPayload | null;
  onSubmit: (payload: MockTestEssayAnswerPayload) => void;
};

const ACCEPT_ATTR =
  'image/jpeg,image/png,image/gif,image/webp,.pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function isAllowedFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const m = file.type.toLowerCase();
  if (
    ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ||
    m.startsWith('image/')
  )
    return true;
  if (ext === 'pdf' || m === 'application/pdf') return true;
  if (
    ['doc', 'docx'].includes(ext) ||
    m.includes('wordprocessing') ||
    m === 'application/msword'
  )
    return true;
  if (
    ['xls', 'xlsx'].includes(ext) ||
    m.includes('spreadsheet') ||
    m.includes('excel')
  )
    return true;
  return false;
}

function previewKind(file: File): 'image' | 'pdf' | 'office' {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const m = file.type;
  if (
    m.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
  )
    return 'image';
  if (ext === 'pdf' || m === 'application/pdf') return 'pdf';
  return 'office';
}

export function MockTestExamEssay({
  question,
  disabled = false,
  reviewMode = false,
  savedAnswer,
  onSubmit,
}: MockTestExamEssayProps): JSX.Element {
  const { t } = useTranslation();
  const [text, setText] = useState(savedAnswer?.text ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localSubmitted, setLocalSubmitted] = useState(false);
  const [submittedFileUrl, setSubmittedFileUrl] = useState(
    savedAnswer?.fileUrl ?? '',
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const locked = disabled || reviewMode || localSubmitted || submitting;

  useEffect(() => {
    if (savedAnswer) {
      setText(savedAnswer.text ?? '');
      setSubmittedFileUrl(savedAnswer.fileUrl ?? '');
      setLocalSubmitted(
        String(savedAnswer.text ?? '').trim().length > 0 ||
          String(savedAnswer.fileUrl ?? '').trim().length > 0,
      );
    }
  }, [savedAnswer?.text, savedAnswer?.fileUrl, savedAnswer]);

  const revokePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
  }, []);

  useEffect(() => () => revokePreview(), [revokePreview]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (locked) return;
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!isAllowedFile(f)) {
      message.warning(t('mocktest.essayInvalidFile'));
      return;
    }
    revokePreview();
    const url = URL.createObjectURL(f);
    previewUrlRef.current = url;
    setPreviewUrl(url);
    setFile(f);
  };

  const clearFile = () => {
    if (locked) return;
    revokePreview();
    setFile(null);
  };

  const canSubmit = useMemo(() => {
    if (locked) return false;
    return text.trim().length > 0 || file !== null;
  }, [locked, text, file]);

  const doSubmit = async () => {
    if (!canSubmit) {
      message.warning(t('mocktest.essayNeedContent'));
      return;
    }
    let fileUrl = '';
    if (file) {
      const uploaded = await uploadFileToS3(file);
      fileUrl = uploaded.publicUrl;
    }
    const payload: MockTestEssayAnswerPayload = {
      text: text.trim(),
      fileUrl,
    };
    setLocalSubmitted(true);
    setSubmittedFileUrl(fileUrl);
    onSubmit(payload);
    message.success(t('mocktest.essaySubmitOk'));
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      message.warning(t('mocktest.essayNeedContent'));
      return;
    }

    Modal.confirm({
      cancelText: t('mocktest.confirmCancel'),
      okText: t('mocktest.confirmSubmit'),
      title: t('mocktest.essayConfirmTitle'),
      content: t('mocktest.essayConfirmBody'),
      onOk: async () => {
        try {
          setSubmitting(true);
          await doSubmit();
        } catch {
          message.error(t('mocktest.essayUploadFail'));
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const previewBlock = useMemo(() => {
    if (!file || !previewUrl) return null;
    const kind = previewKind(file);
    if (kind === 'image') {
      return (
        <div className={styles.previewFrame}>
          <img alt="" className={styles.previewImg} src={previewUrl} />
        </div>
      );
    }
    if (kind === 'pdf') {
      return (
        <div className={styles.previewFrame}>
          <iframe
            className={styles.previewIframe}
            src={previewUrl}
            title={file.name}
          />
        </div>
      );
    }
    return (
      <div className={styles.officePreview}>
        <p className={styles.officeName}>{file.name}</p>
        <p className={styles.officeHint}>
          {t('mocktest.essayOfficePreviewHint')}
        </p>
      </div>
    );
  }, [file, previewUrl, t]);

  return (
    <div className={styles.root}>
      <label className={styles.label} htmlFor={`essay-text-${question.id}`}>
        {t('mocktest.essayYourAnswer')}
      </label>
      <textarea
        className={styles.textarea}
        disabled={locked}
        id={`essay-text-${question.id}`}
        onChange={e => setText(e.target.value)}
        placeholder={t('mocktest.essayPlaceholder')}
        rows={6}
        value={text}
      />

      <div className={styles.fileRow}>
        <input
          accept={ACCEPT_ATTR}
          aria-hidden
          className={styles.hiddenInput}
          disabled={locked}
          onChange={onPickFile}
          ref={inputRef}
          tabIndex={-1}
          type="file"
        />
        {!localSubmitted ? (
          <button
            className={styles.btnSecondary}
            disabled={locked}
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            {t('mocktest.essayAttachFile')}
          </button>
        ) : null}
        {file ? (
          <span className={styles.fileName}>{file.name}</span>
        ) : savedAnswer?.fileUrl && !file ? (
          <span className={styles.fileNameMuted}>
            {t('mocktest.essayAttachedLabel')}: {savedAnswer.fileUrl}
          </span>
        ) : null}
        {file && !locked ? (
          <button className={styles.btnGhost} onClick={clearFile} type="button">
            {t('mocktest.essayRemoveFile')}
          </button>
        ) : null}
      </div>

      <p className={styles.hint}>{t('mocktest.essayFileHint')}</p>

      {previewBlock}

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
          t('mocktest.essaySubmitQuestion')
        )}
      </button>

      {localSubmitted ? (
        <div className={styles.submittedFiles}>
          <p className={styles.submittedTitle}>
            {t('mocktest.essaySubmittedFiles')}
          </p>
          {submittedFileUrl ? (
            <a
              className={styles.submittedLink}
              href={submittedFileUrl}
              rel="noreferrer"
              target="_blank"
            >
              {submittedFileUrl}
            </a>
          ) : (
            <p className={styles.submittedEmpty}>{t('mocktest.essayNoFile')}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
