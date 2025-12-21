// import React, { useState, useRef, useEffect } from 'react';
// import { MAIN_CATEGORIES, BRANDS, PRICE_RANGES, PUFF_RANGES, getSubCategoriesByBrand } from '../data';

// export default function Navbar({ 
//   user, 
//   onLogout, 
//   currentCategory = 'all', 
//   onCategoryChange, 
//   onFilterChange, 
//   activeFilters = {}, 
//   onNavigate, 
//   cartItemCount, 
//   searchQuery = '', 
//   onSearchChange, 
//   isAdminLoggedIn, 
//   adminUser, 
//   onAdminLogout, 
//   setTempAdminBypass 
// }) {
//   const [activeDropdown, setActiveDropdown] = useState(null);
//   const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
//   const buttonRefs = useRef({});
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   // Update dropdown position when it opens
//   useEffect(() => {
//     if (activeDropdown && buttonRefs.current[activeDropdown]) {
//       const rect = buttonRefs.current[activeDropdown].getBoundingClientRect();
//       setDropdownPosition({ top: rect.bottom + 8, left: rect.left });
//     }
//   }, [activeDropdown]);

//   const scrollToProducts = () => {
//     if (typeof window === 'undefined') return;
//     setTimeout(() => {
//       const el = document.getElementById('products');
//       if (el) {
//         el.scrollIntoView({ behavior: 'smooth' });
//       }
//     }, 200);
//   };

//   const handleBrandFilter = (brand) => {
//     onFilterChange?.({ type: 'brand', value: brand });
//     onFilterChange?.({ type: 'subCategory', value: null });
//     onCategoryChange?.('all');
//     onNavigate?.('home');
//     scrollToProducts();
//     setActiveDropdown(null);
//     setMobileMenuOpen(false);
//   };

//   const handleSubCategoryFilter = (series) => {
//     onFilterChange?.({ type: 'subCategory', value: series });
//     onCategoryChange?.('all');
//     onNavigate?.('home');
//     scrollToProducts();
//     setActiveDropdown(null);
//     setMobileMenuOpen(false);
//   };

//   const handlePriceFilter = (range) => {
//     onFilterChange?.({ type: 'price', value: range });
//     onCategoryChange?.('all');
//     onNavigate?.('home');
//     scrollToProducts();
//     setActiveDropdown(null);
//     setMobileMenuOpen(false);
//   };

//   const handlePuffFilter = (range) => {
//     onFilterChange?.({ type: 'puffs', value: range });
//     onCategoryChange?.('all');
//     onNavigate?.('home');
//     scrollToProducts();
//     setActiveDropdown(null);
//     setMobileMenuOpen(false);
//   };

//   const handleClearFilters = () => {
//     onFilterChange?.({ type: 'clear' });
//     onCategoryChange?.('all');
//     onNavigate?.('home');
//     setActiveDropdown(null);
//     setMobileMenuOpen(false);
//   };

//   const navigationItems = [
//     { key: 'podkits', label: 'PODKITS', isCategory: true },
//     { key: 'most-selling', label: 'MOST SELLING', isCategory: true },
//     { key: 'shop-by-brands', label: 'SHOP BY BRANDS', isCategory: false, type: 'brands' },
//     { key: 'shop-by-price', label: 'SHOP BY PRICE', isCategory: false, type: 'price' },
//     { key: 'disposable', label: 'DISPOSABLE', isCategory: true },
//     { key: 'nic-salts', label: 'NICSALTS', isCategory: true },
//     { key: 'shop-by-puffs', label: 'SHOP BY PUFFS', isCategory: false, type: 'puffs' },
//     { key: 'pods-coils', label: 'PODS & COILS', isCategory: true },
//     { key: 'my-account', label: 'MY ACCOUNT', isCategory: false, type: 'account', options: [
//       { id: 'profile', label: 'Profile' },
//       { id: 'orders', label: 'Orders' },
//       { id: 'addresses', label: 'Addresses' }
//     ] },
//     // Admin section
//     isAdminLoggedIn
//       ? { key: 'admin-dashboard', label: `ADMIN (${adminUser?.username?.toUpperCase() || 'DASHBOARD'})`, isCategory: false, type: 'adminDashboard' }
//       : { key: 'admin-login', label: 'ADMIN LOGIN', isCategory: false, type: 'adminLogin' }
//   ];

