import React, { useState, useEffect, useMemo } from 'react';
import { API_ENDPOINTS, apiCall, getAuthHeaders } from './utils/apiConfig';
import Navbar from './components/Navbar.jsx';
import VapeSmokeEffect from './components/VapeSmokeEffect';
import LandingHero from './components/LandingHero';
import Hero3D from './components/Hero3D.jsx';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import LoginSignup from './components/LoginSignup';
import { PRODUCTS, MAIN_CATEGORIES } from './data.js';
import AccountSection from './components/AccountSection';
import CartPage from './components/CartPage';
import PaymentPage from './components/PaymentPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard.jsx';

const loadPersistedState = () => {
  try {
    const savedUser = localStorage.getItem('vapesmart_user');
    const savedLoginState = localStorage.getItem('vapesmart_isLoggedIn');
    const savedCart = localStorage.getItem('vapesmart_cart');
    const savedOrders = localStorage.getItem('vapesmart_orders');
    const savedProfile = localStorage.getItem('vapesmart_profile');
    const savedAdminUser = localStorage.getItem('vapesmart_adminUser');
    const isAdmin = localStorage.getItem('vapesmart_isAdmin') === 'true';

    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      isLoggedIn: savedLoginState === 'true',
      isAdminLoggedIn: isAdmin,
      adminUser: isAdmin && savedAdminUser ? JSON.parse(savedAdminUser) : null,
      adminToken: localStorage.getItem('vapesmart_adminToken'),
      cartItems: savedCart ? JSON.parse(savedCart) : [],
      orders: savedOrders ? JSON.parse(savedOrders) : [],
      profile: savedProfile ? JSON.parse(savedProfile) : null,
    };
  } catch (error) {
    console.error('Error loading persisted state:', error);
    return {
      user: null,
      isLoggedIn: false,
      isAdminLoggedIn: false,
      adminUser: null,
      adminToken: null,
      cartItems: [],
      orders: [],
      profile: null,
    };
  }
};

