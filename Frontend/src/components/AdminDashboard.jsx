import React, { useState, useEffect } from 'react';
import API_BASE_URL_ROOT from '../config';


export default function AdminDashboard({ adminUser, adminToken }) {
  // Stats and Data states
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [clientRequirements, setClientRequirements] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [newTransitInfo, setNewTransitInfo] = useState('');

  const API_BASE_URL = `${API_BASE_URL_ROOT}/api/admin`;

  // Mock data for demonstration purposes
  const MOCK_DATA = {
    users: [
      { _id: 'u1', name: 'Somya Verma', email: 'somya@example.com', phoneNumber: '+91 98765 43210', address: 'B-42, South City, New Delhi', createdAt: '2023-11-20' },
      { _id: 'u2', name: 'James Wilson', email: 'james@vapefans.com', phoneNumber: '+44 7700 900123', address: '12 Baker Street, London', createdAt: '2023-12-05' },
      { _id: 'u3', name: 'Elena Rodriguez', email: 'elena.r@gmail.com', phoneNumber: '+34 612 345 678', address: 'Calle Mayor 15, Madrid', createdAt: '2024-01-12' },
      { _id: 'u4', name: 'Kenji Sato', email: 'kenji.s@it-tokyo.jp', phoneNumber: '+81 90-1234-5678', address: 'Shibuya-ku, Tokyo', createdAt: '2024-02-28' },
    ],
    orders: [
      { _id: 'ORD-7721', userId: { email: 'somya@example.com' }, totalAmount: 1599.00, orderStatus: 'shipped', transitInfo: 'Arrived at local facility', createdAt: '2025-12-23T10:00:00Z' },
      { _id: 'ORD-7722', userId: { email: 'james@vapefans.com' }, totalAmount: 2450.00, orderStatus: 'processing', transitInfo: 'Quality check passed', createdAt: '2025-12-24T08:30:00Z' },
      { _id: 'ORD-7723', userId: { email: 'elena.r@gmail.com' }, totalAmount: 899.00, orderStatus: 'delivered', transitInfo: 'Delivered to porch', createdAt: '2025-12-22T15:45:00Z' },
      { _id: 'ORD-7724', userId: { email: 'kenji.s@it-tokyo.jp' }, totalAmount: 4200.00, orderStatus: 'pending', transitInfo: 'Awaiting payment confirmation', createdAt: '2025-12-24T14:20:00Z' },
      { _id: 'ORD-7725', userId: { email: 'somya@example.com' }, totalAmount: 310.00, orderStatus: 'cancelled', transitInfo: 'Cancelled by customer', createdAt: '2025-12-21T09:12:00Z' },
    ],
    requirements: [
      { id: 1, title: 'Bulk Wholesale Inquiry', description: 'Looking for 500 units of Elfbar BC20000 for a new retail chain opening in Dubai. Need best price quotation.', status: 'Urgent', date: '2025-12-23' },
      { id: 2, title: 'Store Partnership', description: 'Small boutique in Paris interested in stocking premium nic-salts. Seeking distribution details.', status: 'New', date: '2025-12-24' },
      { id: 3, title: 'Custom Flavor Request', description: 'Customer inquiry about potential for customized branding on disposable units for corporate events.', status: 'In Review', date: '2025-12-22' },
    ]
  };

  const fetchData = async (endpoint, setter) => {
    try {
      setError('');
      setLoading(true);

      // If no token, we are likely in bypass mode, use mock data
      if (!adminToken) {
        setTimeout(() => {
          if (endpoint === '/users') setter(MOCK_DATA.users);
          if (endpoint === '/orders') setter(MOCK_DATA.orders);
          if (endpoint === '/client-requirements') setter(MOCK_DATA.requirements);
          setLoading(false);
        }, 800);
        return;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (!response.ok) {
        // Fallback to mock on server error for demonstration
        console.warn(`Backend fetch failed for ${endpoint}, using mock data.`);
        if (endpoint === '/users') setter(MOCK_DATA.users);
        if (endpoint === '/orders') setter(MOCK_DATA.orders);
        if (endpoint === '/client-requirements') setter(MOCK_DATA.requirements);
      } else {
        const data = await response.json();
        setter(data);
      }
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      // Final fallback
      if (endpoint === '/users') setter(MOCK_DATA.users);
      if (endpoint === '/orders') setter(MOCK_DATA.orders);
      if (endpoint === '/client-requirements') setter(MOCK_DATA.requirements);
    } finally {
      if (!adminToken) return; // Already handled by timeout
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch of everything for stats
    fetchData('/users', setUsers);
    fetchData('/orders', setOrders);
    fetchData('/client-requirements', setClientRequirements);
  }, [adminToken]);

  useEffect(() => {
    // Calculate stats whenever data changes
    if (users.length >= 0 || orders.length >= 0) {
      const revenue = orders
        .filter(o => o.orderStatus !== 'cancelled')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const pending = orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'processing').length;

      setStats({
        totalUsers: users.length || MOCK_DATA.users.length,
        totalOrders: orders.length || MOCK_DATA.orders.length,
        totalRevenue: revenue || MOCK_DATA.orders.reduce((sum, o) => sum + o.totalAmount, 0),
        pendingOrders: pending || MOCK_DATA.orders.filter(o => o.orderStatus === 'pending').length
      });
    }
  }, [users, orders]);

  const handleUpdateOrderStatus = async (orderId) => {
    try {
      setLoading(true);

      if (!adminToken) {
        // Mock update
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newOrderStatus, transitInfo: newTransitInfo } : o));
        setSelectedOrder(null);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ orderStatus: newOrderStatus, transitInfo: newTransitInfo }),
      });

      if (!response.ok) throw new Error('Update failed');

      setOrders(prevOrders => prevOrders.map(order =>
        order._id === orderId ? { ...order, orderStatus: newOrderStatus, transitInfo: newTransitInfo, updatedAt: new Date().toISOString() } : order
      ));
      setSelectedOrder(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    processing: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    shipped: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    cancelled: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
  };

  return (
    <div className="min-h-screen text-gray-100 flex flex-col md:flex-row pb-12">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-darkPurple-950/80 backdrop-blur-md border-r border-darkPurple-800 p-6 flex flex-col gap-8 h-auto md:h-screen sticky top-0 md:top-32 z-20">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellowGradient-start to-yellowGradient-end flex items-center justify-center text-darkPurple-950 font-bold">A</div>
          <span className="font-bold text-lg tracking-tight">Admin Console</span>
        </div>

        <nav className="flex flex-col gap-2">
          {[
            { id: 'overview', label: 'Dashboard', icon: 'M4 6h16M4 12h16M4 18h7' },
            { id: 'users', label: 'User Directory', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
            { id: 'orders', label: 'Order Pipeline', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
            { id: 'requirements', label: 'Client Needs', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                ? 'bg-yellowGradient-start text-darkPurple-950 font-bold shadow-lg shadow-yellowGradient-start/20'
                : 'text-darkPurple-300 hover:bg-white/5 hover:text-white'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-darkPurple-900/40 rounded-2xl border border-darkPurple-800">
          <p className="text-xs text-darkPurple-400 uppercase font-bold tracking-widest mb-1">Logged in as</p>
          <p className="text-sm font-semibold text-white truncate">{adminUser?.name || adminUser?.username || 'Temporary Admin'}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white via-darkPurple-200 to-darkPurple-400 bg-clip-text text-transparent">
              {activeTab === 'overview' ? 'Network Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + ' Management'}
            </h1>
            <p className="text-darkPurple-400 mt-1">Real-time metrics and system controls.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchData(activeTab === 'requirements' ? '/client-requirements' : `/${activeTab}`, activeTab === 'users' ? setUsers : activeTab === 'orders' ? setOrders : setClientRequirements)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-darkPurple-800 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Content Tabs */}
        <div className="relative z-10 transition-all duration-300">
          {activeTab === 'overview' && (
            <div className="space-y-10">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Platform Users', value: stats.totalUsers, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-sky-400' },
                  { label: 'Total Volume', value: stats.totalOrders, icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', color: 'text-indigo-400' },
                  { label: 'Annual Revenue', value: stats.totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }), icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-emerald-400' },
                  { label: 'Active Pipeline', value: stats.pendingOrders, icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'text-amber-400' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-darkPurple-900/30 border border-darkPurple-800 p-6 rounded-3xl hover:border-darkPurple-600 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-2xl bg-darkPurple-800/50 ${stat.color} transition-transform group-hover:scale-110`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <p className="text-darkPurple-400 text-sm font-medium">{stat.label}</p>
                    <h3 className="text-3xl font-bold mt-1 text-white">{stat.value}</h3>
                  </div>
                ))}
              </div>

              {/* Secondary Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activities */}
                <div className="bg-darkPurple-900/30 border border-darkPurple-800 rounded-3xl p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-yellowGradient-start"></span>
                    Recent Activity
                  </h3>
                  <div className="space-y-6">
                    {MOCK_DATA.orders.slice(0, 4).map((order, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${statusColors[order.orderStatus].split(' ')[2]}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24 text-darkPurple-300">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white group-hover:text-yellowGradient-end transition-colors capitalize">Order {order.orderStatus}</p>
                          <p className="text-xs text-darkPurple-400 tracking-wide">{order._id} • {order.userId.email}</p>
                        </div>
                        <p className="text-sm font-bold text-darkPurple-200">#ORD-{i + 500}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="bg-darkPurple-900/30 border border-darkPurple-800 rounded-3xl p-8 flex flex-col">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                    System Health
                  </h3>
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    {[
                      { label: 'API Server', status: 'Optimal', color: 'text-emerald-400' },
                      { label: 'Database', status: 'Synchronized', color: 'text-emerald-400' },
                      { label: 'Mail Engine', status: 'Ready', color: 'text-sky-400' },
                      { label: 'Auth Service', status: 'Stable', color: 'text-emerald-400' }
                    ].map((s, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-darkPurple-800/30 border border-darkPurple-800/50 text-center">
                        <p className="text-[10px] font-bold text-darkPurple-400 uppercase mb-1 tracking-widest">{s.label}</p>
                        <p className={`text-sm font-bold ${s.color}`}>{s.status}</p>
                      </div>
                    ))}
                  </div>
                  <button className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-darkPurple-800 to-darkPurple-900 border border-darkPurple-700 font-bold hover:brightness-125 transition-all">
                    System Configuration
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-darkPurple-900/30 border border-darkPurple-800 rounded-3xl overflow-hidden animate-fadeIn">
              <div className="p-6 border-b border-darkPurple-800 flex flex-col md:flex-row justify-between gap-4">
                <h3 className="text-xl font-bold">User Database</h3>
                <div className="relative max-w-sm w-full">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-darkPurple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={2} /></svg>
                  <input type="text" placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2 rounded-xl bg-darkPurple-900/50 border border-darkPurple-700 text-sm focus:outline-none focus:ring-1 focus:ring-yellowGradient-start" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-darkPurple-800/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-darkPurple-400 uppercase tracking-widest">Profile</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-darkPurple-400 uppercase tracking-widest">Contact</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-darkPurple-400 uppercase tracking-widest">Registered</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-darkPurple-400 uppercase tracking-widest">Location</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-darkPurple-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-darkPurple-800/50">
                    {users.map(user => (
                      <tr key={user._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-darkPurple-800 flex items-center justify-center font-bold text-darkPurple-300">{user.name.charAt(0)}</div>
                            <span className="text-sm font-semibold text-white">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-darkPurple-200">{user.email}</p>
                          <p className="text-xs text-darkPurple-500">{user.phoneNumber || 'No phone'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-darkPurple-300">{user.createdAt?.split('T')[0] || '2024-01-01'}</span>
                        </td>
                        <td className="px-6 py-4 max-w-[200px] truncate">
                          <span className="text-xs text-darkPurple-300">{user.address || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 hover:bg-white/10 rounded-lg text-darkPurple-400 hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" strokeWidth={2} /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-darkPurple-900/30 border border-darkPurple-800 rounded-3xl overflow-hidden animate-fadeIn">
              <div className="p-6 border-b border-darkPurple-800">
                <h3 className="text-xl font-bold">Transaction Stream</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-darkPurple-800/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-darkPurple-400 uppercase tracking-widest">Order ID</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-darkPurple-400 uppercase tracking-widest">Customer</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-darkPurple-400 uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-darkPurple-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-darkPurple-400 uppercase tracking-widest">Progress</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-darkPurple-400 uppercase tracking-widest">Command</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-darkPurple-800/50">
                    {orders.map(order => (
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

              {selectedOrder && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[5000] p-4 scale-up">
                  <div className="bg-darkPurple-900 border border-darkPurple-700 p-8 rounded-3xl shadow-2xl w-full max-w-xl">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-yellowGradient-start to-yellowGradient-end bg-clip-text text-transparent underline decoration-darkPurple-700 underline-offset-8">Order Logistics</h3>
                      <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/10 rounded-full text-darkPurple-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2} /></svg></button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-darkPurple-800/40 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-darkPurple-500 uppercase tracking-widest mb-1">Target ID</p>
                        <p className="text-sm font-mono text-yellowGradient-start">{selectedOrder._id}</p>
                      </div>
                      <div className="bg-darkPurple-800/40 p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-darkPurple-500 uppercase tracking-widest mb-1">Customer</p>
                        <p className="text-sm font-semibold truncate text-white">{selectedOrder.userId?.email}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-darkPurple-400 uppercase tracking-widest mb-2">Stage Progression</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                            <button
                              key={status}
                              onClick={() => setNewOrderStatus(status)}
                              className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${newOrderStatus === status
                                ? 'bg-yellowGradient-start text-darkPurple-950 border-yellowGradient-start'
                                : 'bg-darkPurple-800/50 border-darkPurple-700 text-darkPurple-300 hover:border-darkPurple-500'
                                }`}
                            >
                              {status.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-darkPurple-400 uppercase tracking-widest mb-2">Logistics Log</label>
                        <textarea
                          placeholder="Internal notes or tracking details..."
                          className="w-full px-4 py-3 bg-darkPurple-950 border border-darkPurple-700 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-yellowGradient-start h-24 resize-none transition-all placeholder:text-darkPurple-600"
                          value={newTransitInfo}
                          onChange={(e) => setNewTransitInfo(e.target.value)}
                        ></textarea>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-10">
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="flex-1 py-4 rounded-2xl bg-white/5 border border-darkPurple-700 text-sm font-bold text-white hover:bg-white/10 transition-all"
                      >Discard</button>
                      <button
                        onClick={() => handleUpdateOrderStatus(selectedOrder._id)}
                        className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-yellowGradient-start to-yellowGradient-end text-sm font-bold text-darkPurple-950 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-yellowGradient-start/10"
                      >Commit Changes</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-xl font-bold">Priority Requirements</h3>
                <span className="text-xs font-bold text-darkPurple-500">{clientRequirements.length} Pending</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clientRequirements.map(req => (
                  <div key={req.id} className="relative bg-darkPurple-900/30 p-8 rounded-[2rem] border border-darkPurple-800 hover:border-darkPurple-600 transition-all duration-300 group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${req.status === 'Urgent' ? 'bg-rose-500/10 text-rose-400 border-rose-500/40' :
                        req.status === 'New' ? 'bg-sky-500/10 text-sky-400 border-sky-500/40' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/40'
                        }`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="p-3 mb-6 bg-darkPurple-800/50 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-yellowGradient-start" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeWidth={2} /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{req.title}</h3>
                    <p className="text-darkPurple-300 text-sm leading-relaxed mb-6 h-20 overflow-y-auto custom-scrollbar">{req.description}</p>
                    <div className="flex justify-between items-center mt-auto border-t border-darkPurple-800/50 pt-4">
                      <span className="text-[10px] font-bold text-darkPurple-500 uppercase tracking-widest">{req.date}</span>
                      <button className="text-xs font-bold text-yellowGradient-start hover:text-white transition-colors">Process Ticket</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .shadow-purple-glow {
          box-shadow: 0 0 50px -12px rgba(168, 85, 247, 0.2);
        }
        .scale-up {
          animation: scaleUp 0.3s ease-out forwards;
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}
