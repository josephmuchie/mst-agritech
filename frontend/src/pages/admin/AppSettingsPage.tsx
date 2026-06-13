import React, { useEffect } from 'react';
import { Card, Form, Input, Switch, Button, Typography, Space, message, Spin, Alert, Select, Tabs, Row, Col } from 'antd';
import { SettingOutlined, ApiOutlined, SafetyCertificateOutlined, ToolOutlined } from '@ant-design/icons';
import {
  useGetIntegrationSettingsQuery,
  useUpdateIntegrationSettingsMutation,
  useGetTenantSsoConfigQuery,
  useUpdateTenantSsoConfigMutation,
  useGetAppSettingsQuery,
  useUpdateAppSettingsMutation,
} from '../../app/apiSlice';
import { getApiErrorMessage } from '../../utils/apiError';

const { Title, Text } = Typography;

const AppSettingsPage: React.FC = () => {
  const [generalForm] = Form.useForm();
  const [opsForm] = Form.useForm();
  const [integrationForm] = Form.useForm();
  const [ssoForm] = Form.useForm();

  const { data: integrationSettings, isLoading: loadingIntegration } = useGetIntegrationSettingsQuery();
  const [updateIntegrationSettings, { isLoading: savingIntegration }] = useUpdateIntegrationSettingsMutation();
  const { data: ssoConfig, isLoading: loadingSso } = useGetTenantSsoConfigQuery();
  const [updateSsoConfig, { isLoading: savingSso }] = useUpdateTenantSsoConfigMutation();
  const { data: appSettings, isLoading: loadingAppSettings } = useGetAppSettingsQuery();
  const [updateAppSettings, { isLoading: savingAppSettings }] = useUpdateAppSettingsMutation();

  useEffect(() => {
    if (appSettings) {
      generalForm.setFieldsValue({
        platformName: appSettings.platformName,
        supportEmail: appSettings.supportEmail,
        defaultCurrency: appSettings.defaultCurrency,
      });
      opsForm.setFieldsValue({
        maintenanceMode: appSettings.maintenanceMode,
        maxOrderValueUsd: appSettings.maxOrderValueUsd,
      });
    }
  }, [appSettings, generalForm, opsForm]);

  useEffect(() => {
    if (integrationSettings) integrationForm.setFieldsValue(integrationSettings);
  }, [integrationSettings, integrationForm]);

  useEffect(() => {
    if (ssoConfig) {
      ssoForm.setFieldsValue({
        enabled: ssoConfig.enabled,
        providerLabel: ssoConfig.providerLabel,
        providerType: ssoConfig.providerType,
        issuerUri: ssoConfig.issuerUri,
        clientId: ssoConfig.clientId,
        authorizationUri: ssoConfig.authorizationUri,
        tokenUri: ssoConfig.tokenUri,
        userinfoUri: ssoConfig.userinfoUri,
        scopes: ssoConfig.scopes,
        autoProvisionUsers: ssoConfig.autoProvisionUsers,
        allowPasswordLogin: ssoConfig.allowPasswordLogin,
        defaultRoleName: ssoConfig.defaultRoleName,
        emailDomains: ssoConfig.emailDomains,
      });
    }
  }, [ssoConfig, ssoForm]);

  const saveGeneral = async () => {
    try {
      const general = await generalForm.validateFields();
      const ops = await opsForm.validateFields();
      await updateAppSettings({
        platformName: general.platformName,
        supportEmail: general.supportEmail,
        defaultCurrency: general.defaultCurrency,
        maxOrderValueUsd: String(ops.maxOrderValueUsd),
        maintenanceMode: ops.maintenanceMode,
      }).unwrap();
      message.success('Platform settings saved');
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Failed to save platform settings'));
    }
  };

  const saveIntegration = async () => {
    try {
      await updateIntegrationSettings(await integrationForm.validateFields()).unwrap();
      message.success('Integration settings saved');
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Failed to save integration settings'));
    }
  };

  const saveSso = async () => {
    try {
      await updateSsoConfig(await ssoForm.validateFields()).unwrap();
      message.success('SSO settings saved');
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Failed to save SSO settings'));
    }
  };

  if (loadingAppSettings) {
    return <div className="page-root"><Card><Spin /></Card></div>;
  }

  const tabItems = [
    {
      key: 'platform',
      label: <Space><SettingOutlined />Platform</Space>,
      children: (
        <Row gutter={[24, 0]}>
          <Col xs={24} lg={12}>
            <Title level={5}>Branding & contact</Title>
            <Form form={generalForm} layout="vertical">
              <Form.Item label="Platform Name" name="platformName" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Support Email" name="supportEmail" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Default Currency" name="defaultCurrency">
                <Input style={{ maxWidth: 120 }} />
              </Form.Item>
            </Form>
          </Col>
          <Col xs={24} lg={12}>
            <Title level={5}>Operations</Title>
            <Form form={opsForm} layout="vertical">
              <Form.Item label="Max Order Value (USD)" name="maxOrderValueUsd">
                <Input type="number" style={{ maxWidth: 200 }} addonBefore="$" />
              </Form.Item>
              <Form.Item label="Maintenance Mode" name="maintenanceMode" valuePropName="checked"
                extra="When enabled, non-admin users cannot access the platform">
                <Switch />
              </Form.Item>
            </Form>
          </Col>
          <Col span={24}>
            <Button type="primary" onClick={() => void saveGeneral()} loading={savingAppSettings}>
              Save Platform Settings
            </Button>
          </Col>
        </Row>
      ),
    },
    {
      key: 'integrations',
      label: <Space><ApiOutlined />Integrations</Space>,
      children: loadingIntegration ? <Spin /> : (
        <>
          <Alert type="info" showIcon style={{ marginBottom: 16 }}
            message="Global integration policy"
            description="Per-connector credentials are managed under Administration → Integrations." />
          <Form form={integrationForm} layout="vertical" style={{ maxWidth: 520 }}>
            <Form.Item label="Enable Oracle ERP Connector" name="oracleEnabled" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Auto-sync Enabled" name="autoSyncEnabled" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Default Retry Count" name="defaultRetryCount" rules={[{ required: true }]}>
              <Input type="number" min={0} max={10} style={{ width: 120 }} />
            </Form.Item>
            <Button type="primary" onClick={() => void saveIntegration()} loading={savingIntegration}>
              Save Integration Settings
            </Button>
          </Form>
        </>
      ),
    },
    {
      key: 'sso',
      label: <Space><SafetyCertificateOutlined />SSO</Space>,
      children: loadingSso ? <Spin /> : (
        <>
          <Alert type="info" showIcon style={{ marginBottom: 16 }}
            message="Organization-wide sign-in"
            description={ssoConfig ? `Tenant: ${ssoConfig.tenantName} (${ssoConfig.tenantSlug})` : undefined} />
          <Form form={ssoForm} layout="vertical">
            <Row gutter={[24, 0]}>
              <Col xs={24} lg={12}>
                <Title level={5}>Provider</Title>
                <Form.Item label="Enable SSO" name="enabled" valuePropName="checked"><Switch /></Form.Item>
                <Form.Item label="Button label" name="providerLabel" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item label="Provider type" name="providerType" rules={[{ required: true }]}>
                  <Select options={[
                    { value: 'MOCK', label: 'Mock (development)' },
                    { value: 'OIDC', label: 'OpenID Connect' },
                  ]} />
                </Form.Item>
                <Form.Item label="Authorized email domains" name="emailDomains" rules={[{ required: true }]}>
                  <Input placeholder="mst.co.zw, mstagritech.co.zw" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Title level={5}>Access policy</Title>
                <Form.Item label="Auto-provision users" name="autoProvisionUsers" valuePropName="checked"><Switch /></Form.Item>
                <Form.Item label="Allow password login" name="allowPasswordLogin" valuePropName="checked"><Switch /></Form.Item>
                <Form.Item label="Default role for new SSO users" name="defaultRoleName">
                  <Select options={['FARMER', 'BUYER', 'LOGISTICS', 'ANALYST', 'ADMIN'].map((v) => ({ value: v, label: v }))} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Title level={5}>OIDC endpoints</Title>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item label="Issuer URI" name="issuerUri"><Input /></Form.Item>
                <Form.Item label="Client ID" name="clientId"><Input /></Form.Item>
                <Form.Item label="Client secret" name="clientSecret"
                  extra={ssoConfig?.hasClientSecret ? 'Leave blank to keep existing secret' : undefined}>
                  <Input.Password />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item label="Authorization URI" name="authorizationUri"><Input /></Form.Item>
                <Form.Item label="Token URI" name="tokenUri"><Input /></Form.Item>
                <Form.Item label="Userinfo URI" name="userinfoUri"><Input /></Form.Item>
                <Form.Item label="Scopes" name="scopes"><Input placeholder="openid profile email" /></Form.Item>
              </Col>
              <Col span={24}>
                <Button type="primary" onClick={() => void saveSso()} loading={savingSso}>Save SSO Settings</Button>
              </Col>
            </Row>
          </Form>
        </>
      ),
    },
  ];

  return (
    <div className="page-root">
      <Card className="page-card" title={
        <Space><ToolOutlined /><Title level={4} style={{ margin: 0 }}>App Settings</Title></Space>
      }>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Configure platform, integrations, and authentication in grouped sections.
        </Text>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default AppSettingsPage;
