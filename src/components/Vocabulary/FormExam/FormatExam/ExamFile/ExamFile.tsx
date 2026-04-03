import type { QuestionEntity, QuestionGroupEntity } from '#/api/requests';
import type { ExamFileProps } from '#/api/requests/interface/Exam/ExamProps';
import {
  BoxCheck,
  DropArrow,
  DropDownLoad,
  File,
} from '#/assets/svg/externalIcon';
import BaseCKEditor from '#/shared/components/ckeditor/BaseCKEditor';
import { uploadMultipleFileToS3 } from '#/shared/components/upload/uploadFileToS3';
import { FALLBACK } from '#/shared/constants';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import {
  createEssay,
  deleteEssay,
  getEssayByUser,
  updateEssay,
} from '#/shared/redux/thunk/EssayTestThunk';
import {
  DeleteOutlined,
  LoadingOutlined,
  SendOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { Button, Image, Input, Modal, Tooltip, Upload, message } from 'antd';
import { saveAs } from 'file-saver';
import Cookies from 'js-cookie';
import { FilePdf, YoutubeLogo } from 'phosphor-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import FilterVocabulary from '../../../FilterVocabulary/FilterVocabulary';
import styles from './ExamFile.module.scss';

export default function ExamFile({
  data,

  currentItem,
  onAnswerChange,
}: ExamFileProps) {
  function isQuestionEntity(
    obj: QuestionEntity | QuestionGroupEntity,
  ): obj is QuestionEntity {
    return 'essayAnswers' in obj;
  }

  const { dataEssay } = useSelector((state: RootState) => state.essayTest);

  const [link, setLink] = useState('');
  const [allLUrl, setAllLUrl] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [pdfFileListDocs, setPdfFileListDocs] = useState<UploadFile[]>([]);
  const [newFileList, setNewFileList] = useState<UploadFile[]>([]);
  const [translateY, setTranslateY] = useState(0);
  const [startY, setStartY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [loading, setLoading] = useState<'upload' | 'submit' | ''>('');
  const classId = localStorage.getItem('classId') || '';
  const { courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const isAnyCompleted = true;
  const userStr = Cookies.get('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const [submittedText, setSubmittedText] = useState('');

  const hasMeaningfulSubmittedText = (html: string) => {
    if (!html) return false;
    const plainText = html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return plainText.length > 0;
  };

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
      const fileMap = dataEssay.submittedExamUrls.map(file => ({
        name: file,
        status: 'done',
        uid: Math.random().toString(),
        url: file,
      }));
      setPdfFileListDocs(fileMap as UploadFile[]);
      setIsDone(true);
      setSubmittedText(dataEssay.submittedText ?? '');
    } else {
      setPdfFileListDocs([]);
      setIsDone(false);
      setSubmittedText('');
    }
  }, [dataEssay, data]);

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

  const handleDownload = (url: string, name?: string) => {
    if (!url) {
      message.warning('Không có đường dẫn tệp để tải.');
      return;
    }

    try {
      saveAs(url, name ?? 'download.pdf');
    } catch (err) {
      console.error('Download error:', err);
      message.error('Tải xuống thất bại');
    }
  };

  const getFileType = (url: string) => {
    if (!url) return 'unknown';

    if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';

    if (/(jpg|jpeg|png|gif|webp)$/i.test(url)) return 'image';

    if (/pdf$/i.test(url)) return 'pdf';

    if (/(doc|docx)$/i.test(url)) return 'doc';

    return 'unknown';
  };

  const handleSubmit = async () => {
    const hasFileOrLink = newFileList.length > 0 || Boolean(link.trim());
    const hasText = hasMeaningfulSubmittedText(submittedText);
    if (!hasFileOrLink && !hasText) {
      message.warning(t('message.warning.exam.essay.linkExists'));
      return;
    }
    try {
      setLoading('submit');

      const submittedExamUrls = [...allLUrl];

      if (link) {
        submittedExamUrls.push(link);
      }

      if (dataEssay?.id) {
        await dispatch(
          updateEssay({
            data: { submittedExamUrls, submittedText },
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
            submittedText,
            userId: user?.id,
          }),
        );
      }

      onAnswerChange?.(true);
      setAllLUrl([]);
      setLink('');
      setIsDone(true);
      setNewFileList([]);
    } catch (error) {
      message.error(t('message.error.exam.essay.upload'));
    } finally {
      setLoading('');
    }
  };

  const customRequest = async (fileList: File[], link?: string) => {
    if (!link && !fileList) {
      return;
    }

    try {
      setLoading('upload');
      const uploadedFiles = await uploadMultipleFileToS3(fileList.map(f => f));
      const imgUrl = uploadedFiles.map(url => url.publicUrl);
      const listFile: UploadFile[] = uploadedFiles.map(list => ({
        name: list.publicUrl,
        status: 'done',
        uid: Date.now().toString(),
        url: list.publicUrl,
      }));
      setNewFileList(listFile);
      setAllLUrl([...imgUrl]);
    } catch (error) {
      message.error(t('message.error.exam.essay.upload'));
    } finally {
      setLoading('');
    }
  };

  const handleDelete = (url: string) => {
    setNewFileList(prev => prev.filter(f => f.url !== url));
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
          );
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
          <div className={styles.boxDoc}>
            <div className={styles.docFile}>
              <div className={styles.boxFile}>
                <File />
              </div>
              <p className={styles.fileTitle}>{t('file.upload')}</p>
            </div>
            {isQuestionEntity(data) && data.essayAnswers[0]?.examUrl ? (
              <div
                className={styles.downloadButton}
                onClick={() => handleDownload(data.essayAnswers[0].examUrl)}
              >
                <DropDownLoad />
              </div>
            ) : null}
          </div>
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
              <div className={styles.modalBoxFile}>
                <div className={styles.uploadTime}>
                  <p>Nội dung bài làm</p>
                </div>
                <div
                  style={{
                    border: '1px solid var(--Gray-200, #e4e4e7)',
                    borderRadius: 8,
                    minHeight: 200,
                    overflow: 'hidden',
                  }}
                >
                  <BaseCKEditor
                    changeData={setSubmittedText}
                    value={submittedText}
                  />
                </div>
              </div>
              <div className={styles.modalUpload}>
                <div className={styles.uploadTime}>
                  {newFileList.length > 0 && !isDone && (
                    <p>Đã chọn {newFileList.length} file</p>
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
                      <Upload
                        beforeUpload={(file, fileList) => {
                          customRequest(fileList);
                          return false;
                        }}
                        multiple
                        onRemove={async file => {
                          if (!dataEssay) return;
                          await dispatch(deleteEssay(dataEssay.id));
                          setPdfFileListDocs(prev =>
                            prev.filter(f => f.uid !== file.uid),
                          );
                        }}
                        showUploadList={false}
                      >
                        <Button
                          icon={
                            loading === 'upload' ? (
                              <LoadingOutlined />
                            ) : (
                              <UploadOutlined />
                            )
                          }
                        >
                          {t('file.addUpload')}
                        </Button>
                      </Upload>
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
                      <Input
                        onChange={e => {
                          setLink(e.target.value);
                        }}
                        placeholder={t('file.textUploadLink')}
                        style={{
                          width: '300px',
                        }}
                        value={link}
                      />
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
                        title={loading === 'submit' ? 'Đang nộp...' : 'Nộp bài'}
                      >
                        <Button
                          icon={<SendOutlined />}
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
                      <span className={styles.text}>
                        {t('file.textUploadLink')}
                      </span>{' '}
                      {t('file.textUpload')}
                    </p>
                    <p>
                      <span className={styles.text}>{t('file.note')}</span>{' '}
                      {t('file.textNote')}
                    </p>
                  </div>
                </div>
              </div>
              {newFileList.length > 0 && (
                <>
                  <div className={styles.uploadTime}>
                    <p>Đã chọn {newFileList.length} file</p>
                  </div>
                  <div className={styles.modalBoxFile}>
                    {newFileList.map((file, index) => {
                      const fileType = getFileType(file?.url ?? '');

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
                                  {fileType === 'doc' && <File />}
                                  {fileType === 'youtube' && (
                                    <YoutubeLogo size={36} color="red" />
                                  )}
                                  {fileType === 'image' && (
                                    <Image
                                      src={file.url}
                                      fallback={FALLBACK}
                                      width={30}
                                      height={30}
                                      className={styles.imgPreview}
                                    />
                                  )}
                                  {fileType === 'unknown' && <File />}
                                  {fileType === 'pdf' && (
                                    <FilePdf size={36} color="red" />
                                  )}
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
                                        `Đã nộp-${index + 1}.pdf`,
                                    )}
                                  </div>
                                  <a
                                    className={styles.previewLink}
                                    href={file.url}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                  >
                                    {t('file.viewFile')}
                                  </a>
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
                    {dataEssay?.submittedExamUrls.length} file
                  </p>
                </div>
                {dataEssay
                  ? dataEssay.submittedExamUrls.map((url, index) => {
                      const fileType = getFileType(url);

                      return (
                        <div
                          className={styles.modalFile}
                          key={`${dataEssay.id}-${index}`}
                        >
                          <div className={styles.fileBody}>
                            <div className={styles.fileContent}>
                              <div className={styles.flexFirstContent}>
                                <div className={styles.fileBox}>
                                  {fileType === 'doc' && <File />}
                                  {fileType === 'youtube' && (
                                    <YoutubeLogo size={36} color="red" />
                                  )}
                                  {fileType === 'image' && (
                                    <Image
                                      src={url}
                                      fallback=""
                                      width={30}
                                      height={30}
                                      className={styles.imgPreview}
                                    />
                                  )}
                                  {fileType === 'unknown' && <File />}
                                  {fileType === 'pdf' && (
                                    <FilePdf size={36} color="red" />
                                  )}
                                </div>
                                <div className={styles.fileText}>
                                  <p className={styles.textTitle}>
                                    {decodeURIComponent(
                                      url.split('/').pop() ??
                                        `Đã nộp-${index + 1}.pdf`,
                                    )}
                                  </p>
                                  <a
                                    className={styles.previewLink}
                                    href={url}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                  >
                                    {t('file.viewFile')}
                                  </a>
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
              ) : null}
              <div className={styles.modalBoxFile}>
                <div className={styles.uploadTime}>
                  <p>File chữa giáo viên</p>
                </div>
                {dataEssay ? (
                  dataEssay.gradedTest?.split(',').map((url, index) => (
                    <div
                      className={styles.modalFile}
                      key={`${dataEssay.id}-${index}`}
                    >
                      <div className={styles.fileBody}>
                        <div
                          className={styles.fileContent}
                          style={{
                            justifyContent: 'flex-start',
                          }}
                        >
                          <div className={styles.fileBox}>
                            <File />
                          </div>
                          <div className={styles.fileText}>
                            <p className={styles.textTitle}>
                              {decodeURIComponent(
                                url.split('/').pop() ??
                                  `File chữa giáo viên-${index + 1}.pdf`,
                              )}
                            </p>
                            <a
                              className={styles.previewLink}
                              href={url}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              {t('file.viewFile')}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Giáo viên chưa chữa bài</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
