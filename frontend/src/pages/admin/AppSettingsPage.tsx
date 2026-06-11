import React from 'react';
import { Card, Form, Input, Switch, Button, Divider, Typography, Space, message } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AppSettingsPage: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = () => {
    message.success('Settings saved (demo — no backend call in dev mode)');
  };

  return (
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
        onFinish={onFinish}
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
          <Button type="primary" htmlType="submit">Save Settings</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AppSettingsPage;
