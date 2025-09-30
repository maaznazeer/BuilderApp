import React from 'react';
import { Helmet } from 'react-helmet-async';
import ProductsList from '@/components/ProductsList';

const StorePage = () => {
  return (
    <>
      <Helmet>
        <title>Store - DomusBuilder Hub</title>
        <meta name="description" content="Browse our collection of products." />
      </Helmet>
      <div className="bg-gray-900 text-white min-h-screen">
        <div className="relative bg-gray-800 py-20 sm:py-28">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-blue-600/30 opacity-50"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
              Our Store
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
              Find the best tools and materials for your next construction project.
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ProductsList />
        </div>
      </div>
    </>
  );
};

export default StorePage;