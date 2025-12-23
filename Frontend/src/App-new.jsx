import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import VapeSmokeEffect from './components/VapeSmokeEffect';
import LandingHero from './components/LandingHero';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import LoginSignup from './components/LoginSignup';
import { PRODUCTS, MAIN_CATEGORIES } from './data';
import AccountSection from './components/AccountSection';
import CartPage from './components/CartPage';
import PaymentPage from './components/PaymentPage';
import AdminDashboard from './components/AdminDashboard';

// Load persisted state from localStorage
const loadPersistedState = () => {
  try {
    const savedUser = localStorage.getItem('vapesmart_user');
    const savedLoginState = localStorage.getItem('vapesmart_isLoggedIn');
    const savedCart = localStorage.getItem('vapesmart_cart');
    const savedOrders = localStorage.getItem('vapesmart_orders');
    const savedProfile = localStorage.getItem('vapesmart_profile');
    
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      isLoggedIn: savedLoginState === 'true',
      cartItems: savedCart ? JSON.parse(savedCart) : [],
      orders: savedOrders ? JSON.parse(savedOrders) : [],
      profile: savedProfile ? JSON.parse(savedProfile) : null,
    };
  } catch (error) {
    console.error('Error loading persisted state:', error);
    return {
      user: null,
      isLoggedIn: false,
      cartItems: [],
      orders: [],
      profile: null,
    };
  }
};

export default function App() {
  const [selected, setSelected] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [activeFilters, setActiveFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [accountTab, setAccountTab] = useState('profile');
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pendingOrder, setPendingOrder] = useState(null);

  // Load persisted state on component mount
  useEffect(() => {
    const persistedState = loadPersistedState();
    setIsLoggedIn(persistedState.isLoggedIn);
    setUser(persistedState.user);
    setCartItems(persistedState.cartItems);
    setOrders(persistedState.orders);
    setCustomerProfile(persistedState.profile);
  }, []);

  // Handle user login
  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('vapesmart_user', JSON.stringify(userData));
    localStorage.setItem('vapesmart_isLoggedIn', 'true');
    setCurrentPage('home');
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('vapesmart_user');
    localStorage.removeItem('vapesmart_isLoggedIn');
    setCurrentPage('home');
    setToast({ type: 'info', message: 'You have been logged out' });
  };

  // Handle adding item to cart
  const handleAddToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      const newItems = existingItem
        ? prevItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          )
        : [...prevItems, { ...product, quantity: 1 }];
      
      localStorage.setItem('vapesmart_cart', JSON.stringify(newItems));
      return newItems;
    });
    setToast({ type: 'success', message: 'Item added to cart!' });
  };

  // Handle updating cart item quantity
  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem('vapesmart_cart', JSON.stringify(newItems));
      return newItems;
    });
  };

  // Handle removing item from cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== productId);
      localStorage.setItem('vapesmart_cart', JSON.stringify(newItems));
      return newItems;
    });
    setToast({ type: 'info', message: 'Item removed from cart' });
  };

  // Handle navigation
  const handleNavigate = (page, subPage = 'profile') => {
    setCurrentPage(page);
    if (page === 'account') {
      setAccountTab(subPage);
    }
  };

  // Clear toast after delay
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
      
      // Apply additional filters if any
      const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
        if (!value) return true;
        return product[key] === value;
      });
      
      return matchesSearch && matchesCategory && matchesFilters;
    });
  }, [searchQuery, currentCategory, activeFilters]);

  // Admin view - Direct access without authentication
  if (currentPage === 'admin' || currentPage === 'adminDashboard') {
    return (
      <div className="relative min-h-screen bg-gradient-to-b from-black via-darkPurple-950/20 to-black text-gray-100 overflow-hidden">
        <VapeSmokeEffect />
        <Navbar
          user={user}
          onLogout={handleLogout}
          isAdmin={true}
          onNavigate={handleNavigate}
        />
        <AdminDashboard />
      </div>
    );
  }

  // Login/Signup view
  if (!isLoggedIn) {
    return <LoginSignup onLogin={handleLogin} />;
  }

  // Main app view
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-darkPurple-950/20 to-black text-gray-100 overflow-hidden">
      <VapeSmokeEffect />
      <Navbar
        user={user}
        onLogout={handleLogout}
        currentCategory={currentCategory}
        onCategoryChange={setCurrentCategory}
        cartItemCount={cartItems.reduce((total, item) => total + (item.quantity || 1), 0)}
        onNavigate={handleNavigate}
        onSearchChange={setSearchQuery}
      />
      
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'home' && (
          <>
            <LandingHero />
            <ProductGrid 
              products={filteredProducts} 
              onProductClick={setSelected}
              currentCategory={currentCategory}
            />
          </>
        )}
        
        {currentPage === 'account' && (
          <AccountSection 
            user={user} 
            profile={customerProfile}
            onUpdateProfile={setCustomerProfile}
          />
        )}
        
        {currentPage === 'cart' && (
          <CartPage 
            cartItems={cartItems}
            onUpdateQuantity={updateCartItemQuantity}
            onRemoveItem={removeFromCart}
            onCheckout={() => setCurrentPage('checkout')}
          />
        )}
        
        {currentPage === 'checkout' && (
          <PaymentPage 
            cartItems={cartItems}
            onPaymentSuccess={() => {
              setCartItems([]);
              localStorage.removeItem('vapesmart_cart');
              setCurrentPage('account');
              setToast({ type: 'success', message: 'Order placed successfully!' });
            }}
          />
        )}
      </main>

      {selected && (
        <ProductModal
          product={selected}
          onClose={() => setSelected(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg ${
          toast.type === 'error' ? 'bg-red-600' : 
          toast.type === 'success' ? 'bg-green-600' : 'bg-blue-600'
        } text-white`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
