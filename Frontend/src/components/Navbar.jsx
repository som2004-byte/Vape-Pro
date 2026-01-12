import React, { useState } from 'react'
import { MAIN_CATEGORIES, BRANDS, PRICE_RANGES, PUFF_RANGES, getSubCategoriesByBrand } from '../data'

export default function Navbar({ user, onLogout, currentCategory = 'all', onCategoryChange, onFilterChange, activeFilters = {}, onNavigate, cartItemCount }) {
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const scrollToProducts = () => {
    if (typeof window === 'undefined') return
    setTimeout(() => {
      const el = document.getElementById('products')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }, 200)
  }

  const handleBrandFilter = (brand) => {
    onFilterChange?.({ type: 'brand', value: brand })
    // Clear sub-category when brand changes
    onFilterChange?.({ type: 'subCategory', value: null })
    // Ensure we show all categories when filtering by brand so results aren't hidden
    onCategoryChange?.('all')
    onNavigate?.('home')
    scrollToProducts()
    setActiveDropdown(null) // Close dropdown after filter is applied
    setIsSidebarOpen(false)
  }

  const handleSubCategoryFilter = (series) => {
    onFilterChange?.({ type: 'subCategory', value: series })
    // Keep on 'all' to make sure filtered products are visible
    onCategoryChange?.('all')
    onNavigate?.('home')
    scrollToProducts()
    setActiveDropdown(null) // Close dropdown after filter is applied
    setIsSidebarOpen(false)
  }

  const handlePriceFilter = (range) => {
    onFilterChange?.({ type: 'price', value: range })
    onCategoryChange?.('all')
    onNavigate?.('home')
    scrollToProducts()
    setActiveDropdown(null) // Close dropdown after filter is applied
    setIsSidebarOpen(false)
  }

  const handlePuffFilter = (range) => {
    onFilterChange?.({ type: 'puffs', value: range })
    onCategoryChange?.('all')
    onNavigate?.('home')
    scrollToProducts()
    setActiveDropdown(null) // Close dropdown after filter is applied
    setIsSidebarOpen(false)
  }

  const navigationItems = [
    { key: 'podkits', label: 'PODKITS', isCategory: true },
    { key: 'most-selling', label: 'MOST SELLING', isCategory: true },
    { key: 'shop-by-brands', label: 'SHOP BY BRANDS', isCategory: false, type: 'brands' },
    { key: 'shop-by-price', label: 'SHOP BY PRICE', isCategory: false, type: 'price' },
    { key: 'disposable', label: 'DISPOSABLE', isCategory: true },
    { key: 'nic-salts', label: 'NICSALTS', isCategory: true },
    { key: 'shop-by-puffs', label: 'SHOP BY PUFFS', isCategory: false, type: 'puffs' },
    { key: 'pods-coils', label: 'PODS & COILS', isCategory: true },
    {
      key: 'my-account', label: 'MY ACCOUNT', isCategory: false, type: 'account', options: [
        { id: 'profile', label: 'Profile' },
        { id: 'orders', label: 'Orders' },
        { id: 'addresses', label: 'Addresses' }
      ]
    }
  ]

  return (
    <header className="sticky top-0 z-[1050] bg-black border-b border-gray-800">
      {/* Top bar with logo and icons */}
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          onClick={() => {
            onCategoryChange?.('all')
            onFilterChange?.({ type: 'clear' })
            onNavigate?.('home')
            scrollToProducts()
          }}
          className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <img src="/images/vapesmart-logo.png" alt="logo" className="h-10 md:h-20 w-auto object-contain" />
          <div className="hidden md:block">
            <div className="font-bold text-xl bg-gradient-to-r from-white via-cyan-300 to-white bg-clip-text text-transparent">VapeSmart</div>
            <div className="font-semibold text-sm text-cyan-300">Smart vaping starts here</div>
          </div>
        </button>

        <div className="hidden md:block flex-1 max-w-xl mx-6">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              aria-label="Search"
              className="w-full rounded-full py-2 pl-10 pr-4 bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50"
              placeholder="Search flavour, puffs, brand..."
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {user && (
            <div className="hidden md:flex items-center gap-4">
              <span className="text-cyan-300 text-sm px-2 font-medium">
                {user.username || user.email}
              </span>
              <button
                onClick={onLogout}
                className="px-4 py-1.5 rounded bg-cyan-900/40 text-white text-sm font-semibold hover:bg-cyan-800/60 transition-colors border border-cyan-700/40"
              >
                Logout
              </button>
            </div>
          )}
          <button
            onClick={() => onNavigate('account')}
            className="p-2 text-cyan-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <button
            onClick={() => onNavigate('cart')}
            className="p-2 text-cyan-400 hover:text-white transition-colors relative"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="absolute top-0 right-0 bg-white text-black text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{cartItemCount}</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar - Visible only on mobile */}
      <div className="md:hidden px-4 py-2 border-t border-gray-800 bg-black/95">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            aria-label="Search"
            className="w-full rounded-2xl py-2 pl-9 pr-4 bg-gray-900/50 border border-gray-700/50 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 focus:border-cyan-400/50"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Desktop Category navigation bar */}
      <div className="hidden lg:block border-t border-gray-800 bg-gradient-to-r from-black via-gray-900 to-black relative">
        <div className="container mx-auto px-6 relative">
          <nav className="flex items-center gap-6 py-0">
            {navigationItems.map((item) => {
              const isActive = currentCategory === item.key

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
                  <div key={item.key} className="relative z-[1200]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveDropdown(isDropdownOpen ? null : item.type)
                      }}
                      className={`py-3 px-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${isDropdownOpen
                        ? 'text-cyan-400 border-cyan-400'
                        : 'text-gray-300 border-transparent hover:text-cyan-400 hover:border-gray-600'
                        }`}
                    >
                      {item.label}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div
                        className="absolute top-full left-0 mt-2 bg-black border-2 border-gray-800 rounded-lg shadow-2xl min-w-[220px] z-[1300] max-h-[70vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          backgroundColor: 'rgba(5, 5, 10, 0.98)',
                          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 200, 255, 0.1)'
                        }}
                      >
                        {options.map(option => {
                          const key = typeof option === 'string' ? option : option.id
                          const label = typeof option === 'string' ? option : option.label
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
                              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-100 hover:bg-gray-800 hover:text-cyan-300 transition-all duration-150 first:rounded-t-lg last:rounded-b-lg border-b border-gray-800 last:border-b-0 active:bg-gray-700"
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
                  className={`py-3 px-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${isActive
                    ? 'text-cyan-400 border-cyan-400'
                    : 'text-gray-300 border-transparent hover:text-cyan-400 hover:border-gray-600'
                    }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Sub-category filter (Desktop) */}
          {activeFilters.brand && (
            <div className="mt-2 pb-2">
              <div className="flex items-center gap-4">
                <span className="text-purple-400 text-xs font-medium uppercase tracking-wide">
                  Filter by {activeFilters.brand} Series:
                </span>
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === 'subCategory' ? null : 'subCategory')}
                    className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-2 ${activeFilters.subCategory || activeDropdown === 'subCategory'
                      ? 'bg-purple-900/50 border-yellow-400/50 text-yellow-400'
                      : 'bg-purple-950/50 border-purple-800/50 text-purple-300 hover:border-purple-600'
                      }`}
                  >
                    {activeFilters.subCategory || 'All Series'}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeDropdown === 'subCategory' && (
                    <div
                      className="absolute top-full left-0 mt-2 bg-gradient-to-b from-purple-950 via-purple-950 to-black border-2 border-purple-700/90 rounded-lg shadow-2xl min-w-[220px] z-[1300] max-h-[70vh] overflow-y-auto backdrop-blur-sm"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        backgroundColor: 'rgba(30, 0, 60, 0.98)',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(168, 85, 247, 0.3)'
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSubCategoryFilter(null)
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-150 first:rounded-t-lg border-b border-purple-900/40 ${!activeFilters.subCategory
                          ? 'bg-purple-900/70 text-yellow-300'
                          : 'text-purple-100 hover:bg-purple-900/80 hover:text-yellow-300'
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
                          className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-150 last:rounded-b-lg border-b border-purple-900/40 last:border-b-0 active:bg-purple-800 ${activeFilters.subCategory === series
                            ? 'bg-purple-900/70 text-yellow-300'
                            : 'text-purple-100 hover:bg-purple-900/80 hover:text-yellow-300'
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
                    className="px-2 py-1 text-xs text-purple-400 hover:text-yellow-400 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar (Drawer) */}
      {isSidebarOpen && (
        <>
          <div className="fixed inset-0 z-[1500] bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="fixed top-0 left-0 h-full w-[80%] max-w-sm bg-gray-900 z-[1600] overflow-y-auto border-r border-gray-800 animate-slide-in-left shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <img src="/images/vapesmart-logo.png" alt="logo" className="h-10 w-auto" />
                  <div>
                    <div className="font-bold text-lg text-white">VapeSmart</div>
                    <div className="text-xs text-cyan-400 font-medium tracking-wider">PREMIUM VAPE SHOP</div>
                  </div>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {user && (
                <div className="mb-6 pb-6 border-b border-gray-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center text-cyan-400 font-bold">
                      {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.username || 'User'}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onLogout()
                      setIsSidebarOpen(false)
                    }}
                    className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}

              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const isActive = currentCategory === item.key
                  if (!item.isCategory) {
                    const isExpanded = activeDropdown === item.type
                    const isAccount = item.type === 'account'
                    let options = isAccount ? item.options : item.type === 'brands' ? BRANDS : item.type === 'price' ? PRICE_RANGES : PUFF_RANGES
                    let handleAction = isAccount
                      ? (option) => onNavigate('account', option.id)
                      : item.type === 'brands' // Direct filter for now in mobile
                        ? handleBrandFilter
                        : item.type === 'price'
                          ? handlePriceFilter
                          : handlePuffFilter

                    return (
                      <div key={item.key} className="space-y-1">
                        <button
                          onClick={() => setActiveDropdown(isExpanded ? null : item.type)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${isExpanded ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800/50'}`}
                        >
                          <span className="font-medium text-sm">{item.label}</span>
                          <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isExpanded && (
                          <div className="pl-4 space-y-1">
                            {options.map(option => {
                              const key = typeof option === 'string' ? option : option.id
                              const label = typeof option === 'string' ? option : option.label
                              const value =
                                item.type === 'account'
                                  ? option
                                  : typeof option === 'string'
                                    ? option
                                    : (item.type === 'price' || item.type === 'puffs')
                                      ? option
                                      : option.value || option.id

                              return (
                                <button
                                  key={key}
                                  onClick={() => {
                                    handleAction(value)
                                    setActiveDropdown(null)
                                    setIsSidebarOpen(false)
                                  }}
                                  className="w-full text-left p-3 text-sm text-gray-400 hover:text-cyan-400 border-l border-gray-800 hover:border-cyan-400 transition-colors"
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

                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        onCategoryChange?.(item.key)
                        onNavigate?.('home')
                        setIsSidebarOpen(false)
                        scrollToProducts()
                      }}
                      className={`w-full flex items-center p-3 rounded-xl transition-colors text-left ${isActive
                        ? 'bg-cyan-900/20 text-cyan-400 font-bold'
                        : 'text-gray-300 hover:bg-gray-800/50'
                        }`}
                    >
                      <span className="text-sm">{item.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Click outside to close dropdowns (Desktop only logic mainly, but safe to keep) */}
      {activeDropdown && !isSidebarOpen && (
        <div
          className="fixed inset-0 z-[100]"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </header>
  )
}
