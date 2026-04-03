import { useState } from 'react';
import styles from '#/src/pages/Auth/Auth.module.scss';
import { EyeInvisibleOutlined } from '@ant-design/icons';
import { Input, message } from 'antd';
import { authService } from '#/api/Auth/Auth';
import type { GetProps } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

type OTPProps = GetProps<typeof Input.OTP>;

function Register() {
  const onChange: OTPProps['onChange'] = text => {};

  const onInput: OTPProps['onInput'] = value => {};

  const sharedProps: OTPProps = {
    onChange,
    onInput,
  };
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isVerifyStep, setIsVerifyStep] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');

  const isStrongPassword = (password: string) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongRegex.test(password);
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName || !phoneNumber || !email || !password) {
      return message.warning('Vui lòng điền đầy đủ thông tin.');
    }

    if (!emailRegex.test(email)) {
      return message.warning('Email không hợp lệ.');
    }

    if (!isStrongPassword(password)) {
      return message.error(
        'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.',
      );
    }

    try {
      setLoading(true);
      await authService.register({
        email,
        fullName,
        password,
        phoneNumber,
      });
      setIsVerifyStep(true);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyCode || verifyCode.length < 4) {
      return message.warning('Vui lòng nhập mã xác thực hợp lệ.');
    }

    try {
      await authService.confirmRegister({
        email,
        verifyCode,
      });

      message.success('Xác thực thành công! Đang đăng nhập...');

      const data = await authService.login({ email, password });

      Cookies.set('accessToken', data.data.accessToken);
      Cookies.set('refreshToken', data.data.refreshToken);
      Cookies.set('user', JSON.stringify(data.data.user));

      message.success('Đăng nhập thành công!');
      navigate('/');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Mã xác thực không đúng.');
    }
  };

  return isVerifyStep ? (
    <div className={styles.verifyForm}>
      <p className={styles.titleVerify}>Mã xác thực gửi tới email</p>
      <Input.OTP
        formatter={str => str.toUpperCase()}
        length={6}
        onChange={setVerifyCode}
        onInput={valArr => setVerifyCode(valArr.join(''))}
        value={verifyCode}
      />
      <button
        className={styles.buttonLogin}
        onClick={handleVerify}
        type="button"
      >
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
        <span>Xác thực</span>
      </button>
      <div>
        {/* <p className={styles.linkForgot}>
                    Gửi lại mã đăng ký
                </p> */}
        <p className={styles.linkForgot} onClick={() => setIsVerifyStep(false)}>
          Quay lại nhập thông tin
        </p>
      </div>
    </div>
  ) : (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.login}>
        <p className={styles.titleLogin}>Tạo tài khoản</p>
      </div>
      <div className={styles.inputValue}>
        <div className={styles.inputAcc}>
          <p>Họ và tên</p>
          <Input
            className={styles.inputEmail}
            onChange={e => setFullName(e.target.value)}
            placeholder="Nhập họ và tên"
            type="text"
            value={fullName}
          />
        </div>
        <div className={styles.inputAcc}>
          <p>Số điện thoại</p>
          <Input
            className={styles.inputEmail}
            maxLength={10}
            onChange={e => {
              const input = e.target.value;

              if (/^\d*$/.test(input)) {
                setPhoneNumber(input);
              }
            }}
            placeholder="Nhập số điện thoại"
            type="text"
            value={phoneNumber}
          />
        </div>
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
        <Link className={styles.linkForgot} to="/auth/login">
          Quay lại đăng nhập
        </Link>
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
          <button
            disabled={loading}
            style={{ cursor: 'pointer' }}
            type="submit"
          >
            {' '}
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </button>
      </div>
    </form>
  );
}

export default Register;
