import styles from '#/src/pages/Auth/Auth.module.scss';
import { Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { EyeInvisibleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { authService } from '#/api/Auth/Auth';
import Loading from '#/shared/components/loading/Loading';

interface ResetPassProps {
  email: string;
  verifyCode: string;
}

function ResetPass({ email, verifyCode }: ResetPassProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isStrongPassword = (password: string) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongRegex.test(password);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      return message.warning('Vui lòng nhập đầy đủ mật khẩu.');
    }

    if (!isStrongPassword(password)) {
      return message.error(
        'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.',
      );
    }

    if (password !== confirmPassword) {
      return message.error('Mật khẩu không khớp.');
    }

    try {
      setLoading(true);
      await authService.resetPassword({ email, password, verifyCode });
      message.success('Đổi mật khẩu thành công!');
      navigate('/auth/login');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi đổi mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  return (
    <form className={styles.formForgot} onSubmit={handleResetPassword}>
      <div className={styles.login}>
        <p className={styles.titleForgot}>Đổi mật khẩu</p>
      </div>
      <div className={styles.inputValue}>
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
        <div className={styles.inputAcc}>
          <p>Nhập lại mật khẩu</p>
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
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            type="password"
            value={confirmPassword}
          />
        </div>
      </div>
      <div className={styles.buttonAndCheck}>
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
          <button type="submit">Đổi mật khẩu</button>
        </button>
      </div>
      <Link className={styles.linkLogin} to="/auth/forgot-password">
        Quay lại quên mật khẩu
      </Link>
    </form>
  );
}

export default ResetPass;
