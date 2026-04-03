import styles from './Auth.module.scss';
import imgAuth from '#/src/assets/images/login/Frame 1000007260.png';

import { Outlet } from 'react-router-dom';

function Auth() {
  return (
    <>
      <div className={styles.containerAuth}>
        <div className={styles.leftAuth}>
          <img alt="img-login" src={imgAuth} />
        </div>
        <div className={styles.rightAuth}>
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default Auth;
