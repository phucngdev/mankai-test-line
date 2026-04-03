import { Suspense } from 'react';
import { Spin } from 'antd';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { privateRouter } from './PrivateRouter';

const router = createBrowserRouter([...privateRouter]);

function Routes() {
  return (
    <Suspense fallback={<Spin fullscreen size="large" spinning={false} />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default Routes;
