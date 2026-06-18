import React, { useState } from 'react';
import {
  Card, List, Tag, Typography, Space, Switch, Button, Modal, Form, Input,
  Select, message, Table, Divider, Alert, Spin, Tooltip,
} from 'antd';
import {
  ApiOutlined, CheckCircleOutlined, CloseCircleOutlined, PlayCircleOutlined,
  SettingOutlined, SyncOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useGetIntegrationsQuery,
  useUpdateIntegrationMutation,
  useInvokeIntegrationMutation,
  useGetIntegrationRunsQuery,
  useGetIntegrationInvoicesQuery,
  type IntegrationConfigResponse,
  type IntegrationSyncRunResponse,
  type ExternalInvoiceResponse,
} from '../../app/apiSlice';
import { TABLE_SCROLL } from '../../utils/table';
import { useIsMobile } from '../../hooks/useIsMobile';

const { Title, Text, Paragraph } = Typography;

const ENV_COLOR: Record<string, string> = {
  production: 'green', staging: 'orange', sandbox: 'blue',
};

const IntegrationsPage: React.FC = () => {
  const { data: integrations, isLoading, isError } = useGetIntegrationsQuery();
  const [updateIntegration, { isLoading: saving }] = useUpdateIntegrationMutation();
  const [invokeIntegration, { isLoading: invoking }] = useInvokeIntegrationMutation();
  const isMobile = useIsMobile();

  const [configTarget, setConfigTarget] = useState<IntegrationConfigResponse | null>(null);
  const [detailTarget, setDetailTarget] = useState<IntegrationConfigResponse | null>(null);
  const [form] = Form.useForm();

  const { data: runs } = useGetIntegrationRunsQuery(
    { id: detailTarget?.id ?? 0, page: 0, size: 10 },
    { skip: !detailTarget },
  );
  const { data: invoices } = useGetIntegrationInvoicesQuery(
    { id: detailTarget?.id ?? 0, page: 0, size: 10 },
    { skip: !detailTarget || detailTarget.systemType !== 'ORACLE_ERP' },
  );

  const openConfigure = (item: IntegrationConfigResponse) => {
    form.setFieldsValue({
      displayName: item.displayName,
      endpointUrl: item.endpointUrl ?? '',
      environment: item.environment,
      invoiceEndpoint: '/fscmRestApi/resources/latest/invoices',
      username: '',
      password: '',
      active: item.active,
      dataFlows: item.dataFlows?.join(', ') ?? 'INVOICES',
      description: item.description,
    });
    setConfigTarget(item);
  };

  const handleSaveConfig = async () => {
    if (!configTarget) return;
    try {
      const values = await form.validateFields();
      const extraConfig = JSON.stringify({
        environment: values.environment,
        dataFlows: ['INVOICES'],
        syncDirection: 'INBOUND',
        invoiceEndpoint: values.invoiceEndpoint,
        autoSyncEnabled: false,
        description: values.description || 'Share invoices from Oracle Financials into MST Agritech',
      });
      const credentialsJson = values.username
        ? JSON.stringify({ username: values.username, password: values.password ?? '' })
        : undefined;

      await updateIntegration({
        id: configTarget.id,
        displayName: values.displayName,
        endpointUrl: values.endpointUrl,
        credentialsJson,
        extraConfig,
        active: values.active,
      }).unwrap();

      message.success('Connector configuration saved');
      setConfigTarget(null);
    } catch {
      message.error('Failed to save connector configuration');
    }
  };

  const handleInvoke = async (item: IntegrationConfigResponse) => {
    try {
      const result = await invokeIntegration({ id: item.id, flowType: 'INVOICES' }).unwrap();
      message.success(result.message);
      setDetailTarget(item);
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message
        ?? 'Invoke failed — ensure the connector is active and configured in Settings';
      message.error(msg);
    }
  };

  const runColumns: ColumnsType<IntegrationSyncRunResponse> = [
    { title: 'Flow', dataIndex: 'flowType', key: 'flowType' },
    { title: 'Trigger', dataIndex: 'triggerType', key: 'triggerType' },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s: string) => <Tag color={s === 'SUCCESS' ? 'green' : s === 'FAILED' ? 'red' : 'blue'}>{s}</Tag>,
    },
    { title: 'Records', dataIndex: 'recordsProcessed', key: 'recordsProcessed' },
    {
      title: 'Started', dataIndex: 'startedAt', key: 'startedAt',
      render: (v: string) => new Date(v).toLocaleString(),
    },
    { title: 'Error', dataIndex: 'errorMessage', key: 'errorMessage', render: (v) => v ?? '—' },
  ];

  const invoiceColumns: ColumnsType<ExternalInvoiceResponse> = [
    { title: 'Invoice #', dataIndex: 'invoiceNumber', key: 'invoiceNumber' },
    { title: 'Buyer', dataIndex: 'buyerName', key: 'buyerName' },
    { title: 'Order Ref', dataIndex: 'orderReference', key: 'orderReference', render: (v) => v ?? '—' },
    {
      title: 'Amount', key: 'amount',
      render: (_, r) => `${r.currencyCode} ${r.amount.toLocaleString()}`,
    },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag>{s}</Tag> },
    {
      title: 'Synced', dataIndex: 'syncedAt', key: 'syncedAt',
      render: (v: string) => new Date(v).toLocaleString(),
    },
  ];

  const statusIcon = (item: IntegrationConfigResponse) => (
    <Tooltip title={item.active ? 'Active' : 'Inactive'}>
      {item.active
        ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
        : <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />}
    </Tooltip>
  );

  const configureBtn = (item: IntegrationConfigResponse, block?: boolean) => (
    <Button size="small" block={block} icon={<SettingOutlined />} onClick={() => openConfigure(item)}>
      Configure
    </Button>
  );
  const invokeBtn = (item: IntegrationConfigResponse, block?: boolean) => (
    <Button
      size="small" block={block} type="primary" icon={<PlayCircleOutlined />}
      loading={invoking} disabled={!item.active} onClick={() => handleInvoke(item)}
    >
      Invoke Invoices
    </Button>
  );
  const historyBtn = (item: IntegrationConfigResponse, block?: boolean) => (
    <Button size="small" block={block} icon={<SyncOutlined />} onClick={() => setDetailTarget(item)}>
      History
    </Button>
  );

  const renderMobileItem = (item: IntegrationConfigResponse) => (
    <List.Item className="integration-item-mobile">
      <div style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
          <Space align="center">
            <ApiOutlined style={{ fontSize: 22, color: '#0891B2' }} />
            <Text strong>{item.displayName}</Text>
          </Space>
          {statusIcon(item)}
        </Space>
        <Space size={4} wrap style={{ marginTop: 8 }}>
          <Tag color="cyan">{item.systemType}</Tag>
          <Tag color={ENV_COLOR[item.environment] ?? 'default'}>{item.environment}</Tag>
          {item.dataFlows?.map((f) => <Tag key={f}>{f}</Tag>)}
        </Space>
        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
          {item.description || 'ERP data connector'}
        </Text>
        {item.lastSyncAt && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Last sync: {new Date(item.lastSyncAt).toLocaleString()}
          </Text>
        )}
        <div className="integration-actions-mobile">
          {invokeBtn(item, true)}
          {configureBtn(item, true)}
          {historyBtn(item, true)}
        </div>
      </div>
    </List.Item>
  );

  const renderDesktopItem = (item: IntegrationConfigResponse) => (
    <List.Item
      actions={[
        <Tag key="env" color={ENV_COLOR[item.environment] ?? 'default'}>{item.environment}</Tag>,
        <span key="status">{statusIcon(item)}</span>,
        <span key="configure">{configureBtn(item)}</span>,
        <span key="invoke">{invokeBtn(item)}</span>,
        <span key="details">{historyBtn(item)}</span>,
      ]}
    >
      <List.Item.Meta
        avatar={<ApiOutlined style={{ fontSize: 28, color: '#0891B2' }} />}
        title={
          <Space wrap>
            {item.displayName}
            <Tag color="cyan">{item.systemType}</Tag>
            {item.dataFlows?.map((f) => <Tag key={f}>{f}</Tag>)}
          </Space>
        }
        description={
          <Space direction="vertical" size={0}>
            <Text type="secondary">{item.description || 'ERP data connector'}</Text>
            {item.lastSyncAt && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Last sync: {new Date(item.lastSyncAt).toLocaleString()}
              </Text>
            )}
          </Space>
        }
      />
    </List.Item>
  );

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  return (
    <div className="page-root">
      <Alert
        className="page-alert"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Integration Connectors"
        description="Configure ERP connectors in App Settings, then set endpoint credentials here. Use Invoke to manually pull invoices from Oracle ERP into the platform."
      />

      {isError && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Backend unavailable"
          description="Integration API could not be reached. Start the core-api service to manage connectors."
        />
      )}

      <Card
        className="integration-card"
        title={<Space><ApiOutlined /><Title level={4} style={{ margin: 0 }}>External Integrations</Title></Space>}
      >
        <List
          dataSource={integrations ?? []}
          locale={{ emptyText: 'No connectors found. Run database migrations to seed Oracle ERP.' }}
          renderItem={(item) => (isMobile ? renderMobileItem(item) : renderDesktopItem(item))}
        />
      </Card>

      <Modal
        title={`Configure — ${configTarget?.displayName}`}
        open={!!configTarget}
        onCancel={() => setConfigTarget(null)}
        onOk={handleSaveConfig}
        confirmLoading={saving}
        width="100%"
        style={{ maxWidth: 560, top: 20 }}
        okText="Save Connector"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="displayName" label="Display Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="endpointUrl"
            label="Oracle Base URL"
            extra="e.g. https://your-instance.fa.us2.oraclecloud.com"
          >
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="invoiceEndpoint" label="Invoice API Path">
            <Input />
          </Form.Item>
          <Form.Item name="environment" label="Environment">
            <Select options={[
              { value: 'sandbox', label: 'Sandbox' },
              { value: 'staging', label: 'Staging' },
              { value: 'production', label: 'Production' },
            ]} />
          </Form.Item>
          <Divider orientation="left" plain>Credentials</Divider>
          <Form.Item name="username" label="Oracle Username">
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Oracle Password">
            <Input.Password />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Sync History — ${detailTarget?.displayName}`}
        open={!!detailTarget}
        onCancel={() => setDetailTarget(null)}
        footer={null}
        width="100%"
        style={{ maxWidth: 800, top: 20 }}
      >
        <Paragraph type="secondary">Manual and scheduled invoke runs for this connector.</Paragraph>
        <Table
          rowKey="id"
          size="small"
          columns={runColumns}
          dataSource={runs?.content ?? []}
          pagination={false}
          scroll={TABLE_SCROLL}
          className="responsive-table"
        />

        {detailTarget?.systemType === 'ORACLE_ERP' && (
          <>
            <Divider />
            <Title level={5}>Imported Invoices</Title>
            <Table
              rowKey="id"
              size="small"
              columns={invoiceColumns}
              dataSource={invoices?.content ?? []}
              pagination={false}
              scroll={TABLE_SCROLL}
              className="responsive-table"
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default IntegrationsPage;
