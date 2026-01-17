import React, { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard.jsx';
import VapeSmokeEffect from './components/VapeSmokeEffect';

const loadPersistedState = () => {
  try {
    const savedAdminUser = localStorage.getItem('vapesmart_adminUser');
    const isAdmin = localStorage.getItem('vapesmart_isAdmin') === 'true';
    return {
      isAdminLoggedIn: isAdmin,
      adminUser: isAdmin && savedAdminUser ? JSON.parse(savedAdminUser) : null,
      adminToken: localStorage.getItem('vapesmart_adminToken'),
    };
  } catch (error) {
    console.error('Error loading persisted state:', error);
    return { isAdminLoggedIn: false, adminUser: null, adminToken: null };
  }
};

export default function App() {
  const persistedState = loadPersistedState();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(persistedState.isAdminLoggedIn);
  const [adminUser, setAdminUser] = useState(persistedState.adminUser);
  const [adminToken, setAdminToken] = useState(persistedState.adminToken);

  const handleAdminLogin = (token, adminData) => {
    setIsAdminLoggedIn(true);
    setAdminUser(adminData);
    setAdminToken(token);
    localStorage.setItem('vapesmart_adminToken', token);
    localStorage.setItem('vapesmart_adminUser', JSON.stringify(adminData));
    localStorage.setItem('vapesmart_isAdmin', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem('vapesmart_adminUser');
    localStorage.removeItem('vapesmart_isAdmin');
    localStorage.removeItem('vapesmart_adminToken');
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="relative min-h-screen bg-black text-gray-100 flex items-center justify-center">
        <div className="fixed inset-0 -z-10 opacity-80"><VapeSmokeEffect density={40} speed={0.4} opacity={0.35} /></div>
        <AdminLogin onAdminLogin={handleAdminLogin} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-gray-100">
      <div className="fixed inset-0 -z-10 opacity-80"><VapeSmokeEffect density={40} speed={0.4} opacity={0.35} /></div>
      <AdminDashboard
        adminUser={adminUser || { username: 'Admin' }}
        adminToken={adminToken}
        onLogout={handleAdminLogout}
        onNavigateToStore={() => {/* No store in admin portal */ }}
      />
    </div>
  );
}
