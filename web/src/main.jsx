import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from '@/App.jsx';
import ErrorBoundary from '@/components/ErrorBoundary';
import { installGlobalErrorHandlers } from '@/lib/errorReporter';
import '@/index.css';

installGlobalErrorHandlers();

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </ErrorBoundary>,
);
