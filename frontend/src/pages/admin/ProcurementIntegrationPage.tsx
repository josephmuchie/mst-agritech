import React, { useEffect, useState } from 'react';
import {
  Card, Tabs, Typography, Table, Button, Modal, Form, Input, Select, Switch,
  Space, Tag, Badge, Popconfirm, message, Alert, Spin, Collapse, Divider,
} from 'antd';
import {
  ApiOutlined, FileProtectOutlined, CloudServerOutlined, PlusOutlined,
  EditOutlined, DeleteOutlined, SafetyOutlined, BookOutlined,
} from '@ant-design/icons';
import {
  useGetProcurementSettingsQuery, useUpdateProcurementSettingsMutation,
  useGetPunchoutCredentialsQuery, useCreatePunchoutCredentialMutation,
  useUpdatePunchoutCredentialMutation, useDeletePunchoutCredentialMutation,
} from '../../app/apiSlice';
import type { PunchoutCredentialResponse, ProcurementSettingsResponse } from '../../app/apiSlice';
import { getApiErrorMessage } from '../../utils/apiError';

const { Title, Text, Paragraph } = Typography;

const codeBlock: React.CSSProperties = {
  background: '#0f172a', color: '#e2e8f0', padding: 16, borderRadius: 8,
  fontSize: 12, overflowX: 'auto', fontFamily: 'monospace', whiteSpace: 'pre',
};

const Endpoint: React.FC<{ method: string; url?: string; color?: string }> = ({ method, url, color }) => (
  <Space size={8} style={{ marginBottom: 6 }}>
    <Tag color={color ?? 'blue'} style={{ fontFamily: 'monospace' }}>{method}</Tag>
    <Text copyable={{ text: url }} code style={{ fontSize: 12 }}>{url}</Text>
  </Space>
);

