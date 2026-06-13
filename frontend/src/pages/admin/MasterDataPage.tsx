import React, { useMemo, useState } from 'react';
import {
  Card, Tabs, Table, Tag, Typography, Space, Button, Modal, Form, Input,
  Switch, Select, Popconfirm, message, InputNumber,
} from 'antd';
import { DatabaseOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useGetCountriesQuery, useCreateCountryMutation, useUpdateCountryMutation, useDeleteCountryMutation,
  useGetCurrenciesQuery, useCreateCurrencyMutation, useUpdateCurrencyMutation, useDeleteCurrencyMutation,
  useGetProductCategoriesQuery, useCreateProductCategoryMutation, useUpdateProductCategoryMutation, useDeleteProductCategoryMutation,
  useGetAdminProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation,
  useGetMarketPricesQuery, useCreateMarketPriceMutation, useUpdateMarketPriceMutation, useDeleteMarketPriceMutation,
  type CountryResponse, type CurrencyResponse, type ProductCategoryResponse,
  type AdminProductResponse, type MarketPriceResponse,
} from '../../app/apiSlice';
import { TABLE_SCROLL } from '../../utils/table';
import { getApiErrorMessage } from '../../utils/apiError';

const { Title } = Typography;

type EntityKind = 'country' | 'currency' | 'category' | 'product' | 'price';

const statusTag = (active: boolean) =>
  active ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>;

const MasterDataPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState<EntityKind>('country');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const { data: countries = [], isLoading: cLoading } = useGetCountriesQuery({ activeOnly: false });
  const { data: currencies = [], isLoading: curLoading } = useGetCurrenciesQuery({ activeOnly: false });
  const { data: categories = [], isLoading: catLoading } = useGetProductCategoriesQuery({ activeOnly: false });
  const { data: products = [], isLoading: prodLoading } = useGetAdminProductsQuery({ activeOnly: false });
  const { data: prices = [], isLoading: priceLoading } = useGetMarketPricesQuery();

  const [createCountry] = useCreateCountryMutation();
  const [updateCountry] = useUpdateCountryMutation();
  const [deleteCountry] = useDeleteCountryMutation();
  const [createCurrency] = useCreateCurrencyMutation();
  const [updateCurrency] = useUpdateCurrencyMutation();
  const [deleteCurrency] = useDeleteCurrencyMutation();
  const [createCategory] = useCreateProductCategoryMutation();
  const [updateCategory] = useUpdateProductCategoryMutation();
  const [deleteCategory] = useDeleteProductCategoryMutation();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [createPrice] = useCreateMarketPriceMutation();
  const [updatePrice] = useUpdateMarketPriceMutation();
  const [deletePrice] = useDeleteMarketPriceMutation();

  const categoryOptions = useMemo(
    () => categories.filter((c) => c.active).map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );
  const productOptions = useMemo(
    () => products.filter((p) => p.active).map((p) => ({ value: p.id, label: p.name })),
    [products],
  );
  const countryOptions = useMemo(
    () => countries.filter((c) => c.active).map((c) => ({ value: c.id, label: `${c.isoCode} — ${c.name}` })),
    [countries],
  );
  const currencyOptions = useMemo(
    () => currencies.filter((c) => c.active).map((c) => ({ value: c.code, label: c.code })),
    [currencies],
  );

  const openCreate = (kind: EntityKind) => {
    setModalKind(kind);
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ active: true, requiresColdChain: false });
    setModalOpen(true);
  };

  const openEdit = (kind: EntityKind, record: CountryResponse | CurrencyResponse | ProductCategoryResponse | AdminProductResponse | MarketPriceResponse) => {
    setModalKind(kind);
    setEditingId(record.id);
    form.resetFields();
    if (kind === 'country') {
      const r = record as CountryResponse;
      form.setFieldsValue({ isoCode: r.isoCode, name: r.name, region: r.region, active: r.active });
    } else if (kind === 'currency') {
      const r = record as CurrencyResponse;
      form.setFieldsValue({ code: r.code, name: r.name, symbol: r.symbol, active: r.active });
    } else if (kind === 'category') {
      const r = record as ProductCategoryResponse;
      form.setFieldsValue({ name: r.name, description: r.description, active: r.active });
    } else if (kind === 'product') {
      const r = record as AdminProductResponse;
      form.setFieldsValue({
        name: r.name, categoryId: r.categoryId, unitOfMeasure: r.unitOfMeasure,
        description: r.description, requiresColdChain: r.requiresColdChain, active: r.active,
      });
    } else {
      const r = record as MarketPriceResponse;
      form.setFieldsValue({
        productId: r.productId, countryId: r.countryId ?? undefined,
        price: r.price, currencyCode: r.currencyCode, priceSource: r.priceSource,
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      if (modalKind === 'country') {
        const body = {
          isoCode: String(values.isoCode).trim().toUpperCase(),
          name: String(values.name).trim(),
          region: values.region?.trim() || undefined,
          active: values.active ?? true,
        };
        if (editingId) await updateCountry({ id: editingId, body }).unwrap();
        else await createCountry(body).unwrap();
      } else if (modalKind === 'currency') {
        const body = {
          code: String(values.code).trim().toUpperCase(),
          name: String(values.name).trim(),
          symbol: String(values.symbol).trim(),
          active: values.active ?? true,
        };
        if (editingId) await updateCurrency({ id: editingId, body }).unwrap();
        else await createCurrency(body).unwrap();
      } else if (modalKind === 'category') {
        const body = {
          name: String(values.name).trim(),
          description: values.description?.trim() || undefined,
          active: values.active ?? true,
        };
        if (editingId) await updateCategory({ id: editingId, body }).unwrap();
        else await createCategory(body).unwrap();
      } else if (modalKind === 'product') {
        const body = {
          name: String(values.name).trim(),
          categoryId: Number(values.categoryId),
          unitOfMeasure: String(values.unitOfMeasure).trim().toUpperCase(),
          description: values.description?.trim() || undefined,
          requiresColdChain: Boolean(values.requiresColdChain),
          active: values.active ?? true,
        };
        if (editingId) await updateProduct({ id: editingId, body }).unwrap();
        else await createProduct(body).unwrap();
      } else {
        const body = {
          productId: Number(values.productId),
          countryId: values.countryId != null ? Number(values.countryId) : undefined,
          price: Number(values.price),
          currencyCode: String(values.currencyCode).trim().toUpperCase(),
          priceSource: values.priceSource?.trim() || undefined,
        };
        if (editingId) await updatePrice({ id: editingId, body }).unwrap();
        else await createPrice(body).unwrap();
      }
      message.success(editingId ? 'Updated successfully' : 'Created successfully');
      setModalOpen(false);
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Save failed — check values and try again'));
    }
  };

  const handleDelete = async (successMessage: string, action: () => Promise<void>) => {
    try {
      await action();
      message.success(successMessage);
    } catch (err) {
      message.error(getApiErrorMessage(err, 'Delete failed'));
    }
  };

  const actionCol = <T extends { id: number }>(kind: EntityKind, onDelete: (id: number) => Promise<void>, successMessage: string) => ({
    title: 'Actions', key: 'actions', width: 140, align: 'center' as const,
    render: (_: unknown, record: T) => (
      <Space size="small">
        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(kind, record as unknown as CountryResponse)} />
        <Popconfirm title="Deactivate / remove this record?" onConfirm={() => void handleDelete(successMessage, () => onDelete(record.id))}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    ),
  });

  const countryColumns: ColumnsType<CountryResponse> = [
    { title: 'ISO', dataIndex: 'isoCode', key: 'isoCode', render: (v) => <Tag>{v}</Tag> },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Region', dataIndex: 'region', key: 'region', render: (v) => v ?? '—' },
    { title: 'Status', key: 'active', render: (_, r) => statusTag(r.active) },
    actionCol('country', (id) => deleteCountry(id).unwrap(), 'Country deactivated'),
  ];

  const currencyColumns: ColumnsType<CurrencyResponse> = [
    { title: 'Code', dataIndex: 'code', key: 'code', render: (v) => <Tag>{v}</Tag> },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Symbol', dataIndex: 'symbol', key: 'symbol' },
    { title: 'Status', key: 'active', render: (_, r) => statusTag(r.active) },
    actionCol('currency', (id) => deleteCurrency(id).unwrap(), 'Currency deactivated'),
  ];

  const categoryColumns: ColumnsType<ProductCategoryResponse> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description', render: (v) => v ?? '—' },
    { title: 'Status', key: 'active', render: (_, r) => statusTag(r.active) },
    actionCol('category', (id) => deleteCategory(id).unwrap(), 'Category deactivated'),
  ];

  const productColumns: ColumnsType<AdminProductResponse> = [
    { title: 'Product', dataIndex: 'name', key: 'name' },
    { title: 'Category', dataIndex: 'categoryName', key: 'categoryName' },
    { title: 'Unit', dataIndex: 'unitOfMeasure', key: 'unitOfMeasure' },
    { title: 'Cold chain', key: 'cc', render: (_, r) => r.requiresColdChain ? <Tag color="blue">Yes</Tag> : <Tag>No</Tag> },
    { title: 'Status', key: 'active', render: (_, r) => statusTag(r.active) },
    actionCol('product', (id) => deleteProduct(id).unwrap(), 'Product deactivated'),
  ];

  const priceColumns: ColumnsType<MarketPriceResponse> = [
    { title: 'Product', dataIndex: 'productName', key: 'productName' },
    { title: 'Country', dataIndex: 'countryName', key: 'countryName', render: (v) => v ?? '—' },
    { title: 'Price', key: 'price', render: (_, r) => `${r.currencyCode} ${Number(r.price).toFixed(2)}` },
    { title: 'Source', dataIndex: 'priceSource', key: 'priceSource', render: (v) => v ?? '—' },
    { title: 'Recorded', dataIndex: 'recordedAt', key: 'recordedAt', render: (v) => new Date(v).toLocaleString() },
    actionCol('price', (id) => deletePrice(id).unwrap(), 'Price record deleted'),
  ];

  const tabToolbar = (kind: EntityKind, label: string) => (
    <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate(kind)}>
        Add {label}
      </Button>
    </div>
  );

  const modalTitle = {
    country: editingId ? 'Edit Country' : 'Add Country',
    currency: editingId ? 'Edit Currency' : 'Add Currency',
    category: editingId ? 'Edit Category' : 'Add Category',
    product: editingId ? 'Edit Product' : 'Add Product',
    price: editingId ? 'Edit Market Price' : 'Add Market Price',
  }[modalKind];

  return (
    <div className="page-root">
      <Card className="page-card" title={
        <Space><DatabaseOutlined /><Title level={4} style={{ margin: 0 }}>Master Data</Title></Space>
      }>
        <Tabs
          items={[
            {
              key: 'countries', label: `Countries (${countries.length})`,
              children: (
                <>
                  {tabToolbar('country', 'Country')}
                  <Table rowKey="id" dataSource={countries} columns={countryColumns} loading={cLoading}
                    pagination={{ pageSize: 15 }} size="small" scroll={TABLE_SCROLL} className="responsive-table" />
                </>
              ),
            },
            {
              key: 'currencies', label: `Currencies (${currencies.length})`,
              children: (
                <>
                  {tabToolbar('currency', 'Currency')}
                  <Table rowKey="id" dataSource={currencies} columns={currencyColumns} loading={curLoading}
                    pagination={{ pageSize: 15 }} size="small" scroll={TABLE_SCROLL} className="responsive-table" />
                </>
              ),
            },
            {
              key: 'categories', label: `Categories (${categories.length})`,
              children: (
                <>
                  {tabToolbar('category', 'Category')}
                  <Table rowKey="id" dataSource={categories} columns={categoryColumns} loading={catLoading}
                    pagination={{ pageSize: 15 }} size="small" scroll={TABLE_SCROLL} className="responsive-table" />
                </>
              ),
            },
            {
              key: 'products', label: `Products (${products.length})`,
              children: (
                <>
                  {tabToolbar('product', 'Product')}
                  <Table rowKey="id" dataSource={products} columns={productColumns} loading={prodLoading}
                    pagination={{ pageSize: 15 }} size="small" scroll={TABLE_SCROLL} className="responsive-table" />
                </>
              ),
            },
            {
              key: 'prices', label: `Market Prices (${prices.length})`,
              children: (
                <>
                  {tabToolbar('price', 'Price')}
                  <Table rowKey="id" dataSource={prices} columns={priceColumns} loading={priceLoading}
                    pagination={{ pageSize: 15 }} size="small" scroll={TABLE_SCROLL} className="responsive-table" />
                </>
              ),
            },
          ]}
        />
      </Card>

      <Modal title={modalTitle} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => void handleSave()} destroyOnClose>
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          {modalKind === 'country' && (
            <>
              <Form.Item name="isoCode" label="ISO Code" rules={[{ required: true, len: 2, message: 'ISO code must be 2 letters' }]}>
                <Input maxLength={2} style={{ textTransform: 'uppercase' }} />
              </Form.Item>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="region" label="Region"><Input /></Form.Item>
              <Form.Item name="active" label="Active" valuePropName="checked"><Switch /></Form.Item>
            </>
          )}
          {modalKind === 'currency' && (
            <>
              <Form.Item name="code" label="Code" rules={[{ required: true, len: 3, message: 'Currency code must be 3 letters' }]}>
                <Input maxLength={3} style={{ textTransform: 'uppercase' }} />
              </Form.Item>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="symbol" label="Symbol" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="active" label="Active" valuePropName="checked"><Switch /></Form.Item>
            </>
          )}
          {modalKind === 'category' && (
            <>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
              <Form.Item name="active" label="Active" valuePropName="checked"><Switch /></Form.Item>
            </>
          )}
          {modalKind === 'product' && (
            <>
              <Form.Item name="name" label="Product name" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}><Select options={categoryOptions} /></Form.Item>
              <Form.Item name="unitOfMeasure" label="Unit of measure" rules={[{ required: true }]}><Input placeholder="KG, TON, STEM..." /></Form.Item>
              <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
              <Form.Item name="requiresColdChain" label="Cold chain" valuePropName="checked"><Switch /></Form.Item>
              <Form.Item name="active" label="Active" valuePropName="checked"><Switch /></Form.Item>
            </>
          )}
          {modalKind === 'price' && (
            <>
              <Form.Item name="productId" label="Product" rules={[{ required: true }]}><Select options={productOptions} showSearch optionFilterProp="label" /></Form.Item>
              <Form.Item name="countryId" label="Country (optional)"><Select allowClear options={countryOptions} showSearch optionFilterProp="label" /></Form.Item>
              <Form.Item name="price" label="Price" rules={[{ required: true, type: 'number', min: 0, message: 'Enter a valid price' }]}>
                <InputNumber min={0} step={0.01} precision={2} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="currencyCode" label="Currency" rules={[{ required: true }]}><Select options={currencyOptions} /></Form.Item>
              <Form.Item name="priceSource" label="Price source"><Input placeholder="Market, Import, Auction..." /></Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default MasterDataPage;
