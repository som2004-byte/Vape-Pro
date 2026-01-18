import React, { useState, useEffect } from 'react';
import VapeSmokeEffect from './components/VapeSmokeEffect';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard.jsx';

const loadPersistedAdminState = () => {
  try {
    const savedAdminUser = localStorage.getItem('vapesmart_adminUser');
    const isAdmin = localStorage.getItem('vapesmart_isAdmin') === 'true';
    const adminToken = localStorage.getItem('vapesmart_adminToken');

    return {
      isAdminLoggedIn: isAdmin && !!adminToken,
      adminUser: isAdmin && savedAdminUser ? JSON.parse(savedAdminUser) : null,
      adminToken: adminToken,
    };
  } catch (error) {
    console.error('Error loading admin state:', error);
    return {
      isAdminLoggedIn: false,
      adminUser: null,
      adminToken: null,
    };
  }
};

export default function App() {
  const persistedState = loadPersistedAdminState();

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

  // --- RENDER BRANCHES (Strict Admin-Only) ---

  return (
    <div className="relative min-h-screen bg-black text-gray-100">
      {/* Universal background effect */}
      <div className="fixed inset-0 -z-10 opacity-80">
        <VapeSmokeEffect density={40} speed={0.4} opacity={0.35} />
      </div>

      {!isAdminLoggedIn ? (
        <div className="flex items-center justify-center min-h-screen">
          <AdminLogin onAdminLogin={handleAdminLogin} />
        </div>
      ) : (
        <AdminDashboard
          adminUser={adminUser || { username: 'Admin' }}
          adminToken={adminToken}
          onLogout={handleAdminLogout}
          onNavigateToStore={() => {
            // Redirect to actual live storefront URL
            window.location.href = 'https://vapesmart.co.in';
          }}
        />
      )}
    </div>
  );
}
