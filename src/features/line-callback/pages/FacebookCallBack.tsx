import React, { useEffect, useState } from 'react';

const FacebookCallBack = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state'); // chính là deepLinkUri từ app

      console.log('[LINE Callback] code:', code);
      console.log('[LINE Callback] state (deepLinkUri):', state);

      if (!code) {
        setError('Không nhận được mã xác thực từ LINE.');
        return;
      }

      if (!state) {
        setError('Thiếu thông tin redirect.');
        return;
      }

      // state = exp://192.168.1.65:8081/--/line-callback (Expo Go)
      // hoặc mankai-app-native-expo://line-callback (production)
      const deepLink = `${state}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;

      console.log('[LINE Callback] deepLink:', deepLink);

      window.location.replace(deepLink);
    } catch (e) {
      setError('Đã xảy ra lỗi trong quá trình xử lý.');
    }
  }, []);

  const handleManualOpen = () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (code && state) {
      const deepLink = `${state}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
      window.location.replace(deepLink);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* LINE Icon */}
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <rect width="56" height="56" rx="16" fill="#06C755" />
          <path
            d="M46 26.3C46 18.4 38.3 12 28.8 12S11.6 18.4 11.6 26.3c0 7.1 6.3 13 14.8 14.1.6.1 1.4.4 1.6.9.2.4.1 1.1.1 1.1l-.3 1.6c-.1.4-.4 1.7 1.5.9s10-5.9 13.6-10.1C45 32.5 46 29.6 46 26.3z"
            fill="white"
          />
          <path
            d="M24.2 22.8h-1.3c-.2 0-.4.2-.4.4v7.9c0 .2.2.4.4.4h1.3c.2 0 .4-.2.4-.4v-7.9c0-.2-.2-.4-.4-.4zM33.6 22.8h-1.3c-.2 0-.4.2-.4.4v4.7l-3.6-4.9-.1-.1H27c-.2 0-.4.2-.4.4v7.9c0 .2.2.4.4.4h1.3c.2 0 .4-.2.4-.4v-4.7l3.6 4.9.1.1h1.2c.2 0 .4-.2.4-.4v-7.9c0-.2-.2-.4-.4-.4zM21.4 29.4h-3.5v-6.2c0-.2-.2-.4-.4-.4h-1.3c-.2 0-.4.2-.4.4v7.9c0 .1 0 .2.1.3.1.1.2.1.3.1h5.2c.2 0 .4-.2.4-.4V29.8c0-.2-.2-.4-.4-.4zM39.8 24.9c.2 0 .4-.2.4-.4v-1.3c0-.2-.2-.4-.4-.4h-5.2c-.1 0-.2 0-.3.1-.1.1-.1.2-.1.3v7.9c0 .1 0 .2.1.3.1.1.2.1.3.1h5.2c.2 0 .4-.2.4-.4v-1.3c0-.2-.2-.4-.4-.4h-3.5v-1.3h3.5c.2 0 .4-.2.4-.4v-1.3c0-.2-.2-.4-.4-.4h-3.5v-1.3h3.5z"
            fill="#06C755"
          />
        </svg>

        {error ? (
          <>
            <p style={styles.errorTitle}>Đã xảy ra lỗi</p>
            <p style={styles.subtitle}>{error}</p>
          </>
        ) : (
          <>
            <div style={styles.spinnerWrapper}>
              <div style={styles.spinner} />
            </div>
            <p style={styles.title}>Đang quay lại ứng dụng...</p>
            <p style={styles.subtitle}>Vui lòng chờ trong giây lát</p>
            <button style={styles.button} onClick={handleManualOpen}>
              Mở ứng dụng thủ công
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0faf4',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: '40px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    maxWidth: 360,
    width: '100%',
    textAlign: 'center',
  },
  spinnerWrapper: {
    marginTop: 8,
  },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid #e0f5e9',
    borderTop: '3px solid #06C755',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  title: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    color: '#111',
  },
  errorTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    color: '#e53e3e',
  },
  subtitle: {
    margin: 0,
    fontSize: 13,
    color: '#888',
  },
  button: {
    marginTop: 12,
    padding: '10px 24px',
    backgroundColor: '#06C755',
    color: '#fff',
    border: 'none',
    borderRadius: 24,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default FacebookCallBack;