//   const renderAdminControls = () => {
//     if (isAdminLoggedIn) {
//       return (
//         <div className="flex items-center space-x-4">
//           <span className="text-sm font-medium text-purple-300">
//             Welcome, {adminUser?.username || 'Admin'}
//           </span>
//           <button
//             onClick={onAdminLogout}
//             className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-md hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
//           >
//             Logout
//           </button>
//         </div>
//       );
//     }
    
//     return (
//       <button
//         onClick={() => onNavigate?.('adminLogin')}
//         className="ml-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-md hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
//       >
//         Admin Login
//       </button>
//     );
//   };

//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           <div className="flex items-center">
//             <button 
//               onClick={() => onNavigate?.(isAdminLoggedIn ? 'adminDashboard' : 'home')} 
//               className="flex-shrink-0 flex items-center"
//             >
//               <img
//                 className="h-8 w-auto"
//                 src="/images/vapesmart-logo.png"
//                 alt="VapeSmart"
//               />
//               <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
//                 VapeSmart {isAdminLoggedIn ? 'Admin' : ''}
//               </span>
//             </button>
//             <div className="font-semibold text-sm text-darkPurple-300">Smart vaping starts here</div>
//           </div>
  
//           <div className="flex-1 max-w-xl mx-2 sm:mx-6">
//             <div className="relative">
//               <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//               <input
//                 type="text"
//                 placeholder="Search products..."
//                 className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-gray-700 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
//                 value={searchQuery}
//                 onChange={(e) => onSearchChange?.(e.target.value)}
//               />
//               {searchQuery && (
//                 <button
//                   onClick={() => onSearchChange?.('')}
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                 >
//                   <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="flex items-center gap-4">
//             {user || isAdminLoggedIn ? (
//               <>
//                 <span className="text-darkPurple-300 text-sm px-3 py-2">
//                   {(user && (user.username || user.email)) || (isAdminLoggedIn && adminUser && adminUser.username)}
//                 </span>
//                 <button 
//                   onClick={isAdminLoggedIn ? onAdminLogout : onLogout}
//                   className="px-4 py-2 rounded bg-darkPurple-900/50 text-white hover:bg-darkPurple-800/50 transition-colors border border-darkPurple-700/50"
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : null}
//             <button 
//               onClick={() => onNavigate('account')}
//               className="p-2 text-darkPurple-400 hover:text-yellowGradient-start transition-colors"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//               </svg>
//             </button>
//             <button 
//               onClick={() => onNavigate('cart')}
//               className="p-2 text-darkPurple-400 hover:text-yellowGradient-start transition-colors relative"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
//               </svg>
//               <span className="absolute top-0 right-0 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
//                 {cartItemCount}
//               </span>
//             </button>
//           <button 
//             onClick={() => setTempAdminBypass(prev => !prev)}
//             className="px-4 py-2 rounded bg-red-600/50 text-white hover:bg-red-500/50 transition-colors border border-red-700/50"
//             title="TOGGLE ADMIN BYPASS (DEV ONLY)"
//           >
//             DEV ADMIN
//           </button>
//         </div>
//       </div>
//     </div>

  
//   {/* Category navigation bar */}
//   <div className="border-t border-darkPurple-900/30 bg-gradient-to-r from-black via-darkPurple-950/50 to-black relative">
//     <div className="container mx-auto px-6 relative" style={{ overflow: 'visible' }}>
//       <div className="flex items-center gap-6 py-0 overflow-x-auto no-scrollbar" style={{ overflowY: 'visible' }}>
//         {navigationItems.map((item) => {
//           const isActive = currentCategory === item.key
              