// ── Documentation tab ────────────────────────────────────────────
const DocsTab: React.FC<{ s?: ProcurementSettingsResponse }> = ({ s }) => {
  const cxmlExample = `POST ${s?.cxmlSetupUrl ?? '/api/v1/punchout/setup'}
Content-Type: application/xml

<cXML payloadID="..." timestamp="...">
  <Header>
    <From><Credential domain="NetworkID"><Identity>AN0100...</Identity></Credential></From>
    <To><Credential domain="${s?.supplierDomain ?? 'NetworkID'}"><Identity>${s?.supplierIdentity ?? 'MST-AGRITECH'}</Identity></Credential></To>
    <Sender>
      <Credential domain="NetworkID">
        <Identity>AN0100...</Identity>
        <SharedSecret>YOUR_SHARED_SECRET</SharedSecret>
      </Credential>
      <UserAgent>Ariba</UserAgent>
    </Sender>
  </Header>
  <Request>
    <PunchOutSetupRequest operation="create">
      <BuyerCookie>BC-123</BuyerCookie>
      <BrowserFormPost><URL>https://buyer/postback</URL></BrowserFormPost>
    </PunchOutSetupRequest>
  </Request>
</cXML>

→ Returns a PunchOutSetupResponse whose <StartPage><URL> opens the
  MST marketplace. On checkout a PunchOutOrderMessage is auto-posted
  back to your BrowserFormPost URL.`;

  const ociExample = `GET ${s?.ociStartUrl ?? '/api/v1/oci/start'}?HOOK_URL=https://buyer/hook&username=DUNS-ID&password=SECRET

→ 302 redirect into the marketplace. On checkout the cart is posted to
  HOOK_URL as NEW_ITEM-DESCRIPTION[n], NEW_ITEM-MATNR[n], NEW_ITEM-QUANTITY[n],
  NEW_ITEM-PRICE[n], NEW_ITEM-CURRENCY[n], NEW_ITEM-UNIT[n], ...`;

  const soapExample = `POST ${s?.soapEndpointUrl ?? '/soap'}
Content-Type: text/xml

<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:cat="http://mst.co.zw/agritech/catalog">
  <soapenv:Body>
    <cat:GetProductsRequest>
      <cat:category>Flowers</cat:category>
      <cat:username>YOUR_IDENTITY</cat:username>
      <cat:password>YOUR_SHARED_SECRET</cat:password>
    </cat:GetProductsRequest>
  </soapenv:Body>
</soapenv:Envelope>

WSDL: ${s?.wsdlUrl ?? '/soap/catalog.wsdl'}`;

  const restExample = `# List catalog (JWT bearer token required)
GET ${s?.restCatalogUrl ?? '/api/v1/marketplace/products'}?search=roses&category=Flowers
Authorization: Bearer <token>

# Single product
GET ${s?.restProductUrl ?? '/api/v1/marketplace/products/{id}'}`;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Alert
        type="info" showIcon
        message="Connect your procurement system to the MST AgriTech marketplace"
        description="The catalog is exposed over four channels. PunchOut (cXML & OCI) lets buyers browse here and return a cart to their ERP; SOAP and REST let systems pull the catalog directly. Buyer credentials are managed in the Buyer Credentials tab; channels can be toggled in Service Settings."
      />

      <Collapse
        defaultActiveKey={['cxml']}
        items={[
          {
            key: 'cxml',
            label: <Space><FileProtectOutlined />cXML PunchOut — Ariba, Coupa, Jaggaer, SAP Ariba</Space>,
            children: (
              <>
                <Paragraph type="secondary">
                  Configure a PunchOut catalog in your procurement system using the setup URL below and a
                  shared secret issued from the <b>Buyer Credentials</b> tab. Your system POSTs a
                  <Text code>PunchOutSetupRequest</Text>; we authenticate the Sender credential's shared secret and
                  return a start page. When the buyer checks out, a <Text code>PunchOutOrderMessage</Text> is posted
                  back to your <Text code>BrowserFormPost</Text> URL as <Text code>cxml-urlencoded</Text>.
                </Paragraph>
                <Endpoint method="POST" url={s?.cxmlSetupUrl} color="green" />
                <pre style={codeBlock}>{cxmlExample}</pre>
              </>
            ),
          },
          {
            key: 'oci',
            label: <Space><ApiOutlined />Oracle OCI — Oracle iProcurement / Fusion, SAP SRM</Space>,
            children: (
              <>
                <Paragraph type="secondary">
                  Configure the catalog punchout in Oracle iProcurement / SAP SRM pointing at the OCI start URL.
                  Your system redirects the user's browser here with a <Text code>HOOK_URL</Text>; on checkout the
                  cart is posted back to that <Text code>HOOK_URL</Text> as <Text code>NEW_ITEM-*</Text> fields.
                </Paragraph>
                <Endpoint method="GET / POST" url={s?.ociStartUrl} color="green" />
                <pre style={codeBlock}>{ociExample}</pre>
              </>
            ),
          },
          {
            key: 'soap',
            label: <Space><CloudServerOutlined />SOAP catalog web service</Space>,
            children: (
              <>
                <Paragraph type="secondary">
                  Any SOAP-capable procurement system can pull the catalog. Import the WSDL and call
                  <Text code>GetProducts</Text> (optionally filtered) or <Text code>GetProduct</Text> by SKU.
                  Supply your identity + shared secret for authenticated access.
                </Paragraph>
                <Endpoint method="POST" url={s?.soapEndpointUrl} color="purple" />
                <Endpoint method="WSDL" url={s?.wsdlUrl} color="purple" />
                <pre style={codeBlock}>{soapExample}</pre>
              </>
            ),
          },
          {
            key: 'rest',
            label: <Space><ApiOutlined />REST / JSON API</Space>,
            children: (
              <>
                <Paragraph type="secondary">
                  The native REST API returns JSON with full product metadata. It requires a JWT bearer token
                  (see the API Docs page for the OpenAPI explorer and "Try it out").
                </Paragraph>
                <Endpoint method="GET" url={s?.restCatalogUrl} />
                <Endpoint method="GET" url={s?.restProductUrl} />
                <pre style={codeBlock}>{restExample}</pre>
              </>
            ),
          },
        ]}
      />

      <Card size="small" title={<Space><BookOutlined />Setup checklist for a new buyer</Space>}>
        <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9 }}>
          <li>Create a credential in <b>Buyer Credentials</b> (choose cXML for Ariba/Coupa, OCI for Oracle/SAP SRM).</li>
          <li>Share the <b>identity</b> + <b>shared secret</b> with the buyer's procurement admin.</li>
          <li>Give them the matching endpoint URL above (cXML setup, OCI start, SOAP/WSDL, or REST).</li>
          <li>For cXML/OCI, the buyer points their PunchOut catalog at that URL; for SOAP they import the WSDL.</li>
          <li>Confirm the channel is enabled in <b>Service Settings</b>.</li>
        </ol>
      </Card>
    </Space>
  );
};

