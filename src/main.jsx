import React, { Suspense } from 'react';
    import ReactDOM from 'react-dom/client';
    import App from '@/App';
    import '@/index.css';
    import '@/i18n';
    import { QueryClient, QueryClientProvider } from 'react-query';

    const queryClient = new QueryClient();

    const LoadingFallback = () => (
      <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Initializing...</h2>
        </div>
      </div>
    );

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <Suspense fallback={<LoadingFallback />}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </Suspense>
      </React.StrictMode>
    );