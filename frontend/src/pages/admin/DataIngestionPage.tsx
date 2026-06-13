import React, { useEffect, useState } from 'react';
import {
  Card, Tabs, Select, Upload, Button, Table, Typography, Space, Alert, Spin,
  message, Input, Tag, Row, Col, Statistic,
} from 'antd';
import {
  CloudUploadOutlined, ApiOutlined, HistoryOutlined, DownloadOutlined,
  DatabaseOutlined, CheckCircleOutlined, CloseCircleOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  useGetIngestionAccessQuery,
  useGetIngestionTypesQuery,
  useGetIngestionJobsQuery,
  useUploadIngestionExcelMutation,
  useUploadIngestionApiMutation,
} from '../../app/apiSlice';
import { useAppSelector } from '../../app/store';
import { getApiBaseUrl } from '../../config/api';
import { TABLE_SCROLL } from '../../utils/table';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: 'green', PARTIAL: 'orange', FAILED: 'red', PROCESSING: 'blue',
};

const API_EXAMPLE = `{
  "importType": "MARKET_PRICES",
  "records": [
    {
      "product_name": "Premium Roses",
      "price": "4.75",
      "currency_code": "USD",
      "country_iso": "ZW",
      "price_source": "Manual upload"
    }
  ]
}`;

const DataIngestionPage: React.FC = () => {
  const navigate = useNavigate();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const { data: access, isLoading: loadingAccess } = useGetIngestionAccessQuery();
  const { data: types, isLoading: loadingTypes } = useGetIngestionTypesQuery(undefined, {
    skip: !access?.allowed,
  });
  const { data: jobs, isLoading: loadingJobs, refetch: refetchJobs } = useGetIngestionJobsQuery(
    { page: 0, size: 20 },
    { skip: !access?.allowed },
  );
  const [uploadExcel, { isLoading: uploadingExcel }] = useUploadIngestionExcelMutation();
  const [uploadApi, { isLoading: uploadingApi }] = useUploadIngestionApiMutation();

  const [importType, setImportType] = useState<string>('MARKET_PRICES');
  const [apiJson, setApiJson] = useState(API_EXAMPLE);

  useEffect(() => {
    if (!loadingAccess && access && !access.allowed) {
      navigate('/403', { replace: true });
    }
  }, [access, loadingAccess, navigate]);

  if (loadingAccess) {
    return <div className="page-root"><Spin size="large" /></div>;
  }

  if (!access?.allowed) {
    return null;
  }

  const selectedType = types?.find((t) => t.type === importType);

  const downloadTemplate = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/config/ingestion/template/${importType}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mst-import-${importType.toLowerCase()}-template.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      message.error('Could not download template');
    }
  };

  const uploadProps: UploadProps = {
    accept: '.xlsx',
    maxCount: 1,
    showUploadList: true,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const result = await uploadExcel({ importType, file: file as File }).unwrap();
        message.success(`Import finished: ${result.recordsSuccess}/${result.recordsTotal} succeeded`);
        refetchJobs();
        onSuccess?.(result);
      } catch {
        message.error('Excel import failed');
        onError?.(new Error('Upload failed'));
      }
    },
  };

  const handleApiSubmit = async () => {
    try {
      const payload = JSON.parse(apiJson);
      const result = await uploadApi(payload).unwrap();
      message.success(`Import finished: ${result.recordsSuccess}/${result.recordsTotal} succeeded`);
      refetchJobs();
    } catch {
      message.error('Invalid JSON or import failed');
    }
  };

  return (
    <div className="page-root">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Title level={4} style={{ margin: 0 }}>
              <DatabaseOutlined /> Data Ingestion
            </Title>
            <Text type="secondary">
              Bulk import platform data via Excel upload or JSON API. Restricted to administrators
              and users with the <Text code>data:ingest</Text> permission.
            </Text>
          </Space>
        </Card>

        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <Text strong>Import type</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={importType}
                onChange={setImportType}
                loading={loadingTypes}
                options={(types ?? []).map((t) => ({
                  value: t.type,
                  label: t.label,
                }))}
              />
              {selectedType && (
                <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                  {selectedType.description}
                  <br />
                  Columns: <Text code>{selectedType.columns.join(', ')}</Text>
                </Paragraph>
              )}
            </Col>
            <Col xs={24} md={12}>
              <Button icon={<DownloadOutlined />} onClick={downloadTemplate} block>
                Download Excel template
              </Button>
            </Col>
          </Row>
        </Card>

        <Tabs
          items={[
            {
              key: 'excel',
              label: <><CloudUploadOutlined /> Excel upload</>,
              children: (
                <Card>
                  <Alert
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message="Upload a .xlsx file using the template column headers in row 1."
                  />
                  <Upload.Dragger {...uploadProps} disabled={uploadingExcel}>
                    <p className="ant-upload-drag-icon">
                      <CloudUploadOutlined style={{ color: '#0891B2', fontSize: 40 }} />
                    </p>
                    <p className="ant-upload-text">Click or drag Excel file to upload</p>
                    <p className="ant-upload-hint">Only .xlsx files · max 5,000 rows per batch</p>
                  </Upload.Dragger>
                </Card>
              ),
            },
            {
              key: 'api',
              label: <><ApiOutlined /> API upload</>,
              children: (
                <Card>
                  <Alert
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message="POST JSON to /api/v1/config/ingestion/api with importType and records array."
                  />
                  <TextArea
                    rows={14}
                    value={apiJson}
                    onChange={(e) => setApiJson(e.target.value)}
                    style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13 }}
                  />
                  <Button
                    type="primary"
                    icon={<ApiOutlined />}
                    onClick={handleApiSubmit}
                    loading={uploadingApi}
                    style={{ marginTop: 12 }}
                  >
                    Submit API import
                  </Button>
                </Card>
              ),
            },
            {
              key: 'history',
              label: <><HistoryOutlined /> Import history</>,
              children: (
                <Card>
                  <Table
                    rowKey="id"
                    loading={loadingJobs}
                    dataSource={jobs?.content ?? []}
                    scroll={TABLE_SCROLL}
                    className="responsive-table"
                    pagination={{
                      total: jobs?.totalElements ?? 0,
                      pageSize: 20,
                      showSizeChanger: false,
                    }}
                    columns={[
                      { title: 'ID', dataIndex: 'id', width: 60 },
                      { title: 'Type', dataIndex: 'importType', render: (v) => <Tag>{v}</Tag> },
                      { title: 'Source', dataIndex: 'source' },
                      { title: 'File', dataIndex: 'fileName', render: (v) => v ?? '—' },
                      {
                        title: 'Result',
                        key: 'result',
                        render: (_, r) => (
                          <Space>
                            <Statistic
                              value={r.recordsSuccess}
                              suffix={`/ ${r.recordsTotal}`}
                              valueStyle={{ fontSize: 14, color: '#16A34A' }}
                              prefix={<CheckCircleOutlined />}
                            />
                            {r.recordsFailed > 0 && (
                              <Text type="danger">
                                <CloseCircleOutlined /> {r.recordsFailed} failed
                              </Text>
                            )}
                          </Space>
                        ),
                      },
                      {
                        title: 'Status',
                        dataIndex: 'status',
                        render: (v) => <Tag color={STATUS_COLOR[v]}>{v}</Tag>,
                      },
                      {
                        title: 'Started',
                        dataIndex: 'startedAt',
                        render: (v: string) => v?.slice(0, 16).replace('T', ' '),
                      },
                    ]}
                    expandable={{
                      expandedRowRender: (r) => r.errorSummary
                        ? <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>{r.errorSummary}</pre>
                        : <Text type="secondary">No errors</Text>,
                    }}
                  />
                </Card>
              ),
            },
          ]}
        />
      </Space>
    </div>
  );
};

export default DataIngestionPage;
