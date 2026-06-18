import React, { useState } from 'react';
import { Typography, message } from 'antd';
import { useGetMarketplaceProductsQuery, useGetMarketplaceCategoriesQuery } from '../app/apiSlice';
import type { MarketplaceProductResponse } from '../app/apiSlice';
import CatalogView from '../components/marketplace/CatalogView';

const { Title, Text } = Typography;

const MarketplacePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const { data: products, isLoading } = useGetMarketplaceProductsQuery({ search, category });
  const { data: categories } = useGetMarketplaceCategoriesQuery();

  const requestQuote = (p: MarketplaceProductResponse, qty: number) => {
    message.success(`Quote requested for ${qty} ${p.unit} of ${p.name}`);
  };

  return (
    <div className="page-root">
      <div style={{ marginBottom: 12 }}>
        <Title level={3} style={{ marginBottom: 0 }}>Marketplace</Title>
        <Text type="secondary">
          Browse verified agricultural produce. Procurement systems can also connect via PunchOut (cXML / OCI) and SOAP.
        </Text>
      </div>
      <CatalogView
        products={products}
        categories={categories}
        isLoading={isLoading}
        search={search}
        onSearch={setSearch}
        category={category}
        onCategory={setCategory}
        onRequestQuote={requestQuote}
      />
    </div>
  );
};

export default MarketplacePage;
