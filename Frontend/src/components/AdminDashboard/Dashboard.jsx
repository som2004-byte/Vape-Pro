import React, { useState, useEffect } from 'react';
import { FiUsers, FiPackage, FiDollarSign, FiAlertCircle, FiSearch, FiFilter, FiDownload, FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { BsBoxSeam, BsGraphUp, BsShieldCheck, BsThreeDotsVertical } from 'react-icons/bs';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = ({ adminUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  
  // Mock data for demonstration
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeCarts: 0,
    newSignups: 0,
    lowStockItems: 0,
  });

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showVariantMatrix, setShowVariantMatrix] = useState(false);

  // Load initial data
  useEffect(() => {
    // In a real app, these would be API calls
    const loadData = async () => {
      // Mock data
      setStats({
        totalRevenue: 12890.50,
        activeCarts: 24,
        newSignups: 18,
        lowStockItems: 7,
      });

      setOrders([
        { id: 'ORD-1001', customer: 'John Doe', date: '2023-05-20', total: 129.99, status: 'Processing' },
        { id: 'ORD-1002', customer: 'Jane Smith', date: '2023-05-19', total: 89.99, status: 'Shipped' },
        // Add more mock orders
      ]);

      setProducts([
        { 
          id: 1,
          name: 'Elf Bar 5000',
          sku: 'ELF-5000', 
          price: 24.99, 
          stock: 15, 
          status: 'In Stock',
          variants: [
            { id: 'v1', flavor: 'Mango Ice', strength: '5%', stock: 10 },
            { id: 'v2', flavor: 'Blue Razz', strength: '5%', stock: 5 }
          ]
        },
        // Add more mock products
      ]);

      setCustomers([
        { id: 1, name: 'John Doe', email: 'john@example.com', orders: 5, ltv: 524.95 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', orders: 3, ltv: 269.97 },
        // Add more mock customers
      ]);
    };

    loadData();
  }, []);

  // Chart data
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000, 20000, 28000],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const orderStatusData = {
    labels: ['Pending', 'Processing', 'Shipped', 'Delivered'],
    datasets: [
      {
        data: [12, 8, 15, 20],
        backgroundColor: [
          'rgba(255, 206, 86, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(75, 192, 86, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Handle keyboard shortcuts for command palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      } else if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
              <p className="text-green-500 text-sm">+12.5% from last month</p>
            </div>
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <FiDollarSign size={24} />
            </div>
          </div>
        </div>
        
        {/* Add other KPI cards similarly */}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
          <div className="h-64">
            <Line data={revenueData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Order Status</h3>
          <div className="h-64">
            <Pie data={orderStatusData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                    <button className="text-gray-500 hover:text-gray-700">
                      <BsThreeDotsVertical />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">VapeSmart Admin</h1>
          <p className="text-sm text-gray-400">Welcome back, {adminUser?.name || 'Admin'}</p>
        </div>
        
        <nav className="mt-6">
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Main
          </div>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center w-full px-4 py-3 text-left text-sm font-medium ${
              activeTab === 'dashboard' ? 'bg-indigo-800 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <FiBarChart2 className="mr-3" />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center w-full px-4 py-3 text-left text-sm font-medium ${
              activeTab === 'products' ? 'bg-indigo-800 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <FiPackage className="mr-3" />
            Products
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center w-full px-4 py-3 text-left text-sm font-medium ${
              activeTab === 'orders' ? 'bg-indigo-800 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <FiBox className="mr-3" />
            Orders
          </button>
          
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center w-full px-4 py-3 text-left text-sm font-medium ${
              activeTab === 'customers' ? 'bg-indigo-800 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <FiUsers className="mr-3" />
            Customers
          </button>
          
          <div className="mt-8 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Settings
          </div>
          
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-left text-sm font-medium text-gray-300 hover:bg-gray-800"
          >
            <FiLogOut className="mr-3" />
            Logout
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="pl-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="relative w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search anything... (Ctrl+K)"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onClick={() => setShowCommandPalette(true)}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <span className="sr-only">View notifications</span>
                <span className="relative">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                </span>
              </button>
              
              <div className="relative">
                <button className="flex items-center max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                    {adminUser?.name?.charAt(0) || 'A'}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {adminUser?.name || 'Admin'}
                  </span>
                  <FiChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-6">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'products' && <div>Products Management</div>}
          {activeTab === 'orders' && <div>Orders Management</div>}
          {activeTab === 'customers' && <div>Customers Management</div>}
        </main>
      </div>
      
      {/* Command Palette */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-4 border-0 text-lg focus:ring-0 focus:outline-none"
                placeholder="Search for orders, customers, products..."
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">ESC</span>
              </div>
            </div>
            <div className="border-t border-gray-200 p-2">
              <p className="text-xs text-gray-500 px-3 py-2">Quick Actions</p>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                Create new product
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                View all orders
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                View customer list
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