// ── Buyer credentials tab ────────────────────────────────────────
const CredentialsTab: React.FC = () => {
  const { data: credentials, isLoading } = useGetPunchoutCredentialsQuery();
  const [createCred] = useCreatePunchoutCredentialMutation();
  const [updateCred] = useUpdatePunchoutCredentialMutation();
  const [deleteCred] = useDeletePunchoutCredentialMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PunchoutCredentialResponse | null>(null);
  const [form] = Form.useForm();

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ protocol: 'CXML', active: true });
    setOpen(true);
  };
  const openEdit = (record: PunchoutCredentialResponse) => {
    setEditing(record);
    form.setFieldsValue({ ...record, sharedSecret: '' });
    setOpen(true);
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await updateCred({ id: editing.id, body: values }).unwrap();
      } else {
        await createCred(values).unwrap();
      }
      message.success(editing ? 'Credential updated' : 'Credential created');
      setOpen(false);
    } catch (err) {
      if ((err as { errorFields?: unknown }).errorFields) return;
      message.error(getApiErrorMessage(err, 'Save failed'));
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteCred(id).unwrap();
      message.success('Credential deleted');
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Delete failed'));
    }
  };

  const columns = [
    { title: 'Buyer', dataIndex: 'buyerName', key: 'buyerName' },
    { title: 'Domain', dataIndex: 'domain', key: 'domain' },
    { title: 'Identity', dataIndex: 'identity', key: 'identity', render: (v: string) => <Text code>{v}</Text> },
    { title: 'Protocol', dataIndex: 'protocol', key: 'protocol',
      render: (p: string) => <Tag color={p === 'OCI' ? 'orange' : 'cyan'}>{p}</Tag> },
    { title: 'Secret', dataIndex: 'hasSecret', key: 'hasSecret',
      render: (h: boolean) => h ? <Tag color="green">Set</Tag> : <Tag color="red">Missing</Tag> },
    { title: 'Status', dataIndex: 'active', key: 'active',
      render: (a: boolean) => <Badge status={a ? 'success' : 'default'} text={a ? 'Active' : 'Inactive'} /> },
    {
      title: 'Actions', key: 'actions', width: 120,
      render: (_: unknown, record: PunchoutCredentialResponse) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this credential?" onConfirm={() => remove(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Alert
        type="warning" showIcon
        message="Shared secrets are write-only"
        description="For security, existing secrets are never displayed. Leave the shared secret blank when editing to keep the current value."
      />
      <div style={{ textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add credential</Button>
      </div>
      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={credentials ?? []}
        className="responsive-table"
        scroll={{ x: 'max-content' }}
        pagination={false}
      />

      <Modal
        open={open}
        title={editing ? 'Edit credential' : 'Add credential'}
        onCancel={() => setOpen(false)}
        onOk={save}
        okText="Save"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="buyerName" label="Buyer name" rules={[{ required: true, message: 'Buyer name is required' }]}>
            <Input placeholder="Ariba Network – Acme Corp" />
          </Form.Item>
          <Form.Item name="domain" label="Credential domain" rules={[{ required: true, message: 'Domain is required' }]}>
            <Input placeholder="NetworkID, DUNS, etc." />
          </Form.Item>
          <Form.Item name="identity" label="Identity" rules={[{ required: true, message: 'Identity is required' }]}>
            <Input placeholder="AN01000000123" />
          </Form.Item>
          <Form.Item name="protocol" label="Protocol" rules={[{ required: true }]}>
            <Select options={[{ value: 'CXML', label: 'cXML (Ariba / Coupa / Jaggaer)' }, { value: 'OCI', label: 'OCI (Oracle / SAP SRM)' }]} />
          </Form.Item>
          <Form.Item
            name="sharedSecret"
            label="Shared secret"
            rules={editing ? [] : [{ required: true, message: 'Shared secret is required' }]}
            extra={editing ? 'Leave blank to keep the existing secret' : undefined}
          >
            <Input.Password placeholder={editing ? '•••••••• (unchanged)' : 'Shared secret'} />
          </Form.Item>
          <Form.Item name="active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

// ── Service settings tab ─────────────────────────────────────────
const SettingsTab: React.FC<{ s?: ProcurementSettingsResponse; loading: boolean }> = ({ s, loading }) => {
  const [updateSettings, { isLoading: saving }] = useUpdateProcurementSettingsMutation();
  const [form] = Form.useForm();

  useEffect(() => {
    if (s) {
      form.setFieldsValue({
        restEnabled: s.restEnabled, cxmlEnabled: s.cxmlEnabled,
        ociEnabled: s.ociEnabled, soapEnabled: s.soapEnabled,
        supplierDomain: s.supplierDomain, supplierIdentity: s.supplierIdentity,
      });
    }
  }, [s, form]);

  const save = async () => {
    try {
      const values = await form.validateFields();
      await updateSettings(values).unwrap();
      message.success('Procurement settings saved');
    } catch (err) {
      if ((err as { errorFields?: unknown }).errorFields) return;
      message.error(getApiErrorMessage(err, 'Save failed'));
    }
  };

  if (loading) return <Spin />;

  return (
    <Form form={form} layout="vertical" style={{ maxWidth: 560 }}>
      <Title level={5}>Channels</Title>
      <Text type="secondary">Enable or disable each catalog access channel. Disabled channels reject incoming requests.</Text>
      <Divider style={{ margin: '12px 0' }} />
      <Form.Item name="restEnabled" label="REST / JSON API" valuePropName="checked"><Switch /></Form.Item>
      <Form.Item name="cxmlEnabled" label="cXML PunchOut (Ariba / Coupa / Jaggaer)" valuePropName="checked"><Switch /></Form.Item>
      <Form.Item name="ociEnabled" label="OCI PunchOut (Oracle / SAP SRM)" valuePropName="checked"><Switch /></Form.Item>
      <Form.Item name="soapEnabled" label="SOAP catalog web service" valuePropName="checked"><Switch /></Form.Item>

      <Title level={5} style={{ marginTop: 16 }}>Supplier identity</Title>
      <Text type="secondary">Used as the supplier credential in outbound cXML PunchOutOrderMessages.</Text>
      <Divider style={{ margin: '12px 0' }} />
      <Form.Item name="supplierDomain" label="Supplier credential domain">
        <Input placeholder="NetworkID" />
      </Form.Item>
      <Form.Item name="supplierIdentity" label="Supplier identity">
        <Input placeholder="MST-AGRITECH" />
      </Form.Item>

      <Button type="primary" loading={saving} onClick={save}>Save settings</Button>
    </Form>
  );
};

const ProcurementIntegrationPage: React.FC = () => {
  const { data: settings, isLoading } = useGetProcurementSettingsQuery();

  return (
    <div className="page-root">
      <Title level={3} style={{ marginBottom: 4 }}>Procurement & API Integration</Title>
      <Text type="secondary">Documentation and configuration for connecting buyers via PunchOut, SOAP and REST.</Text>
      <Card style={{ marginTop: 16 }}>
        <Tabs
          defaultActiveKey="docs"
          items={[
            { key: 'docs', label: <Space><BookOutlined />Documentation</Space>, children: <DocsTab s={settings} /> },
            { key: 'credentials', label: <Space><SafetyOutlined />Buyer Credentials</Space>, children: <CredentialsTab /> },
            { key: 'settings', label: <Space><ApiOutlined />Service Settings</Space>, children: <SettingsTab s={settings} loading={isLoading} /> },
          ]}
        />
      </Card>
    </div>
  );
};

export default ProcurementIntegrationPage;
