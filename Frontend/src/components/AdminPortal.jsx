import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiPackage, 
  FiBox, 
  FiBarChart2, 
  FiSettings, 
  FiLogOut,
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi';
import { BsBoxSeam, BsGraphUp, BsShieldCheck } from 'react-icons/bs';

const AdminPortal = ({ adminUser, onAdminLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    users: true,
    orders: true,
    inventory: true,
  });

  // Mock data - Replace with actual API calls
  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, these would be actual API calls
        setUsers([
          { id: 1, name: 'John Doe', email: 'john@example.com', joinDate: '2023-01-15', orders: 5 },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', joinDate: '2023-02-20', orders: 3 },
        ]);

        setOrders([
          { id: 'ORD-001', customer: 'John Doe', date: '2023-05-15', total: 129.99, status: 'Delivered' },
          { id: 'ORD-002', customer: 'Jane Smith', date: '2023-05-16', total: 89.99, status: 'Shipped' },
          { id: 'ORD-003', customer: 'Mike Johnson', date: '2023-05-17', total: 199.99, status: 'Processing' },
        ]);

        setInventory([
          { id: 1, name: 'Vape Pen X', sku: 'VPX-001', stock: 15, price: 59.99, status: 'In Stock' },
          { id: 2, name: 'E-Liquid - Mango', sku: 'EL-MG-50', stock: 5, price: 14.99, status: 'Low Stock' },
          { id: 3, name: 'Replacement Coils', sku: 'RC-001', stock: 0, price: 9.99, status: 'Out of Stock' },
        ]);

        setStats({
          totalUsers: 42,
          totalOrders: 128,
          totalRevenue: 12543.76,
          lowStockItems: 3,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <FiUsers size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Users</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <FiPackage size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Orders</p>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <BsGraphUp size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
            <FiBox size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Low Stock Items</p>
            <p className="text-2xl font-bold">{stats.lowStockItems}</p>
          </div>
        </div>
      </div>

      <div className="col-span-full bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Users</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
            Add New User
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600">{user.name.charAt(0)}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.joinDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.orders}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Orders</h3>
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Inventory</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
            Add New Product
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.price}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                    item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h4 className="text-gray-600 font-medium mb-2">Sales Overview</h4>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-400">Sales Chart Placeholder</p>
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <h4 className="text-gray-600 font-medium mb-2">Top Products</h4>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="text-sm font-medium">Product {i}</div>
                <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.random() * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 w-10 text-right">
                  {Math.floor(Math.random() * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                {adminUser?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                {adminUser?.username || 'Admin'}
              </span>
            </div>
            <button 
              onClick={onAdminLogout}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <FiLogOut className="mr-1" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md">
          <nav className="mt-5">
            <div className="px-2 space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`${
                  activeTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md`}
              >
                <FiBarChart2 className="mr-3 h-5 w-5" />
                Dashboard
              </button>

              <div>
                <button
                  onClick={() => toggleSection('users')}
                  className={`${
                    expandedSections.users ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                  } group w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50`}
                >
                  <div className="flex items-center">
                    <FiUsers className="mr-3 h-5 w-5" />
                    Users
                  </div>
                  {expandedSections.users ? (
                    <FiChevronDown className="h-4 w-4" />
                  ) : (
                    <FiChevronRight className="h-4 w-4" />
                  )}
                </button>
                {expandedSections.users && (
                  <div className="pl-11 py-1 space-y-1">
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`${
                        activeTab === 'users' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                      } block w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50`}
                    >
                      All Users
                    </button>
                    <button className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
                      User Roles
                    </button>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => toggleSection('orders')}
                  className={`${
                    expandedSections.orders ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                  } group w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50`}
                >
                  <div className="flex items-center">
                    <FiPackage className="mr-3 h-5 w-5" />
                    Orders
                  </div>
                  {expandedSections.orders ? (
                    <FiChevronDown className="h-4 w-4" />
                  ) : (
                    <FiChevronRight className="h-4 w-4" />
                  )}
                </button>
                {expandedSections.orders && (
                  <div className="pl-11 py-1 space-y-1">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`${
                        activeTab === 'orders' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                      } block w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50`}
                    >
                      All Orders
                    </button>
                    <button className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
                      Returns
                    </button>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => toggleSection('inventory')}
                  className={`${
                    expandedSections.inventory ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                  } group w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50`}
                >
                  <div className="flex items-center">
                    <FiBox className="mr-3 h-5 w-5" />
                    Inventory
                  </div>
                  {expandedSections.inventory ? (
                    <FiChevronDown className="h-4 w-4" />
                  ) : (
                    <FiChevronRight className="h-4 w-4" />
                  )}
                </button>
                {expandedSections.inventory && (
                  <div className="pl-11 py-1 space-y-1">
                    <button
                      onClick={() => setActiveTab('inventory')}
                      className={`${
                        activeTab === 'inventory' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                      } block w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50`}
                    >
                      Products
                    </button>
                    <button className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
                      Categories
                    </button>
                    <button className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
                      Stock Alerts
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`${
                  activeTab === 'analytics'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md`}
              >
                <BsGraphUp className="mr-3 h-5 w-5" />
                Analytics
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`${
                  activeTab === 'settings'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md`}
              >
                <FiSettings className="mr-3 h-5 w-5" />
                Settings
              </button>
            </div>
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'orders' && renderOrders()}
              {activeTab === 'inventory' && renderInventory()}
              {activeTab === 'analytics' && renderAnalytics()}
              {activeTab === 'settings' && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
                  <p className="text-gray-600">Settings content will go here.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPortal;
