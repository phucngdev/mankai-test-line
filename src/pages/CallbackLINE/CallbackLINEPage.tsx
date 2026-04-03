import { useEffect } from 'react';

export default function CallbackLINEPage() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code) {
      if (window.opener) {
        window.opener.postMessage(
          { code, state, type: 'LINE_LOGIN_DATA' },
          window.location.origin,
        );

        window.close();
      } else {
        window.location.href = '/auth/login';
      }
    }
  }, []);
  return <div />;
}
