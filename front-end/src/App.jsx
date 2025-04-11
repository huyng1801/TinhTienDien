// src/App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppContent from './AppContent';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import AppProviders from './context/AppProviders';

const App = () => {
  return (
    <ConfigProvider locale={viVN}>
      <Router>
        <AppProviders>
          <AppContent />
        </AppProviders>
      </Router>
    </ConfigProvider>
  );
};

export default App;