//               // Render direct navigation for admin links
//               if (item.type === 'adminLogin' || item.type === 'adminDashboard') {
//                 return (
//                   <button
//                     key={item.key}
//                     onClick={() => {
//                       onNavigate?.(item.type)
//                       setActiveDropdown(null)
//                     }}
//                     className={`py-3 px-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 text-yellowGradient-start border-yellowGradient-start`}
//                   >
//                     {item.label}
//                   </button>
//                 )
//               }

//               // Render dropdown filters
//               if (!item.isCategory) {
//                 const isDropdownOpen = activeDropdown === item.type

//                 const isAccount = item.type === 'account'
//                 let options = isAccount ? item.options : item.type === 'brands' ? BRANDS : item.type === 'price' ? PRICE_RANGES : PUFF_RANGES
//                 let handleAction = isAccount
//                   ? (option) => onNavigate('account', option.id)
//                   : item.type === 'brands'
//                     ? handleBrandFilter
//                     : item.type === 'price'
//                       ? handlePriceFilter
//                       : handlePuffFilter
                
//                 return (
//                   <div key={item.key} className="relative" style={{ position: 'relative', zIndex: 3000 }}>
//                     <button
//                       ref={(el) => {
//                         if (el) buttonRefs.current[item.type] = el
//                       }}
//                       onClick={(e) => {
//                         e.stopPropagation()
//                         const rect = buttonRefs.current[item.type]?.getBoundingClientRect()
//                         if (rect && !isDropdownOpen) {
//                           setDropdownPosition({ top: rect.bottom + 8, left: rect.left })
//                         }
//                         setActiveDropdown(isDropdownOpen ? null : item.type)
//                       }}
//                       className={`py-3 px-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
//                         isDropdownOpen
//                           ? 'text-yellowGradient-start border-yellowGradient-start'
//                           : 'text-darkPurple-300 border-transparent hover:text-yellowGradient-start hover:border-darkPurple-600'
//                       }`}
//                     >
//                       {item.label}
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                       </svg>
//                     </button>
//                     {isDropdownOpen && (
//                       <div 
//                         className="fixed bg-gradient-to-b from-darkPurple-950 via-darkPurple-950 to-black border-2 border-darkPurple-700/90 rounded-lg shadow-2xl min-w-[220px] max-h-[unset] overflow-y-auto backdrop-blur-sm"
//                         onClick={(e) => e.stopPropagation()}
//                         style={{ 
//                           backgroundColor: 'rgba(15, 23, 42, 0.98)',
//                           boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(168, 85, 247, 0.3)',
//                           zIndex: 9999,
//                           position: 'fixed',
//                           top: `${dropdownPosition.top}px`,
//                           left: `${dropdownPosition.left}px`
//                         }}
//                       >
//                         {options.map(option => {
//                           const key = typeof option === 'string' ? option : option.id
//                           const label = typeof option === 'string' ? option : option.label
//                           // For account, pass the whole option; for price/puffs pass the object; for brands pass the string.
//                           const value =
//                             item.type === 'account'
//                               ? option
//                               : typeof option === 'string'
//                                 ? option
//                                 : (item.type === 'price' || item.type === 'puffs')
//                                   ? option
//                                   : option.value || option.id
//                           const handleSelect = (e) => {
//                             e.preventDefault()
//                             e.stopPropagation()
//                             handleAction(value)
//                             setActiveDropdown(null)
//                           }
//                           return (
//                             <button
//                               key={key}
//                               type="button"
//                               onClick={handleSelect}
//                               onMouseDown={handleSelect}
//                               className="w-full text-left px-4 py-3 text-sm font-medium text-darkPurple-100 hover:bg-darkPurple-900/80 hover:text-yellowGradient-end transition-all duration-150 first:rounded-t-lg last:rounded-b-lg border-b border-darkPurple-900/40 last:border-b-0 active:bg-darkPurple-800"
//                             >
//                               {label}
//                             </button>
//                           )
//                         })}
//                       </div>
//                     )}
//                   </div>
//                 )
//               }
              
