import React, { useState, useEffect } from 'react';
import API_BASE_URL_ROOT from '../config';
import { PRODUCTS as USER_PRODUCTS } from '../data';

export default function AdminDashboard({ adminUser, adminToken, onLogout, onNavigateToStore }) {
  const REACT_APP_API_BASE_URL = API_BASE_URL_ROOT;
  const logo = '/images/vapesmart-logo.png';

  // Navigation and view states
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedReferenceUser, setSelectedReferenceUser] = useState(null); // Helper for user details
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stockUpdateValue, setStockUpdateValue] = useState('');
  const [priceUpdateValue, setPriceUpdateValue] = useState('');

  // Creation state
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Data states
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [clientRequirements, setClientRequirements] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRequirements: 0,
    pendingRequirements: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE_URL = `${API_BASE_URL_ROOT}/api/admin`;

  // Fetch data from API
  const fetchData = async (endpoint, setter) => {
    try {
      if (!adminToken) return;
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (response.ok) {
        const data = await response.json();

        // Handle different response structures
        if (endpoint.includes('/orders')) {
          setter(data.orders || (Array.isArray(data) ? data : []));
        } else if (endpoint.includes('/products')) {
          const rawProducts = data.products || (Array.isArray(data) ? data : []);

          const normalize = (s) => (s === null || s === undefined || s === 'null') ? '' : s.toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '');

          const finalProductsMap = new Map();
          const seenNameKeys = new Set();
          const seenSkuKeys = new Set();

          // 1. Process Live Products (Priority)
          rawProducts.forEach(lp => {
            const match = USER_PRODUCTS.find(up =>
              up.id === lp.id || up.id === lp._id || up.id === lp.sku ||
              (normalize(lp.brand) === normalize(up.brand) &&
                normalize(lp.series) === normalize(up.series) &&
                normalize(lp.flavor) === normalize(up.flavor))
            );

            const brand = lp.brand || match?.brand || 'Generic';
            const series = lp.series || match?.series || '';
            let flavor = lp.flavor || match?.flavor || '';
            if (normalize(flavor) === '') flavor = '';

            // Clean Name: Force re-generation if name is missing or contains "null"
            let displayName = lp.name;
            if (!displayName || displayName.toLowerCase().includes('null')) {
              displayName = series ? (flavor ? `${brand} ${series} - ${flavor}` : `${brand} ${series}`) : brand;
            }
            if (displayName.endsWith(' - ')) displayName = displayName.slice(0, -3);

            const item = {
              ...lp,
              name: displayName,
              image: lp.image || (lp.images && lp.images[0]) || (match ? (match.poster || match.cardImage) : ''),
              isDemo: false
            };

            const nameKey = `${normalize(brand)}|${normalize(series)}|${normalize(flavor)}`;
            const skuKey = lp.sku;

            // Strict deduplication: Check both SKU and Name
            if (!seenNameKeys.has(nameKey) && (!skuKey || !seenSkuKeys.has(skuKey))) {
              finalProductsMap.set(skuKey || nameKey, item);
              seenNameKeys.add(nameKey);
              if (skuKey) seenSkuKeys.add(skuKey);
            }
          });

          // 2. Add Missing Demo Products
          USER_PRODUCTS.forEach(up => {
            const nameKey = `${normalize(up.brand)}|${normalize(up.series)}|${normalize(up.flavor)}`;
            const idKey = up.id;

            if (!seenNameKeys.has(nameKey) && !seenSkuKeys.has(idKey)) {
              let displayName = up.series ? (up.flavor ? `${up.brand} ${up.series} - ${up.flavor}` : `${up.brand} ${up.series}`) : up.brand;

              finalProductsMap.set(idKey || nameKey, {
                ...up,
                _id: up.id,
                name: displayName,
                image: up.poster || up.cardImage || '',
                isDemo: true
              });
              seenNameKeys.add(nameKey);
              seenSkuKeys.add(idKey);
            }
          });

          setter(Array.from(finalProductsMap.values()));
        } else if (endpoint.includes('/users')) {
          setter(data.users || (Array.isArray(data) ? data : []));
        } else if (endpoint.includes('/admins')) {
          setter(data || []);
        } else if (endpoint.includes('/client-requirements')) {
          setter(data.requirements || (Array.isArray(data) ? data : []));
        } else {
          setter(data);
        }
      } else {
        if (response.status === 401) {
          console.warn('Session expired or unauthorized. Logging out...');
          onLogout();
          return;
        }
        let msg = `Failed to fetch ${endpoint}`;
        try {
          const errData = await response.json();
          msg = errData?.message || errData?.error || msg;
        } catch (e) {
          // ignore parse errors
        }
        setError(msg);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Failed to fetch ${endpoint}: ${err.message}`);
    } finally {
      setLoading(false);
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
        setStats(data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchData('/users', setUsers);
    fetchData('/client-requirements', setClientRequirements);
    fetchData('/orders', setOrders);
    fetchData('/products?limit=1000', setProducts);
    fetchStats();
  };

  // --- CRUD Operations (Frontend Only / LocalStorage) ---

  const saveProductsToStorage = (updatedProducts) => {
    localStorage.setItem('vapesmart_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
  };

  const handleProductUpdate = async (productId, updates) => {
    try {
      setLoading(true);

      const isMongoId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

      if (!isMongoId(productId)) {
        // This is a Demo Product (local ID). To sync changes across devices, 
        // we must promote it to a real Database product.
        const productToPromote = products.find(p => p.id === productId || p._id === productId);
        if (!productToPromote) return;

        // Find the ORIGINAL full demo object to ensure we have all fields 
        const originalDemoData = USER_PRODUCTS.find(p => p.id === productId) || {};

        const payload = {
          ...originalDemoData, // Use original data as base
          ...productToPromote, // Override with current state
          ...updates,          // Override with specific updates

          // Explicitly ensure required fields for Mongoose Schema
          name: productToPromote.name || originalDemoData.name || `Product ${productId}`,
          description: productToPromote.description || originalDemoData.features || `Premium vape product from ${productToPromote.brand || 'VapeSmart'}`,
          category: (() => {
            const validCategories = ['disposable', 'pod-systems', 'starter-kits', 'mods', 'tanks', 'coils', 'e-liquids', 'accessories'];
            const candidate = (productToPromote.mainCategory || productToPromote.category || originalDemoData.mainCategory || originalDemoData.category || 'disposable').toLowerCase();
            return validCategories.includes(candidate) ? candidate : 'disposable';
          })(),
          brand: productToPromote.brand || originalDemoData.brand || 'Generic',

          price: Number(updates.price || productToPromote.price || originalDemoData.price || 0),
          stock: Number(updates.stock || productToPromote.stock || 0),
          sku: productId // Preserve demo ID as SKU for storefront matching
        };
        // Remove system fields and IDs
        delete payload._id;
        delete payload.id;
        delete payload.createdAt;
        delete payload.updatedAt;
        delete payload.__v;
        delete payload.isDemo; // Remove our local flag

        // Ensure images format is correct
        if (payload.image && !payload.images) {
          payload.images = [payload.image];
        }

        const response = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          const newProduct = data.product || data;
          // Replace the local demo product with the new DB product in state
          setProducts(products.map(p =>
            (p.id === productId || p._id === productId) ? newProduct : p
          ));
          if (selectedProduct && (selectedProduct.id === productId || selectedProduct._id === productId)) {
            setSelectedProduct(newProduct);
          }
          setStockUpdateValue('');
          setPriceUpdateValue('');
          return;
        } else {
          // If promotion failed, don't try to update the non-existent ID
          const errData = await response.json();
          console.error("Promotion failed:", errData);
          throw new Error(errData.error || errData.message || "Failed to promote demo product to database");
        }
      }

      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        const updatedProduct = data.product;

        // Update local state with response from server
        setProducts(products.map(p =>
          (p._id === productId || p.id === productId) ? updatedProduct : p
        ));

        if (selectedProduct && (selectedProduct._id === productId || selectedProduct.id === productId)) {
          setSelectedProduct(updatedProduct);
        }

        setStockUpdateValue('');
        setPriceUpdateValue('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product', error);
      setError('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(newAdminForm)
      });

      if (response.ok) {
        alert('New Admin Created Successfully');
        setIsCreatingAdmin(false);
        setNewAdminForm({ name: '', email: '', password: '' });
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create admin');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.ok) {
        setProducts(products.filter(p => p._id !== productId));
        setSelectedProduct(null); // Close detail view
      } else {
        const err = await response.json();
        setError(err.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Delete product error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const currentOrder = orders.find(o => o._id === orderId);

      // Sanitize order object to prevent backend validation errors
      // 1. Flatten userId if it's an object
      // 2. Remove immutable/system fields
      const payload = { ...currentOrder, status: newStatus };
      if (payload.userId && typeof payload.userId === 'object') {
        payload.userId = payload.userId._id;
      }
      delete payload._id;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.__v;

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const updatedOrder = await response.json();

        // Update local state
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o)); // Use current state status update
        // We might not get full updated order object back exactly as we expect or populated, 
        // but status update is key.
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

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (response.ok) {
        setOrders(orders.filter(o => o._id !== orderId));
        setSelectedOrder(null);
        fetchStats();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete order');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also remove their associated data.')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (response.ok) {
        setUsers(users.filter(u => u._id !== userId));
        setSelectedUser(null);
        fetchStats();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete user');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to remove this administrator?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (response.ok) {
        setAdmins(admins.filter(a => a._id !== adminId));
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete admin');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  // Initial data load and polling
  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Fetch backend data
        if (adminToken) {
          await fetchData('/users', setUsers);
          await fetchData('/admins', setAdmins);
          await fetchData('/client-requirements', setClientRequirements);
          await fetchData('/orders', setOrders);
          await fetchData('/products?limit=1000', setProducts);
          fetchStats();
        } else {
          // Fallback for demo mode if no token
          const initialProducts = USER_PRODUCTS.map(p => ({
            ...p,
            _id: p.id,
            name: `${p.brand} ${p.series} - ${p.flavor}`,
            image: p.poster || p.cardImage || ''
          }));
          setProducts(initialProducts);
        }
      } catch (e) {
        console.error("Error loading initial data", e);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // Poll for new orders only
    const intervalId = setInterval(() => {
      if (adminToken) {
        fetchData('/orders', setOrders);
        fetchData('/products?limit=1000', setProducts);
        fetchStats();
      }
    }, 10000);

    return () => clearInterval(intervalId);
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

  const filteredOrders = Array.isArray(orders) && orders.length > 0 ? orders.filter(order =>
    order && order._id && (
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.userId && order.userId.email && order.userId.email.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  ) : [];

  const usingApiProducts = true; // Always true in this mode to enable editing

  const supplyDepotProducts = products && products.length > 0 ? products : [];

  const filteredProducts = Array.isArray(supplyDepotProducts) ? supplyDepotProducts.filter(prod =>
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

  const [showRevenueStats, setShowRevenueStats] = useState(false);
  const [showPendingStats, setShowPendingStats] = useState(false);

  // Derived Statistics for Revenue View
  const averageOrderValue = stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0';
  const recentTransactions = Array.isArray(orders) ? orders.slice(0, 5) : [];

  // Derived Data for Pending View
  const pendingOrdersList = Array.isArray(orders) ? orders.filter(o => o.status === 'pending' || o.status === 'processing') : [];
  const unverifiedUsers = Array.isArray(users) ? users.filter(u => !u.isVerified) : [];

  const handleStatClick = (type) => {
    setSelectedUser(null);
    setSelectedOrder(null);
    setSelectedRequirement(null);
    setSelectedProduct(null);

    if (type === 'users') setActiveTab('users');
    else if (type === 'orders') setActiveTab('logistics');
    else if (type === 'revenue') setShowRevenueStats(true);
    else if (type === 'pending') setShowPendingStats(true);
  };

  // Close stats views when navigating elsewhere
  useEffect(() => {
    if (activeTab || selectedUser || selectedOrder) {
      setShowRevenueStats(false);
      setShowPendingStats(false);
    }
  }, [activeTab, selectedUser, selectedOrder]);

  if (showRevenueStats) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8">
        <button onClick={() => setShowRevenueStats(false)} className="mb-6 px-4 py-2 bg-gray-800/50 text-gray-300 rounded-xl text-sm font-medium border border-gray-700/50">← Back to Dashboard</button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-green-900/10 border border-green-500/20 p-8 rounded-[32px]">
              <h2 className="text-3xl font-black italic uppercase text-green-400 mb-2">Financial Intelligence</h2>
              <p className="text-gray-400 mb-8">Real-time revenue stream analysis</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">Total Revenue</p>
                  <p className="text-4xl lg:text-5xl font-black text-white truncate">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">Avg. Order Value</p>
                  <p className="text-4xl lg:text-5xl font-black text-green-400 truncate">₹{averageOrderValue}</p>
                </div>
              </div>

              <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-green-500 w-[75%]"></div>
              </div>
              <p className="text-right text-xs text-green-500 font-bold">75% to Monthly Goal</p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-[32px] p-8">
              <h3 className="text-xl font-bold mb-6">Recent Transactions</h3>
              <div className="space-y-4">
                {recentTransactions.map(order => (
                  <div key={order._id} className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">↓</div>
                      <div>
                        <p className="font-bold text-white text-sm">{order.userId?.name || order.userId?.email || 'Guest User'}</p>
                        <p className="text-xs text-gray-500">Order #{order._id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                    <p className="font-mono font-bold text-green-400">+ ₹{order.total}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-[32px]">
              <h3 className="text-lg font-bold mb-4">Performance Metrics</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-gray-400">Conversion Rate</span>
                    <span className="text-white">3.2%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full"><div className="w-[32%] h-full bg-blue-500 rounded-full" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-gray-400">Cart Abandonment</span>
                    <span className="text-white">12%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full"><div className="w-[12%] h-full bg-red-500 rounded-full" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-gray-400">Return Customer Rate</span>
                    <span className="text-white">45%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full"><div className="w-[45%] h-full bg-purple-500 rounded-full" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showPendingStats) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8">
        <button onClick={() => setShowPendingStats(false)} className="mb-6 px-4 py-2 bg-gray-800/50 text-gray-300 rounded-xl text-sm font-medium border border-gray-700/50">← Back to Dashboard</button>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black italic uppercase text-yellow-400 mb-8">Action Center</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div onClick={() => { setShowPendingStats(false); setActiveTab('logistics'); }} className="bg-gray-900/50 border border-gray-800 p-8 rounded-[32px] cursor-pointer hover:border-yellow-500/50 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400 text-2xl">📦</div>
                <span className="text-3xl font-black group-hover:scale-110 transition-transform">{pendingOrdersList.length}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Pending Orders</h3>
              <p className="text-sm text-gray-400">Orders requiring immediate processing and dispatch.</p>
              {pendingOrdersList.slice(0, 3).map(o => (
                <div key={o._id} className="mt-4 p-3 bg-black/40 rounded-lg text-sm border border-gray-800 text-gray-300">
                  #{o._id.slice(-6).toUpperCase()} - ₹{o.total}
                </div>
              ))}
              {pendingOrdersList.length > 3 && <p className="mt-2 text-xs text-center text-gray-500">and {pendingOrdersList.length - 3} more...</p>}
            </div>

            <div onClick={() => { setShowPendingStats(false); setActiveTab('users'); }} className="bg-gray-900/50 border border-gray-800 p-8 rounded-[32px] cursor-pointer hover:border-blue-500/50 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 text-2xl">👥</div>
                <span className="text-3xl font-black group-hover:scale-110 transition-transform">{unverifiedUsers.length}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Unverified Nodes</h3>
              <p className="text-sm text-gray-400">New user registrations awaiting system verification.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Dashboard View ---

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-purple-900/20 to-gray-900 border-b border-gray-800/50 backdrop-blur-xl mb-8 rounded-2xl">
        <div className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <img
                src="/images/vapesmart-logo.png"
                alt="VapeSmart"
                className="h-10 md:h-12 w-auto filter drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]"
              />
              <div>
                <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter text-white uppercase">VapeSmart</h1>
                <p className="text-xs md:text-sm text-gray-400 font-medium">VapeSmart Control Center</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(selectedUser || selectedOrder || selectedProduct || selectedRequirement) && (
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setSelectedOrder(null);
                    setSelectedRequirement(null);
                    setSelectedProduct(null);
                    setIsCreatingProduct(false);
                  }}
                  className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-xl text-sm font-medium transition-all duration-200 border border-purple-500/30 hover:border-purple-400/50"
                >
                  ← Back
                </button>
              )}

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-xl text-sm font-medium transition-all duration-200 border border-purple-500/30 hover:border-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⟳ Refreshing...' : '↻ Refresh'}
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-xl text-sm font-medium transition-all duration-200 border border-red-500/30 hover:border-red-400/50"
              >
                → Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Tabs */}
      {!selectedUser && !selectedRequirement && !selectedOrder && !selectedProduct && (
        <div className="flex flex-wrap gap-3 md:gap-4 mb-8">
          {[
            { id: 'overview', label: 'Command', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { id: 'logistics', label: 'Logistics', icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z' },
            { id: 'inventory', label: 'Supply', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { id: 'users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { id: 'requirements', label: 'Requirements', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-purple-500/50 hover:text-purple-400'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              <span className="hidden md:inline">{tab.label}</span>
              <span className="md:hidden">{tab.label.slice(0, 4)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { id: 'users', label: 'Users', value: stats.totalUsers, icon: '👥', color: 'from-blue-600/20 to-blue-600/10', border: 'border-blue-500/30', textColor: 'text-blue-400' },
          { id: 'orders', label: 'Orders', value: stats.totalOrders, icon: '📦', color: 'from-purple-600/20 to-purple-600/10', border: 'border-purple-500/30', textColor: 'text-purple-400' },
          { id: 'revenue', label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'from-green-600/20 to-green-600/10', border: 'border-green-500/30', textColor: 'text-green-400' },
          { id: 'pending', label: 'Pending', value: stats.pendingOrders, icon: '⏳', color: 'from-yellow-600/20 to-yellow-600/10', border: 'border-yellow-500/30', textColor: 'text-yellow-400' },
        ].map((stat, index) => (
          <button
            key={index}
            onClick={() => handleStatClick(stat.id)}
            className={`relative overflow-hidden bg-gradient-to-br ${stat.color} border ${stat.border} rounded-2xl p-6 backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 text-left w-full`}
          >
            <div className="relative z-10 w-full">
              <div className="flex items-center justify-between mb-3 w-full">
                <span className="text-2xl">{stat.icon}</span>
                <div className="w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
              </div>
              <p className={`text-2xl md:text-3xl font-black ${stat.textColor} mb-1 truncate`}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
          </button>
        ))}
      </div>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-2xl p-6 mb-8 backdrop-blur-sm">
        <h2 className="text-xl md:text-2xl font-black italic text-white mb-2">
          Welcome back, Admin 👋
        </h2>
        <p className="text-gray-300 text-sm md:text-base">
          Manage your VapeSmart store operations from this central dashboard. Monitor orders, track inventory, and oversee customer requirements.
        </p>
      </div>

      {/* Logistics (Orders) Tab */}
      {(() => {
        try {
          if (activeTab !== 'logistics' || selectedOrder) return null;

          return (
            <div className="bg-gray-900/50 border border-gray-800 rounded-[32px] overflow-hidden backdrop-blur-xl">
              <div className="p-4 md:p-6 md:p-8 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase">Logistics Log</h3>
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
                      <th className="px-4 md:px-8 py-3 md:py-5 text-left text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">Order ID</th>
                      <th className="px-4 md:px-8 py-3 md:py-5 text-left text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">Date</th>
                      <th className="hidden md:table-cell px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Customer</th>
                      <th className="px-4 md:px-8 py-3 md:py-5 text-left text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">Total</th>
                      <th className="px-4 md:px-8 py-3 md:py-5 text-right text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {!Array.isArray(filteredOrders) || filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 md:px-8 py-12 md:py-20 text-center text-gray-600 font-black italic text-sm md:text-base">
                          {error ? `Failed to load orders: ${error}` : 'No orders found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => {
                        if (!order || !order._id) return null;
                        return (
                          <tr key={order._id} className="group hover:bg-white/5 transition-all cursor-pointer" onClick={() => setSelectedOrder(order)}>
                            <td className="px-4 md:px-8 py-3 md:py-6 font-mono text-xs md:text-sm text-purple-400">#{order._id.slice(-6).toUpperCase()}</td>
                            <td className="px-4 md:px-8 py-3 md:py-6 text-xs md:text-sm text-gray-400">{new Date(order.createdAt || Date.now()).toLocaleDateString()}</td>
                            <td className="hidden md:table-cell px-8 py-6 text-sm font-bold text-white">{order.userId?.email || 'Guest'}</td>
                            <td className="px-4 md:px-8 py-3 md:py-6 text-xs md:text-sm font-mono text-green-400">₹{(order.total || 0).toFixed(2)}</td>
                            <td className="px-4 md:px-8 py-3 md:py-6 text-right">
                              <span className={`inline-block px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest border ${statusColors[order.status] || statusColors.pending}`}>
                                {order.status || 'pending'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        } catch (sectionError) {
          console.error('Logistics section error:', sectionError);
          return (
            <div className="bg-red-900/20 border border-red-800 rounded-[32px] p-8 text-center">
              <p className="text-red-400 font-black text-lg mb-4">Error loading Logistics Log</p>
              <p className="text-red-600 text-sm">Please refresh the page to try again.</p>
            </div>
          );
        }
      })()}

      {/* Order Details View */}
      {selectedOrder && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-[40px] p-6 md:p-10 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Items */}
              <div className="bg-black/40 border border-gray-800 p-8 rounded-[32px]">
                <h4 className="text-xl font-black italic uppercase mb-6">Cargo Manifest</h4>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, idx) => {
                    // Smart resolve product
                    const resolveProduct = () => {
                      let p = products.find(p => p._id === item.product || p.id === item.product);
                      if (p) return p;

                      if (item.product && typeof item.product === 'object' && item.product._id) {
                        p = products.find(local => local._id === item.product._id || local.id === item.product._id);
                        if (p) return p;
                        return item.product;
                      }

                      // Fallback: Match by Price
                      p = products.find(local => Number(local.price) === Number(item.price));
                      if (p) return p;

                      return null;
                    };

                    const resolved = resolveProduct();
                    const name = resolved?.name || resolved?.title || item.name || 'Unknown Product';
                    const image = resolved?.image || resolved?.poster || resolved?.cardImage;

                    return (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-2xl border border-gray-800 gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden border border-gray-700 flex-shrink-0 relative">
                            {(image || (resolved?.images && resolved.images[0])) ? (
                              <img src={image || resolved.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-bold text-gray-500 text-xs">x{item.quantity}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-white line-clamp-2">{name}</p>
                            <p className="text-xs text-gray-400">Unit Cost: ₹{item.price}</p>
                          </div>
                        </div>
                        <p className="font-mono text-green-400 font-bold flex-shrink-0 text-right">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center">
                  <span className="text-sm font-black uppercase text-gray-500 tracking-widest">Total Value</span>
                  <span className="text-3xl font-black text-green-400">₹{(selectedOrder.total || 0).toFixed(2)}</span>
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
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[10px] font-black uppercase text-purple-400 tracking-widest">Command Actions</p>
                  <div className={`px-4 py-1.5 rounded-lg border ${statusColors[selectedOrder.status] || statusColors.pending} text-[10px] font-black uppercase bg-black/50 shadow-lg`}>
                    {selectedOrder.status}
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleOrderStatusUpdate(selectedOrder._id, 'processing')}
                    disabled={selectedOrder.status === 'processing'}
                    className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${selectedOrder.status === 'processing'
                      ? 'bg-purple-600/20 text-purple-400 cursor-default border border-purple-500/50'
                      : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20'
                      }`}
                  >
                    {selectedOrder.status === 'processing' ? '✓ Currently Processing' : 'Mark Processed'}
                  </button>

                  <button
                    onClick={() => handleOrderStatusUpdate(selectedOrder._id, 'shipped')}
                    disabled={selectedOrder.status === 'shipped'}
                    className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${selectedOrder.status === 'shipped'
                      ? 'bg-blue-600/20 text-blue-400 cursor-default border border-blue-500/50'
                      : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'
                      }`}
                  >
                    {selectedOrder.status === 'shipped' ? '✓ Currently Shipped' : 'Mark Shipped'}
                  </button>

                  <button
                    onClick={() => handleOrderStatusUpdate(selectedOrder._id, 'delivered')}
                    disabled={selectedOrder.status === 'delivered'}
                    className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${selectedOrder.status === 'delivered'
                      ? 'bg-green-600/20 text-green-400 cursor-default border border-green-500/50'
                      : 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/20'
                      }`}
                  >
                    {selectedOrder.status === 'delivered' ? '✓ Currently Delivered' : 'Mark Delivered'}
                  </button>

                  <button
                    onClick={() => handleDeleteOrder(selectedOrder._id)}
                    className="w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white shadow-lg border border-red-500/20"
                  >
                    Delete Order Record
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory/Supply Depot Tab */}
      {activeTab === 'inventory' && !selectedProduct && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-[32px] overflow-hidden backdrop-blur-xl">
          <div className="p-4 md:p-6 md:p-8 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase">Supply Depot (Live Registry)</h3>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">

              <input
                type="text"
                placeholder="Search Supplies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-4 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-sm font-bold focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black/40">
                  <th className="px-2 md:px-8 py-3 md:py-5 text-left text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">Item Name</th>
                  <th className="hidden md:table-cell px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Category</th>
                  <th className="px-2 md:px-8 py-3 md:py-5 text-left text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] md:tracking-[0.3em] whitespace-nowrap">Stock</th>
                  <th className="px-2 md:px-8 py-3 md:py-5 text-left text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] md:tracking-[0.3em] whitespace-nowrap">Price</th>
                  <th className="px-2 md:px-8 py-3 md:py-5 text-right text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] md:tracking-[0.3em] whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 md:px-8 py-12 md:py-20 text-center text-gray-600 font-black italic text-sm md:text-base">
                      No items found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(prod => (
                    <tr key={prod._id} onClick={() => setSelectedProduct(prod)} className="group hover:bg-white/5 transition-all cursor-pointer">
                      <td className="px-2 md:px-8 py-3 md:py-6 font-bold text-sm md:text-base text-white group-hover:text-purple-400 transition-colors">
                        <div className="flex items-center gap-3">
                          {prod.image ? (
                            <img src={prod.image} alt="" className="w-10 h-10 object-contain bg-black rounded-lg border border-gray-800" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-800 rounded-lg animate-pulse" />
                          )}
                          <span>{prod.name}</span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-8 py-6 text-sm text-gray-400 capitalize">{prod.category}</td>
                      <td className="px-2 md:px-8 py-3 md:py-6 whitespace-nowrap">
                        <span className={`font-mono font-bold text-xs md:text-sm ${prod.stock < 10 ? 'text-red-500' : 'text-green-400'}`}>
                          {prod.stock} Units
                        </span>
                      </td>
                      <td className="px-2 md:px-8 py-3 md:py-6 font-mono text-xs md:text-sm text-gray-300 whitespace-nowrap">₹{prod.price}</td>
                      <td className="px-2 md:px-8 py-3 md:py-6 text-right whitespace-nowrap">
                        {prod.stock > 0 ? (
                          <span className="inline-block text-[8px] md:text-xs font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-2 md:px-3 py-1 rounded-full border border-green-500/50 whitespace-nowrap">In Supply</span>
                        ) : (
                          <span className="inline-block text-[8px] md:text-xs font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 md:px-3 py-1 rounded-full border border-red-500/50 animate-pulse whitespace-nowrap">Depleted</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )
      }



      {/* Selected Product (Stock Management) View */}
      {
        selectedProduct && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-[40px] p-6 md:p-12 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Product Info */}
              <div className="lg:w-1/3">
                <div className="w-full aspect-square bg-black border border-gray-800 rounded-[32px] flex items-center justify-center mb-8 relative overflow-hidden group">
                  {(selectedProduct.image || (selectedProduct.images && selectedProduct.images[0])) ? (
                    <img
                      src={selectedProduct.image || selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
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
                    <p className="text-xl font-mono text-green-400 font-bold">₹{selectedProduct.price}</p>
                  </div>
                  <div className="bg-gray-800/30 p-4 rounded-2xl border border-gray-700/30">
                    <p className="text-[10px] uppercase text-gray-500 font-black mb-1">Total Sold</p>
                    <p className="text-xl font-mono text-blue-400 font-bold">--</p>
                  </div>
                </div>
              </div>

              {/* Inventory & Price Control */}
              <div className="lg:w-2/3 space-y-8">
                <div className="bg-black/40 border border-gray-800 p-10 rounded-[40px]">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <p className="text-[10px] font-black uppercase text-purple-400 tracking-[0.4em] mb-2">Inventory  &  Pricing</p>
                      <h3 className="text-xl font-bold text-white">Manage Product Data</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">Current Availability</p>
                      <p className={`text-6xl font-black ${selectedProduct.stock < 10 ? 'text-red-500' : 'text-white'}`}>{selectedProduct.stock}</p>
                    </div>
                  </div>

                  {/* Edit Inputs */}
                  <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500 mb-2 block">New Stock Qty</label>
                      <input
                        type="number"
                        placeholder="Qty..."
                        value={stockUpdateValue}
                        onChange={(e) => setStockUpdateValue(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 text-xl font-bold focus:border-purple-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold uppercase text-gray-500 mb-2 block">New Price ($)</label>
                      <input
                        type="number"
                        placeholder="Price..."
                        value={priceUpdateValue}
                        onChange={(e) => setPriceUpdateValue(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 text-xl font-bold focus:border-purple-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const updates = {};
                      if (stockUpdateValue !== '') updates.stock = Number(stockUpdateValue);
                      if (priceUpdateValue !== '') updates.price = Number(priceUpdateValue);
                      if (Object.keys(updates).length > 0) {
                        handleProductUpdate(selectedProduct._id || selectedProduct.id, updates);
                      }
                    }}
                    disabled={(!stockUpdateValue && !priceUpdateValue)}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-600/20 mb-4"
                  >
                    Update details
                  </button>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => handleProductUpdate(selectedProduct._id || selectedProduct.id, { stock: selectedProduct.stock + 10 })} className="p-4 rounded-2xl bg-gray-900 border border-gray-800 hover:border-green-500/50 hover:bg-green-500/10 transition-all group">
                      <p className="text-green-500 font-black text-lg group-hover:scale-110 transition-transform">+10</p>
                      <p className="text-[10px] font-bold uppercase text-gray-500">Quick Restock</p>
                    </button>
                    <button onClick={() => handleProductUpdate(selectedProduct._id || selectedProduct.id, { stock: selectedProduct.stock + 50 })} className="p-4 rounded-2xl bg-gray-900 border border-gray-800 hover:border-green-500/50 hover:bg-green-500/10 transition-all group">
                      <p className="text-green-500 font-black text-lg group-hover:scale-110 transition-transform">+50</p>
                      <p className="text-[10px] font-bold uppercase text-gray-500">Bulk Restock</p>
                    </button>
                    <button onClick={() => handleProductUpdate(selectedProduct._id || selectedProduct.id, { stock: Math.max(0, selectedProduct.stock - 10) })} className="p-4 rounded-2xl bg-gray-900 border border-gray-800 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all group">
                      <p className="text-yellow-500 font-black text-lg group-hover:scale-110 transition-transform">-10</p>
                      <p className="text-[10px] font-bold uppercase text-gray-500">Reduce</p>
                    </button>
                    <button onClick={() => handleProductUpdate(selectedProduct._id || selectedProduct.id, { stock: 0 })} className="p-4 rounded-2xl bg-gray-900 border border-gray-800 hover:border-red-500/50 hover:bg-red-500/10 transition-all group">
                      <p className="text-red-500 font-black text-lg group-hover:scale-110 transition-transform">ZERO</p>
                      <p className="text-[10px] font-bold uppercase text-gray-500">Deplete</p>
                    </button>
                  </div>
                </div>

                <div className="bg-red-900/10 border border-red-500/20 p-8 rounded-[32px]">
                  <h4 className="text-lg font-black uppercase text-red-400 italic mb-4">Emergency Protocol</h4>
                  <p className="text-sm text-gray-400 mb-6">If product line is discontinued or recalled, initiate immediate takedown from the verified registry.</p>
                  <button
                    onClick={() => handleDeleteProduct(selectedProduct._id)}
                    className="w-full py-4 rounded-xl border border-red-500/30 text-red-400 font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all"
                  >
                    Deactivate Product Node
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Create Admin Modal */}
      {isCreatingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-[32px] p-8 max-w-md w-full relative">
            <button
              onClick={() => setIsCreatingAdmin(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <h3 className="text-2xl font-black italic uppercase mb-2">New Admin Node</h3>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-8">Grant system access privileges</p>

            <form onSubmit={handleCreateAdmin} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">Admin Name</label>
                <input
                  required
                  type="text"
                  value={newAdminForm.name}
                  onChange={e => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white font-bold focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="e.g. System Admin"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">Email Address</label>
                <input
                  required
                  type="email"
                  value={newAdminForm.email}
                  onChange={e => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white font-bold focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="admin@vapepro.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">Secure Password</label>
                <input
                  required
                  type="password"
                  value={newAdminForm.password}
                  onChange={e => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white font-bold focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black uppercase tracking-widest hover:shadow-lg hover:shadow-purple-600/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Initialize Admin'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && !selectedUser && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-[32px] overflow-hidden backdrop-blur-xl">
          <div className="p-6 md:p-8 border-b border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex flex-col gap-2">
                <div>
                  <h3 className="text-3xl font-black italic tracking-tighter uppercase">Registry Management</h3>
                  <p className="text-sm text-gray-500 font-medium">Control and monitor all verified platform operators</p>
                </div>
                <button
                  onClick={() => setIsCreatingAdmin(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-purple-600/20 transition-all w-fit flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  New Admin Node
                </button>
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

          {/* Admin Hierarchy Section */}
          <div className="mt-8">
            <h4 className="text-xl font-black italic uppercase text-gray-500 mb-4 tracking-widest">System Admins ({admins.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {admins.map((admin) => (
                <div key={admin._id} className="bg-black/40 border border-gray-800 rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-lg font-black italic text-white shadow-lg shadow-purple-900/40">
                    {admin.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="font-bold text-white uppercase">{admin.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{admin.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-purple-900/30 border border-purple-500/30 text-[10px] font-black uppercase text-purple-400">
                      Super Admin
                    </span>
                    <button
                      onClick={() => handleDeleteAdmin(admin._id)}
                      className="ml-2 px-2 py-0.5 rounded bg-red-900/30 border border-red-500/30 text-[10px] font-black uppercase text-red-400 hover:bg-red-900/50 transition-colors"
                      title="Remove Admin Access"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
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
      )
      }

      {/* Selected User - (Existing) */}
      {
        selectedUser && (
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
                  <button
                    onClick={() => handleDeleteUser(selectedUser._id)}
                    className="p-4 rounded-2xl bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
        )
      }

      {/* Create Product Modal */}
      {

      }

      {/* Selected Requirement - (Existing) */}
      {
        selectedRequirement && (
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
        )
      }

      {/* Requirements Tab - (Existing) */}
      {
        activeTab === 'requirements' && !selectedRequirement && (
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
        )
      }

    </div >
  );
}
