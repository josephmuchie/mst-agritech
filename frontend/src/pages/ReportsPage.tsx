import React from 'react';
import { Card, List, Button, Tag, Space, Typography, Row, Col } from 'antd';
import { FilePdfOutlined, DownloadOutlined, BarChartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const REPORTS = [
  { id: 'sales-summary', title: 'Sales Summary', description: 'Monthly revenue breakdown by product and buyer country', category: 'Sales', format: 'PDF' },
  { id: 'farmer-performance', title: 'Farmer Performance', description: 'Yield and delivery metrics per verified farmer', category: 'Operations', format: 'PDF' },
  { id: 'shipment-status', title: 'Shipment Status Report', description: 'Current in-transit shipments with ETAs and carrier details', category: 'Logistics', format: 'PDF' },
  { id: 'payment-reconciliation', title: 'Payment Reconciliation', description: 'Matched payments against invoices across all currencies', category: 'Finance', format: 'PDF' },
  { id: 'market-prices', title: 'Market Price Report', description: 'Weekly commodity price trends and benchmarks', category: 'Analytics', format: 'PDF' },
  { id: 'audit-log-export', title: 'Audit Log Export', description: 'Full audit trail export with IP tracking', category: 'Compliance', format: 'CSV' },
];

const CATEGORY_COLOR: Record<string, string> = {
  Sales: 'blue', Operations: 'green', Logistics: 'purple',
  Finance: 'gold', Analytics: 'cyan', Compliance: 'red',
};

const ReportsPage: React.FC = () => (
  <div className="page-root">
  <Row gutter={[16, 16]}>
    <Col span={24}>
      <Card title={<Space><BarChartOutlined /><Title level={4} style={{ margin: 0 }}>Reports</Title></Space>}>
        <List
          dataSource={REPORTS}
          renderItem={(r) => (
            <List.Item
              actions={[
                <Button icon={<DownloadOutlined />} type="primary" ghost size="small">
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

export default ReportsPage;
