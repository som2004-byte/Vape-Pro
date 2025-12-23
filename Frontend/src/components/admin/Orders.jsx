import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock, 
  FiDollarSign, FiSearch, FiFilter, FiChevronDown, FiChevronUp,
  FiPrinter, FiDownload, FiMail, FiEye, FiEdit2
} from 'react-icons/fi';

const statuses = {
  pending: { name: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  processing: { name: 'Processing', color: 'bg-blue-100 text-blue-800' },
  shipped: { name: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  delivered: { name: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { name: 'Cancelled', color: 'bg-red-100 text-red-800' },
  refunded: { name: 'Refunded', color: 'bg-purple-100 text-purple-800' },
};

const paymentStatuses = {
  pending: { name: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  paid: { name: 'Paid', color: 'bg-green-100 text-green-800' },
  refunded: { name: 'Refunded', color: 'bg-purple-100 text-purple-800' },
  failed: { name: 'Failed', color: 'bg-red-100 text-red-800' },
};

const Orders = () => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
    dateRange: 'all',
  });

  // Mock data - Replace with API calls
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          const mockOrders = Array.from({ length: 35 }, (_, i) => ({
            id: `ORD-${1000 + i}`,
            customer: {
              name: ['John Doe', 'Jane Smith', 'Michael Johnson', 'Sarah Williams', 'David Brown'][i % 5],
              email: `customer${i}@example.com`,
            },
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: Object.keys(statuses)[Math.floor(Math.random() * Object.keys(statuses).length)],
            paymentStatus: Object.keys(paymentStatuses)[Math.floor(Math.random() * Object.keys(paymentStatuses).length)],
            total: (Math.random() * 1000 + 20).toFixed(2),
            items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
              id: `ITEM-${1000 + i}-${j}`,
              name: `Vape ${['Starter Kit', 'Pod System', 'Mod', 'Tank', 'E-Liquid'][(i + j) % 5]} ${i + j}`,
              quantity: Math.floor(Math.random() * 3) + 1,
              price: (Math.random() * 100 + 10).toFixed(2),
            })),
            shipping: {
              address: `${Math.floor(Math.random() * 1000) + 100} Main St`,
              city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i % 5],
              state: ['NY', 'CA', 'IL', 'TX', 'AZ'][i % 5],
              zip: `1000${i}`,
              country: 'United States',
            },
            paymentMethod: ['Credit Card', 'PayPal', 'Bank Transfer'][i % 3],
          }));
          setOrders(mockOrders);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter and sort orders
  const getFilteredAndSortedOrders = () => {
    return orders
      .filter(order => {
        // Apply search
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            order.id.toLowerCase().includes(query) ||
            order.customer.name.toLowerCase().includes(query) ||
            order.customer.email.toLowerCase().includes(query) ||
            order.paymentMethod.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .filter(order => {
        // Apply filters
        if (filters.status !== 'all' && order.status !== filters.status) return false;
        if (filters.paymentStatus !== 'all' && order.paymentStatus !== filters.paymentStatus) return false;
        
        // Apply date range filter
        if (filters.dateRange !== 'all') {
          const orderDate = new Date(order.date);
          const today = new Date();
          const diffTime = today - orderDate;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (filters.dateRange === 'today' && diffDays > 0) return false;
          if (filters.dateRange === 'week' && diffDays > 7) return false;
          if (filters.dateRange === 'month' && diffDays > 30) return false;
        }
        
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date (newest first)
  };

  // Pagination
  const filteredOrders = getFilteredAndSortedOrders();
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Toggle order selection
  const toggleOrderSelect = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedOrders.length === currentItems.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentItems.map(order => order.id));
    }
  };

  // Toggle order details
  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Handle status update
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } 
          : order
      )
    );
    // In a real app, you would make an API call here
    console.log(`Updated order ${orderId} status to ${newStatus}`);
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    // In a real app, this would make an API call to apply the action to selected orders
    console.log(`Bulk ${action} for orders:`, selectedOrders);
    alert(`Bulk ${action} action will be applied to ${selectedOrders.length} orders`);
    setSelectedOrders([]);
  };

  // If we're on a nested route, render the outlet
  if (location.pathname !== '/admin/orders') {
    return <Outlet />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage customer orders
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <FiDownload className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Export
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            Create Order
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-yellow-500 focus:border-yellow-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <div>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setCurrentPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              {Object.entries(statuses).map(([key, { name }]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
              value={filters.dateRange}
              onChange={(e) => {
                setFilters({ ...filters, dateRange: e.target.value });
                setCurrentPage(1);
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredOrders.length)}
              </span>{' '}
              of <span className="font-medium">{filteredOrders.length}</span> orders
            </span>
          </div>
          <div className="mt-2 sm:mt-0">
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <FiFilter className="-ml-0.5 mr-2 h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">{selectedOrders.length} orders</span> selected
              </p>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <div className="flex flex-wrap gap-2">
                <select
                  className="block w-full pl-3 pr-10 py-1.5 text-xs border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 rounded-md"
                  onChange={(e) => updateOrderStatus(selectedOrders[0], e.target.value)}
                  value=""
                >
                  <option value="">Update Status</option>
                  {Object.entries(statuses).map(([key, { name }]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleBulkAction('print')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <FiPrinter className="-ml-0.5 mr-1.5 h-4 w-4" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkAction('export')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <FiDownload className="-ml-0.5 mr-1.5 h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {loading ? (
            <li className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
            </li>
          ) : filteredOrders.length > 0 ? (
            currentItems.map((order) => (
              <li key={order.id} className="bg-white">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center
                    ">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-300 rounded"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleOrderSelect(order.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <p className="ml-3 text-sm font-medium text-yellow-600 truncate">
                        {order.id}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ${order.total}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <FiPackage className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <FiDollarSign className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        {order.paymentMethod}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <FiClock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <p>
                        Ordered on <time dateTime={order.date}>{new Date(order.date).toLocaleDateString()}</time>
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statuses[order.status].color}`}>
                        {statuses[order.status].name}
                      </span>
                      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatuses[order.paymentStatus].color}`}>
                        {paymentStatuses[order.paymentStatus].name}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="inline-flex items-center p-1 border border-gray-300 rounded-full shadow-sm text-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        onClick={() => toggleOrderDetails(order.id)}
                      >
                        {expandedOrder === order.id ? (
                          <FiChevronUp className="h-5 w-5" />
                        ) : (
                          <FiChevronDown className="h-5 w-5" />
                        )}
                      </button>
                      <div className="relative inline-block text-left">
                        <div>
                          <button
                            type="button"
                            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            id="options-menu"
                            aria-expanded="true"
                            aria-haspopup="true"
                          >
                            Actions
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order details */}
                {expandedOrder === order.id && (
                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-5 sm:px-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Customer</h4>
                        <p className="mt-1 text-sm text-gray-900">{order.customer.name}</p>
                        <p className="text-sm text-gray-500">{order.customer.email}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Shipping Address</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {order.shipping.address}<br />
                          {order.shipping.city}, {order.shipping.state} {order.shipping.zip}<br />
                          {order.shipping.country}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Order Summary</h4>
                        <div className="mt-1 text-sm text-gray-900">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${(order.total * 0.9).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping:</span>
                            <span>$0.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>${(order.total * 0.1).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-medium mt-1 pt-1 border-t border-gray-200">
                            <span>Total:</span>
                            <span>${order.total}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500">Order Items</h4>
                      <div className="mt-1 overflow-hidden border border-gray-200 rounded-md
                      ">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {order.items.map((item) => (
                              <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  ${item.price}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  ${(item.quantity * item.price).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        <FiPrinter className="-ml-0.5 mr-2 h-4 w-4" />
                        Print Invoice
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        <FiTruck className="-ml-0.5 mr-2 h-4 w-4" />
                        Update Status
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))
          ) : (
            <li className="py-12 text-center">
              <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({
                      status: 'all',
                      paymentStatus: 'all',
                      dateRange: 'all',
                    });
                  }}
                >
                  <FiXCircle className="-ml-1 mr-2 h-5 w-5" />
                  Clear all filters
                </button>
              </div>
            </li>
          )}
        </ul>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredOrders.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredOrders.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">First</span>
                    <FiChevronsLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <FiChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-yellow-50 border-yellow-500 text-yellow-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => paginate(totalPages)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Last</span>
                    <FiChevronsRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
