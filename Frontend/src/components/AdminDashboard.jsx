import React, { useState, useEffect } from 'react';
import API_BASE_URL_ROOT from '../config';

export default function AdminDashboard({ adminUser, adminToken, onLogout }) {
  // Navigation and view states
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedRequirement, setSelectedRequirement] = useState(null);

  // Data states
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [clientRequirements, setClientRequirements] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [newTransitInfo, setNewTransitInfo] = useState('');

  const API_BASE_URL = `${API_BASE_URL_ROOT}/api/admin`;

  // Enhanced mock data
  const MOCK_DATA = {
    users: [
      { _id: 'u1', name: 'Somya Verma', email: 'somya@example.com', phoneNumber: '+91 98765 43210', address: 'B-42, South City, New Delhi', createdAt: '2023-11-20' },
      { _id: 'u2', name: 'James Wilson', email: 'james@vapefans.com', phoneNumber: '+44 7700 900123', address: '12 Baker Street, London', createdAt: '2023-12-05' },
      { _id: 'u3', name: 'Elena Rodriguez', email: 'elena.r@gmail.com', phoneNumber: '+34 612 345 678', address: 'Calle Mayor 15, Madrid', createdAt: '2024-01-12' },
      { _id: 'u4', name: 'Kenji Sato', email: 'kenji.s@it-tokyo.jp', phoneNumber: '+81 90-1234-5678', address: 'Shibuya-ku, Tokyo', createdAt: '2024-02-28' },
    ],
    orders: [
      { _id: 'ORD-7721', userId: { email: 'somya@example.com', name: 'Somya Verma' }, totalAmount: 1599.00, orderStatus: 'shipped', transitInfo: 'Arrived at local facility', createdAt: '2025-12-23T10:00:00Z' },
      { _id: 'ORD-7722', userId: { email: 'james@vapefans.com', name: 'James Wilson' }, totalAmount: 2450.00, orderStatus: 'processing', transitInfo: 'Quality check passed', createdAt: '2025-12-24T08:30:00Z' },
      { _id: 'ORD-7723', userId: { email: 'elena.r@gmail.com', name: 'Elena Rodriguez' }, totalAmount: 899.00, orderStatus: 'delivered', transitInfo: 'Delivered to porch', createdAt: '2025-12-22T15:45:00Z' },
      { _id: 'ORD-7724', userId: { email: 'kenji.s@it-tokyo.jp', name: 'Kenji Sato' }, totalAmount: 4200.00, orderStatus: 'pending', transitInfo: 'Awaiting payment confirmation', createdAt: '2025-12-24T14:20:00Z' },
      { _id: 'ORD-7725', userId: { email: 'somya@example.com', name: 'Somya Verma' }, totalAmount: 310.00, orderStatus: 'cancelled', transitInfo: 'Cancelled by customer', createdAt: '2025-12-21T09:12:00Z' },
    ],
    requirements: [
      { _id: 'req1', title: 'Bulk Wholesale Inquiry', description: 'Looking for 500 units of Elfbar BC20000 for a new retail chain opening in Dubai. Need best price quotation.', status: 'Urgent', contactName: 'Unknown Contact', contactEmail: 'No Email', date: '2025-12-23' },
      { _id: 'req2', title: 'Store Partnership', description: 'Small boutique in Paris interested in stocking premium nic-salts. Seeking distribution details.', status: 'New', contactName: 'Unknown Contact', contactEmail: 'No Email', date: '2025-12-24' },
      { _id: 'req3', title: 'Custom Flavor Request', description: 'Customer inquiry about potential for customized branding on disposable units for corporate events.', status: 'In Review', contactName: 'Unknown Contact', contactEmail: 'No Email', date: '2025-12-22' },
    ]
  };

  // Fetch data from API with fallback to mock
  const fetchData = async (endpoint, setter) => {
    try {
      setLoading(true);
      setError('');

      // Try to fetch from API if token exists
      if (adminToken) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          let finalData = data;

          // Handle paginated responses
          if (data.orders && Array.isArray(data.orders)) finalData = data.orders;
          else if (data.users && Array.isArray(data.users)) finalData = data.users;

          setter(finalData);
          setLoading(false);
          return;
        }
      }

      // Fallback to mock data
      if (endpoint === '/users') setter(MOCK_DATA.users);
      if (endpoint === '/orders') setter(MOCK_DATA.orders);
      if (endpoint === '/client-requirements') setter(MOCK_DATA.requirements);

      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      // Use mock data on error
      if (endpoint === '/users') setter(MOCK_DATA.users);
      if (endpoint === '/orders') setter(MOCK_DATA.orders);
      if (endpoint === '/client-requirements') setter(MOCK_DATA.requirements);
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      if (adminToken) {
        const response = await fetch(`${API_BASE_URL}/stats`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
          return;
        }
      }

      // Calculate from mock data
      setStats({
        totalUsers: MOCK_DATA.users.length,
        totalOrders: MOCK_DATA.orders.length,
        totalRevenue: MOCK_DATA.orders.reduce((sum, order) => sum + order.totalAmount, 0),
        pendingOrders: MOCK_DATA.orders.filter(o => o.orderStatus === 'pending').length
      });
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async () => {
    try {
      if (adminToken && selectedOrder) {
        const response = await fetch(`${API_BASE_URL}/orders/${selectedOrder._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            orderStatus: newOrderStatus,
            transitInfo: newTransitInfo,
          }),
        });

        if (response.ok) {
          // Update local state
          setOrders(orders.map(order =>
            order._id === selectedOrder._id
              ? { ...order, orderStatus: newOrderStatus, transitInfo: newTransitInfo }
              : order
          ));
          setSelectedOrder(null);
          return;
        }
      }

      // Mock update
      setOrders(orders.map(order =>
        order._id === selectedOrder._id
          ? { ...order, orderStatus: newOrderStatus, transitInfo: newTransitInfo }
          : order
      ));
      setSelectedOrder(null);
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchData('/users', setUsers);
    fetchData('/orders', setOrders);
    fetchData('/client-requirements', setClientRequirements);
    fetchStats();
  };

  // Initial data load
  useEffect(() => {
    handleRefresh();
  }, [adminToken]);

  // Filter functions
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(order =>
    order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequirements = clientRequirements.filter(req =>
    req.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Status colors
  const statusColors = {
    pending: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
    processing: 'bg-blue-500/20 border-blue-500 text-blue-400',
    shipped: 'bg-cyan-500/20 border-cyan-500 text-cyan-400',
    delivered: 'bg-green-500/20 border-green-500 text-green-400',
    cancelled: 'bg-red-500/20 border-red-500 text-red-400',
  };

  const requirementStatusColors = {
    'Urgent': 'bg-red-500/20 border-red-500 text-red-400',
    'New': 'bg-cyan-500/20 border-cyan-500 text-cyan-400',
    'In Review': 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-darkPurple-950 via-black to-darkPurple-950 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              {selectedUser ? 'User Details' : selectedOrder ? 'Order Details' : selectedRequirement ? 'Requirement Details' :
                activeTab === 'overview' ? 'Network Overview' :
                  activeTab === 'users' ? 'Users Management' :
                    activeTab === 'orders' ? 'Orders Management' :
                      'Requirements Management'}
            </h1>
            <p className="text-darkPurple-400 mt-1">Real-time metrics and system controls.</p>
          </div>
          <div className="flex gap-3">
            {(selectedUser || selectedOrder || selectedRequirement) && (
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedOrder(null);
                  setSelectedRequirement(null);
                }}
                className="px-4 py-2 rounded-xl bg-darkPurple-800 hover:bg-darkPurple-700 text-sm font-bold transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-xl bg-darkPurple-800 hover:bg-darkPurple-700 text-sm font-bold transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
          </div>
        </div>

        {/* Tabs - Only show when not viewing details */}
        {!selectedUser && !selectedOrder && !selectedRequirement && (
          <div className="flex gap-2 border-b border-darkPurple-800 pb-2">
            {['overview', 'users', 'orders', 'requirements'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-t-xl font-bold text-sm transition-all ${activeTab === tab
                    ? 'bg-darkPurple-800 text-white'
                    : 'text-darkPurple-400 hover:text-white hover:bg-darkPurple-900/50'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && !selectedUser && !selectedOrder && !selectedRequirement && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-darkPurple-900/30 border border-darkPurple-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-green-400 font-bold">+12%</span>
                </div>
                <p className="text-sm text-darkPurple-400 mb-1">Platform Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>

              <div className="bg-darkPurple-900/30 border border-darkPurple-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <span className="text-xs text-green-400 font-bold">+12%</span>
                </div>
                <p className="text-sm text-darkPurple-400 mb-1">Total Volume</p>
                <p className="text-3xl font-bold">{stats.totalOrders}</p>
              </div>

              <div className="bg-darkPurple-900/30 border border-darkPurple-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-green-400 font-bold">+12%</span>
                </div>
                <p className="text-sm text-darkPurple-400 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold">₹{stats.totalRevenue?.toLocaleString('en-IN') || '0'}</p>
              </div>

              <div className="bg-darkPurple-900/30 border border-darkPurple-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xs text-green-400 font-bold">+12%</span>
                </div>
                <p className="text-sm text-darkPurple-400 mb-1">Active Pipeline</p>
                <p className="text-3xl font-bold">{stats.pendingOrders}</p>
              </div>
            </div>

            {/* Recent Activity & System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-darkPurple-900/30 border border-darkPurple-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {orders.slice(0, 4).map((order, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-darkPurple-800/30 rounded-xl hover:bg-darkPurple-800/50 transition-all cursor-pointer"
                      onClick={() => setSelectedOrder(order)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-darkPurple-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">{order.userId?.email?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold">Order {order.orderStatus}</p>
                          <p className="text-xs text-purple-400">{order._id} • {order.userId?.email}</p>
                        </div>
                      </div>
                      <p className="text-sm font-mono">#{order._id.substring(0, 8)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Health */}
              <div className="bg-darkPurple-900/30 border border-darkPurple-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  System Health
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-darkPurple-800/30 rounded-xl">
                    <p className="text-[10px] text-purple-400 uppercase tracking-widest mb-2">API Server</p>
                    <p className="text-sm font-bold text-green-400">Optimal</p>
                  </div>
                  <div className="text-center p-4 bg-darkPurple-800/30 rounded-xl">
                    <p className="text-[10px] text-purple-400 uppercase tracking-widest mb-2">Database</p>
                    <p className="text-sm font-bold text-green-400">Synchronized</p>
                  </div>
                  <div className="text-center p-4 bg-darkPurple-800/30 rounded-xl">
                    <p className="text-[10px] text-purple-400 uppercase tracking-widest mb-2">Mail Engine</p>
                    <p className="text-sm font-bold text-cyan-400">Ready</p>
                  </div>
                  <div className="text-center p-4 bg-darkPurple-800/30 rounded-xl">
                    <p className="text-[10px] text-purple-400 uppercase tracking-widest mb-2">Auth Service</p>
                    <p className="text-sm font-bold text-green-400">Stable</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-darkPurple-800/30 rounded-xl">
                  <p className="text-xs text-darkPurple-400 text-center">System Configuration</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && !selectedUser && (
          <div className="bg-darkPurple-900/30 border border-darkPurple-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-darkPurple-800">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">User Database</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 pl-10 bg-darkPurple-800 border border-darkPurple-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-darkPurple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-darkPurple-800/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-purple-400 uppercase tracking-widest">Profile</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-purple-400 uppercase tracking-widest">Contact</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-purple-400 uppercase tracking-widest">Registered</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-purple-400 uppercase tracking-widest">Location</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-purple-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-darkPurple-800/50">
                  {filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedUser(user)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg font-bold">
                            {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{user.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-white">{user.email}</p>
                          <p className="text-xs text-purple-400">{user.phoneNumber || 'No phone'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{user.createdAt}</td>
                      <td className="px-6 py-4 text-sm text-darkPurple-300">{user.address || 'No address'}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Details View */}
        {selectedUser && (
          <div className="bg-darkPurple-900/30 border border-darkPurple-800 rounded-3xl p-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl font-bold">
                  {selectedUser.name?.charAt(0) || selectedUser.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedUser.name || 'Unknown User'}</h2>
                  <p className="text-darkPurple-400">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-darkPurple-800/40 p-6 rounded-2xl border border-darkPurple-700/30">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">User ID</p>
                  <p className="text-sm font-mono text-cyan-400">{selectedUser._id}</p>
                </div>
                <div className="bg-darkPurple-800/40 p-6 rounded-2xl border border-darkPurple-700/30">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">Phone Number</p>
                  <p className="text-sm">{selectedUser.phoneNumber || 'Not provided'}</p>
                </div>
                <div className="bg-darkPurple-800/40 p-6 rounded-2xl border border-darkPurple-700/30">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">Registration Date</p>
                  <p className="text-sm">{selectedUser.createdAt}</p>
                </div>
                <div className="bg-darkPurple-800/40 p-6 rounded-2xl border border-darkPurple-700/30">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">Address</p>
                  <p className="text-sm">{selectedUser.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && !selectedOrder && (
          <div className="bg-darkPurple-900/30 border border-darkPurple-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-darkPurple-800">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Transaction Stream</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 pl-10 bg-darkPurple-800 border border-darkPurple-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-darkPurple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-darkPurple-800/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-purple-400 uppercase tracking-widest">Order ID</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-purple-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-purple-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-purple-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-purple-400 uppercase tracking-widest">Progress</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-purple-400 uppercase tracking-widest">Command</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-darkPurple-800/50">
                  {filteredOrders.map(order => (
                    <tr key={order._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-sky-400">{order._id.substring(0, 10)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-white">{order.userId?.email || 'Guest Account'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-white">₹{order.totalAmount?.toLocaleString('en-IN') || '0.00'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${statusColors[order.orderStatus]}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-darkPurple-300 italic truncate max-w-[150px]">{order.transitInfo || 'Status Update Log Empty'}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewOrderStatus(order.orderStatus);
                            setNewTransitInfo(order.transitInfo || '');
                          }}
                          className="px-4 py-2 rounded-xl bg-darkPurple-800 hover:bg-darkPurple-700 text-xs font-bold text-white transition-all shadow-md active:scale-95"
                        >Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[5000] p-4">
            <div className="bg-gradient-to-br from-darkPurple-900 via-darkPurple-900 to-darkPurple-950 border-2 border-darkPurple-700/50 p-8 rounded-3xl shadow-2xl w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-darkPurple-700/50">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-yellowGradient-start to-yellowGradient-end bg-clip-text text-transparent mb-1">
                    Orders Management
                  </h3>
                  <p className="text-sm text-darkPurple-400">Real-time metrics and system controls.</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-white/10 rounded-full text-darkPurple-400 hover:text-white transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-darkPurple-800/40 p-5 rounded-2xl border border-darkPurple-700/30">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">Target ID</p>
                  <p className="text-sm font-mono text-cyan-400 break-all">{selectedOrder._id}</p>
                </div>
                <div className="bg-darkPurple-800/40 p-5 rounded-2xl border border-darkPurple-700/30">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">Customer</p>
                  <p className="text-sm font-semibold text-white truncate">{selectedOrder.userId?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Stage Progression</label>
                <div className="grid grid-cols-2 gap-3">
                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => setNewOrderStatus(status)}
                      className={`px-4 py-3 rounded-xl text-xs font-bold border-2 transition-all uppercase tracking-wide ${newOrderStatus === status
                          ? 'bg-cyan-500 text-darkPurple-950 border-cyan-400 shadow-lg shadow-cyan-500/50'
                          : 'bg-darkPurple-800/50 border-darkPurple-700 text-darkPurple-300 hover:border-darkPurple-500 hover:bg-darkPurple-800'
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Logistics Log</label>
                <div className="bg-darkPurple-800/40 p-4 rounded-2xl border border-darkPurple-700/30">
                  <textarea
                    placeholder="Arrived at local facility"
                    value={newTransitInfo}
                    onChange={(e) => setNewTransitInfo(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-darkPurple-500 text-sm resize-none focus:outline-none min-h-[80px]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-darkPurple-700/50">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 px-6 py-3 rounded-xl bg-darkPurple-800/50 border-2 border-darkPurple-700 text-sm font-bold text-darkPurple-300 hover:bg-darkPurple-800 hover:border-darkPurple-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateOrderStatus}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-sm font-bold text-darkPurple-950 hover:from-cyan-400 hover:to-cyan-500 transition-all shadow-lg shadow-cyan-500/30 active:scale-95"
                >
                  Update Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Requirements Tab */}
        {activeTab === 'requirements' && !selectedRequirement && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Priority Requirements</h3>
              <span className="text-sm text-cyan-400 font-bold">{clientRequirements.length} Pending</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequirements.map(req => (
                <div
                  key={req._id}
                  className="bg-darkPurple-900/30 border-2 border-darkPurple-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all cursor-pointer"
                  onClick={() => setSelectedRequirement(req)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${requirementStatusColors[req.status]}`}>
                      {req.status}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold mb-2">{req.title}</h4>
                  <p className="text-sm text-darkPurple-300 mb-4 line-clamp-2">{req.description}</p>
                  <div className="flex items-center gap-2 text-xs text-purple-400 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{req.contactName || 'Unknown Contact'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-purple-400 mb-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{req.contactEmail || 'No Email'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-darkPurple-700">
                    <span className="text-xs text-darkPurple-400">{req.date}</span>
                    <button className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-darkPurple-950 transition-all">
                      Process Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requirement Details View */}
        {selectedRequirement && (
          <div className="bg-darkPurple-900/30 border border-darkPurple-800 rounded-3xl p-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-purple-500/20 rounded-xl">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{selectedRequirement.title}</h2>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${requirementStatusColors[selectedRequirement.status]}`}>
                      {selectedRequirement.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-darkPurple-800/40 p-6 rounded-2xl border border-darkPurple-700/30 mb-6">
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3">Description</p>
                <p className="text-sm leading-relaxed">{selectedRequirement.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-darkPurple-800/40 p-6 rounded-2xl border border-darkPurple-700/30">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">Contact Name</p>
                  <p className="text-sm">{selectedRequirement.contactName || 'Not provided'}</p>
                </div>
                <div className="bg-darkPurple-800/40 p-6 rounded-2xl border border-darkPurple-700/30">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">Contact Email</p>
                  <p className="text-sm">{selectedRequirement.contactEmail || 'Not provided'}</p>
                </div>
                <div className="bg-darkPurple-800/40 p-6 rounded-2xl border border-darkPurple-700/30">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">Submission Date</p>
                  <p className="text-sm">{selectedRequirement.date}</p>
                </div>
                <div className="bg-darkPurple-800/40 p-6 rounded-2xl border border-darkPurple-700/30">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">Requirement ID</p>
                  <p className="text-sm font-mono text-cyan-400">{selectedRequirement._id}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-6 py-3 rounded-xl bg-darkPurple-800 hover:bg-darkPurple-700 text-sm font-bold transition-all">
                  Mark as Processed
                </button>
                <button className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-sm font-bold text-darkPurple-950 hover:from-cyan-400 hover:to-cyan-500 transition-all shadow-lg shadow-cyan-500/30">
                  Contact Client
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
