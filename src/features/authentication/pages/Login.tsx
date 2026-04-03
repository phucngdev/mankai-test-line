import './Login.scss';
// image
import logo from '/src/assets/images/header/Logo.png';
import icon from '/src/assets/images/header/Navigation_Language.png';
import Logomark from '/src/assets/images/login/Logomark.png';
import google from '/src/assets/images/login/google.png';
//end image
import { Input } from 'antd';

function Login() {
  return (
    <>
      <div className="login">
        <div className="login__header">
          <div className="login__header-logo">
            <img alt="logo" src={logo} />
          </div>
          <div className="login__header-right">
            <div className="login__header-right__back">
              <p>Quay lại</p>
            </div>
            <div className="login__header-right__icon">
              <img alt="icon" src={icon} />
            </div>
          </div>
        </div>
        <div className="login__body">
          <div className="login__body-logo">
            <img alt="logo" src={Logomark} />
          </div>
          <div className="login__body-title">
            <p className="login__body-title--up">Log in to your account</p>
            <p className="login__body-title--down">
              Welcome back! Please enter your details.
            </p>
          </div>
          <div className="login__body-form">
            <div className="login__body-form__item">
              <label htmlFor="">Email</label>
              <Input placeholder="Enter your email" />
            </div>
            <div className="login__body-form__item">
              <label htmlFor="">Password</label>
              <Input placeholder="Enter your password" type="password" />
            </div>
            <div className="login__body-form__remember">
              <div className="login__body-form__remember-checkbox">
                <input type="checkbox" />
                <p>Remember for 30 days</p>
              </div>
              <p className="login__body-form__remember-forgot">
                Forgot password
              </p>
            </div>
            <div className="login__body-form__button">
              <p>Sign in</p>
            </div>
            <div className="login__body-form__google">
              <img alt="icon" src={google} />
              <p>Sign in with Google</p>
            </div>
          </div>
          <div className="login__body-footer">
            <p className="login__body-footer--up">Don’t have an account?</p>
            <p className="login__body-footer--down">Sign up</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
