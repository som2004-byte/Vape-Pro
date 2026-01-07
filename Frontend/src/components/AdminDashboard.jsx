import React, { useState, useEffect } from 'react';
import API_BASE_URL_ROOT from '../config';

export default function AdminDashboard({ adminUser, adminToken, onLogout }) {
  // Navigation and view states
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stockUpdateValue, setStockUpdateValue] = useState('');

  // Data states
  const [users, setUsers] = useState([]);
  const [clientRequirements, setClientRequirements] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRequirements: 0,
    pendingRequirements: 0
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [newTransitInfo, setNewTransitInfo] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking', 'live', 'offline'
  const [lastError, setLastError] = useState(null);

  const API_BASE_URL = `${API_BASE_URL_ROOT}/api/admin`;

  // Fetch data from API
  const fetchData = async (endpoint, setter) => {
    try {
      if (!adminToken) return;
      setLoading(true);
      setError('');

      // Try to fetch from API if token exists
      if (adminToken) {
        setConnectionStatus('checking');
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
          setConnectionStatus('live');
          return;
        } else {
          const errData = await response.json().catch(() => ({}));
          console.error(`API Error (${endpoint}):`, response.status, errData);
          setLastError(`API Error ${response.status}: ${errData.message || response.statusText}`);
        }
      } else {
        setConnectionStatus('offline');
      }

      // Fallback to mock data
      if (endpoint === '/users') setter(MOCK_DATA.users);
      if (endpoint === '/orders') setter(MOCK_DATA.orders);
      if (endpoint === '/client-requirements') setter(MOCK_DATA.requirements);

      setLoading(false);
      if (adminToken) setConnectionStatus('offline');
    } catch (err) {
      console.error('Fetch error:', err);
      setLastError(err.message);
      // Use mock data on error
      if (endpoint === '/users') setter(MOCK_DATA.users);
      if (endpoint === '/orders') setter(MOCK_DATA.orders);
      if (endpoint === '/client-requirements') setter(MOCK_DATA.requirements);
      setLoading(false);
      setConnectionStatus('offline');
    }
  };

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      if (!adminToken) return;
      const response = await fetch(`${API_BASE_URL}/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

        if (response.ok) {
          const data = await response.json();
          // Merge with current stats to preserve pendingOrders if missing
          setStats(prev => ({ ...prev, ...data }));
          return;
        }
      }

      // Calculate from mock data
      setStats({
        totalUsers: MOCK_DATA.users.length,
        totalOrders: MOCK_DATA.orders.length,
        totalRevenue: MOCK_DATA.orders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0),
        pendingOrders: MOCK_DATA.orders.filter(o => o.orderStatus === 'pending' || o.status === 'pending').length
      });
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchData('/users', setUsers);
    fetchData('/client-requirements', setClientRequirements);
    fetchData('/orders', setOrders);
    fetchData('/products', setProducts);
    fetchStats();
  };

  const handleStockUpdate = async (productId, newStock) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ stock: Number(newStock) })
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        // Update local state
        setProducts(products.map(p => p._id === productId ? updatedProduct : p));
        if (selectedProduct && selectedProduct._id === productId) {
          setSelectedProduct(updatedProduct);
        }
        setStockUpdateValue('');
      } else {
        console.error('Failed to update stock');
      }
    } catch (error) {
      console.error('Error updating stock', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        const updatedOrderWithDetails = { ...selectedOrder, ...updatedOrder, userId: selectedOrder.userId }; // Preserve populated user details if backend doesn't return them fully

        // Update local state
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    handleRefresh();
  }, [adminToken]);

  // Filter functions
  const filteredUsers = Array.isArray(users) ? users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const filteredRequirements = Array.isArray(clientRequirements) ? clientRequirements.filter(req =>
    req.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const filteredOrders = Array.isArray(orders) ? orders.filter(order =>
    order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const filteredProducts = Array.isArray(products) ? products.filter(prod =>
    prod.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prod.category?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const statusColors = {
    'Urgent': 'bg-red-500/20 border-red-500 text-red-400',
    'New': 'bg-cyan-500/20 border-cyan-500 text-cyan-400',
    'In Review': 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
    'Processed': 'bg-green-500/20 border-green-500 text-green-400',
    'pending': 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
    'processing': 'bg-blue-500/20 border-blue-500 text-blue-400',
    'shipped': 'bg-purple-500/20 border-purple-500 text-purple-400',
    'delivered': 'bg-green-500/20 border-green-500 text-green-400',
    'cancelled': 'bg-red-500/20 border-red-500 text-red-400',
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              {selectedUser ? 'User Details' : selectedOrder ? 'Order Details' : selectedRequirement ? 'Requirement Details' :
                activeTab === 'overview' ? 'Network Overview' :
                  activeTab === 'users' ? 'Users Management' :
                    activeTab === 'orders' ? 'Orders Management' :
                      'Requirements Management'}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${connectionStatus === 'live' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : connectionStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></span>
                <span className={`text-xs font-bold uppercase tracking-wider ${connectionStatus === 'live' ? 'text-green-400' : connectionStatus === 'checking' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {connectionStatus === 'live' ? 'Database Live' : connectionStatus === 'checking' ? 'Connecting...' : 'Offline (Mock Mode)'}
                </span>
              </div>
              <span className="text-darkPurple-600">|</span>
              <p className="text-darkPurple-400 text-xs uppercase tracking-widest font-medium">Real-time metrics and system controls</p>
            </div>
            {lastError && connectionStatus === 'offline' && (
              <p className="text-red-400 text-[10px] mt-1 font-mono">{lastError}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {(selectedUser || selectedRequirement || selectedOrder || selectedProduct) && (
              <button
                onClick={() => { setSelectedUser(null); setSelectedRequirement(null); setSelectedOrder(null); setSelectedProduct(null); }}
                className="px-5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Return
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-500/50 transition-all"
              title="Refresh Data"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            <button
              onClick={onLogout}
              className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Global Tabs */}
        {!selectedUser && !selectedRequirement && !selectedOrder && !selectedProduct && (
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'overview', label: 'Command Center', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { id: 'logistics', label: 'Logistics Log', icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z' },
              { id: 'inventory', label: 'Supply Depot', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
              { id: 'users', label: 'User Fleet', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
              { id: 'requirements', label: 'Requirement Log', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
            ].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-t-xl font-bold text-sm transition-all ${activeTab === tab
                  ? 'bg-darkPurple-800 text-white'
                  : 'text-darkPurple-400 hover:text-white hover:bg-darkPurple-900/50'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        {activeTab === 'overview' && !selectedUser && !selectedRequirement && !selectedOrder && !selectedProduct && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Col */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
                  <p className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Total Registry</p>
                  <div className="flex items-end justify-between">
                    <span className="text-5xl font-black">{stats.totalUsers}</span>
                    <span className="text-xs text-green-400 flex items-center gap-1 font-bold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 11.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L10 10.586 13.586 7H12z" clipRule="evenodd" /></svg>
                      Active
                    </span>
                  </div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
                  <p className="text-xs font-black text-yellow-400 uppercase tracking-[0.2em] mb-4">Pending Ops</p>
                  <div className="flex items-end justify-between">
                    <span className="text-5xl font-black">{stats.pendingRequirements}</span>
                    <span className="text-xs text-yellow-400 font-bold">Tasks</span>
                  </div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
                  <p className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] mb-4">Orders</p>
                  <div className="flex items-end justify-between">
                    <span className="text-5xl font-black">{orders.length}</span>
                    <span className="text-xs text-purple-400 font-bold">Total</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
                <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-6">Recent Logistics</h3>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 font-bold">No recent logistic activity.</div>
                  ) : (
                    orders.slice(0, 5).map(order => (
                      <div key={order._id} onClick={() => setSelectedOrder(order)} className="flex items-center justify-between p-4 bg-black/40 border border-gray-800 rounded-2xl hover:border-purple-500/50 cursor-pointer">
                        <div>
                          <p className="font-bold text-white">ORD-{order._id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${statusColors[order.status] || 'border-gray-700'}`}>
                          {order.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logistics (Orders) Tab */}
        {activeTab === 'logistics' && !selectedOrder && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-[32px] overflow-hidden backdrop-blur-xl">
            <div className="p-6 md:p-8 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-3xl font-black italic tracking-tighter uppercase">Logistics Log</h3>
              <input
                type="text"
                placeholder="Search Order ID or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-72 pl-4 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-sm font-bold focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/40">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Order ID</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Date</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Customer</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Total</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filteredOrders.map(order => (
                    <tr key={order._id} className="group hover:bg-white/5 transition-all cursor-pointer" onClick={() => setSelectedOrder(order)}>
                      <td className="px-8 py-6 font-mono text-sm text-purple-400">#{order._id.slice(-6).toUpperCase()}</td>
                      <td className="px-8 py-6 text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-8 py-6 text-sm font-bold text-white">{order.userId?.email || 'Guest'}</td>
                      <td className="px-8 py-6 text-sm font-mono text-green-400">${order.total.toFixed(2)}</td>
                      <td className="px-8 py-6 text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Details View */}
        {selectedOrder && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-[40px] p-6 md:p-10 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Items */}
                <div className="bg-black/40 border border-gray-800 p-8 rounded-[32px]">
                  <h4 className="text-xl font-black italic uppercase mb-6">Cargo Manifest</h4>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-gray-500">x{item.quantity}</span>
                          </div>
                          <div>
                            <p className="font-bold text-white">{item.name}</p>
                            <p className="text-xs text-gray-400">Unit Cost: ${item.price}</p>
                          </div>
                        </div>
                        <p className="font-mono text-green-400 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center">
                    <span className="text-sm font-black uppercase text-gray-500 tracking-widest">Total Value</span>
                    <span className="text-3xl font-black text-green-400">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-black/40 border border-gray-800 p-8 rounded-[32px]">
                  <h4 className="text-xl font-black italic uppercase mb-6">Delivery Vector</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">Recipient</p>
                      <p className="text-lg font-bold text-white">{selectedOrder.userId?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-400">{selectedOrder.userId?.email}</p>
                      <p className="text-sm text-gray-400">{selectedOrder.userId?.phoneNumber || 'No Contact'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">Destination</p>
                      <p className="text-lg font-bold text-white leading-relaxed">{selectedOrder.shippingAddress || selectedOrder.userId?.address || 'No Address Provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-purple-900/10 border border-purple-500/20 p-8 rounded-[32px]">
                  <p className="text-[10px] font-black uppercase text-purple-400 tracking-widest mb-4">Command Actions</p>
                  <div className="space-y-3">
                    <button onClick={() => handleOrderStatusUpdate(selectedOrder._id, 'processing')} className="w-full py-4 rounded-xl bg-purple-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-purple-500 transition-all">Mark Processed</button>
                    <button onClick={() => handleOrderStatusUpdate(selectedOrder._id, 'shipped')} className="w-full py-4 rounded-xl bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all">Mark Shipped</button>
                    <button onClick={() => handleOrderStatusUpdate(selectedOrder._id, 'delivered')} className="w-full py-4 rounded-xl bg-green-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-green-500 transition-all">Mark Delivered</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory/Supply Depot Tab */}
        {activeTab === 'inventory' && !selectedProduct && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-[32px] overflow-hidden backdrop-blur-xl">
            <div className="p-6 md:p-8 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-3xl font-black italic tracking-tighter uppercase">Supply Depot</h3>
              <input
                type="text"
                placeholder="Search Supplies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-72 pl-4 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-sm font-bold focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/40">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Item Name</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Category</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Stock Level</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Price</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filteredProducts.map(prod => (
                    <tr key={prod._id} onClick={() => setSelectedProduct(prod)} className="group hover:bg-white/5 transition-all cursor-pointer">
                      <td className="px-8 py-6 font-bold text-white group-hover:text-purple-400 transition-colors">{prod.name}</td>
                      <td className="px-8 py-6 text-sm text-gray-400 capitalize">{prod.category}</td>
                      <td className="px-8 py-6">
                        <span className={`font-mono font-bold ${prod.stock < 10 ? 'text-red-500' : 'text-green-400'}`}>
                          {prod.stock} Units
                        </span>
                      </td>
                      <td className="px-8 py-6 font-mono text-gray-300">${prod.price}</td>
                      <td className="px-8 py-6 text-right">
                        {prod.stock > 0 ? (
                          <span className="text-xs font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full border border-green-500/50">In Supply</span>
                        ) : (
                          <span className="text-xs font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/50 animate-pulse">Depleted</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Selected Product (Stock Management) View */}
        {selectedProduct && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-[40px] p-6 md:p-12 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Product Info */}
              <div className="lg:w-1/3">
                <div className="w-full aspect-square bg-black border border-gray-800 rounded-[32px] flex items-center justify-center mb-8 relative overflow-hidden group">
                  {selectedProduct.image ? (
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="text-center">
                      <svg className="w-20 h-20 text-gray-800 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      <p className="text-xs font-black uppercase text-gray-700 tracking-widest">No Visual Data</p>
                    </div>
                  )}
                </div>
                <h2 className="text-3xl font-black italic uppercase leading-none mb-2">{selectedProduct.name}</h2>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">{selectedProduct.category} // {selectedProduct.sku || 'NO_SKU'}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/30 p-4 rounded-2xl border border-gray-700/30">
                    <p className="text-[10px] uppercase text-gray-500 font-black mb-1">Unit Value</p>
                    <p className="text-xl font-mono text-green-400 font-bold">${selectedProduct.price}</p>
                  </div>
                  <div className="bg-gray-800/30 p-4 rounded-2xl border border-gray-700/30">
                    <p className="text-[10px] uppercase text-gray-500 font-black mb-1">Total Sold</p>
                    <p className="text-xl font-mono text-blue-400 font-bold">--</p>
                  </div>
                </div>
              </div>

              {/* Inventory Control */}
              <div className="lg:w-2/3 space-y-8">
                <div className="bg-black/40 border border-gray-800 p-10 rounded-[40px]">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <p className="text-[10px] font-black uppercase text-purple-400 tracking-[0.4em] mb-2">Inventory Control</p>
                      <h3 className="text-xl font-bold text-white">Manage Stock Levels</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">Current Availability</p>
                      <p className={`text-6xl font-black ${selectedProduct.stock < 10 ? 'text-red-500' : 'text-white'}`}>{selectedProduct.stock}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 mb-8">
                    <input
                      type="number"
                      placeholder="Enter new quantity..."
                      value={stockUpdateValue}
                      onChange={(e) => setStockUpdateValue(e.target.value)}
                      className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 text-xl font-bold focus:border-purple-500 focus:outline-none transition-colors"
                    />
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
                  </div>
                </div>

                <div className="bg-red-900/10 border border-red-500/20 p-8 rounded-[32px]">
                  <h4 className="text-lg font-black uppercase text-red-400 italic mb-4">Emergency Protocol</h4>
                  <p className="text-sm text-gray-400 mb-6">If product line is discontinued or recalled, initiate immediate takedown from the verified registry.</p>
                  <button className="w-full py-4 rounded-xl border border-red-500/30 text-red-400 font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all">Deactivate Product Node</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && !selectedUser && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-[32px] overflow-hidden backdrop-blur-xl">
            <div className="p-6 md:p-8 border-b border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="text-3xl font-black italic tracking-tighter uppercase">Registry Management</h3>
                  <p className="text-sm text-gray-500 font-medium">Control and monitor all verified platform operators</p>
                </div>
                <div className="relative w-full md:w-96">
                  <input
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-black border border-gray-800 rounded-2xl text-sm italic font-bold focus:outline-none focus:border-purple-500 transition-all"
                  />
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/40">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Identity</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Contact Vector</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Registry Date</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Current Loc</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center text-gray-600 font-black italic">No records found matching criteria.</td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user._id} className="group hover:bg-white/5 transition-all cursor-pointer" onClick={() => setSelectedUser(user)}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-lg font-black italic shadow-lg shadow-purple-900/40 group-hover:scale-110 transition-transform">
                              {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-gray-200 group-hover:text-white transition-colors">{user.name || 'ANONYMOUS'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div>
                            <p className="text-sm font-bold text-gray-300">{user.email}</p>
                            <p className="text-[10px] text-gray-500 font-black uppercase mt-1">{user.phoneNumber || 'STOCKED_NONE'}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-gray-400">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'LEGACY_USER'}
                        </td>
                        <td className="px-8 py-6 text-xs font-bold text-gray-500 uppercase truncate max-w-[200px]">
                          {user.address || 'UNDEFINED_VECTOR'}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="px-4 py-2 rounded-xl border border-gray-800 text-[10px] font-black uppercase hover:bg-gray-800 transition-colors">
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Requirements Tab - (Existing) */}
        {activeTab === 'requirements' && !selectedRequirement && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="text-3xl font-black italic tracking-tighter uppercase">Requirement Ledger</h3>
                <p className="text-sm text-gray-500 font-medium">Processing high-priority client infrastructure tickets</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 px-6 py-3 rounded-2xl flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-xs font-black uppercase text-gray-400">{filteredRequirements.length} Active</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequirements.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-800 rounded-[32px]">
                  <p className="text-gray-600 font-black italic text-xl">LEADGER_EMPTY: NO TICKETS FOUND</p>
                </div>
              ) : (
                filteredRequirements.map(req => (
                  <div
                    key={req._id}
                    className="group bg-gray-900/50 border-2 border-gray-800 rounded-[32px] p-8 hover:border-purple-500/50 transition-all cursor-pointer relative overflow-hidden"
                    onClick={() => setSelectedRequirement(req)}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-[60px] group-hover:bg-purple-600/10 transition-all" />

                    <div className="flex items-start justify-between mb-8 relative z-10">
                      <div className="w-14 h-14 bg-black border border-gray-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border ${statusColors[req.status] || 'border-gray-800 text-gray-500'}`}>
                        {req.status}
                      </span>
                    </div>

                    <h4 className="text-xl font-black italic uppercase mb-3 relative z-10 group-hover:text-purple-400 transition-colors">{req.title}</h4>
                    <p className="text-sm text-gray-500 font-medium mb-8 line-clamp-3 leading-relaxed">{req.description}</p>

                    <div className="space-y-3 mb-8 relative z-10">
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                        <svg className="w-4 h-4 text-purple-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        {req.contactName}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-500 truncate lowercase italic">
                        <svg className="w-4 h-4 text-purple-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {req.contactEmail}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-800 relative z-10">
                      <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">{req.date}</span>
                      <button className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest group-hover:bg-purple-600 group-hover:text-white transition-all shadow-xl shadow-white/5 group-hover:shadow-purple-600/30">
                        Process
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Selected User - (Existing) */}
        {selectedUser && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-[40px] p-6 md:p-10 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4 flex flex-col items-center text-center">
                <div className="w-48 h-48 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-[48px] flex items-center justify-center text-6xl font-black italic shadow-2xl shadow-purple-500/40 mb-8 border-4 border-white/10">
                  {selectedUser.name?.charAt(0) || selectedUser.email?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">{selectedUser.name || 'ANONYMOUS'}</h2>
                <p className="text-xl text-purple-400 font-bold mb-8">{selectedUser.email}</p>
                <div className="w-full flex gap-4">
                  <button className="flex-1 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-purple-600 hover:text-white transition-all">Verify Node</button>
                  <button className="p-4 rounded-2xl bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full content-center">
                  {[
                    { label: 'Platform ID', value: selectedUser._id, mono: true, color: 'text-blue-400' },
                    { label: 'Register Date', value: new Date(selectedUser.createdAt).toLocaleString(), color: 'text-gray-300' },
                    { label: 'Mobile Vector', value: selectedUser.phoneNumber || 'NOT_LINKED', color: 'text-gray-300' },
                    { label: 'Verification Status', value: selectedUser.isVerified ? 'ENCRYPTED_SECURE' : 'UNVERIFIED_PENDING', color: selectedUser.isVerified ? 'text-green-400' : 'text-yellow-400' },
                    { label: 'Mailing Vector', value: selectedUser.address || 'VECTOR_UNDEFINED', full: true, color: 'text-gray-300' }
                  ].map((item, i) => (
                    <div key={i} className={`bg-black/40 border border-gray-800 p-8 rounded-[32px] ${item.full ? 'md:col-span-2' : ''}`}>
                      <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] mb-4">{item.label}</p>
                      <p className={`text-lg font-bold ${item.mono ? 'font-mono tracking-tighter' : ''} ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Requirement - (Existing) */}
        {selectedRequirement && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-[40px] p-6 md:p-12 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                <div className="flex items-center gap-8">
                  <div className="w-24 h-24 bg-purple-600/10 border border-purple-500/30 rounded-[32px] flex items-center justify-center">
                    <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div>
                    <span className={`px-4 py-1.5 text-xs font-black rounded-full uppercase tracking-widest border mb-4 inline-block ${statusColors[selectedRequirement.status] || 'border-gray-800 text-gray-500'}`}>
                      {selectedRequirement.status}
                    </span>
                    <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">{selectedRequirement.title}</h2>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-black/40 border border-gray-800 p-10 rounded-[40px]">
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] mb-6">Subject Brief</p>
                    <p className="text-xl font-medium leading-relaxed text-gray-200 italic">"{selectedRequirement.description}"</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800/20 border border-gray-800 p-8 rounded-[32px]">
                      <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Registry Name</p>
                      <p className="text-xl font-black text-white">{selectedRequirement.contactName}</p>
                    </div>
                    <div className="bg-gray-800/20 border border-gray-800 p-8 rounded-[32px]">
                      <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Network Email</p>
                      <p className="text-xl font-bold text-purple-400 lowercase">{selectedRequirement.contactEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-purple-600/10 border border-purple-500/20 p-8 rounded-[40px]">
                    <p className="text-[10px] font-black uppercase text-gray-500 mb-4">Priority Node</p>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                      <span className="text-xl font-black uppercase italic">High Level</span>
                    </div>
                    <p className="text-xs font-bold text-gray-400 mb-8 leading-relaxed">This ticket requires immediate platform intervention or client contact across the network protocols.</p>
                    <button className="w-full py-4 rounded-2xl bg-purple-600 text-white font-black uppercase tracking-widest text-xs hover:bg-purple-500 transition-all shadow-xl shadow-purple-900/40 mb-3">Initiate Contact</button>
                    <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">Close Ticket</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
