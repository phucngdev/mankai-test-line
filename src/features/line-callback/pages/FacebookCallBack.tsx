import React, { useEffect, useState } from 'react';

const FacebookCallBack = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const state = params.get('state');

      if (!accessToken) {
        setError('Không nhận được access token từ Facebook.');
        return;
      }

      if (!state) {
        setError('Thiếu thông tin redirect.');
        return;
      }

      const deepLink = `${decodeURIComponent(state)}?access_token=${encodeURIComponent(accessToken)}`;
      window.location.replace(deepLink);
    } catch (e) {
      setError('Đã xảy ra lỗi trong quá trình xử lý.');
    }
  }, []);

  const handleManualOpen = () => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const state = params.get('state');
    if (accessToken && state) {
      const deepLink = `${decodeURIComponent(state)}?access_token=${encodeURIComponent(accessToken)}`;
      window.location.replace(deepLink);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Facebook Icon */}
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <rect width="56" height="56" rx="16" fill="#1877F2" />
          <path
            d="M38 28C38 22.477 33.523 18 28 18C22.477 18 18 22.477 18 28C18 32.991 21.657 37.128 26.438 37.878V30.891H23.898V28H26.438V25.797C26.438 23.291 27.932 21.906 30.215 21.906C31.309 21.906 32.453 22.102 32.453 22.102V24.562H31.193C29.95 24.562 29.563 25.333 29.563 26.125V28H32.336L31.893 30.891H29.563V37.878C34.343 37.128 38 32.991 38 28Z"
            fill="white"
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
    backgroundColor: '#e7f0fd',
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
    boxShadow: '0 4px 24px rgba(24,119,242,0.12)',
    maxWidth: 360,
    width: '100%',
    textAlign: 'center',
  },
  spinnerWrapper: { marginTop: 8 },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid #d0e4fd',
    borderTop: '3px solid #1877F2',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  title: { margin: 0, fontSize: 17, fontWeight: 600, color: '#111' },
  errorTitle: { margin: 0, fontSize: 17, fontWeight: 600, color: '#e53e3e' },
  subtitle: { margin: 0, fontSize: 13, color: '#888' },
  button: {
    marginTop: 12,
    padding: '10px 24px',
    backgroundColor: '#1877F2',
    color: '#fff',
    border: 'none',
    borderRadius: 24,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default FacebookCallBack;
