/* eslint-disable @typescript-eslint/no-non-null-assertion */
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import './i18next.config.ts';
import App from './App.tsx';
import './styles/reset.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Provider } from 'react-redux';
import store from './shared/redux/store/index.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <BrowserRouter>
      <SnackbarProvider
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        autoHideDuration={3000}
        maxSnack={3}
      >
        <App />
      </SnackbarProvider>
    </BrowserRouter>
  </Provider>,
);
