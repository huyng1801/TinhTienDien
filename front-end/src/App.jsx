import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CompensationProvider } from './context/CompensationContext';
import { SharedDataProvider } from './context/SharedDataContext';
import AppContent from './AppContent';

const App = () => {
  return (
    <AuthProvider>
      <SharedDataProvider>
        <CompensationProvider>
          <AppContent />
        </CompensationProvider>
      </SharedDataProvider>
    </AuthProvider>
  );
};

export default App;