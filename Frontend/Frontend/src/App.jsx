import React, { useState, useMemo } from 'react'
import Navbar from './components/Navbar'
import LandingHero from './components/LandingHero'
import Hero3D from './components/Hero3D'
import FloatingShowcase from './components/FloatingShowcase'
import ProductGrid from './components/ProductGrid'
import ProductModal from './components/ProductModal'
import LoginSignup from './components/LoginSignup'
import { PRODUCTS, MAIN_CATEGORIES } from './data'
import AccountSection from './components/AccountSection'
import CartPage from './components/CartPage' // Import CartPage

export default function App(){
  const [selected, setSelected] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [currentCategory, setCurrentCategory] = useState('all')
  const [activeFilters, setActiveFilters] = useState({})
  const [currentPage, setCurrentPage] = useState('home') // New state for current page
  const [accountTab, setAccountTab] = useState('profile') // New state for account sub-page
  const [cartItems, setCartItems] = useState([]) // State for cart items

  const handleNavigate = (page, subPage = 'profile') => {
    setCurrentPage(page)
    if (page === 'account') {
      setAccountTab(subPage)
    }
  }

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
  }

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

  const handleAddToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id)
      if (existingItem) {
        return prevItems.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      } else {
        return [...prevItems, { ...product, quantity }]
      }
    })
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
  }

  const handleCheckout = () => {
    alert('Proceeding to checkout! (This is a placeholder action)')
    // In a real application, this would navigate to a checkout page and process the order
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
      products = products.filter(p => p.type && (p.type.includes('Pod') || p.type.includes('Coil')))
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

    return products
  }, [currentCategory, activeFilters])

  const hasActiveFilters = Object.keys(activeFilters).length > 0

  // Determine which products to display based on category and active filters
  const displayProducts = useMemo(() => {
    if (hasActiveFilters) {
      return filteredProducts;
    } else {
      return currentCategory === 'all' ? featuredProducts : filteredProducts;
    }
  }, [currentCategory, activeFilters, featuredProducts, filteredProducts, hasActiveFilters]);
  
  if (!isLoggedIn) {
    return <LoginSignup onLogin={handleLogin} />
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black text-gray-100">
      <Navbar 
        user={user} 
        onLogout={handleLogout}
        currentCategory={currentCategory}
        onCategoryChange={setCurrentCategory}
        onFilterChange={handleFilterChange}
        activeFilters={activeFilters}
        onNavigate={handleNavigate} // Pass onNavigate to Navbar
        cartItems={cartItems} // Pass cartItems to Navbar
      />
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'home' && currentCategory === 'all' && !hasActiveFilters && (
          <>
            <LandingHero />
            {featuredProducts.length > 0 && (
              <div className="mt-12">
                <Hero3D product={featuredProducts[0]} />
              </div>
            )}
            <FloatingShowcase items={floatingItems} />
          </>
        )}
        {currentPage === 'home' && (
          <section id="products" className="mt-12">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-400 to-white bg-clip-text text-transparent">
              {currentCategory === 'all' ? 'Featured Products' : MAIN_CATEGORIES[currentCategory] || 'Products'}
            </h2>
            <ProductGrid 
              products={displayProducts} 
              onOpen={(p)=>setSelected(p)}
              category={currentCategory}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onAddToCart={handleAddToCart} // Pass onAddToCart to ProductGrid
            />
          </section>
        )}
        {currentPage === 'account' && <AccountSection activeTab={accountTab} />}
        {currentPage === 'cart' && (
          <CartPage 
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
            onCheckout={handleCheckout}
          />
        )}
      </main>
      {selected && <ProductModal product={selected} onClose={()=>setSelected(null)} />}
    </div>
  )
}