//               // Render category buttons
//               return (
//                 <button
//                   key={item.key}
//                   onClick={() => {
//                     onCategoryChange?.(item.key)
//                     onNavigate?.('home')
//                     setActiveDropdown(null)
//                     onFilterChange?.({ type: 'clear' })
//                     scrollToProducts()
//                   }}
//                   className={`py-3 px-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
//                     isActive
//                       ? 'text-yellow-400 border-yellow-400'
//                       : 'text-darkPurple-300 border-transparent hover:text-yellowGradient-start hover:border-darkPurple-600'
//                   }`}
//                 >
//                   {item.label}
//                 </button>
//               )
//             })}
//           </div>
          
//           {/* Sub-category filter dropdown - appears when a brand is selected */}
//           {activeFilters.brand && (
//             <div className="mt-2 pb-2">
//               <div className="flex items-center gap-4">
//                 <span className="text-darkPurple-400 text-xs font-medium uppercase tracking-wide">
//                   Filter by {activeFilters.brand} Series:
//                 </span>
//                 <div className="relative">
//                   <button
//                     onClick={() => setActiveDropdown(activeDropdown === 'subCategory' ? null : 'subCategory')}
//                     className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-2 ${
//                       activeFilters.subCategory || activeDropdown === 'subCategory'
//                         ? 'bg-darkPurple-900/50 border-yellowGradient-start/50 text-yellowGradient-start'
//                         : 'bg-darkPurple-950/50 border-darkPurple-800/50 text-darkPurple-300 hover:border-darkPurple-600'
//                     }`}
//                   >
//                     {activeFilters.subCategory || 'All Series'}
//                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                     </svg>
//                   </button>
//                 </div>
//                     {activeDropdown === 'subCategory' && (
//                       <div 
//                         className="absolute top-full left-0 mt-2 bg-gradient-to-b from-darkPurple-950 via-darkPurple-950 to-black border-2 border-darkPurple-700/90 rounded-lg shadow-2xl min-w-[220px] max-h-[unset] overflow-y-auto backdrop-blur-sm"
//                         onClick={(e) => e.stopPropagation()}
//                         style={{ 
//                           backgroundColor: 'rgba(15, 23, 42, 0.98)',
//                           boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(168, 85, 247, 0.3)',
//                           zIndex: 3001,
//                           position: 'absolute'
//                         }}
//                       >
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation()
//                           handleSubCategoryFilter(null)
//                         }}
//                         className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-150 first:rounded-t-lg border-b border-darkPurple-900/40 ${
//                           !activeFilters.subCategory
//                             ? 'bg-darkPurple-900/70 text-yellowGradient-start'
//                             : 'text-darkPurple-100 hover:bg-darkPurple-900/80 hover:text-yellowGradient-start'
//                         }`}
//                       >
//                         All Series
//                       </button>
//                       {getSubCategoriesByBrand(activeFilters.brand).map(series => (
//                         <button
//                           key={series}
//                           onClick={(e) => {
//                             e.stopPropagation()
//                             handleSubCategoryFilter(series)
//                           }}
//                           className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-150 last:rounded-b-lg border-b border-darkPurple-900/40 last:border-b-0 active:bg-darkPurple-800 ${
//                             activeFilters.subCategory === series
//                               ? 'bg-darkPurple-900/70 text-yellowGradient-start'
//                               : 'text-darkPurple-100 hover:bg-darkPurple-900/80 hover:text-yellowGradient-start'
//                           }`}
//                         >
//                           {series}
//                         </button>
//                       ))}
//                       </div>
//                     )}
//                 </div>
//                 {activeFilters.subCategory && (
//                   <button
//                     onClick={() => handleSubCategoryFilter(null)}
//                     className="px-2 py-1 text-xs text-darkPurple-400 hover:text-yellowGradient-start transition-colors"
//                   >
//                     Clear
//                   </button>
//                 )}
//               </div>
//           )}
//         </div>
//       </div>
      
