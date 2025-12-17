import React, { useState } from 'react'
import { MAIN_CATEGORIES, BRANDS, PRICE_RANGES, PUFF_RANGES, getSubCategoriesByBrand } from '../data'

export default function Navbar({ user, onLogout, currentCategory = 'all', onCategoryChange, onFilterChange, activeFilters = {}, onNavigate, cartItemCount }){
  const [activeDropdown, setActiveDropdown] = useState(null)

  const handleBrandFilter = (brand) => {
    onFilterChange?.({ type: 'brand', value: brand })
    // Clear sub-category when brand changes
    onFilterChange?.({ type: 'subCategory', value: null })
    // Ensure we show all categories when filtering by brand so results aren't hidden
    onCategoryChange?.('all')
    onNavigate?.('home')
    setActiveDropdown(null) // Close dropdown after filter is applied
  }

  const handleSubCategoryFilter = (series) => {
    onFilterChange?.({ type: 'subCategory', value: series })
    // Keep on 'all' to make sure filtered products are visible
    onCategoryChange?.('all')
    onNavigate?.('home')
    setActiveDropdown(null) // Close dropdown after filter is applied
  }

  const handlePriceFilter = (range) => {
    onFilterChange?.({ type: 'price', value: range })
    onCategoryChange?.('all')
    onNavigate?.('home')
    setActiveDropdown(null) // Close dropdown after filter is applied
  }

  const handlePuffFilter = (range) => {
    onFilterChange?.({ type: 'puffs', value: range })
    onCategoryChange?.('all')
    onNavigate?.('home')
    setActiveDropdown(null) // Close dropdown after filter is applied
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
    { key: 'my-account', label: 'MY ACCOUNT', isCategory: false, type: 'account', options: [
      { id: 'profile', label: 'Profile' },
      { id: 'orders', label: 'Orders' },
      { id: 'addresses', label: 'Addresses' }
    ] }
  ]

  return (
    <header className="sticky top-0 z-[1050] bg-gradient-to-b from-black via-purple-950 to-black border-b border-purple-900/30">
      {/* Top bar with logo and icons */}
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => {
            onCategoryChange?.('all')
            onFilterChange?.({ type: 'clear' })
            onNavigate?.('home')
          }}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img src="/images/vapesmart-logo.png" alt="logo" className="h-20 w-auto object-contain" />
          <div>
            <div className="font-bold text-xl bg-gradient-to-r from-white via-yellow-300 to-white bg-clip-text text-transparent">VapeSmart</div>
            <div className="font-semibold text-sm text-purple-300">Smart vaping starts here</div>
        </div>
        </button>

        <div className="flex-1 max-w-xl mx-6">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              aria-label="Search"
              className="w-full rounded-full py-2 pl-10 pr-4 bg-purple-950/50 border border-purple-800/50 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50"
              placeholder="Search flavour, puffs, brand..." 
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-purple-300 text-sm px-3 py-2">
              {user.username || user.email}
            </span>
          )}
          <button 
            onClick={() => onNavigate('account')}
            className="p-2 text-purple-400 hover:text-yellow-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <button 
            onClick={() => onNavigate('cart')}
            className="p-2 text-purple-400 hover:text-yellow-400 transition-colors relative"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="absolute top-0 right-0 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{cartItemCount}</span>
          </button>
          {user && (
            <button 
              onClick={onLogout}
              className="px-4 py-2 rounded bg-purple-900/50 text-white hover:bg-purple-800/50 transition-colors border border-purple-700/50"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Category navigation bar */}
      <div className="border-t border-purple-900/30 bg-gradient-to-r from-black via-purple-950/50 to-black relative">
        <div className="container mx-auto px-6 relative">
          <nav className="flex items-center gap-6 py-0" style={{ overflowY: 'unset' }}>
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
                      className={`py-3 px-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
                        isDropdownOpen
                          ? 'text-yellow-400 border-yellow-400'
                          : 'text-purple-300 border-transparent hover:text-yellow-400 hover:border-purple-600'
                      }`}
                    >
                      {item.label}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div 
                        className="absolute top-full left-0 mt-2 bg-gradient-to-b from-purple-950 via-purple-950 to-black border-2 border-purple-700/90 rounded-lg shadow-2xl min-w-[220px] z-[1300] max-h-[unset] overflow-y-auto backdrop-blur-sm"
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                          backgroundColor: 'rgba(30, 0, 60, 0.98)',
                          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(168, 85, 247, 0.3)'
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
                              className="w-full text-left px-4 py-3 text-sm font-medium text-purple-100 hover:bg-purple-900/80 hover:text-yellow-300 transition-all duration-150 first:rounded-t-lg last:rounded-b-lg border-b border-purple-900/40 last:border-b-0 active:bg-purple-800"
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
                  }}
                  className={`py-3 px-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? 'text-yellow-400 border-yellow-400'
                      : 'text-purple-300 border-transparent hover:text-yellow-400 hover:border-purple-600'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
          
          {/* Sub-category filter dropdown - appears when a brand is selected */}
          {activeFilters.brand && (
            <div className="mt-2 pb-2">
              <div className="flex items-center gap-4">
                <span className="text-purple-400 text-xs font-medium uppercase tracking-wide">
                  Filter by {activeFilters.brand} Series:
                </span>
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === 'subCategory' ? null : 'subCategory')}
                    className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-2 ${
                      activeFilters.subCategory || activeDropdown === 'subCategory'
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
                        className="absolute top-full left-0 mt-2 bg-gradient-to-b from-purple-950 via-purple-950 to-black border-2 border-purple-700/90 rounded-lg shadow-2xl min-w-[220px] z-[1300] max-h-[unset] overflow-y-auto backdrop-blur-sm"
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
                        className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-150 first:rounded-t-lg border-b border-purple-900/40 ${
                          !activeFilters.subCategory
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
                          className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-150 last:rounded-b-lg border-b border-purple-900/40 last:border-b-0 active:bg-purple-800 ${
                            activeFilters.subCategory === series
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
      
      {/* Click outside to close dropdowns */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-[100]" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </header>
  )
}