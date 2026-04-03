import { ArrowIconBack, ArrowIconNext } from '#/assets/svg/externalIcon';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { getProfile } from '#/shared/redux/thunk/UserThunk';
import type { TabsProps } from 'antd';
import { Tabs, Upload, message } from 'antd';
import Cookies from 'js-cookie';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import avatar from 'src/assets/images/header/avatardefault.jpg';
import profile from 'src/assets/images/login/profile.png';
import ChangePasswordForm from './ChangePasswordForm';
import ConnectAccountForm from './ConnectAccountForm';
import PersonalInfoForm from './PersonalInfoForm';
import styles from './Profile.module.scss';

export default function Profile() {
  const data = useSelector((state: RootState) => state.user.data);
  const [activeClassId, setActiveClassId] = useState<string>('1');
  const [previewImage, setPreviewImage] = useState<string>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const token = Cookies.get('accessToken');
  const refreshToken = Cookies.get('refreshToken');

  if (!token) {
    message.warning('Bạn không thể truy cập khi chưa đăng nhập!');
    return <Navigate replace to="/" />;
  }

  useEffect(() => {
    if (refreshToken) {
      dispatch(getProfile());
    }
  }, [dispatch]);

  const items: TabsProps['items'] = useMemo(
    () => [
      {
        children: (
          <PersonalInfoForm
            data={data}
            previewImage={previewImage}
            selectedFile={selectedFile}
            setPreviewImage={setPreviewImage}
            setSelectedFile={setSelectedFile}
          />
        ),
        key: '1',
        label: <> {t('profile.filterProfile')}</>,
      },
      {
        children: <ChangePasswordForm />,
        key: '2',
        label: <> {t('profile.changePass')}</>,
      },
      {
        children: <ConnectAccountForm data={data} />,
        key: '3',
        label: <>Kết nối tài khoản</>,
      },
    ],
    [data, selectedFile, previewImage, setSelectedFile, setPreviewImage],
  );

  // useEffect(() => {
  //   if (data?.userType === 'PAID_USER') {
  //     setActiveClassId('1');
  //   } else {
  //     setActiveClassId('2');
  //   }
  // }, [data?.userType]);

  const onChange = (key: string) => {
    setActiveClassId(key);
  };

  return (
    <main className={styles.main}>
      <div className={styles.listTop}>
        <div className={styles.arrowIcons}>
          <ArrowIconBack height={24} onClick={() => navigate(-1)} width={24} />
          <ArrowIconNext height={24} onClick={() => navigate(+1)} width={24} />
        </div>
        <p className={styles.homeText} onClick={() => navigate(`/`)}>
          {t('banner.homeText')}
        </p>
        <p>/</p>
        <p className={styles.topicText} onClick={() => navigate(`/profile`)}>
          {t('header.profile')}
        </p>
      </div>

      <div className={styles.boxClass}>
        <div className={styles.content}>
          <p className={styles.titleClass}>{t('profile.textAccount')}</p>
          <p className={styles.contentClass}>{t('profile.contentAccount')}</p>

          <div className={styles.imgAvt}>
            <Upload
              beforeUpload={file => {
                const isImage = file.type.startsWith('image/');

                if (!isImage) {
                  message.error('Chỉ hỗ trợ định dạng ảnh!');
                  return Upload.LIST_IGNORE;
                }

                const preview = URL.createObjectURL(file);
                setSelectedFile(file);
                setPreviewImage(preview);

                return false;
              }}
              showUploadList={false}
            >
              <img
                alt="avatar"
                className={styles.avatarImage}
                src={previewImage || data?.avatarUrl || avatar}
                style={{ cursor: 'pointer' }}
              />
            </Upload>
          </div>
        </div>

        <div className={styles.imgClass}>
          <img alt="" src={profile} />
        </div>
      </div>

      <div className={styles.boxTab}>
        <Tabs
          activeKey={activeClassId}
          defaultActiveKey={activeClassId}
          items={items}
          onChange={onChange}
        />
      </div>
    </main>
  );
}
