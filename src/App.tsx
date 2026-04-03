import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import routesConfig from './routers/routes.config';
import './styles/reset.css';
import { FloatingChatButton } from './components/floating-chat';

interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
}

const renderRoutes = (routes: RouteConfig[]) =>
  routes.map((route, index) => (
    <Route element={route.element} key={index} path={route.path}>
      {route.children ? renderRoutes(route.children) : null}
    </Route>
  ));

function App() {
  const location = useLocation();

  // useEffect(() => {
  //   window.scrollTo({ behavior: 'smooth', top: 0 });
  // }, [location.pathname]);

  // useEffect(() => {
  //   const handleContextMenu = (e: MouseEvent) => {
  //     e.preventDefault();
  //   };

  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (
  //       e.key === 'F12' ||
  //       (e.ctrlKey && e.shiftKey && e.key === 'I') ||
  //       (e.ctrlKey && e.shiftKey && e.key === 'J') ||
  //       (e.ctrlKey && e.key === 'U')
  //     ) {
  //       e.preventDefault();
  //       e.stopPropagation();
  //     }
  //   };

  //   document.addEventListener('contextmenu', handleContextMenu);
  //   document.addEventListener('keydown', handleKeyDown);

  //   return () => {
  //     document.removeEventListener('contextmenu', handleContextMenu);
  //     document.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, []);

  return (
    <>
      <Routes>{renderRoutes(routesConfig)}</Routes>
      <FloatingChatButton />
    </>
  );
}

export default App;
