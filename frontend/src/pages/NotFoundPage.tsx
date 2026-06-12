import React from 'react';
import { Button, Result, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

const { Text } = Typography;

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48 }} className="page-result">
      <BrandLogo variant="icon-cyan" height={88} style={{ marginBottom: 24 }} />
      <Result
        status="404"
        title="Page Not Found"
        subTitle={<Text type="secondary">The page you are looking for does not exist or is under construction.</Text>}
        extra={<Button type="primary" onClick={() => navigate('/')}>Back to Dashboard</Button>}
      />
    </div>
  );
};

export default NotFoundPage;
