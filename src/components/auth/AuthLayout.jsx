import React from 'react';
import { Card } from '@/components/ui/card';

const AuthLayout = ({ children, imageUrl, imageAlt, title, subtitle, imageFirst = false }) => {
  const imageColumn = (
    <div className="hidden md:block md:col-span-1 relative">
      <img  
        className="absolute inset-0 w-full h-full object-cover"
        alt={imageAlt}
        src={imageUrl} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className="absolute bottom-8 left-8 text-white">
        <h3 className="text-3xl font-bold">{title}</h3>
        <p className="mt-2 text-lg">{subtitle}</p>
      </div>
    </div>
  );

  const formColumn = (
    <div className="md:col-span-1 p-8 lg:p-12 bg-white flex items-center justify-center">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-2xl rounded-3xl`}>
        {imageFirst ? (
          <>
            {imageColumn}
            {formColumn}
          </>
        ) : (
          <>
            {formColumn}
            {imageColumn}
          </>
        )}
      </Card>
    </div>
  );
};

export default AuthLayout;