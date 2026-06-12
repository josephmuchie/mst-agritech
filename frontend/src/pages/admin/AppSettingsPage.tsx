import React, { useEffect } from 'react';
import { Card, Form, Input, Switch, Button, Divider, Typography, Space, message, Spin, Alert, Select } from 'antd';
import { SettingOutlined, ApiOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import {
  useGetIntegrationSettingsQuery,
  useUpdateIntegrationSettingsMutation,
  useGetTenantSsoConfigQuery,
  useUpdateTenantSsoConfigMutation,
} from '../../app/apiSlice';

const { Title } = Typography;

const AppSettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [integrationForm] = Form.useForm();
  const [ssoForm] = Form.useForm();
  const { data: integrationSettings, isLoading: loadingIntegration } = useGetIntegrationSettingsQuery();
  const [updateIntegrationSettings, { isLoading: savingIntegration }] = useUpdateIntegrationSettingsMutation();
  const { data: ssoConfig, isLoading: loadingSso } = useGetTenantSsoConfigQuery();
  const [updateSsoConfig, { isLoading: savingSso }] = useUpdateTenantSsoConfigMutation();

  useEffect(() => {
    if (integrationSettings) {
      integrationForm.setFieldsValue(integrationSettings);
    }
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

  const onFinishGeneral = () => {
    message.success('General settings saved (demo — wire to app settings API when ready)');
  };

  const onFinishIntegration = async () => {
    try {
      const values = await integrationForm.validateFields();
      await updateIntegrationSettings(values).unwrap();
      message.success('Integration settings saved');
    } catch {
      message.error('Failed to save integration settings');
    }
  };

  const onFinishSso = async () => {
    try {
      const values = await ssoForm.validateFields();
      await updateSsoConfig(values).unwrap();
      message.success('SSO settings saved — all users in your organization can sign in accordingly');
    } catch {
      message.error('Failed to save SSO settings');
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card title={<Space><SettingOutlined /><Title level={4} style={{ margin: 0 }}>App Settings</Title></Space>}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            platformName: 'MST Agritech',
            supportEmail: 'support@mstagritech.co.zw',
            defaultCurrency: 'USD',
            maintenanceMode: false,
            registrationOpen: true,
            maxOrderValueUsd: 500000,
          }}
          onFinish={onFinishGeneral}
          style={{ maxWidth: 600 }}
        >
          <Divider orientation="left">General</Divider>
          <Form.Item label="Platform Name" name="platformName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Support Email" name="supportEmail" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Default Currency" name="defaultCurrency">
            <Input style={{ width: 120 }} />
          </Form.Item>

          <Divider orientation="left">Operational</Divider>
          <Form.Item label="Max Order Value (USD)" name="maxOrderValueUsd">
            <Input type="number" style={{ width: 200 }} addonBefore="$" />
          </Form.Item>
          <Form.Item label="Open Registration" name="registrationOpen" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="Maintenance Mode" name="maintenanceMode" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">Save General Settings</Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title={<Space><ApiOutlined /><Title level={4} style={{ margin: 0 }}>Integration Settings</Title></Space>}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Global integration policy"
          description="Control whether connectors can run and how retries are handled. Per-connector endpoints and credentials are configured under Administration → Integrations."
        />
        {loadingIntegration ? (
          <Spin />
        ) : (
          <Form
            form={integrationForm}
            layout="vertical"
            onFinish={onFinishIntegration}
            style={{ maxWidth: 600 }}
          >
            <Form.Item
              label="Enable Oracle ERP Connector"
              name="oracleEnabled"
              valuePropName="checked"
              extra="Allows Oracle invoice sync to be configured and invoked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="Auto-sync Enabled"
              name="autoSyncEnabled"
              valuePropName="checked"
              extra="When enabled, active connectors with autoSyncEnabled in their config will run on schedule"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="Default Retry Count"
              name="defaultRetryCount"
              rules={[{ required: true }]}
            >
              <Input type="number" min={0} max={10} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={savingIntegration}>
                Save Integration Settings
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>

      <Card title={<Space><SafetyCertificateOutlined /><Title level={4} style={{ margin: 0 }}>Single Sign-On (SSO)</Title></Space>}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Organization-wide sign-in"
          description="When enabled, users with matching email domains can sign in through your corporate identity provider. All users under the same tenant inherit this configuration."
        />
        {loadingSso ? (
          <Spin />
        ) : (
          <Form
            form={ssoForm}
            layout="vertical"
            onFinish={onFinishSso}
            style={{ maxWidth: 640 }}
          >
            <Form.Item
              label="Enable SSO for this organization"
              name="enabled"
              valuePropName="checked"
              extra={ssoConfig ? `Tenant: ${ssoConfig.tenantName} (${ssoConfig.tenantSlug})` : undefined}
            >
              <Switch />
            </Form.Item>
            <Form.Item label="Button label on login page" name="providerLabel" rules={[{ required: true }]}>
              <Input placeholder="e.g. Sign in with Acme Corp" />
            </Form.Item>
            <Form.Item label="Provider type" name="providerType" rules={[{ required: true }]}>
              <Select options={[
                { value: 'MOCK', label: 'Mock (development / demo)' },
                { value: 'OIDC', label: 'OpenID Connect (Azure AD, Okta, Google, etc.)' },
              ]} />
            </Form.Item>
            <Form.Item
              label="Authorized email domains"
              name="emailDomains"
              extra="Comma-separated domains, e.g. acme.com, acme.co.zw"
              rules={[{ required: true }]}
            >
              <Input placeholder="mstagritech.co.zw" />
            </Form.Item>
            <Divider orientation="left">OIDC endpoints</Divider>
            <Form.Item label="Issuer URI" name="issuerUri" extra="Used to auto-discover endpoints via /.well-known/openid-configuration">
              <Input placeholder="https://login.microsoftonline.com/{tenant}/v2.0" />
            </Form.Item>
            <Form.Item label="Client ID" name="clientId">
              <Input />
            </Form.Item>
            <Form.Item
              label="Client secret"
              name="clientSecret"
              extra={ssoConfig?.hasClientSecret ? 'A secret is already stored — leave blank to keep it' : 'Required for production OIDC providers'}
            >
              <Input.Password placeholder="Enter new client secret" />
            </Form.Item>
            <Form.Item label="Authorization URI (optional override)" name="authorizationUri">
              <Input />
            </Form.Item>
            <Form.Item label="Token URI (optional override)" name="tokenUri">
              <Input />
            </Form.Item>
            <Form.Item label="Userinfo URI (optional override)" name="userinfoUri">
              <Input />
            </Form.Item>
            <Form.Item label="Scopes" name="scopes">
              <Input placeholder="openid profile email" />
            </Form.Item>
            <Divider orientation="left">Access policy</Divider>
            <Form.Item
              label="Auto-provision new users"
              name="autoProvisionUsers"
              valuePropName="checked"
              extra="Create platform accounts automatically on first SSO login"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="Allow password login"
              name="allowPasswordLogin"
              valuePropName="checked"
              extra="When disabled, users must use company SSO"
            >
              <Switch />
            </Form.Item>
            <Form.Item label="Default role for new SSO users" name="defaultRoleName">
              <Select options={[
                { value: 'FARMER', label: 'Farmer' },
                { value: 'BUYER', label: 'Buyer' },
                { value: 'LOGISTICS', label: 'Logistics' },
                { value: 'ANALYST', label: 'Analyst' },
                { value: 'ADMIN', label: 'Admin' },
              ]} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={savingSso}>
                Save SSO Settings
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </Space>
  );
};

export default AppSettingsPage;
