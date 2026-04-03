import { useState } from 'react';
import styles from '#/src/pages/Auth/Auth.module.scss';
import { Checkbox, Input, message } from 'antd';
import { EyeInvisibleOutlined } from '@ant-design/icons';
import type { CheckboxProps } from 'antd';
import { Link } from 'react-router-dom';
import { authService } from '#/api/Auth/Auth';
import ResetPass from './ResetPass';

function ForgotPass() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [isVerifyStep, setIsVerifyStep] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange: CheckboxProps['onChange'] = e => {};

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return message.warning('Vui lòng nhập email.');

    try {
      setLoading(true);
      await authService.forgotPassword(email);
      message.success('Mã xác thực đã được gửi đến email.');
      setStep(2);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể gửi OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = () => {
    if (!verifyCode || verifyCode.length < 6) {
      return message.warning('Vui lòng nhập mã xác thực hợp lệ.');
    }

    message.success('Mã xác thực hợp lệ!');
    setStep(3);
  };

  return step === 1 ? (
    <form className={styles.formForgot} onSubmit={handleRequestOTP}>
      <div className={styles.login}>
        <p className={styles.titleForgot}>Quên mật khẩu</p>
      </div>

      <div className={styles.inputValue}>
        <div className={styles.inputAcc}>
          <p>Email hoặc tên đăng nhập</p>
          <Input
            className={styles.inputEmail}
            onChange={e => setEmail(e.target.value)}
            placeholder="Nhập email"
            type="text"
            value={email}
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

      <Link className={styles.linkLogin} to="/auth/login">
        Quay lại đăng nhập
      </Link>
    </form>
  ) : step === 2 ? (
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
        <p className={styles.linkForgot} onClick={() => setIsVerifyStep(false)}>
          Quay lại nhập thông tin
        </p>
      </div>
    </div>
  ) : (
    <ResetPass email={email} verifyCode={verifyCode} />
  );
}

export default ForgotPass;
