import React from 'react';
import { Card, List, Button, Tag, Space, Typography, Row, Col, Spin, message } from 'antd';
import { FilePdfOutlined, DownloadOutlined, BarChartOutlined } from '@ant-design/icons';
import { useGetReportsQuery } from '../app/apiSlice';

const { Title, Text } = Typography;

const CATEGORY_COLOR: Record<string, string> = {
  Sales: 'blue', Operations: 'green', Logistics: 'purple',
  Finance: 'gold', Analytics: 'cyan', Compliance: 'red',
};

const ReportsPage: React.FC = () => {
  const { data: reports, isLoading } = useGetReportsQuery();

  if (isLoading) {
    return <div className="page-root"><Spin size="large" /></div>;
  }

  return (
    <div className="page-root">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title={<Space><BarChartOutlined /><Title level={4} style={{ margin: 0 }}>Reports</Title></Space>}>
            <List
              dataSource={reports ?? []}
              renderItem={(r) => (
                <List.Item
                  actions={[
                    <Button
                      icon={<DownloadOutlined />}
                      type="primary"
                      ghost
                      size="small"
                      onClick={() => message.info(`Report generation for "${r.title}" will be available in a future release.`)}
                    >
                      Generate {r.format}
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<FilePdfOutlined style={{ fontSize: 24, color: '#0891B2' }} />}
                    title={<Space>{r.title}<Tag color={CATEGORY_COLOR[r.category]}>{r.category}</Tag></Space>}
                    description={<Text type="secondary">{r.description}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportsPage;
