import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import FunctionA from './pages/FunctionA';
import FunctionB from './pages/FunctionB';
import UserProfile from './pages/UserProfile';

const AppContent = () => {
  const { user, isAdmin } = useAuth();
  const [selectedFunction, setSelectedFunction] = React.useState('A');

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (selectedFunction) {
      case 'A':
        return <FunctionA />;
      case 'B':
        return isAdmin ? <FunctionB /> : null;
      case 'profile':
        return <UserProfile />;
      default:
        return null;
    }
  };

  return (
    <MainLayout 
      selectedFunction={selectedFunction} 
      setSelectedFunction={setSelectedFunction}
      isAdmin={isAdmin}
    >
      {renderContent()}
    </MainLayout>
  );
};

export default AppContent;