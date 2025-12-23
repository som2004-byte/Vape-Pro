import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, FiUsers, FiPackage, FiShoppingBag, FiDollarSign, 
  FiSettings, FiLogOut, FiChevronDown, FiChevronRight, FiGrid,
  FiPieChart, FiTag, FiTruck, FiMessageSquare, FiShield
} from 'react-icons/fi';

const AdminLayout = ({ children, adminUser, onLogout }) => {
  const [expandedMenus, setExpandedMenus] = useState({
    products: false,
    orders: false,
    users: false,
    marketing: false,
    settings: false
  });
  const location = useLocation();

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-darkPurple-800 text-yellow-400' : 'text-gray-300 hover:bg-darkPurple-800 hover:text-white';
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <FiHome className="w-5 h-5" />,
      path: '/admin/dashboard'
    },
    {
      title: 'Products',
      icon: <FiPackage className="w-5 h-5" />,
      path: '/admin/products',
      submenu: [
        { title: 'All Products', path: '/admin/products' },
        { title: 'Add New', path: '/admin/products/new' },
        { title: 'Categories', path: '/admin/products/categories' },
        { title: 'Inventory', path: '/admin/products/inventory' }
      ]
    },
    {
      title: 'Orders',
      icon: <FiShoppingBag className="w-5 h-5" />,
      path: '/admin/orders',
      submenu: [
        { title: 'All Orders', path: '/admin/orders' },
        { title: 'Pending', path: '/admin/orders/pending' },
        { title: 'Processing', path: '/admin/orders/processing' },
        { title: 'Completed', path: '/admin/orders/completed' },
        { title: 'Cancelled', path: '/admin/orders/cancelled' }
      ]
    },
    {
      title: 'Customers',
      icon: <FiUsers className="w-5 h-5" />,
      path: '/admin/customers'
    },
    {
      title: 'Analytics',
      icon: <FiPieChart className="w-5 h-5" />,
      path: '/admin/analytics',
      submenu: [
        { title: 'Sales', path: '/admin/analytics/sales' },
        { title: 'Products', path: '/admin/analytics/products' },
        { title: 'Customers', path: '/admin/analytics/customers' }
      ]
    },
    {
      title: 'Marketing',
      icon: <FiTag className="w-5 h-5" />,
      path: '/admin/marketing',
      submenu: [
        { title: 'Discounts', path: '/admin/marketing/discounts' },
        { title: 'Email Campaigns', path: '/admin/marketing/email' },
        { title: 'Banners', path: '/admin/marketing/banners' }
      ]
    },
    {
      title: 'Settings',
      icon: <FiSettings className="w-5 h-5" />,
      path: '/admin/settings',
      submenu: [
        { title: 'General', path: '/admin/settings/general' },
        { title: 'Payment', path: '/admin/settings/payment' },
        { title: 'Shipping', path: '/admin/settings/shipping' },
        { title: 'Tax', path: '/admin/settings/tax' },
        { title: 'Users & Permissions', path: '/admin/settings/users' }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-darkPurple-900 border-r border-darkPurple-800">
          <div className="flex items-center justify-center h-16 px-4 bg-darkPurple-900 border-b border-darkPurple-800">
            <div className="flex items-center">
              <FiGrid className="h-8 w-8 text-yellow-400" />
              <span className="ml-2 text-xl font-bold text-white">VapeSmart</span>
              <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-darkPurple-900 text-xs font-bold rounded">ADMIN</span>
            </div>
          </div>
          
          {/* User Profile */}
          <div className="px-4 py-6 border-b border-darkPurple-800">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center text-darkPurple-900 font-bold">
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{adminUser?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-400">{adminUser?.email || 'admin@vapesmart.com'}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.title}>
                <Link
                  to={item.path}
                  onClick={() => item.submenu && toggleMenu(item.title.toLowerCase())}
                  className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md ${isActive(item.path)}`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{item.icon}</span>
                    {item.title}
                  </div>
                  {item.submenu && (
                    <span>
                      {expandedMenus[item.title.toLowerCase()] ? 
                        <FiChevronDown className="h-4 w-4" /> : 
                        <FiChevronRight className="h-4 w-4" />
                      }
                    </span>
                  )}
                </Link>
                
                {item.submenu && expandedMenus[item.title.toLowerCase()] && (
                  <div className="mt-1 space-y-1 pl-12">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.title}
                        to={subItem.path}
                        className={`block px-3 py-2 text-xs font-medium rounded-md ${isActive(subItem.path)}`}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            <div className="border-t border-darkPurple-800 mt-4 pt-4">
              <button
                onClick={onLogout}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-md transition-colors"
              >
                <FiLogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center md:hidden">
              <button className="text-gray-500 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              
              <div className="relative">
                <button className="flex items-center max-w-xs rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-darkPurple-900 font-bold">
                    {adminUser?.name?.charAt(0) || 'A'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
