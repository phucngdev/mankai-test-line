import {
  BookOutlined,
  CloseOutlined,
  EditOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import styles from './FloatingChat.module.scss';
import { redirectRouter } from '#/configs/index';
import thumb_sp_ad from '#/assets/images/logo/thumb_sp_ad.jpg';
import { useTranslation } from 'react-i18next';

interface FloatingChatBoxProps {
  onClose: () => void;
}

type SupportType = 'system' | 'content' | 'adsive' | null;

const FloatingChatBox = ({ onClose }: FloatingChatBoxProps) => {
  const { t } = useTranslation();
  const [supportType, setSupportType] = useState<SupportType>(null);
  const [showModal, setShowModal] = useState<'' | 'content' | 'system'>('');

  const handleSupportTypeClick = (type: SupportType) => {
    if (type === 'system') {
      window.open(
        redirectRouter.support_system,
        '_blank',
        'noopener,noreferrer',
      );
    } else if (type === 'adsive') {
      window.open(
        redirectRouter.support_adsive,
        '_blank',
        'noopener,noreferrer',
      );
    } else {
      window.open(
        redirectRouter.support_content,
        '_blank',
        'noopener,noreferrer',
      );
    }
  };

  const handleBackFromContent = () => {
    setShowModal('');
  };

  return (
    <>
      <div className={styles.chatBoxOverlay} onClick={onClose}>
        <div className={styles.chatBox} onClick={e => e.stopPropagation()}>
          <div className={styles.chatBoxHeader}>
            <div className={styles.headerLeft}>
              <h3 className={styles.chatBoxTitle}>
                {t('floatButton.titleModal')}
              </h3>
            </div>
            <button
              aria-label="Đóng"
              className={styles.closeButton}
              onClick={onClose}
            >
              <CloseOutlined />
            </button>
          </div>

          <div className={styles.chatBoxBody}>
            <h4 className={styles.questionTitle}>
              {t('floatButton.subTitleModal')}
            </h4>

            <div className={styles.supportOptions}>
              <div
                className={`${styles.supportOption} ${
                  showModal === 'system' ? styles.active : ''
                }`}
                onClick={() => handleSupportTypeClick('system')}
              >
                <div className={styles.optionIcon}>
                  <SettingOutlined />
                </div>
                <div className={styles.optionContent}>
                  <h5 className={styles.optionTitle}>
                    {t('floatButton.system.title')}
                  </h5>
                  <p className={styles.optionDescription}>
                    {t('floatButton.system.subTitle')}
                  </p>
                </div>
              </div>

              <div
                className={`${styles.supportOption} ${
                  supportType === 'content' ? styles.active : ''
                }`}
                onClick={() => handleSupportTypeClick('content')}
              >
                <div className={styles.optionIcon}>
                  <img src={thumb_sp_ad} alt="" />
                  <div className={styles.dot_active}></div>
                </div>
                <div className={styles.optionContent}>
                  <h5 className={styles.optionTitle}>
                    {' '}
                    {t('floatButton.content.title')}
                  </h5>
                  <p className={styles.optionDescription}>
                    {t('floatButton.content.subTitle')}
                  </p>
                </div>
              </div>

              <div
                className={`${styles.supportOption} ${
                  supportType === 'adsive' ? styles.active : ''
                }`}
                onClick={() => handleSupportTypeClick('adsive')}
              >
                <div className={styles.optionIcon}>
                  <img src={thumb_sp_ad} alt="" />
                  <div className={styles.dot_active}></div>
                </div>
                <div className={styles.optionContent}>
                  <h5 className={styles.optionTitle}>
                    {t('floatButton.advise.title')}
                  </h5>
                  <p className={styles.optionDescription}>
                    {t('floatButton.advise.subTitle')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* {showModal === 'content' && (
        <ContentSupportModal
          onClose={onClose}
          onBack={() => setShowModal('')}
        />
      )}
      {showModal === 'system' && (
        <SystemSupportModal onClose={onClose} onBack={() => setShowModal('')} />
      )} */}
    </>
  );
};

export default FloatingChatBox;
