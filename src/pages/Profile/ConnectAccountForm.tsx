import type { UserEntity } from '#/api/requests';
import { putUpdateLoginProviderService } from '#/api/services/user.service';
import { auth, facebookProvider } from '#/configs/firebase';
import { Form, Input, message } from 'antd';
import { FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import connectStyles from './ConnectAccountForm.module.scss';
import styles from './PersonalInfoForm.module.scss';

interface ConnectAccountFormProps {
  data?: UserEntity | null;
}

function ConnectAccountForm({ data }: ConnectAccountFormProps) {
  const [fbConnected, setFbConnected] = useState<boolean>(!!data?.facebookSub);
  const [lineConnected, setLineConnected] = useState(!!data?.lineSub);
  const [loadingFb, setLoadingFb] = useState(false);
  const [loadingLine, setLoadingLine] = useState(false);

  const handleConnectFacebook = async () => {
    if (fbConnected) return;
    setLoadingFb(true);

    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const credential = FacebookAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) throw new Error('Không lấy được token');

      await putUpdateLoginProviderService({
        loginProvider: 'FACEBOOK',
        token: credential.accessToken,
      });

      setFbConnected(true);

      message.success('Kết nối Facebook thành công!');
    } catch (error: any) {
      message.error(error.response.data.message[0]);
    } finally {
      setLoadingFb(false);
    }
  };

  const handleConnectLINE = () => {
    if (lineConnected) return;

    const clientID = import.meta.env.VITE_LINE_CLIENT_ID;
    const redirectURI = encodeURIComponent(
      import.meta.env.VITE_LINE_REDIRECT_URL,
    );
    const state = 'connect';
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientID}&redirect_uri=${redirectURI}&state=${state}&scope=profile%20openid%20email`;

    window.open(lineAuthUrl, '_blank', 'width=500,height=600');

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (
        event.data.type === 'LINE_LOGIN_DATA' &&
        event.data.state === 'connect'
      ) {
        const { code } = event.data;
        setLoadingLine(true);

        try {
          await putUpdateLoginProviderService({
            loginProvider: 'LINE',
            token: code,
          });

          setLineConnected(true);
          message.success('Kết nối LINE thành công!');
        } catch (error: any) {
          message.error(
            error.response?.data?.message?.[0] ||
              'Có lỗi xảy ra khi kết nối LINE!',
          );
        } finally {
          setLoadingLine(false);
        }

        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);
  };

  function ConnectButton({
    connected,
    loading,
    onClick,
  }: {
    connected: boolean;
    loading?: boolean;
    onClick?: () => void;
  }) {
    return (
      <button
        className={`${connectStyles.connectBtn} ${connected ? connectStyles.connected : ''}`}
        disabled={connected || loading}
        onClick={onClick}
        type="button"
      >
        {loading ? 'Đang kết nối...' : connected ? 'Đã kết nối' : 'Kết nối'}
      </button>
    );
  }

  return (
    <Form layout="vertical">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxWidth: '600px',
        }}
      >
        {/* Facebook */}
        <Form.Item label="Facebook">
          <Input
            className={styles.inputControl}
            disabled
            placeholder={fbConnected ? 'Đã kết nối' : 'Chưa kết nối'}
            prefix={
              <svg
                fill="#1877F2"
                height="18"
                viewBox="0 0 24 24"
                width="18"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.883v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
              </svg>
            }
            suffix={
              <ConnectButton
                connected={fbConnected}
                loading={loadingFb}
                onClick={handleConnectFacebook}
              />
            }
            value=""
          />
        </Form.Item>

        {/* LINE */}
        <Form.Item label="LINE">
          <Input
            className={styles.inputControl}
            disabled
            placeholder={lineConnected ? 'Đã kết nối' : 'Chưa kết nối'}
            prefix={
              <svg
                fill="#06C755"
                height="18"
                viewBox="0 0 24 24"
                width="18"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.629 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
            }
            suffix={
              <ConnectButton
                connected={lineConnected}
                loading={loadingLine}
                onClick={handleConnectLINE}
              />
            }
            value=""
          />
        </Form.Item>
      </div>
    </Form>
  );
}

export default ConnectAccountForm;
