import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { store } from './redux/store.js';
import { DarkModeProvider } from './context/DarkModeContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <DarkModeProvider>
        <App />
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1E3A5F',
              color: '#fff',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 8px 32px rgba(30, 58, 95, 0.25)',
            },
            success: {
              style: { background: '#16A34A' },
              iconTheme: { primary: '#fff', secondary: '#16A34A' },
            },
            error: {
              style: { background: '#DC2626' },
              iconTheme: { primary: '#fff', secondary: '#DC2626' },
            },
          }}
        />
      </DarkModeProvider>
    </Provider>
  </React.StrictMode>
);
