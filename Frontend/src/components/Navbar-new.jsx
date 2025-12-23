import React, { useState, useRef, useEffect } from 'react';
import { MAIN_CATEGORIES, BRANDS, PRICE_RANGES, PUFF_RANGES, getSubCategoriesByBrand } from '../data';

export default function Navbar({ 
  user, 
  onLogout, 
  currentCategory = 'all', 
  onCategoryChange, 
  onFilterChange, 
  activeFilters = {}, 
  onNavigate, 
  cartItemCount, 
  searchQuery = '', 
  onSearchChange, 
  isAdmin = false,
  isAdminLoggedIn,
  adminUser,
  onAdminLogout,
  setTempAdminBypass
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Update dropdown position when it opens
  useEffect(() => {
    if (activeDropdown && buttonRefs.current[activeDropdown]) {
      const rect = buttonRefs.current[activeDropdown].getBoundingClientRect();
      setDropdownPosition({ top: rect.bottom + 8, left: rect.left });
    }
  }, [activeDropdown]);

  const scrollToProducts = () => {
    if (typeof window === 'undefined') return;
    setTimeout(() => {
      const el = document.getElementById('products');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  };

  const handleBrandFilter = (brand) => {
    onFilterChange?.({ type: 'brand', value: brand });
    onFilterChange?.({ type: 'subCategory', value: null });
    onCategoryChange?.('all');
    onNavigate?.('home');
    scrollToProducts();
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleSubCategoryFilter = (subCategory) => {
    onFilterChange?.({ type: 'subCategory', value: subCategory });
    onCategoryChange?.('all');
    onNavigate?.('home');
    scrollToProducts();
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handlePriceFilter = (min, max) => {
    onFilterChange?.({ type: 'price', value: { min, max } });
    onCategoryChange?.('all');
    onNavigate?.('home');
    scrollToProducts();
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handlePuffFilter = (min, max) => {
    onFilterChange?.({ type: 'puffs', value: { min, max } });
    onCategoryChange?.('all');
    onNavigate?.('home');
    scrollToProducts();
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleCategoryClick = (category) => {
    onCategoryChange?.(category);
    onFilterChange?.({ type: 'clear' });
    onNavigate?.('home');
    scrollToProducts();
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleShopNow = () => {
    onCategoryChange?.('all');
    onFilterChange?.({ type: 'clear' });
    onNavigate?.('home');
    scrollToProducts();
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleViewFlavours = () => {
    onCategoryChange?.('all');
    onFilterChange?.({ type: 'flavorOnly', value: true });
    onNavigate?.('home');
    scrollToProducts();
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleDropdownClick = (type) => {
    if (activeDropdown === type) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(type);
    }
  };

  // Navigation items configuration
  const navigationItems = [
    {
      name: 'Shop Now',
      href: '#',
      action: handleShopNow
    },
    {
      type: 'brand',
      name: 'Brands',
      items: BRANDS,
      action: handleBrandFilter
    },
    {
      type: 'category',
      name: 'Categories',
      items: MAIN_CATEGORIES,
      action: handleCategoryClick
    },
    {
      type: 'price',
      name: 'Price Range',
      items: PRICE_RANGES,
      action: handlePriceFilter
    },
    {
      type: 'puffs',
      name: 'Puffs',
      items: PUFF_RANGES,
      action: handlePuffFilter
    },
    {
      name: 'View Flavours',
      href: '#',
      action: handleViewFlavours
    },
    // Admin link - Direct access without authentication
    {
      name: isAdmin ? 'Admin Dashboard' : 'Admin Portal',
      href: '#',
      action: () => {
        onNavigate?.('admin');
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate?.(isAdmin ? 'admin' : 'home')} 
              className="flex-shrink-0 flex items-center"
            >
              <img
                className="h-8 w-auto"
                src="/images/vapesmart-logo.png"
                alt="VapeSmart"
              />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                VapeSmart {isAdmin ? 'Admin' : ''}
              </span>
            </button>
            <div className="font-semibold text-sm text-darkPurple-300">Smart vaping starts here</div>
          </div>
  
          <div className="flex-1 max-w-xl mx-2 sm:mx-6">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-gray-700 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange?.('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-darkPurple-300 text-sm px-3 py-2">
                  {user.username || user.email}
                </span>
                <button 
                  onClick={onLogout}
                  className="px-4 py-2 rounded bg-darkPurple-900/50 text-white hover:bg-darkPurple-800/50 transition-colors border border-darkPurple-700/50"
                >
                  Logout
                </button>
              </>
            ) : null}
            <button 
              onClick={() => onNavigate('account')}
              className="p-2 text-darkPurple-400 hover:text-yellowGradient-start transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button 
              onClick={() => onNavigate('cart')}
              className="p-2 text-darkPurple-400 hover:text-yellowGradient-start transition-colors relative"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute top-0 right-0 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            </button>
          </div>
        </div>
      </div>
  
      {/* Category navigation bar */}
      <div className="border-t border-darkPurple-900/30 bg-gradient-to-r from-black via-darkPurple-950/50 to-black relative">
        <div className="container mx-auto px-6 relative" style={{ overflow: 'visible' }}>
          <div className="flex items-center gap-6 py-0 overflow-x-auto no-scrollbar" style={{ overflowY: 'visible' }}>
            {navigationItems.map((item) => {
              const isActive = currentCategory === item.key || (isAdmin && item.name.includes('Admin'));
              
              // Render direct navigation for admin links
              if (item.name.includes('Admin')) {
                return (
                  <button
                    key={item.name}
                    onClick={item.action}
                    className={`py-3 px-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
                      isActive 
                        ? 'text-yellowGradient-start border-yellowGradient-start' 
                        : 'text-gray-400 border-transparent hover:text-gray-300'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {item.name}
                  </button>
                );
              }

              // Render dropdown filters
              if (!item.isCategory && item.type) {
                const isDropdownOpen = activeDropdown === item.type;
                const currentFilterValue = activeFilters[item.type];
                return (
                  <div 
                    key={item.type} 
                    className="relative"
                    style={{ overflow: 'visible' }}
                  >
                    <button
                      ref={el => buttonRefs.current[item.type] = el}
                      onClick={() => handleDropdownClick(item.type)}
                      className={`py-3 px-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
                        isDropdownOpen 
                          ? 'text-yellowGradient-start border-yellowGradient-start' 
                          : 'text-gray-400 border-transparent hover:text-gray-300'
                      }`}
                    >
                      {item.name}
                      {currentFilterValue && (
                        <span className="bg-yellow-400/20 text-yellow-400 text-xs px-1 rounded">
                          {typeof currentFilterValue === 'object' 
                            ? `${currentFilterValue.min}-${currentFilterValue.max}` 
                            : currentFilterValue
                          }
                        </span>
                      )}
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isDropdownOpen ? 'transform rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isDropdownOpen && (
                      <div
                        className="absolute top-full mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50"
                        style={{ 
                          left: dropdownPosition.left,
                          top: dropdownPosition.top
                        }}
                      >
                        <div className="py-2 max-h-96 overflow-y-auto">
                          {item.items.map((filterItem) => (
                            <button
                              key={filterItem.key || filterItem.name}
                              onClick={() => {
                                if (item.type === 'brand') {
                                  handleBrandFilter(filterItem.key);
                                } else if (item.type === 'price') {
                                  handlePriceFilter(filterItem.min, filterItem.max);
                                } else if (item.type === 'puffs') {
                                  handlePuffFilter(filterItem.min, filterItem.max);
                                }
                              }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${
                                activeFilters[item.type] === filterItem.key 
                                  ? 'bg-gray-800 text-yellowGradient-start' 
                                  : 'text-gray-300'
                              }`}
                            >
                              {filterItem.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // Render direct navigation items
              return (
                <button
                  key={item.name}
                  onClick={item.action}
                  className={`py-3 px-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    isActive 
                      ? 'text-yellowGradient-start border-yellowGradient-start' 
                      : 'text-gray-400 border-transparent hover:text-gray-300'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
