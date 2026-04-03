// src/components/Header.tsx
import { baseURL } from '#/api/axios/axios';
import type { NotificationEntity } from '#/api/requests';
import { useResetDataOnLogout } from '#/shared/hooks/useResetDataOnLogout';
import { addNotification } from '#/shared/redux/slices/NotificationSlice';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { fetchUnreadCountNotification } from '#/shared/redux/thunk/NotificationThunk';
import { getProfile, putUpdateLocale } from '#/shared/redux/thunk/UserThunk';
import { BellOutlined, DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Avatar, Badge, Dropdown, message, notification } from 'antd';
import Cookies from 'js-cookie';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import avatar from 'src/assets/images/header/avatardefault.jpg';
import logoEL from 'src/assets/images/header/logoAnh.png';
import logo from 'src/assets/images/header/logoMankai.png';
import logoJP from 'src/assets/images/header/LogoNhat.png';
import logoVN from 'src/assets/images/header/logoVN.png';
import i18n from 'src/i18next.config';
import styles from './Header.module.scss';
import NotificationModal from './NotificationModal';

function Header(): React.ReactElement {
  const dispatch = useAppDispatch();
  const user = useResetDataOnLogout();
  const refreshToken = Cookies.get('refreshToken');

  const { t } = useTranslation();

  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useSelector((state: RootState) => state.notification);

  const handleHome = () => navigate('/');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    if (refreshToken) {
      dispatch(getProfile());
    }
  }, [dispatch]);

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('user');
    navigate('/');
    message.success('Đăng xuất thành công');
  };

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      label: <>{t('header.profile')}</>,
    },

    // {
    //   key: 'class',
    //   label: <>{t('header.class')}</>,
    // },
    {
      key: 'list-exam',
      label: <>{t('header.list-exam')}</>,
    },

    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: <>{t('header.logout')}</>,
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'list-exam') {
      navigate('/list-exam');
    } else if (key === 'logout') {
      handleLogout();
    }
  };

  const { data: userData } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!user) return;
    dispatch(fetchUnreadCountNotification());
  }, [user, dispatch]);

  useEffect(() => {
    if (userData?.locale && userData.locale !== i18n.language) {
      i18n.changeLanguage(userData.locale);
    }
  }, [userData?.locale]);

  useEffect(() => {
    const controller = new AbortController();

    const connectSSE = async () => {
      const token = Cookies.get('accessToken');

      try {
        const response = await fetch(`${baseURL}notifications/stream`, {
          headers: {
            Accept: 'text/event-stream',
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.body) return;

        const reader = response.body
          .pipeThrough(new TextDecoderStream())
          .getReader();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const lines = value.split('\n');
          lines.forEach(line => {
            if (line.startsWith('data:')) {
              try {
                const rawData = line.replace('data:', '').trim();

                const newNoti: { data: NotificationEntity } =
                  JSON.parse(rawData);

                dispatch(addNotification(newNoti.data));

                notification.success({
                  description: newNoti.data.message,
                  message: t('header.notificationPopup'),
                });
              } catch (e) {
                console.error(e);
              }
            }
          });
        }
      } catch {}
    };

    if (refreshToken) {
      connectSSE();
    }

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <img
          alt={t('header.logoAlt')}
          className={styles.logo}
          onClick={handleHome}
          src={logo}
        />
        <div className={styles.right}>
          <button
            aria-label={t('header.toggleMenu')}
            className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`}
            onClick={toggleMenu}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
            {/* <a href="/class">{t('header.nav.myClass')}</a> */}
            <Link to={`${user ? '/mock-test' : '/auth/login'}`}>
              {t('header.nav.dailyTest')}
            </Link>
            <Link to={`${user ? '/list-topic' : '/auth/login'}`}>
              {t('header.nav.topics')}
            </Link>
            <Link to={`${user ? '/list-course' : '/auth/login'}`}>
              {t('header.nav.learning')}
            </Link>
            <Link to={`${user ? '/forum' : '/auth/login'}`}>
              {t('header.nav.forum')}
            </Link>
          </nav>

          <div className={styles.dropdown}>
            <div className={styles.dropdown_left}>
              <Dropdown
                menu={{
                  items: [
                    { key: 'en', label: 'EN' },
                    { key: 'jp', label: 'JP' },
                    { key: 'vi', label: 'VI' },
                  ],
                  onClick: ({ key }) => {
                    i18n.changeLanguage(key);

                    if (user) {
                      dispatch(putUpdateLocale({ locale: key as any }));
                    }
                  },
                }}
                placement="bottomCenter"
                trigger={['click']}
              >
                <div className={styles.languageSelector}>
                  <img
                    alt="flag"
                    className={styles.languageFlag}
                    src={
                      i18n.language === 'vi'
                        ? `${logoVN}`
                        : i18n.language === 'jp'
                          ? `${logoJP}`
                          : `${logoEL}`
                    }
                  />
                  <p>{i18n.language.toUpperCase()}</p>
                  <DownOutlined style={{ fontSize: 12, marginLeft: 4 }} />
                </div>
              </Dropdown>
            </div>

            {user ? (
              <div
                className=""
                onClick={() => setIsNotificationModalOpen(true)}
                ref={bellRef}
                style={{ position: 'relative' }}
              >
                <Badge count={unreadCount}>
                  <Avatar
                    icon={<BellOutlined style={{ color: '#1d2939' }} />}
                    shape="circle"
                    size="large"
                    style={{
                      backgroundColor: '#d9dde1',
                      cursor: 'pointer',
                    }}
                  />
                </Badge>
              </div>
            ) : null}

            {user ? (
              <Dropdown
                menu={{ items, onClick: handleMenuClick }}
                placement="bottomCenter"
                trigger={['click']}
              >
                <img alt="avatar" src={user?.avatarUrl || avatar} />
              </Dropdown>
            ) : (
              <div
                className={styles.loginButton}
                onClick={() => navigate('/auth')}
              >
                {t('header.login')}
              </div>
            )}
          </div>
        </div>
      </div>
      {isNotificationModalOpen && bellRef.current ? (
        <NotificationModal
          onClose={() => setIsNotificationModalOpen(false)}
          triggerElement={bellRef.current}
        />
      ) : null}
    </header>
  );
}

export default Header;
