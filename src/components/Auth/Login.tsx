import { authService } from '#/api/Auth/Auth';
import FacebookLoginIcon, {
  GoogleLoginIcon,
  LINELoginIcon,
} from '#/assets/svg/externalIcon';
import { auth, facebookProvider, googleProvider } from '#/configs/firebase';
import { expiresToken } from '#/shared/constants/expises';
import styles from '#/src/pages/Auth/Auth.module.scss';
import { EyeInvisibleOutlined } from '@ant-design/icons';
import type { CheckboxProps } from 'antd';
import { Checkbox, Input, message } from 'antd';
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const onChange: CheckboxProps['onChange'] = e => {};

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await authService.login({ email, password });

      Cookies.set('accessToken', data.data.accessToken, {
        expires: expiresToken.accessToken,
      });
      Cookies.set('refreshToken', data.data.refreshToken, {
        expires: expiresToken.refreshToken,
      });
      Cookies.set('user', JSON.stringify(data.data.user), {
        expires: expiresToken.refreshToken,
      });

      message.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error: any) {
      message.error('Đăng nhập thất bại!');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const credential = GoogleAuthProvider.credentialFromResult(result);
      const googleIdToken = credential?.idToken;

      if (!googleIdToken) {
        message.error('Không lấy được Google Token!');
        return;
      }

      const fullName = result.user.displayName;

      if (!fullName) {
        message.error('Không lấy được tên Google!');
        return;
      }

      const data = await authService.loginGoogle(googleIdToken, fullName);
      Cookies.set('accessToken', data.data.accessToken, {
        expires: expiresToken.accessToken,
      });
      Cookies.set('refreshToken', data.data.refreshToken, {
        expires: expiresToken.refreshToken,
      });
      Cookies.set('user', JSON.stringify(data.data.user), {
        expires: expiresToken.refreshToken,
      });
      message.success('Đăng nhập Google thành công!');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      message.error('Đăng nhập Google thất bại!');
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);

      const credential = FacebookAuthProvider.credentialFromResult(result);
      const facebookAccessToken = credential?.accessToken;

      if (!facebookAccessToken) {
        message.error('Không lấy được Facebook Token!');
        return;
      }

      const data = await authService.loginFacebook(facebookAccessToken);
      Cookies.set('accessToken', data.data.accessToken, {
        expires: expiresToken.accessToken,
      });
      Cookies.set('refreshToken', data.data.refreshToken, {
        expires: expiresToken.refreshToken,
      });
      Cookies.set('user', JSON.stringify(data.data.user), {
        expires: expiresToken.refreshToken,
      });
      message.success('Đăng nhập Facebook thành công!');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      message.error('Đăng nhập Facebook thất bại!');
    }
  };

  const handleLINELogin = () => {
    const clientID = import.meta.env.VITE_LINE_CLIENT_ID;
    const redirectURI = encodeURIComponent(
      import.meta.env.VITE_LINE_REDIRECT_URL,
    );
    const state = 'login';
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientID}&redirect_uri=${redirectURI}&state=${state}&scope=profile%20openid%20email`;

    window.open(lineAuthUrl, '_blank', 'width=500,height=600');

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (
        event.data.type === 'LINE_LOGIN_DATA' &&
        event.data.state === 'login'
      ) {
        const { code } = event.data;

        try {
          const data = await authService.loginWithLINE({ code });

          Cookies.set('accessToken', data.data.accessToken, {
            expires: expiresToken.accessToken,
          });
          Cookies.set('refreshToken', data.data.refreshToken, {
            expires: expiresToken.refreshToken,
          });
          Cookies.set('user', JSON.stringify(data.data.user), {
            expires: expiresToken.refreshToken,
          });

          navigate('/');
          message.success('Đăng nhập LINE thành công!');
        } catch (error) {
          message.error('Có lỗi xảy ra khi xử lý tài khoản!');
        }

        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.login}>
            <p className={styles.titleLogin}>Đăng nhập</p>
            <p className={styles.text}>
              Sử dụng tài khoản được cấp để đăng nhập vào hệ thống
            </p>
          </div>
          <div className={styles.inputValue}>
            <div className={styles.inputAcc}>
              <p>Email</p>
              <Input
                className={styles.inputEmail}
                onChange={e => setEmail(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                type="text"
                value={email}
              />
            </div>
            <div className={styles.inputAcc}>
              <p>Mật khẩu</p>
              <Input.Password
                className={styles.inputPass}
                iconRender={visible =>
                  visible ? (
                    <svg
                      fill="none"
                      height="17"
                      style={{ cursor: 'pointer' }}
                      viewBox="0 0 16 17"
                      width="16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.3866 8.50001C10.3866 9.82001 9.31995 10.8867 7.99995 10.8867C6.67995 10.8867 5.61328 9.82001 5.61328 8.50001C5.61328 7.18001 6.67995 6.11334 7.99995 6.11334C9.31995 6.11334 10.3866 7.18001 10.3866 8.50001Z"
                        stroke="#3D3D3D"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M8.00002 14.0133C10.3534 14.0133 12.5467 12.6267 14.0734 10.2267C14.6734 9.28668 14.6734 7.70668 14.0734 6.76668C12.5467 4.36668 10.3534 2.98001 8.00002 2.98001C5.64668 2.98001 3.45335 4.36668 1.92668 6.76668C1.32668 7.70668 1.32668 9.28668 1.92668 10.2267C3.45335 12.6267 5.64668 14.0133 8.00002 14.0133Z"
                        stroke="#3D3D3D"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                  ) : (
                    <EyeInvisibleOutlined />
                  )
                }
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                type="password"
                value={password}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Link className={styles.linkForgot} to="/auth/forgot-password">
                Quên mật khẩu?
              </Link>
              <Link className={styles.linkForgot} to="/auth/register">
                Tạo tài khoản
              </Link>
            </div>
          </div>
          <div className={styles.buttonAndCheck}>
            <Checkbox className={styles.check} onChange={onChange}>
              Lưu thông tin đăng nhập
            </Checkbox>
            <button className={styles.buttonLogin}>
              <svg
                fill="none"
                height="49"
                viewBox="0 0 165 49"
                width="165"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity="0.5">
                  <g style={{ mixBlendMode: 'soft-light' }}>
                    <rect
                      fill="#FBD3C4"
                      height="109.684"
                      transform="rotate(-27.1119 9.36328 -18.0518)"
                      width="10.8577"
                      x="9.36328"
                      y="-18.0518"
                    />
                  </g>
                  <g style={{ mixBlendMode: 'soft-light' }}>
                    <rect
                      fill="#FBD3C4"
                      height="109.684"
                      transform="rotate(-27.1119 24.1191 -18.0518)"
                      width="1.9657"
                      x="24.1191"
                      y="-18.0518"
                    />
                  </g>
                  <g style={{ mixBlendMode: 'soft-light' }}>
                    <rect
                      fill="#FBD3C4"
                      height="109.684"
                      transform="rotate(-27.1119 0 -18.0518)"
                      width="5.16073"
                      y="-18.0518"
                    />
                  </g>
                </g>
              </svg>
              <button style={{ cursor: 'pointer' }} type="submit">
                Đăng nhập
              </button>
            </button>
          </div>
        </form>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className={styles.divider}>Hoặc đăng nhập bằng</div>
          <div
            style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}
          >
            <button
              onClick={handleFacebookLogin}
              style={{ backgroundColor: 'transparent', border: 'none' }}
            >
              <FacebookLoginIcon />
            </button>
            <button
              onClick={handleGoogleLogin}
              style={{ backgroundColor: 'transparent', border: 'none' }}
              type="button"
            >
              <GoogleLoginIcon />
            </button>
            <button
              onClick={handleLINELogin}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '100%',
              }}
            >
              <LINELoginIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
