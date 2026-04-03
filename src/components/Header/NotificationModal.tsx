import { NotificationEntity } from '#/api/requests';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import {
  fetchNotification,
  markReadNotification,
} from '#/shared/redux/thunk/NotificationThunk';
import { formatter } from '#/shared/utils';
import {
  CloseOutlined,
  MessageOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './NotificationModal.module.scss';

interface NotificationModalProps {
  onClose: () => void;
  triggerElement: HTMLElement;
}

const getNotificationIcon = (type: NotificationEntity.notificationType) => {
  switch (type) {
    case NotificationEntity.notificationType.GRADED_ESSAY_TEST:
      return <MessageOutlined />;
    default:
      return <MessageOutlined />;
  }
};

function NotificationModal({
  onClose,
  triggerElement,
}: NotificationModalProps) {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ right: 0, top: 0 });
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchNotification({ limit: 10, offset: 0 }));
  }, [dispatch]);

  const { items, status } = useSelector(
    (state: RootState) => state.notification,
  );
  const navigate = useNavigate();

  const clickNotification = (id: string, notification: NotificationEntity) => {
    dispatch(markReadNotification({ doc: { isSeen: true }, id }));

    if (
      notification.notificationType ===
      NotificationEntity.notificationType.GRADED_ESSAY_TEST
    ) {
      const { courseId, sessonId, lessonId } = notification.metaData || {};

      if (courseId && sessonId && lessonId) {
        navigate(
          `/vocabulary/${courseId}/${sessonId}/${lessonId}?submitDrawer=true`,
        );
        onClose();
      }
    }
  };

  useEffect(() => {
    if (triggerElement && modalRef.current) {
      const rect = triggerElement.getBoundingClientRect();
      const modalHeight = modalRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      // màn hình mobile
      if (window.innerWidth < 768) {
        setPosition({ right: 0, top: 76 });
        return;
      }

      // Tính toán vị trí: ngay dưới nút bell, căn phải
      const top = rect.bottom + 8; // 8px spacing
      const right = window.innerWidth - rect.right;

      // Nếu modal quá dài, đặt lên trên thay vì dưới
      const finalTop =
        top + modalHeight > viewportHeight ? rect.top - modalHeight - 8 : top;

      setPosition({ right, top: finalTop });
    }
  }, [triggerElement]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        triggerElement &&
        !triggerElement.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, triggerElement]);

  const handleLoadMoreNotifications = () => {
    dispatch(fetchNotification({ offset: items.length }));
  };

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose} />
      <div
        className={styles.modal}
        onClick={e => e.stopPropagation()}
        ref={modalRef}
        style={{
          right: `${position.right}px`,
          top: `${position.top}px`,
        }}
      >
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <h2 className={styles.modalTitle}>{t('header.notifications')}</h2>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.markAllButton} onClick={onClose}>
              <CloseOutlined />
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          <div
            className={styles.notificationList}
            style={{ display: 'flex', gap: '10px' }}
          >
            {status === 'pending' ? (
              <div className={styles.notificationLoading}>
                <Spin size="large" />
              </div>
            ) : (
              items.map(notification => (
                <div
                  className={`${styles.notificationItem} ${
                    !notification.isSeen ? styles.unread : ''
                  }`}
                  key={notification.id}
                  onClick={() =>
                    clickNotification(notification.id, notification)
                  }
                >
                  <div
                    className={styles.notificationIcon}
                    // style={{ backgroundColor: `${notification.iconColor}20` }}
                    // style={{ backgroundColor: `#6b7280` }}
                  >
                    <div
                      className={styles.iconWrapper}
                      style={{ color: '#6b7280' }}
                    >
                      {getNotificationIcon(notification.notificationType)}
                    </div>
                  </div>
                  <div className={styles.notificationContent}>
                    <h4 className={styles.notificationTitle}>
                      {notification.title}
                    </h4>
                    {notification.title ? (
                      <p className={styles.notificationDescription}>
                        {notification.title}
                      </p>
                    ) : null}
                    <span className={styles.notificationTimestamp}>
                      {formatter.formatDaytime(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.isSeen && (
                    <div className={styles.unreadIndicator} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.viewAllButton}
            onClick={handleLoadMoreNotifications}
          >
            <span>{t('header.viewMore')}</span>
            <RightOutlined />
          </button>
        </div>
      </div>
    </>
  );
}

export default NotificationModal;
