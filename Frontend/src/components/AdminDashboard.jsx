import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ adminUser, adminToken }) {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [clientRequirements, setClientRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [newTransitInfo, setNewTransitInfo] = useState('');

  const API_BASE_URL = 'http://localhost:3000/api/admin';

  const fetchData = async (endpoint, setter) => {
    try {
      setError('');
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch data');
      }
      setter(data);
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      if (activeTab === 'users') fetchData('/users', setUsers);
      if (activeTab === 'orders') fetchData('/orders', setOrders);
      if (activeTab === 'requirements') fetchData('/client-requirements', setClientRequirements);
    }
  }, [adminToken, activeTab]);

  const handleUpdateOrderStatus = async (orderId) => {
    try {
      setError('');
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ orderStatus: newOrderStatus, transitInfo: newTransitInfo }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update order');
      }
      setOrders(prevOrders => prevOrders.map(order => 
        order._id === orderId ? { ...order, orderStatus: newOrderStatus, transitInfo: newTransitInfo, updatedAt: new Date().toISOString() } : order
      ));
      setSelectedOrder(null); // Close modal
      setNewOrderStatus('');
      setNewTransitInfo('');
    } catch (err) {
      console.error('Error updating order:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-yellowGradient-start via-yellowGradient-end to-yellowGradient-start bg-clip-text text-transparent">Admin Dashboard</h1>

      <div className="mb-6 border-b border-darkPurple-700">
        <nav className="flex space-x-4">
          <button 
            className={`py-2 px-4 text-lg font-medium ${
              activeTab === 'users' ? 'text-yellowGradient-start border-b-2 border-yellowGradient-start' : 'text-darkPurple-300 hover:text-yellowGradient-end'
            }`}
            onClick={() => setActiveTab('users')}
          >Users</button>
          <button 
            className={`py-2 px-4 text-lg font-medium ${
              activeTab === 'orders' ? 'text-yellowGradient-start border-b-2 border-yellowGradient-start' : 'text-darkPurple-300 hover:text-yellowGradient-end'
            }`}
            onClick={() => setActiveTab('orders')}
          >Orders</button>
          <button 
            className={`py-2 px-4 text-lg font-medium ${
              activeTab === 'requirements' ? 'text-yellowGradient-start border-b-2 border-yellowGradient-start' : 'text-darkPurple-300 hover:text-yellowGradient-end'
            }`}
            onClick={() => setActiveTab('requirements')}
          >Client Requirements</button>
        </nav>
      </div>

      {loading && <p className="text-yellow-400">Loading...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && !error && (
        <div className="bg-darkPurple-900/50 p-6 rounded-lg shadow-xl border border-darkPurple-700/60">
          {activeTab === 'users' && (
            <div>
              <h2 className="text-3xl font-semibold mb-4 text-white">User Details</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-darkPurple-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-darkPurple-200 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-darkPurple-200 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-darkPurple-200 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-darkPurple-200 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-darkPurple-200 uppercase tracking-wider">Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-darkPurple-800">
                    {users.map(user => (
                      <tr key={user._id} className="hover:bg-darkPurple-800/70">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-darkPurple-100">{user._id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-darkPurple-100">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-darkPurple-100">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-darkPurple-100">{user.phoneNumber || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-darkPurple-100">{user.address || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="text-3xl font-semibold mb-4 text-white">Order Details</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-darkPurple-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-darkPurple-200 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-darkPurple-200 uppercase tracking-wider">User Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-darkPurple-200 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-darkPurple-200 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-darkPurple-200 uppercase tracking-wider">Transit Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-darkPurple-200 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-darkPurple-800">
                    {orders.map(order => (
                      <tr key={order._id} className="hover:bg-darkPurple-800/70">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-darkPurple-100">{order._id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-darkPurple-100">{order.userId?.email || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-darkPurple-100">${order.totalAmount?.toFixed(2) || '0.00'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-darkPurple-100">{order.orderStatus}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-darkPurple-100">{order.transitInfo || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewOrderStatus(order.orderStatus);
                              setNewTransitInfo(order.transitInfo || '');
                            }}
                            className="text-yellowGradient-start hover:text-yellow-300 transition-colors"
                          >Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedOrder && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[5000] p-4">
                  <div className="bg-darkPurple-900 p-8 rounded-lg shadow-purple-glow w-full max-w-lg">
                    <h3 className="text-2xl font-semibold mb-4 text-white">Edit Order {selectedOrder._id}</h3>
                    <div className="mb-4">
                      <label htmlFor="orderStatus" className="block text-sm font-medium text-darkPurple-200">Order Status</label>
                      <select
                        id="orderStatus"
                        className="mt-1 block w-full px-3 py-2 bg-darkPurple-800 border border-darkPurple-600 rounded-md text-gray-100 focus:ring-yellowGradient-start focus:border-yellowGradient-start"
                        value={newOrderStatus}
                        onChange={(e) => setNewOrderStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="transitInfo" className="block text-sm font-medium text-darkPurple-200">Transit Information</label>
                      <textarea
                        id="transitInfo"
                        className="mt-1 block w-full px-3 py-2 bg-darkPurple-800 border border-darkPurple-600 rounded-md text-gray-100 focus:ring-yellowGradient-start focus:border-yellowGradient-start"
                        rows="3"
                        value={newTransitInfo}
                        onChange={(e) => setNewTransitInfo(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="px-4 py-2 rounded bg-darkPurple-700 text-white hover:bg-darkPurple-600 transition-colors"
                      >Cancel</button>
                      <button
                        onClick={() => handleUpdateOrderStatus(selectedOrder._id)}
                        className="px-4 py-2 rounded bg-yellowGradient-start text-darkPurple-950 hover:bg-yellowGradient-end transition-colors"
                      >Save</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requirements' && (
            <div>
              <h2 className="text-3xl font-semibold mb-4 text-white">Client Requirements</h2>
              <div className="space-y-4">
                {clientRequirements.map(req => (
                  <div key={req.id} className="bg-darkPurple-800/70 p-4 rounded-lg border border-darkPurple-700">
                    <h3 className="text-xl font-semibold text-white">{req.title}</h3>
                    <p className="text-darkPurple-200 text-sm mt-1">{req.description}</p>
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-darkPurple-600 text-darkPurple-100">
                      Status: {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

