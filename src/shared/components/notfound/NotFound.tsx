import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <Result
      extra={
        <Button onClick={() => navigate('/')} type="primary">
          Trang chủ
        </Button>
      }
      status="404"
      subTitle="Trang không tồn tại"
      title="404"
    />
  );
}
