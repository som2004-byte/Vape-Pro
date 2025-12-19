import React, { useState, useMemo, useEffect } from 'react'
import Navbar from './components/Navbar'
import LandingHero from './components/LandingHero'
import Hero3D from './components/Hero3D'
import ProductGrid from './components/ProductGrid'
import ProductModal from './components/ProductModal'
import LoginSignup from './components/LoginSignup'
import { PRODUCTS, MAIN_CATEGORIES } from './data'
import AccountSection from './components/AccountSection'
import CartPage from './components/CartPage' // Import CartPage
import VapeSmokeEffect from './components/VapeSmokeEffect'

export default function App(){
  const [selected, setSelected] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [currentCategory, setCurrentCategory] = useState('all')
  const [activeFilters, setActiveFilters] = useState({})
  const [currentPage, setCurrentPage] = useState('home') // New state for current page
  const [accountTab, setAccountTab] = useState('profile') // New state for account sub-page
  const [cartItems, setCartItems] = useState([]) // State for cart items
  const [toast, setToast] = useState(null) // Snackbar / toast notification state
  const [customerProfile, setCustomerProfile] = useState(null) // Saved customer details for My Account
  const [orders, setOrders] = useState([]) // Simple in-memory order history

  const handleNavigate = (page, subPage = 'profile') => {
    setCurrentPage(page)
    if (page === 'account') {
      setAccountTab(subPage)
    }
  }

  useEffect(() => {
    if (currentPage === 'home') {
      const productsSection = document.getElementById('products');
      if (productsSection) {
        setTimeout(() => {
          productsSection.scrollIntoView({ behavior: 'smooth' });
        }, 500); // Increased delay to allow rendering and observe scroll
      } else {
        console.log('Products section not found.');
      }
    }
  }, [currentPage]);

  // Get featured products for landing page (limit to 12 best selling items)
  const featuredProducts = useMemo(() => {
    return PRODUCTS.filter(p => p.isBestSelling).slice(0, 3)
  }, [])

  const floatingItems = [
    { src: '/images/elfbar-pineapple.png', title: 'Elfbar BC20000', flavor: 'Pineapple Ice' },
    { src: '/images/elfbar-pineapple-clear.png', title: 'Elfbar BC20000', flavor: 'Pineapple Ice (Clear)' },
    { src: '/images/Screenshot_20250127_143406_Chrome-300x300-removebg-preview.png', title: 'Star Bar', flavor: 'Cosmic Mix' },
    { src: '/images/elfbar-watermelon.png', title: 'Elfbar BC20000', flavor: 'Watermelon Ice' }
  ]
  
  const handleLogin = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
  }
  
  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
    setToast({ type: 'info', message: 'You have been logged out' })
  }

  // Auto-hide toast after a short delay
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  const handleFilterChange = (filter) => {
    if (filter.type === 'clear') {
      setActiveFilters({})
    } else if (filter.value === null) {
      // Remove filter when value is null
      setActiveFilters(prev => {
        const newFilters = { ...prev }
        delete newFilters[filter.type]
        return newFilters
      })
    } else {
      setActiveFilters(prev => ({
        ...prev,
        [filter.type]: filter.value
      }))
    }
  }

  const handleAddToCart = (product, quantity = 1, { redirectToCart = false } = {}) => {
    let previousCart = []
    setCartItems(prevItems => {
      previousCart = prevItems
      const existingItem = prevItems.find(item => item.id === product.id)
      if (existingItem) {
        return prevItems.map(item => 
          item.id === product.id ? { ...item, quantity: (item.quantity || 0) + quantity } : item
        )
      } else {
        return [...prevItems, { ...product, quantity }]
      }
    })

    setToast({
      type: 'success',
      message: `${product.series || product.name || 'Item'} added to cart`,
      actionLabel: 'Undo',
      onAction: () => {
        setCartItems(previousCart)
      }
    })

    if (redirectToCart) {
      setCurrentPage('cart')
    }
  }

  const handleUpdateCartQuantity = (productId, quantity) => {
    setCartItems(prevItems => {
      if (quantity <= 0) {
        return prevItems.filter(item => item.id !== productId)
      }
      return prevItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    })
  }

  const handleRemoveFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId))
    setToast({
      type: 'info',
      message: 'Item removed from cart',
    })
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty.')
      return
    }

    const total = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    )

    const newOrder = {
      id: Date.now(),
      placedAt: new Date().toISOString(),
      items: cartItems,
      total,
    }

    setOrders(prev => [newOrder, ...prev])
    setCartItems([])
    setToast({ type: 'success', message: 'Order placed successfully' })
    setCurrentPage('account')
    setAccountTab('orders')
  }

  // Filter products based on category and active filters
  const filteredProducts = useMemo(() => {
    let products = [...PRODUCTS]

    // Filter by main category
    if (currentCategory === 'all') {
      // Show all products
    } else if (currentCategory === 'most-selling') {
      products = products.filter(p => p.isBestSelling)
    } else if (currentCategory === 'podkits') {
      products = products.filter(p => p.mainCategory === 'podkits')
    } else if (currentCategory === 'disposable') {
      products = products.filter(p => p.mainCategory === 'disposable')
    } else if (currentCategory === 'nic-salts') {
      products = products.filter(p => p.nicotine && p.nicotine.includes('mg'))
    } else if (currentCategory === 'pods-coils') {
      // Pods & Coils: try explicit mainCategory first, then fall back to type text
      products = products.filter(p => {
        if (p.mainCategory === 'pods-coils') return true
        if (!p.type) return false
        const t = p.type.toLowerCase()
        return t.includes('pod') || t.includes('coil')
      })
    }

    // Apply additional filters
    if (activeFilters.brand) {
      products = products.filter(p => p.brand === activeFilters.brand)
    }

    // Filter by sub-category (series) if brand is selected
    if (activeFilters.brand && activeFilters.subCategory) {
      products = products.filter(p => p.series === activeFilters.subCategory)
    }

    if (activeFilters.price) {
      const { min, max } = activeFilters.price
      products = products.filter(p => {
        if (max === Infinity) {
          return p.price >= min
        }
        return p.price >= min && p.price <= max
      })
    }

    if (activeFilters.puffs) {
      const { min, max } = activeFilters.puffs
      products = products.filter(p => {
        if (!p.puffs) return false
        if (max === Infinity) {
          return p.puffs >= min
        }
        return p.puffs >= min && p.puffs <= max
      })
    }

    // Optional: flavour-specific filter (used by View Flavours button)
    if (activeFilters.flavorOnly) {
      products = products.filter(p => !!p.flavor)
    }

    return products
  }, [currentCategory, activeFilters])

  const hasActiveFilters = Object.keys(activeFilters).length > 0

  // Determine which products to display based on category and active filters
  const displayProducts = useMemo(() => {
    // Always base the grid on the filtered list so "Shop Now" truly shows all,
    // and any filters (including flavour) are respected.
    return filteredProducts;
  }, [filteredProducts]);
  
  if (!isLoggedIn) {
    return <LoginSignup onLogin={handleLogin} />
  }
  
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-darkPurple-950/20 to-black text-gray-100 overflow-hidden">
      {/* Site-wide subtle vape smoke background */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-80">
        <VapeSmokeEffect density={40} speed={0.4} opacity={0.35} />
      </div>
      <Navbar 
        user={user} 
        onLogout={handleLogout}
        currentCategory={currentCategory}
        onCategoryChange={setCurrentCategory}
        onFilterChange={handleFilterChange}
        activeFilters={activeFilters}
        onNavigate={handleNavigate} // Pass onNavigate to Navbar
        cartItemCount={cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
      />
      {/* Simple toast notification for cart actions */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] px-4">
          <div className="flex items-center gap-4 bg-neutral-900/95 border border-neutral-700/60 rounded-2xl px-5 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.75)] min-w-[260px] max-w-md">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold
                ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50' :
                  toast.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-400/50' :
                  'bg-sky-500/20 text-sky-300 border border-sky-400/50'}`}
            >
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : 'i'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{toast.message}</p>
              {toast.subTitle && (
                <p className="text-xs text-neutral-400 mt-0.5">{toast.subTitle}</p>
              )}
            </div>
            {toast.actionLabel && toast.onAction && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.()
                  setToast(null)
                }}
                className="text-xs font-semibold text-yellowGradient-end hover:text-yellowGradient-start px-2 py-1 rounded-lg hover:bg-white/5"
              >
                {toast.actionLabel}
              </button>
            )}
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-neutral-500 hover:text-neutral-300 text-xs"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <main className="container mx-auto px-4 py-8 overflow-visible">
        {currentPage === 'home' && (
          <>
            {currentCategory === 'all' && !hasActiveFilters && (
              <LandingHero 
                onNavigate={handleNavigate}
                onCategoryChange={setCurrentCategory}
                onFilterChange={handleFilterChange}
              />
            )}
            {featuredProducts.length > 0 && (
              <div className="mt-12">
                <Hero3D
                  product={featuredProducts[0]}
                  onNavigate={handleNavigate}
                  onCategoryChange={setCurrentCategory}
                  onFilterChange={handleFilterChange}
                  onOpenProduct={(p) => setSelected(p)}
                />
              </div>
            )}
          </>
        )}
        {currentPage === 'home' && (
          <section id="products" className="mt-12">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellowGradient-start via-yellowGradient-end to-yellowGradient-start bg-clip-text text-transparent">
              {currentCategory === 'all' ? 'Featured Products' : MAIN_CATEGORIES[currentCategory] || 'Products'}
            </h2>
            <ProductGrid 
              products={displayProducts} 
              onOpen={(p)=>setSelected(p)}
              category={currentCategory}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onAddToCart={(product) => handleAddToCart(product, 1, { redirectToCart: false })} // Add to cart but stay on page
            />
          </section>
        )}
        {currentPage === 'account' && (
          <AccountSection
            activeTab={accountTab}
            profile={customerProfile}
            onSaveProfile={(saved) => {
              setCustomerProfile(saved)
              setToast({
                type: 'success',
                message: customerProfile ? 'Profile updated successfully' : 'Profile added successfully',
              })
            }}
            orders={orders}
            onNotify={(payload) => {
              if (!payload) return
              setToast({
                type: payload.type || 'info',
                message: payload.message || '',
                subTitle: payload.subTitle,
              })
            }}
          />
        )}
        {currentPage === 'cart' && (
          <CartPage 
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
            onCheckout={handleCheckout}
          />
        )}
      </main>
      {selected && (
        <ProductModal
          product={selected}
          onClose={() => setSelected(null)}
          onAddToCart={(product) => handleAddToCart(product, 1, { redirectToCart: false })}
          onBuyNow={(p) => {
            handleAddToCart(p, 1, { redirectToCart: true })
          }}
        />
      )}
    </div>
  )
}
