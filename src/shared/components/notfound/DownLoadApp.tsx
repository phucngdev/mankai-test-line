import { Button, Result } from 'antd';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function DownLoadApp() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 700) {
        navigate('/auth');
      }
    };

    window.addEventListener('resize', handleResize);

    // Gọi một lần khi mount
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <Result
        // status="404"
        extra={
          <Link to="#">
            <Button type="primary">Tải App</Button>
          </Link>
        }
        subTitle="Xin lỗi, vui lòng tải app để sử dụng."
        title="Mankai"
      />
    </>
  );
}

export default DownLoadApp;
