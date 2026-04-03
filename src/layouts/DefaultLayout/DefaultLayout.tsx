import { Outlet } from 'react-router-dom';
import styles from './DefaultLayout.module.scss';
import Header from '#/src/components/Header/Header';
import Footer from '#/src/components/Footer/Footer';
import FloatingChatButton from '#/src/components/floating-chat/FloatingChatButton';
import { useResetDataOnLogout } from '#/shared/hooks/useResetDataOnLogout';

function DefaultLayout() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.inner}>
        <Header />
        <Outlet />
        <Footer />
        <FloatingChatButton />
      </div>
    </section>
  );
}

export default DefaultLayout;