export default function App() {
  const persistedState = loadPersistedState();

  const [selected, setSelected] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(persistedState.isLoggedIn);
  const [user, setUser] = useState(persistedState.user);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(persistedState.isAdminLoggedIn);
  const [adminUser, setAdminUser] = useState(persistedState.adminUser);
  const [adminToken, setAdminToken] = useState(persistedState.adminToken);

  const [currentCategory, setCurrentCategory] = useState('all');
  const [activeFilters, setActiveFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(persistedState.isAdminLoggedIn ? 'adminDashboard' : 'home');
  const [accountTab, setAccountTab] = useState('profile');
  const [cartItems, setCartItems] = useState(persistedState.cartItems);
  const [toast, setToast] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(persistedState.profile);
  const [orders, setOrders] = useState(persistedState.orders);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [backendProducts, setBackendProducts] = useState(PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Dynamic product merging logic for Storefront
  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const data = await apiCall(API_ENDPOINTS.PRODUCTS.ALL);
      if (Array.isArray(data)) {
        const normalize = (s) => (s || '').toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '');

        const matchedBackendIds = new Set();
        const finalProductsMap = new Map();

        // 1. Process Static Products first (The "Anchor" items)
        PRODUCTS.forEach(staticProduct => {
          const staticNormKey = `${normalize(staticProduct.brand)}|${normalize(staticProduct.series)}|${normalize(staticProduct.flavor)}`;

          // Find best backend match using SKU or fuzzy name
          const matchingBackendProducts = data.filter(p => {
            if (matchedBackendIds.has(p._id)) return false;
            return p.sku === staticProduct.id || p._id === staticProduct.id ||
              (normalize(p.brand) === normalize(staticProduct.brand) && normalize(p.flavor) === normalize(staticProduct.flavor));
          });

          if (matchingBackendProducts.length > 0) {
            const backendProduct = matchingBackendProducts[0];
            matchedBackendIds.add(backendProduct._id);

            const finalProduct = {
              ...staticProduct,
              ...backendProduct,
              id: backendProduct._id || backendProduct.id,
              stock: Number(backendProduct.stock || 0),
              soldOut: Number(backendProduct.stock || 0) <= 0
            };
            finalProductsMap.set(staticNormKey, finalProduct);
          } else {
            // Static item not in backend - defaulting to its static stock
            finalProductsMap.set(staticNormKey, {
              ...staticProduct,
              stock: staticProduct.stock,
              soldOut: (staticProduct.stock || 0) <= 0
            });
          }
        });

        // 2. Process remaining backend items (New products)
        data.filter(p => !matchedBackendIds.has(p._id)).forEach(p => {
          const normKey = `${normalize(p.brand)}|${normalize(p.series)}|${normalize(p.flavor)}`;
          if (finalProductsMap.has(normKey)) return;

          finalProductsMap.set(normKey, {
            ...p,
            id: p._id || p.id,
            name: p.name || `${p.brand} ${p.series} - ${p.flavor}`,
            cardImage: p.images?.[0] || '',
            poster: p.images?.[0] || '',
            stock: Number(p.stock || 0),
            soldOut: Number(p.stock || 0) <= 0
          });
        });

        setBackendProducts(Array.from(finalProductsMap.values()));
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (!isAdminLoggedIn) {
      fetchProducts();
    }
  }, [isAdminLoggedIn]);

  const handleLogin = (userData) => {
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem('vapesmart_adminUser');
    localStorage.removeItem('vapesmart_isAdmin');
    localStorage.removeItem('vapesmart_adminToken');

    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('vapesmart_user', JSON.stringify(userData));
    localStorage.setItem('vapesmart_isLoggedIn', 'true');
    setCurrentPage('home');
  };

  const handleAdminLogin = (token, adminData) => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('vapesmart_user');
    localStorage.removeItem('vapesmart_isLoggedIn');

    setIsAdminLoggedIn(true);
    setAdminUser(adminData);
    setAdminToken(token);
    setCurrentPage('adminDashboard');
    localStorage.setItem('vapesmart_adminToken', token);
    localStorage.setItem('vapesmart_adminUser', JSON.stringify(adminData));
    localStorage.setItem('vapesmart_isAdmin', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem('vapesmart_adminUser');
    localStorage.removeItem('vapesmart_isAdmin');
    localStorage.removeItem('vapesmart_adminToken');
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('vapesmart_user');
    localStorage.removeItem('vapesmart_isLoggedIn');
    setCurrentPage('home');
  };

  const filteredProducts = useMemo(() => {
    let list = [...backendProducts];
    if (currentCategory !== 'all') {
      list = list.filter(p => p.mainCategory === currentCategory || p.category === currentCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.flavor?.toLowerCase().includes(q));
    }
    return list;
  }, [backendProducts, currentCategory, searchQuery]);

  const handleAddToCart = (product, quantity = 1) => {
    const existing = cartItems.find(item => item.id === product.id);
    const newCart = existing
      ? cartItems.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
      : [...cartItems, { ...product, quantity }];
    setCartItems(newCart);
    localStorage.setItem('vapesmart_cart', JSON.stringify(newCart));
    setToast({ type: 'success', message: 'Added to cart' });
  };

  // --- RENDER BRANCHES (Strict Separation) ---

  // 1. Admin Dashboard View
  if (isAdminLoggedIn) {
    return (
      <div className="relative min-h-screen bg-black text-gray-100">
        <div className="fixed inset-0 -z-10 opacity-80"><VapeSmokeEffect density={40} speed={0.4} opacity={0.35} /></div>
        <AdminDashboard
          adminUser={adminUser || { username: 'Admin' }}
          adminToken={adminToken}
          onLogout={handleAdminLogout}
          onNavigateToStore={() => {/* Navigation is handled via state */ }}
        />
      </div>
    );
  }

  // 2. Admin Login View
  if (currentPage === 'adminLogin' && !isAdminLoggedIn) {
    return (
      <div className="relative min-h-screen bg-black text-gray-100 flex items-center justify-center">
        <div className="fixed inset-0 -z-10 opacity-80"><VapeSmokeEffect density={40} speed={0.4} opacity={0.35} /></div>
        <AdminLogin onAdminLogin={handleAdminLogin} />
      </div>
    );
  }

  // 3. User Portal (Storefront / Login) View
  return (
    <div className="relative min-h-screen bg-black text-gray-100">
      <div className="fixed inset-0 -z-10 opacity-80"><VapeSmokeEffect density={40} speed={0.4} opacity={0.35} /></div>

      {!isLoggedIn ? (
        <LoginSignup onLogin={handleLogin} onAdminLogin={() => setCurrentPage('adminLogin')} />
      ) : (
        <>
          <Navbar
            user={user}
            onLogout={handleLogout}
            currentCategory={currentCategory}
            onCategoryChange={setCurrentCategory}
            onNavigate={setCurrentPage}
            cartItemCount={cartItems.reduce((s, i) => s + i.quantity, 0)}
            onSearchChange={setSearchQuery}
          />

          <main className="pt-20 px-4">
            {currentPage === 'home' && (
              <>
                <LandingHero onNavigate={setCurrentPage} />
                <ProductGrid products={filteredProducts} onOpen={setSelected} onAddToCart={handleAddToCart} />
              </>
            )}
            {currentPage === 'account' && <AccountSection activeTab={accountTab} profile={customerProfile} orders={orders} />}
            {currentPage === 'cart' && (
              <CartPage
                cartItems={cartItems}
                onUpdateQuantity={(id, delta) => {
                  const newCart = cartItems.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item);
                  setCartItems(newCart);
                  localStorage.setItem('vapesmart_cart', JSON.stringify(newCart));
                }}
                onRemoveItem={(id) => {
                  const newCart = cartItems.filter(item => item.id !== id);
                  setCartItems(newCart);
                  localStorage.setItem('vapesmart_cart', JSON.stringify(newCart));
                }}
                onCheckout={() => setCurrentPage('payment')}
              />
            )}
            {currentPage === 'payment' && <PaymentPage total={cartItems.reduce((s, i) => s + (i.price * i.quantity), 0)} onPaymentSuccess={() => {
              setCartItems([]);
              localStorage.removeItem('vapesmart_cart');
              setCurrentPage('home');
              setToast({ type: 'success', message: 'Order Placed!' });
            }} />}
          </main>

          {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onAddToCart={handleAddToCart} />}
        </>
      )}

      {toast && (
        <div className="fixed bottom-10 right-10 z-[1000] bg-neutral-900 border border-neutral-800 px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4">
          <p className="text-sm font-bold text-white uppercase tracking-widest">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
