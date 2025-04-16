// src/AppContent.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import ElectricityViolationHousehold from './pages/ElectricityViolationHousehold';
import UserManagement from './pages/UserManagement';
import UserProfile from './pages/UserProfile';
import ElectricityViolationBusiness from './pages/ElectricityViolationBusiness';
import ElectricityViolationProduction from './pages/ElectricityViolationProduction';
import ElectricityViolation from './pages/ElectricityViolation';

const AppContent = () => {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/electricity-violation-household" replace />} />
        <Route path="/electricity-violation-household" element={<ElectricityViolationHousehold />} />
        <Route path="/electricity-violation-business" element={<ElectricityViolationBusiness />} />
        <Route path="/electricity-violation-production" element={<ElectricityViolationProduction />} />
        <Route path="/electricity-violation" element={<ElectricityViolation />} />
        {isAdmin && <Route path="/user-management" element={<UserManagement />} />}
        <Route path="/profile" element={<UserProfile />} />
        <Route path="*" element={<Navigate to="/electricity-violation-household" replace />} />
      </Routes>
    </MainLayout>
  );
};

export default AppContent;
