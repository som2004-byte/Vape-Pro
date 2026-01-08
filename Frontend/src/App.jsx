import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import VapeSmokeEffect from './components/VapeSmokeEffect';
import LandingHero from './components/LandingHero';
import LoginSignup from './components/LoginSignup';
import AccountSection from './components/AccountSection';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { apiCall, API_ENDPOINTS, getAuthHeaders } from './utils/apiConfig';

// Load persisted state from localStorage
const loadPersistedState = () => {
  try {
    const savedUser = localStorage.getItem('vapesmart_user');
    const savedLoginState = localStorage.getItem('vapesmart_isLoggedIn');
    const savedProfile = localStorage.getItem('vapesmart_profile');
    const savedAdminToken = localStorage.getItem('vapesmart_adminToken');
    const savedAdminUser = localStorage.getItem('vapesmart_adminUser');
    const isAdmin = localStorage.getItem('vapesmart_isAdmin') === 'true';

    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      isLoggedIn: savedLoginState === 'true',
      isAdminLoggedIn: isAdmin,
      adminToken: savedAdminToken || null,
      adminUser: isAdmin && savedAdminUser ? JSON.parse(savedAdminUser) : null,
      profile: savedProfile ? JSON.parse(savedProfile) : null,
    };
  } catch (error) {
    console.error('Error loading persisted state:', error);
    return {
      user: null,
      isLoggedIn: false,
      isAdminLoggedIn: false,
      adminToken: null,
      adminUser: null,
      profile: null,
    };
  }
};

export default function App() {
  const persistedState = loadPersistedState();

  const [isLoggedIn, setIsLoggedIn] = useState(persistedState.isLoggedIn);
  const [user, setUser] = useState(persistedState.user);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(persistedState.isAdminLoggedIn);
  const [adminUser, setAdminUser] = useState(persistedState.adminUser);
  const [adminToken, setAdminToken] = useState(persistedState.adminToken);
  const [isViewingAdminDashboard, setIsViewingAdminDashboard] = useState(persistedState.isAdminLoggedIn);
  const [currentPage, setCurrentPage] = useState('home');
  const [accountTab, setAccountTab] = useState('profile');
  const [toast, setToast] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(persistedState.profile);

  const handleNavigate = (page, subPage = 'profile') => {
    if (page === 'adminDashboard' && isAdminLoggedIn) {
      setIsViewingAdminDashboard(true);
      return;
    }
    setCurrentPage(page);
    if (page === 'account') {
      setAccountTab(subPage);
    }
  };

  const fetchUserData = async (token) => {
    if (!token) return;
    try {
      // Fetch Profile only
      const profileData = await apiCall(API_ENDPOINTS.USER.PROFILE, {
        headers: getAuthHeaders(token)
      });
      if (profileData) {
        setCustomerProfile(profileData);
        localStorage.setItem('vapesmart_profile', JSON.stringify(profileData));
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  // Sync on mount if logged in
  useEffect(() => {
    if (isLoggedIn && user?.token) {
      fetchUserData(user.token);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('vapesmart_user', JSON.stringify(userData));
    localStorage.setItem('vapesmart_isLoggedIn', 'true');

    if (userData.token) {
      fetchUserData(userData.token);
    }
    setCurrentPage('home');
  };

  const handleAdminLogin = (token, adminData) => {
    setIsAdminLoggedIn(true);
    setAdminUser(adminData);
    setAdminToken(token);
    setIsViewingAdminDashboard(true); // Default to dashboard on login
    setCurrentPage('adminDashboard');

    localStorage.setItem('vapesmart_adminToken', token);
    localStorage.setItem('vapesmart_adminUser', JSON.stringify(adminData));
    localStorage.setItem('vapesmart_isAdmin', 'true');

    setToast({ type: 'success', message: 'Admin login successful' });
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setIsViewingAdminDashboard(false);
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem('vapesmart_adminUser');
    localStorage.removeItem('vapesmart_isAdmin');
    localStorage.removeItem('vapesmart_adminToken');
    setToast({ type: 'info', message: 'Admin logged out' });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setIsAdminLoggedIn(false);
    setIsViewingAdminDashboard(false);
    setAdminUser(null);
    localStorage.removeItem('vapesmart_user');
    localStorage.removeItem('vapesmart_isLoggedIn');
    localStorage.removeItem('vapesmart_isAdmin');
    localStorage.removeItem('vapesmart_adminUser');
    localStorage.removeItem('vapesmart_profile');
    setCustomerProfile(null);
    setToast({ type: 'info', message: 'You have been logged out' });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const renderContent = () => {
    if (isAdminLoggedIn && isViewingAdminDashboard) {
      return (
        <AdminDashboard
          adminUser={adminUser}
          adminToken={adminToken}
          onLogout={handleAdminLogout}
          onNavigateToStore={() => setIsViewingAdminDashboard(false)}
        />
      );
    }

    // Default view for public pages
    const mainContent = (
      <>
        <Navbar
          user={user}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          currentPage={currentPage}
          isAdminLoggedIn={isAdminLoggedIn}
          adminUser={adminUser}
          onAdminLogout={handleAdminLogout}
        />

        <main className="min-h-screen pt-20">
          {currentPage === 'home' && <LandingHero onNavigate={handleNavigate} />}

          {currentPage === 'account' && (
            isLoggedIn ? (
              <AccountSection
                user={user}
                profile={customerProfile}
                onUpdateProfile={setCustomerProfile}
                activeTab={accountTab}
                onTabChange={setAccountTab}
              />
            ) : (
              <LoginSignup onLogin={handleLogin} />
            )
          )}

          {currentPage === 'login' && !isLoggedIn && (
            <LoginSignup onLogin={handleLogin} />
          )}

          {currentPage === 'adminLogin' && !isAdminLoggedIn && (
            <AdminLogin onAdminLogin={handleAdminLogin} />
          )}
        </main>
      </>
    );

    return mainContent;
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-darkPurple-950/20 to-black text-gray-100 overflow-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-80">
        <VapeSmokeEffect density={40} speed={0.4} opacity={0.35} />
      </div>
      {renderContent()}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] px-6 py-3 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-3 transition-all animate-in slide-in-from-bottom-4 duration-300 ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' :
          toast.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' :
            'bg-darkPurple-800/80 border-darkPurple-500/50 text-white'
          }`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
