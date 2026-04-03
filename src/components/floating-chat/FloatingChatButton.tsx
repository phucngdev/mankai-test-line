import logo from '#/src/assets/images/logo/logo_noccontent.png';
import { Tooltip } from 'antd';
import { useState } from 'react';
import styles from './FloatingChat.module.scss';
import FloatingChatBox from './FloatingChatBox';
import { useTranslation } from 'react-i18next';

const FloatingChatButton = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <>
      <Tooltip title={t('floatButton.tooltipButton')} open>
        <button
          aria-label="Mở chat hỗ trợ"
          className={styles.floatingButton}
          onClick={handleToggle}
        >
          <img alt="" src={logo} />
        </button>
      </Tooltip>
      {isOpen ? <FloatingChatBox onClose={() => setIsOpen(false)} /> : null}
    </>
  );
};

export default FloatingChatButton;
