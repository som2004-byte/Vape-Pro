import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiDollarSign, 
  FiShoppingBag, 
  FiUsers, 
  FiPackage,
  FiTrendingUp,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenue: {
      current: 0,
      change: 0,
      trend: 'up'
    },
    recentOrders: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // const response = await fetch('/api/admin/dashboard');
        // const data = await response.json();
        
        // Mock data for demonstration
        setTimeout(() => {
          setStats({
            totalSales: 1289,
            totalOrders: 524,
            totalCustomers: 243,
            totalProducts: 87,
            revenue: {
              current: 45890.75,
              change: 12.5,
              trend: 'up'
            },
            recentOrders: [
              { id: 'ORD-001', customer: 'John Doe', date: '2023-05-15', amount: 129.99, status: 'Delivered' },
              { id: 'ORD-002', customer: 'Jane Smith', date: '2023-05-14', amount: 89.99, status: 'Shipped' },
              { id: 'ORD-003', customer: 'Mike Johnson', date: '2023-05-14', amount: 199.99, status: 'Processing' },
              { id: 'ORD-004', customer: 'Sarah Williams', date: '2023-05-13', amount: 59.99, status: 'Shipped' },
              { id: 'ORD-005', customer: 'David Brown', date: '2023-05-12', amount: 149.99, status: 'Delivered' }
            ],
            lowStockProducts: [
              { id: 1, name: 'Vape Pen X', sku: 'VPX-001', stock: 2, threshold: 5 },
              { id: 2, name: 'E-Liquid - Mango', sku: 'EL-MG-50', stock: 3, threshold: 10 },
              { id: 3, name: 'Replacement Coils', sku: 'RC-001', stock: 0, threshold: 5 }
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, color, link }) => (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 ${link ? 'cursor-pointer hover:border-yellow-400' : ''}`}>
      {link ? (
        <Link to={link} className="block">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
              {React.cloneElement(icon, { className: `w-6 h-6 ${color}` })}
            </div>
          </div>
        </Link>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
            {React.cloneElement(icon, { className: `w-6 h-6 ${color}` })}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiAlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back, Admin! Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center space-x-3
        ">
          <div className="relative">
            <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md">
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.revenue.current.toLocaleString()}`} 
          icon={<FiDollarSign />} 
          color="text-green-600"
          link="/admin/analytics/sales"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders.toLocaleString()} 
          icon={<FiShoppingBag />} 
          color="text-blue-600"
          link="/admin/orders"
        />
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers.toLocaleString()} 
          icon={<FiUsers />} 
          color="text-purple-600"
          link="/admin/customers"
        />
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts.toLocaleString()} 
          icon={<FiPackage />} 
          color="text-yellow-600"
          link="/admin/products"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Orders</h3>
              <Link to="/admin/orders" className="text-sm font-medium text-yellow-600 hover:text-yellow-500">
                View all
              </Link>
            </div>
          </div>
          <div className="bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link to={`/admin/orders/${order.id}`} className="text-yellow-600 hover:text-yellow-900">
                          {order.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.amount}</td>
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

        {/* Low Stock Products */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Low Stock Products</h3>
              <Link to="/admin/products/inventory" className="text-sm font-medium text-yellow-600 hover:text-yellow-500">
                View all
              </Link>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <ul className="divide-y divide-gray-200">
              {stats.lowStockProducts.map((product) => (
                <li key={product.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                        <FiPackage className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        product.stock === 0 ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                      </p>
                      <p className="text-xs text-gray-500">Threshold: {product.threshold}</p>
                    </div>
                  </div>
                </li>
              ))}
              {stats.lowStockProducts.length === 0 && (
                <li className="py-4 text-center">
                  <p className="text-sm text-gray-500">No low stock products</p>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Revenue Chart (Placeholder) */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Revenue Overview</h3>
          <div className="flex items-center text-sm text-green-600">
            <FiTrendingUp className="mr-1" />
            <span>{stats.revenue.change}% from last month</span>
          </div>
        </div>
        <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center">
          <p className="text-gray-500">Revenue chart will be displayed here</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              {[
                {
                  id: 1,
                  type: 'order',
                  content: 'New order #12345 from John Doe',
                  date: '2h ago',
                  datetime: '2023-05-15T09:00:00',
                  icon: <FiShoppingBag className="h-5 w-5 text-gray-400" />
                },
                {
                  id: 2,
                  type: 'product',
                  content: 'Product "Vape Pen X" was updated',
                  date: '5h ago',
                  datetime: '2023-05-15T06:00:00',
                  icon: <FiPackage className="h-5 w-5 text-blue-500" />
                },
                {
                  id: 3,
                  type: 'customer',
                  content: 'New customer registration: Sarah Williams',
                  date: '1d ago',
                  datetime: '2023-05-14T12:00:00',
                  icon: <FiUsers className="h-5 w-5 text-green-500" />
                },
                {
                  id: 4,
                  type: 'order',
                  content: 'Order #12340 was delivered',
                  date: '1d ago',
                  datetime: '2023-05-14T09:30:00',
                  icon: <FiShoppingBag className="h-5 w-5 text-gray-400" />
                },
                {
                  id: 5,
                  type: 'system',
                  content: 'System update completed',
                  date: '2d ago',
                  datetime: '2023-05-13T03:00:00',
                  icon: <FiClock className="h-5 w-5 text-purple-500" />
                }
              ].map((activityItem, activityItemIdx) => (
                <li key={activityItem.id}>
                  <div className="relative pb-8">
                    {activityItemIdx !== 4 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          activityItem.type === 'order' ? 'bg-yellow-100' : 
                          activityItem.type === 'product' ? 'bg-blue-100' : 
                          activityItem.type === 'customer' ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                          {activityItem.icon}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-800">
                            {activityItem.content}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={activityItem.datetime}>{activityItem.date}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
