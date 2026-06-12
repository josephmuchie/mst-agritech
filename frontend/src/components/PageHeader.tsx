import React from 'react';
import { Typography, Space } from 'antd';
import { useIsMobile } from '../hooks/useIsMobile';

const { Title, Paragraph } = Typography;

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  extra,
  className,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`page-header${className ? ` ${className}` : ''}`}>
      <div className="page-header-main">
        {icon && <div className="page-header-icon">{icon}</div>}
        <div className="page-header-text">
          <Title level={isMobile ? 4 : 3} className="page-header-title">
            {title}
          </Title>
          {description && (
            <Paragraph type="secondary" className="page-header-description">
              {description}
            </Paragraph>
          )}
        </div>
      </div>
      {extra && (
        <div className="page-header-extra">
          <Space wrap size={8}>{extra}</Space>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
