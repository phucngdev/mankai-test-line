import { useState } from 'react';
import {
  ArrowLeftOutlined,
  CloseOutlined,
  CloudUploadOutlined,
  ExclamationCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Input, Switch, Upload, message } from 'antd';
import type { UploadFile } from 'antd';
import styles from './FloatingChat.module.scss';
import BaseCKEditor from '#/shared/components/ckeditor/BaseCKEditor';
import { PlayIcon } from '#/assets/svg/externalIcon';

interface ContentSupportModalProps {
  onClose: () => void;
  onBack: () => void;
}

function ContentSupportModal({ onClose, onBack }: ContentSupportModalProps) {
  const [description, setDescription] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleSubmit = () => {
    if (!description.trim()) {
      message.warning('Vui lòng mô tả yêu cầu chỉnh sửa');
      return;
    }

    message.success('Yêu cầu đã được gửi thành công!');
    onClose();
  };

  const handleRemove = (file: UploadFile) => {
    setFileList(prev => prev.filter(item => item.uid !== file.uid));
  };

  return (
    <div className={styles.contentModalOverlay} onClick={onBack}>
      <div className={styles.contentModal} onClick={e => e.stopPropagation()}>
        <div className={styles.contentModalHeader}>
          <button
            aria-label="Quay lại"
            className={styles.backButton}
            onClick={onBack}
          >
            <ArrowLeftOutlined />
          </button>
          <div className={styles.headerContent}>
            <h3 className={styles.contentModalTitle}>Hỗ trợ nội dung</h3>
          </div>
          <button
            aria-label="Đóng"
            className={styles.closeButton}
            onClick={onClose}
          >
            <CloseOutlined />
          </button>
        </div>

        <div className={styles.contentModalBody}>
          <div className={styles.formSection}>
            <label className={styles.formLabel}>Nội dung chi tiết</label>
            <BaseCKEditor changeData={setDescription} value={description} />
          </div>

          <div className={styles.formSection}>
            <label className={styles.formLabel}>Tài liệu đính kèm</label>
            <Upload.Dragger
              beforeUpload={() => false}
              className={styles.uploadDragger}
              fileList={fileList}
              multiple
              onRemove={handleRemove}
            >
              <div className={styles.uploadContent}>
                <CloudUploadOutlined className={styles.uploadIcon} />
                <p className={styles.uploadText}>
                  Kéo thả file hoặc{' '}
                  <span className={styles.uploadLink}>tải lên</span>
                </p>
                <p className={styles.uploadHint}>JPG, PNG, PDF (Max 10MB)</p>
              </div>
            </Upload.Dragger>
          </div>
        </div>

        <div className={styles.contentModalFooter}>
          <div className={styles.submitButton}>
            <p>Gửi yêu cầu</p>
            <PlayIcon color="#fff" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentSupportModal;
