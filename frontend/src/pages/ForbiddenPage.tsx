import React from 'react';
import { Button, Result, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

const { Text } = Typography;

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 48 }}>
      <BrandLogo variant="icon-cyan" height={88} style={{ marginBottom: 24 }} />
      <Result
        status="403"
        title="Access Denied"
        subTitle={<Text type="secondary">You do not have permission to view this section.</Text>}
        extra={<Button type="primary" onClick={() => navigate('/')}>Back to Dashboard</Button>}
      />
    </div>
  );
};

export default ForbiddenPage;
