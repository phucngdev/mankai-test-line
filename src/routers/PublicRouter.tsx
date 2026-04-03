import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer/Footer';

function PublicLayout() {
  return (
    <>
      {/* <Header /> */}
      <section>
        <div>
          <Outlet />{' '}
          {/* Các trang như LoginPage và ForgotPasswordPage sẽ được render tại đây */}
        </div>
      </section>
      <Footer />
    </>
  );
}

export default PublicLayout;