//       {/* Click outside to close dropdowns */}
//       {activeDropdown && (
//         <div 
//           className="fixed inset-0" 
//           style={{ zIndex: 2999 }}
//           onClick={() => setActiveDropdown(null)}
//         />
//       )}
//     </nav>
//   );
// }
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

  const handleSubCategoryFilter = (series) => {
    onFilterChange?.({ type: 'subCategory', value: series });
    onCategoryChange?.('all');
    onNavigate?.('home');
    scrollToProducts();
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handlePriceFilter = (range) => {
    onFilterChange?.({ type: 'price', value: range });
    onCategoryChange?.('all');
    onNavigate?.('home');
    scrollToProducts();
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handlePuffFilter = (range) => {
    onFilterChange?.({ type: 'puffs', value: range });
    onCategoryChange?.('all');
    onNavigate?.('home');
    scrollToProducts();
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleClearFilters = () => {
    onFilterChange?.({ type: 'clear' });
    onCategoryChange?.('all');
    onNavigate?.('home');
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const navigationItems = [
    { key: 'podkits', label: 'PODKITS', isCategory: true },
    { key: 'most-selling', label: 'MOST SELLING', isCategory: true },
    { key: 'shop-by-brands', label: 'SHOP BY BRANDS', isCategory: false, type: 'brands' },
    { key: 'shop-by-price', label: 'SHOP BY PRICE', isCategory: false, type: 'price' },
    { key: 'disposable', label: 'DISPOSABLE', isCategory: true },
    { key: 'nic-salts', label: 'NICSALTS', isCategory: true },
    { key: 'shop-by-puffs', label: 'SHOP BY PUFFS', isCategory: false, type: 'puffs' },
    { key: 'pods-coils', label: 'PODS & COILS', isCategory: true },
    { key: 'my-account', label: 'MY ACCOUNT', isCategory: false, type: 'account', options: [
      { id: 'profile', label: 'Profile' },
      { id: 'orders', label: 'Orders' },
      { id: 'addresses', label: 'Addresses' }
    ] },
    // Admin section
    isAdminLoggedIn
      ? { key: 'admin-dashboard', label: `ADMIN (${adminUser?.username?.toUpperCase() || 'DASHBOARD'})`, isCategory: false, type: 'adminDashboard' }
      : { key: 'admin-login', label: 'ADMIN LOGIN', isCategory: false, type: 'adminLogin' }
  ];

  const renderAdminControls = () => {
    if (isAdminLoggedIn) {
      return (
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-purple-300">
            Welcome, {adminUser?.username || 'Admin'}
          </span>
          <button
            onClick={onAdminLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-md hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      );
    }
    
    return (
      <button
        onClick={() => onNavigate?.('adminLogin')}
        className="ml-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-md hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      >
        Admin Login
      </button>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
      {/* Top Bar - Logo, Search, User Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate?.(isAdminLoggedIn ? 'adminDashboard' : 'home')} 
              className="flex-shrink-0 flex items-center"
            >
              <img
                className="h-8 w-auto"
                src="/images/vapesmart-logo.png"
                alt="VapeSmart"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent leading-none">
                  VapeSmart {isAdminLoggedIn ? 'Admin' : ''}
                </span>
                <span className="hidden md:block text-xs font-medium text-darkPurple-300 mt-0.5">
                  Smart vaping starts here
                </span>
              </div>
            </button>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex items-center flex-1 max-w-2xl px-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="block w-full pl-9 pr-8 py-2 bg-gray-800/80 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white focus:text-gray-900 text-sm h-9 transition-colors duration-200"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                aria-label="Search products"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange?.('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user || isAdminLoggedIn ? (
              <div className="hidden sm:flex items-center">
                <span className="text-darkPurple-300 text-sm px-3 py-2 truncate max-w-[120px]">
                  {(user && (user.username || user.email)) || (isAdminLoggedIn && adminUser && adminUser.username)}
                </span>
                <button 
                  onClick={isAdminLoggedIn ? onAdminLogout : onLogout}
                  className="px-3 py-1 text-sm rounded bg-darkPurple-900/50 text-white hover:bg-darkPurple-800/50 transition-colors border border-darkPurple-700/50"
                >
                  Logout
                </button>
              </div>
            ) : null}
            
            <button 
              onClick={() => onNavigate('account')}
              className="p-2 text-darkPurple-400 hover:text-yellowGradient-start transition-colors"
              aria-label="Account"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            
            <button 
              onClick={() => onNavigate('cart')}
              className="p-2 text-darkPurple-400 hover:text-yellowGradient-start transition-colors relative"
              aria-label="Cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white focus:outline-none"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900">
          {/* Mobile Search */}
          <div className="px-3 py-2">
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
            </div>
          </div>

          {/* Mobile User Info */}
          {user || isAdminLoggedIn ? (
            <div className="px-3 py-4 border-t border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-10 w-10 rounded-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.67 0 8.77 2.37 11.17 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">
                    {(user && (user.username || user.email)) || (isAdminLoggedIn && adminUser && adminUser.username)}
                  </div>
                  <div className="text-sm font-medium text-gray-400">
                    {isAdminLoggedIn ? 'Administrator' : 'Customer'}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={() => {
                    if (isAdminLoggedIn) {
                      onAdminLogout?.();
                    } else {
                      onLogout?.();
                    }
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:text-white hover:bg-gray-700 rounded-md"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="px-3 py-4 border-t border-gray-700">
              <button
                onClick={() => {
                  onNavigate?.('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Sign in
              </button>
            </div>
          )}
        </div>
      </div>

  
  {/* Category navigation bar */}
  <div className="border-t border-darkPurple-900/30 bg-gradient-to-r from-black via-darkPurple-950/50 to-black relative">
    <div className="container mx-auto px-6 relative" style={{ overflow: 'visible' }}>
      <div className="flex items-center gap-6 py-0 overflow-x-auto no-scrollbar" style={{ overflowY: 'visible' }}>
        {navigationItems.map((item) => {
          const isActive = currentCategory === item.key
              
              // Render direct navigation for admin links
              if (item.type === 'adminLogin' || item.type === 'adminDashboard') {
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onNavigate?.(item.type)
                      setActiveDropdown(null)
                    }}
                    className={`py-3 px-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 text-yellowGradient-start border-yellowGradient-start`}
                  >
                    {item.label}
                  </button>
                )
              }

              // Render dropdown filters
              if (!item.isCategory) {
                const isDropdownOpen = activeDropdown === item.type

                const isAccount = item.type === 'account'
                let options = isAccount ? item.options : item.type === 'brands' ? BRANDS : item.type === 'price' ? PRICE_RANGES : PUFF_RANGES
                let handleAction = isAccount
                  ? (option) => onNavigate('account', option.id)
                  : item.type === 'brands'
                    ? handleBrandFilter
                    : item.type === 'price'
                      ? handlePriceFilter
                      : handlePuffFilter
                
                return (
                  <div key={item.key} className="relative" style={{ position: 'relative', zIndex: 3000 }}>
                    <button
                      ref={(el) => {
                        if (el) buttonRefs.current[item.type] = el
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        const rect = buttonRefs.current[item.type]?.getBoundingClientRect()
                        if (rect && !isDropdownOpen) {
                          setDropdownPosition({ top: rect.bottom + 8, left: rect.left })
                        }
                        setActiveDropdown(isDropdownOpen ? null : item.type)
                      }}
                      className={`py-3 px-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
                        isDropdownOpen
                          ? 'text-yellowGradient-start border-yellowGradient-start'
                          : 'text-darkPurple-300 border-transparent hover:text-yellowGradient-start hover:border-darkPurple-600'
                      }`}
                    >
                      {item.label}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div 
                        className="fixed bg-gradient-to-b from-darkPurple-950 via-darkPurple-950 to-black border-2 border-darkPurple-700/90 rounded-lg shadow-2xl min-w-[220px] max-h-[unset] overflow-y-auto backdrop-blur-sm"
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.98)',
                          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(168, 85, 247, 0.3)',
                          zIndex: 9999,
                          position: 'fixed',
                          top: `${dropdownPosition.top}px`,
                          left: `${dropdownPosition.left}px`
                        }}
                      >
                        {options.map(option => {
                          const key = typeof option === 'string' ? option : option.id
                          const label = typeof option === 'string' ? option : option.label
                          // For account, pass the whole option; for price/puffs pass the object; for brands pass the string.
                          const value =
                            item.type === 'account'
                              ? option
                              : typeof option === 'string'
                                ? option
                                : (item.type === 'price' || item.type === 'puffs')
                                  ? option
                                  : option.value || option.id
                          const handleSelect = (e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleAction(value)
                            setActiveDropdown(null)
                          }
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={handleSelect}
                              onMouseDown={handleSelect}
                              className="w-full text-left px-4 py-3 text-sm font-medium text-darkPurple-100 hover:bg-darkPurple-900/80 hover:text-yellowGradient-end transition-all duration-150 first:rounded-t-lg last:rounded-b-lg border-b border-darkPurple-900/40 last:border-b-0 active:bg-darkPurple-800"
                            >
                              {label}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }
              
              // Render category buttons
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onCategoryChange?.(item.key)
                    onNavigate?.('home')
                    setActiveDropdown(null)
                    onFilterChange?.({ type: 'clear' })
                    scrollToProducts()
                  }}
                  className={`py-3 px-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? 'text-yellow-400 border-yellow-400'
                      : 'text-darkPurple-300 border-transparent hover:text-yellowGradient-start hover:border-darkPurple-600'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
          
          {/* Sub-category filter dropdown - appears when a brand is selected */}
          {activeFilters.brand && (
            <div className="mt-2 pb-2">
              <div className="flex items-center gap-4">
                <span className="text-darkPurple-400 text-xs font-medium uppercase tracking-wide">
                  Filter by {activeFilters.brand} Series:
                </span>
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === 'subCategory' ? null : 'subCategory')}
                    className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-2 ${
                      activeFilters.subCategory || activeDropdown === 'subCategory'
                        ? 'bg-darkPurple-900/50 border-yellowGradient-start/50 text-yellowGradient-start'
                        : 'bg-darkPurple-950/50 border-darkPurple-800/50 text-darkPurple-300 hover:border-darkPurple-600'
                    }`}
                  >
                    {activeFilters.subCategory || 'All Series'}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                    {activeDropdown === 'subCategory' && (
                      <div 
                        className="absolute top-full left-0 mt-2 bg-gradient-to-b from-darkPurple-950 via-darkPurple-950 to-black border-2 border-darkPurple-700/90 rounded-lg shadow-2xl min-w-[220px] max-h-[unset] overflow-y-auto backdrop-blur-sm"
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.98)',
                          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(168, 85, 247, 0.3)',
                          zIndex: 3001,
                          position: 'absolute'
                        }}
                      >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSubCategoryFilter(null)
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-150 first:rounded-t-lg border-b border-darkPurple-900/40 ${
                          !activeFilters.subCategory
                            ? 'bg-darkPurple-900/70 text-yellowGradient-start'
                            : 'text-darkPurple-100 hover:bg-darkPurple-900/80 hover:text-yellowGradient-start'
                        }`}
                      >
                        All Series
                      </button>
                      {getSubCategoriesByBrand(activeFilters.brand).map(series => (
                        <button
                          key={series}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSubCategoryFilter(series)
                          }}
                          className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-150 last:rounded-b-lg border-b border-darkPurple-900/40 last:border-b-0 active:bg-darkPurple-800 ${
                            activeFilters.subCategory === series
                              ? 'bg-darkPurple-900/70 text-yellowGradient-start'
                              : 'text-darkPurple-100 hover:bg-darkPurple-900/80 hover:text-yellowGradient-start'
                          }`}
                        >
                          {series}
                        </button>
                      ))}
                      </div>
                    )}
                </div>
                {activeFilters.subCategory && (
                  <button
                    onClick={() => handleSubCategoryFilter(null)}
                    className="px-2 py-1 text-xs text-darkPurple-400 hover:text-yellowGradient-start transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
          )}
        </div>
      </div>
      
      {/* Click outside to close dropdowns */}
      {activeDropdown && (
        <div 
          className="fixed inset-0" 
          style={{ zIndex: 2999 }}
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </nav>
  );
}
