import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import Products from './Products';
import Orders from './Orders';
import Customers from './Customers';
import Analytics from './Analytics';
import Settings from './Settings';
import NotFound from '../NotFound';

const AdminPortal = ({ adminUser, onAdminLogout }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if admin is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      // In a real app, you would verify the token with the server
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    onAdminLogout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-darkPurple-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-white">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout adminUser={adminUser} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products/*" element={<Products />} />
        <Route path="orders/*" element={<Orders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="analytics/*" element={<Analytics />} />
        <Route path="settings/*" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPortal;
