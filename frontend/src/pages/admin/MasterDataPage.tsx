import React from 'react';
import { Card, Tabs, Table, Tag, Typography, Space } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import { useGetCountriesQuery, useGetCurrenciesQuery, useGetProductCategoriesQuery } from '../../app/apiSlice';

const { Title } = Typography;

const MasterDataPage: React.FC = () => {
  const { data: countries, isLoading: cLoading } = useGetCountriesQuery();
  const { data: currencies, isLoading: curLoading } = useGetCurrenciesQuery();
  const { data: categories, isLoading: catLoading } = useGetProductCategoriesQuery();

  const countryColumns = [
    { title: 'ISO Code', dataIndex: 'isoCode', key: 'isoCode', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Region', dataIndex: 'region', key: 'region' },
    { title: 'Status', key: 'active', render: (_: unknown, r: { active: boolean }) => r.active ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag> },
  ];

  const currencyColumns = [
    { title: 'Code', dataIndex: 'code', key: 'code', render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Symbol', dataIndex: 'symbol', key: 'symbol' },
    { title: 'Status', key: 'active', render: (_: unknown, r: { active: boolean }) => r.active ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag> },
  ];

  const categoryColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description', render: (v: string) => v ?? '—' },
    { title: 'Status', key: 'active', render: (_: unknown, r: { active: boolean }) => r.active ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag> },
  ];

  return (
    <Card title={<Space><DatabaseOutlined /><Title level={4} style={{ margin: 0 }}>Master Data</Title></Space>}>
      <Tabs
        items={[
          {
            key: 'countries', label: 'Countries',
            children: <Table rowKey="id" dataSource={countries ?? []} columns={countryColumns} loading={cLoading} pagination={false} size="small" />,
          },
          {
            key: 'currencies', label: 'Currencies',
            children: <Table rowKey="id" dataSource={currencies ?? []} columns={currencyColumns} loading={curLoading} pagination={false} size="small" />,
          },
          {
            key: 'categories', label: 'Product Categories',
            children: <Table rowKey="id" dataSource={categories ?? []} columns={categoryColumns} loading={catLoading} pagination={false} size="small" />,
          },
        ]}
      />
    </Card>
  );
};

export default MasterDataPage;
