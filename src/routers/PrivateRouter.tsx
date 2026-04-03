import { Navigate, Outlet } from 'react-router-dom';

function PrivateRouter() {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  return isAuthenticated ? <Outlet /> : <Navigate replace to="/auth" />;
}

export default PrivateRouter;
