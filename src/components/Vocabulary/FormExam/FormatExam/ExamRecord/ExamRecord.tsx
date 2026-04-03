import type { ExamRecordProps } from '#/api/requests/interface/Exam/ExamProps';
import { BoxCheck, DropArrow } from '#/assets/svg/externalIcon';
import { uploadFileToS3 } from '#/shared/components/upload/uploadFileToS3';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import {
  createEssay,
  getEssayByUser,
  updateEssay,
} from '#/shared/redux/thunk/EssayTestThunk';
import {
  DeleteOutlined,
  LoadingOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { Button, Modal, Tooltip, message } from 'antd';
import Cookies from 'js-cookie';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import FilterVocabulary from '../../../FilterVocabulary/FilterVocabulary';
import styles from '../ExamFile/ExamFile.module.scss';

const isRecordAudioUrl = (url?: string): boolean => {
  if (!url) return false;
  const path = url.split('?')[0].split('#')[0].toLowerCase();
  const lastSegment = path.split('/').pop() || '';

  if (/record-\d+/i.test(lastSegment)) return true;

  return /(webm|ogg|mp4|m4a|wav|aac|opus|flac|mp3)$/i.test(lastSegment);
};

export default function ExamRecord({
  data,

  currentItem,
  onAnswerChange,
}: ExamRecordProps) {
  const { dataEssay } = useSelector((state: RootState) => state.essayTest);
  const [allLUrl, setAllLUrl] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [newFileList, setNewFileList] = useState<UploadFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const [startY, setStartY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [loading, setLoading] = useState<'upload' | 'submit' | ''>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const classId = localStorage.getItem('classId') || '';
  const { courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const isAnyCompleted = true;
  const userStr = Cookies.get('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const [submittedText, setSubmittedText] = useState('');

  useEffect(() => {
    dispatch(getEssayByUser({ examId: currentItem.exam.id, userId: user?.id }));
  }, [data]);

  useEffect(() => {
    if (searchParams.get('submitDrawer') === 'true') {
      setIsSubmitModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (dataEssay) {
      const recordUrls =
        dataEssay.submittedExamUrls?.filter((u: string) =>
          isRecordAudioUrl(u),
        ) ?? [];

      const hasRecord = recordUrls.length > 0;
      setIsDone(hasRecord);

      setSubmittedText(
        hasRecord ? (recordUrls[0] ?? dataEssay.submittedText ?? '') : '',
      );
    } else {
      setIsDone(false);
      setSubmittedText('');
    }
  }, [dataEssay, data]);

  useEffect(() => {
    return () => {
      try {
        mediaRecorderRef.current?.stop();
      } catch {
        // ignore
      }
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
      mediaRecorderRef.current = null;
      recordedChunksRef.current = [];
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartY(e.clientY);
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || startY === null) return;
      const deltaY = e.clientY - startY;
      const clamped = Math.min(
        0,
        Math.max(-250, isOpen ? -250 + deltaY : deltaY),
      );
      setTranslateY(clamped);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        if (translateY < -100) {
          setIsOpen(true);
          setTranslateY(-250);
        } else {
          setIsOpen(false);
          setTranslateY(0);
        }
      }

      setIsDragging(false);
      setStartY(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, translateY, isOpen]);

  const handleSubmit = async () => {
    if (newFileList.length === 0) {
      message.warning(t('message.warning.exam.essay.emptyFile'));
      return;
    }

    try {
      setLoading('submit');

      const submittedExamUrls = [...allLUrl] as unknown as any[][];
      const submittedTextPayload = allLUrl[0] ?? (submittedText?.trim() || '');

      if (dataEssay?.id) {
        await dispatch(
          updateEssay({
            data: { submittedExamUrls, submittedText: submittedTextPayload },
            id: dataEssay.id,
          }),
        );
      } else {
        await dispatch(
          createEssay({
            classId,
            courseId,
            examId: currentItem.exam.id,
            status: true,
            submittedExamUrls,
            submittedText: submittedTextPayload,
            userId: user?.id,
          }),
        );
      }

      onAnswerChange?.(true);
      setAllLUrl([]);
      setIsDone(true);
      setNewFileList([]);
      setSubmittedText('');
    } catch (error) {
      message.error(t('message.error.exam.essay.upload'));
    } finally {
      setLoading('');
    }
  };

  const handleDelete = (url: string) => {
    setNewFileList(prev => prev.filter(f => f.url !== url));
    setAllLUrl(prev => {
      const next = prev.filter(u => u !== url);
      setSubmittedText(next[0] ?? '');
      return next;
    });
  };

  const startRecording = async () => {
    if (isRecording || isDone || loading) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      message.error('Không hỗ trợ thu âm trên trình duyệt này');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      recordedChunksRef.current = [];

      const supportedMimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
      ];

      const mimeType =
        supportedMimeTypes.find(mt => {
          return (
            typeof MediaRecorder !== 'undefined' &&
            typeof MediaRecorder.isTypeSupported === 'function' &&
            MediaRecorder.isTypeSupported(mt)
          );
        }) ?? undefined;

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const chunks = recordedChunksRef.current;
        recordedChunksRef.current = [];

        const mime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type: mime });
        const ext = mime.includes('ogg')
          ? 'ogg'
          : mime.includes('mp4')
            ? 'mp4'
            : 'webm';
        const file = new File([blob], `record-${Date.now()}.${ext}`, {
          type: blob.type,
        });

        try {
          setLoading('upload');
          const uploaded = await uploadFileToS3(file);
          const url = uploaded.publicUrl;

          setNewFileList(prev => [
            ...prev,
            {
              name: file.name,
              status: 'done',
              uid: Date.now().toString(),
              url,
            },
          ]);
          setAllLUrl(prev => [...prev, url]);
          setSubmittedText(url);
        } catch (error) {
          message.error(t('message.error.exam.essay.upload'));
        } finally {
          setLoading('');
          setIsRecording(false);
          mediaStreamRef.current?.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
          mediaRecorderRef.current = null;
        }
      };

      setIsRecording(true);
      recorder.start();
    } catch (error) {
      message.error(t('message.error.exam.essay.upload'));
      setIsRecording(false);
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
      mediaRecorderRef.current = null;
      recordedChunksRef.current = [];
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (recorder.state === 'inactive') return;
    recorder.stop();
  };

  const handleDeleteFile = (url: string, index: number) => {
    Modal.confirm({
      cancelText: t('message.confirm.exam.essay.cancelTextDeleteFile'),
      content: t('message.confirm.exam.essay.contentDeleteFile'),
      okText: t('message.confirm.exam.essay.okTextDeleteFile'),
      okType: 'danger',
      onOk: async () => {
        if (!dataEssay) return;
        try {
          const submitUrls = dataEssay.submittedExamUrls.filter(
            (u, idx) => !(u === url && idx === index),
          ) as unknown as any[][];
          await dispatch(
            updateEssay({
              data: { submittedExamUrls: submitUrls },
              id: dataEssay.id,
            }),
          );
        } catch (error) {
          console.log('🚀 ~ handleDeleteFile ~ error:', error);
          message.error(t('message.error.exam.essay.upload'));
        }
      },
      title: t('message.confirm.exam.essay.titleDeleteFile'),
    });
  };

  return (
    <>
      <div className={styles.boxContent}>
        <div className={styles.contentFile}>
          <div
            className={styles.textFile}
            dangerouslySetInnerHTML={{ __html: data ? data.content : '' }}
          />
          <div
            className={`${styles.btnSession} ${
              !isAnyCompleted ? styles.disabledBtn : styles.activeBtn
            }`}
            onClick={() => {
              setIsSubmitModalOpen(true);
              setSearchParams(prev => {
                prev.set('submitDrawer', 'true');
                return prev;
              });
            }}
          >
            <p className={styles.textSession}>{t('banner.btnSub')}</p>
          </div>
        </div>

        <div className={styles.contentTitle}>
          <div
            className={styles.contentTitle}
            style={{
              transform: `translateY(${translateY}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease',
            }}
          >
            <div className={styles.dropDown} onMouseDown={handleMouseDown}>
              <DropArrow />
            </div>
            <div className={styles.filterWrapper}>
              <FilterVocabulary
                data={
                  'essayAnswers' in data && Array.isArray(data.essayAnswers)
                    ? data.essayAnswers
                    : null
                }
                hideComment={true}
              />
            </div>
          </div>
        </div>
      </div>

      {isSubmitModalOpen ? (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            setIsSubmitModalOpen(false);
            setSearchParams(prev => {
              prev.delete('submitDrawer');
              return prev;
            });
          }}
        >
          <div
            className={styles.modalContent}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div
                className={styles.modalBtn}
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  setSearchParams(prev => {
                    prev.delete('submitDrawer');
                    return prev;
                  });
                }}
              >
                ✕
              </div>
              <h3>{t('file.btnUpload')}</h3>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalUpload}>
                <div className={styles.uploadTime}>
                  {newFileList.length > 0 && !isDone && (
                    <p>Đã ghi {newFileList.length} bản ghi</p>
                  )}
                </div>
                {isDone ? (
                  <div className={styles.uploadTime}>
                    <div className={styles.uploadStatus}>
                      <p>{t('class.status')}:</p>
                      <BoxCheck color="#12B76A" />
                      <p>{t('file.uploadDone')}</p>
                    </div>
                  </div>
                ) : null}

                <div className={styles.uploadImg}>
                  <div className={styles.spaceForm}>
                    <div className={styles.uploadBox}>
                      <Button
                        block
                        disabled={isDone || loading === 'upload' || isRecording}
                        onClick={startRecording}
                        icon={
                          loading === 'upload' ? <LoadingOutlined /> : undefined
                        }
                      >
                        Record giọng nói
                      </Button>
                      <div style={{ height: 10 }} />
                      <Button
                        block
                        danger
                        disabled={!isRecording}
                        onClick={stopRecording}
                      >
                        Dừng ghi âm
                      </Button>
                    </div>

                    <div
                      style={{
                        alignItems: 'center',
                        background: '#f4f4f5',
                        border: '1px solid var(--Gray-200, #e4e4e7)',
                        borderRadius: '8px',
                        display: 'flex',
                        gap: '10px',
                        padding: '12px',
                      }}
                    >
                      <p style={{ margin: 0 }}>
                        {isRecording ? 'Đang ghi...' : 'Nhấn Record để bắt đầu'}
                      </p>
                    </div>

                    <div
                      className={styles.uploadButton}
                      style={{
                        alignItems: 'center',
                        background: '#f4f4f5',
                        border: '1px solid var(--Gray-200, #e4e4e7)',
                        borderRadius: '8px',
                        display: 'flex',
                        gap: '10px',
                        padding: '12px',
                      }}
                    >
                      <Tooltip
                        title={
                          loading === 'submit'
                            ? t('exam.essay.tooltipSubmiting')
                            : t('exam.essay.tooltipSubmit')
                        }
                        open
                      >
                        <Button
                          icon={<SendOutlined />}
                          disabled={newFileList.length === 0 || isRecording}
                          onClick={async () => {
                            await handleSubmit();
                          }}
                        >
                          <span className={styles.textButton}>
                            {t('exam.essay.tooltipSubmit')}
                          </span>
                        </Button>
                      </Tooltip>
                    </div>
                  </div>

                  <div className={styles.uploadContent}>
                    <p>
                      <span className={styles.text}>Ghi âm</span> và nộp bài
                      bằng file audio.
                    </p>
                  </div>
                </div>
              </div>
              {newFileList.length > 0 && (
                <>
                  <div className={styles.uploadTime}>
                    <p>Đã ghi {newFileList.length} bản ghi</p>
                  </div>
                  <div className={styles.modalBoxFile}>
                    {newFileList.map((file, index) => {
                      return (
                        <div
                          className={styles.modalFile}
                          key={`${file.uid}-${index}`}
                        >
                          <div className={styles.fileBody}>
                            <div
                              className={styles.fileContent}
                              style={{
                                flex: 1,
                                justifyContent: 'space-between',
                              }}
                            >
                              <div className={styles.flexFirstContent}>
                                <div className={styles.fileBox}>
                                  <span
                                    style={{
                                      fontSize: 14,
                                      fontWeight: 700,
                                    }}
                                  >
                                    REC
                                  </span>
                                </div>
                                <div
                                  className={styles.fileText}
                                  style={{
                                    flex: 1,
                                  }}
                                >
                                  <div className={styles.textTitle}>
                                    {decodeURIComponent(
                                      file.name.split('/').pop() ??
                                        `Đã nộp-${index + 1}.audio`,
                                    )}
                                  </div>
                                  <audio
                                    controls
                                    src={file.url}
                                    style={{ width: '100%', marginTop: 6 }}
                                  />
                                </div>
                              </div>
                              <Button
                                danger
                                ghost
                                icon={<DeleteOutlined />}
                                style={{
                                  width: '32px !important',
                                }}
                                onClick={() => handleDelete(file.url ?? '')}
                              ></Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              <div className={styles.modalBoxFile}>
                <div className={styles.uploadTime}>
                  <p>
                    {t('exam.essay.submitted')}{' '}
                    {dataEssay?.submittedExamUrls.length} bản ghi
                  </p>
                </div>
                {dataEssay
                  ? dataEssay.submittedExamUrls.map((url, index) => {
                      return (
                        <div
                          className={styles.modalFile}
                          key={`${dataEssay.id}-${index}`}
                        >
                          <div className={styles.fileBody}>
                            <div className={styles.fileContent}>
                              <div className={styles.flexFirstContent}>
                                <div className={styles.fileBox}>
                                  <span
                                    style={{
                                      fontSize: 14,
                                      fontWeight: 700,
                                    }}
                                  >
                                    REC
                                  </span>
                                </div>
                                <div className={styles.fileText}>
                                  <p className={styles.textTitle}>
                                    {decodeURIComponent(
                                      url.split('/').pop() ??
                                        `Đã nộp-${index + 1}.audio`,
                                    )}
                                  </p>
                                  <audio
                                    controls
                                    src={url}
                                    style={{ width: '100%', marginTop: 6 }}
                                  />
                                </div>
                              </div>
                              <Button
                                danger
                                style={{
                                  width: '32px !important',
                                }}
                                ghost
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteFile(url, index)}
                              ></Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  : null}
              </div>
              <div className={styles.modalBoxFile}>
                <p>Điểm số</p>
                {dataEssay?.score ? (
                  <p>{dataEssay.score}</p>
                ) : (
                  <p>Chưa chấm điểm</p>
                )}
              </div>
              {dataEssay?.feedback ? (
                <div className={styles.modalBoxFile}>
                  <p>{t('exam.essay.comment')}</p>
                  <div
                    className={styles.modalFile}
                    dangerouslySetInnerHTML={{ __html: dataEssay.feedback }}
                    style={{
                      alignItems: 'flex-start',
                      textAlign: 'left',
                    }}
                  />
                </div>
              ) : (
                <div className={styles.modalBoxFile}>
                  <p>{t('exam.essay.comment')}</p>
                  <p>Chưa có nhận xét từ giáo viên</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
