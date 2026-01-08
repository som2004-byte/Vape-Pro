import React, { useState } from 'react';

export default function Navbar({
  user,
  onLogout,
  onNavigate,
  currentCategory,
  onCategoryChange,
  onFilterChange,
  activeFilters,
  cartItemCount = 0,
  searchQuery,
  onSearchChange,
  isAdminLoggedIn,
  adminUser,
  onAdminLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'podkits', label: 'Pod Kits' },
    { id: 'disposable', label: 'Disposables' },
    { id: 'nic-salts', label: 'E-Liquids' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] bg-black/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <button
              onClick={() => onNavigate?.('home')}
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <img
                  className="h-10 w-auto relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                  src="/images/vapesmart-logo.png"
                  alt="VapeSmart"
                />
              </div>
              <div className="hidden sm:flex flex-col items-start relative z-10">
                <span className="text-2xl font-black bg-gradient-to-r from-white via-purple-400 to-pink-500 bg-clip-text text-transparent leading-none tracking-tighter uppercase italic">
                  VapeMaster {isAdminLoggedIn ? <span className="text-purple-500 not-italic">Pro</span> : ''}
                </span>
                {isAdminLoggedIn && (
                  <span className="text-[9px] uppercase tracking-[0.4em] font-black text-white/30">
                    Platform Console
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Center: Search & Categories (User Mode Only) */}
          {!isAdminLoggedIn && (
            <div className="hidden md:flex flex-1 items-center justify-center max-w-2xl px-8 gap-6">
              {/* Search */}
              <div className="relative w-full max-w-md group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-800 rounded-xl leading-5 bg-gray-900/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-black focus:border-purple-600 focus:ring-1 focus:ring-purple-600 sm:text-sm transition-all"
                  placeholder="Search products, brands, flavors..."
                  value={searchQuery || ''}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
              </div>

              {/* Categories */}
              <div className="flex items-center gap-4">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryChange?.(cat.id)}
                    className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${currentCategory === cat.id ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Right Navigation */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* User Actions */}
            {!isAdminLoggedIn && (
              <>
                {/* Cart */}
                <button
                  onClick={() => onNavigate?.('cart')}
                  className="relative p-2 text-gray-400 hover:text-white transition-colors group"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-purple-600 rounded-full group-hover:bg-purple-500 transition-colors">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* Admin Dashboard Link */}
            {isAdminLoggedIn && (
              <button
                onClick={() => onNavigate?.('adminDashboard')}
                className="hidden sm:block px-4 py-2 rounded-xl bg-purple-600/10 border border-purple-500/30 text-purple-400 text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all"
              >
                Dashboard
              </button>
            )}

            <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />

            {/* Profile / Login */}
            {user || isAdminLoggedIn ? (
              <div className="flex items-center gap-4">
                <div onClick={() => !isAdminLoggedIn && onNavigate?.('account')} className="flex flex-col items-end cursor-pointer group">
                  <span className="text-xs font-black text-white truncate max-w-[100px] uppercase tracking-tighter group-hover:text-purple-400 transition-colors">
                    {(user && (user.username || user.email)) || (isAdminLoggedIn && adminUser && (adminUser.name || 'Admin'))}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isAdminLoggedIn ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`} />
                    <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">
                      {isAdminLoggedIn ? 'Admin' : 'Member'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={isAdminLoggedIn ? onAdminLogout : onLogout}
                  className="hidden sm:block px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-[10px] font-black border border-white/10 hover:bg-white hover:text-black transition-all uppercase tracking-widest"
                >
                  Exit
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate?.('login')}
                  className="px-5 py-2.5 rounded-xl bg-white text-black text-[11px] font-black shadow-lg hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                >
                  Login
                </button>
                {/* Only show Admin Access if NO user is logged in */}
                <button
                  onClick={() => onNavigate?.('adminLogin')}
                  className="hidden md:block text-[9px] font-bold text-gray-600 hover:text-gray-400 uppercase tracking-widest transition-colors"
                >
                  Admin
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-gray-900 border border-white/5 text-gray-400 hover:text-white transition-colors"
              >
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl transition-all">
          <div className="flex flex-col p-6 space-y-6 mt-20">
            {!isAdminLoggedIn && (
              <div className="relative mb-6">
                <input
                  type="text"
                  className="block w-full px-4 py-3 border border-gray-800 rounded-xl bg-gray-900 text-white placeholder-gray-500 focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  placeholder="Search..."
                  value={searchQuery || ''}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
              </div>
            )}

            <button onClick={() => { onNavigate?.('home'); setMobileMenuOpen(false); }} className="text-2xl font-bold text-white">Home</button>

            {!isAdminLoggedIn && (
              <>
                <button onClick={() => { onNavigate?.('cart'); setMobileMenuOpen(false); }} className="text-2xl font-bold text-white flex justify-between">
                  Cart <span className="text-purple-400">{cartItemCount}</span>
                </button>
                <div className="border-t border-gray-800 pt-4">
                  <p className="text-gray-500 uppercase text-xs font-bold tracking-widest mb-4">Categories</p>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { onCategoryChange?.(cat.id); setMobileMenuOpen(false); }}
                      className={`block w-full text-left py-2 text-lg font-medium ${currentCategory === cat.id ? 'text-purple-400' : 'text-gray-300'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {isAdminLoggedIn && (
              <button onClick={() => { onNavigate?.('adminDashboard'); setMobileMenuOpen(false); }} className="text-2xl font-bold text-purple-400">Dashboard</button>
            )}

            {(user || isAdminLoggedIn) && (
              <button onClick={() => { onNavigate?.('account'); setMobileMenuOpen(false); }} className="text-2xl font-bold text-white">Profile</button>
            )}

            <div className="border-t border-gray-800 pt-6 mt-auto">
              {user || isAdminLoggedIn ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    isAdminLoggedIn ? onAdminLogout() : onLogout();
                  }}
                  className="w-full py-4 rounded-xl bg-red-600/20 text-red-500 font-bold uppercase tracking-widest"
                >
                  Log Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { onNavigate?.('login'); setMobileMenuOpen(false); }} className="py-3 rounded-xl bg-white text-black font-bold uppercase tracking-widest">Login</button>
                  <button onClick={() => { onNavigate?.('adminLogin'); setMobileMenuOpen(false); }} className="py-3 rounded-xl bg-gray-800 text-gray-400 font-bold uppercase tracking-widest">Admin</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
