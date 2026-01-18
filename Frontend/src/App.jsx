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
    const savedUser = localStorage.getItem('vapesmart_user')
    const savedLoginState = localStorage.getItem('vapesmart_isLoggedIn')
    const savedCart = localStorage.getItem('vapesmart_cart')
    const savedOrders = localStorage.getItem('vapesmart_orders')
    const savedProfile = localStorage.getItem('vapesmart_profile')
    const savedAdminUser = localStorage.getItem('vapesmart_adminUser')
    const isAdmin = localStorage.getItem('vapesmart_isAdmin') === 'true'

    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      isLoggedIn: savedLoginState === 'true',
      isAdminLoggedIn: isAdmin,
      adminUser: isAdmin && savedAdminUser ? JSON.parse(savedAdminUser) : null,
      adminToken: localStorage.getItem('vapesmart_adminToken'),
      cartItems: savedCart ? JSON.parse(savedCart) : [],
      orders: savedOrders ? JSON.parse(savedOrders) : [],
      profile: savedProfile ? JSON.parse(savedProfile) : null,
    }
  } catch (error) {
    console.error('Error loading persisted state:', error)
    return {
      user: null,
      isLoggedIn: false,
      isAdminLoggedIn: false,
      adminUser: null,
      adminToken: null,
      cartItems: [],
      orders: [],
      profile: null,
    }
  }
}

export default function App() {
  const persistedState = loadPersistedState()

  const [selected, setSelected] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(persistedState.isLoggedIn)
  const [user, setUser] = useState(persistedState.user)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(persistedState.isAdminLoggedIn)
  const [adminUser, setAdminUser] = useState(persistedState.adminUser)
  const [adminToken, setAdminToken] = useState(persistedState.adminToken)

  // Sync token to localStorage for components that use it directly
  useEffect(() => {
    if (user && user.token) {
      localStorage.setItem('token', user.token);
    } else if (!isLoggedIn) {
      localStorage.removeItem('token');
    }
  }, [user, isLoggedIn]);
  const [currentCategory, setCurrentCategory] = useState('all')
  const [activeFilters, setActiveFilters] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState('home')
  const [accountTab, setAccountTab] = useState('profile')
  const [cartItems, setCartItems] = useState(persistedState.cartItems)
  const [toast, setToast] = useState(null)
  const [customerProfile, setCustomerProfile] = useState(persistedState.profile)
  const [orders, setOrders] = useState(persistedState.orders)
  const [pendingOrder, setPendingOrder] = useState(null)
  const [tempAdminBypass, setTempAdminBypass] = useState(false)
  const [backendProducts, setBackendProducts] = useState(PRODUCTS)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const data = await apiCall(API_ENDPOINTS.PRODUCTS.ALL);
      if (Array.isArray(data)) {
        const normalize = (s) => (s === null || s === undefined || s === 'null') ? '' : s.toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '');

        const resolveSpec = (backendVal, staticVal, isNumber = false) => {
          const isEmpty = (v) => v === null || v === undefined || v === "" || v === 0 || v === "0" || (typeof v === 'string' && (v.toLowerCase() === 'n/a' || v.toLowerCase() === 'null'));
          if (!isEmpty(backendVal)) return isNumber ? parseInt(backendVal) : backendVal;
          return staticVal;
        };

        const matchedBackendIds = new Set();
        const finalProductsMap = new Map();
        const seenNameKeys = new Set();

        // 1. Process Static Products
        PRODUCTS.forEach(staticProduct => {
          const staticNameKey = `${normalize(staticProduct.brand)}|${normalize(staticProduct.series)}|${normalize(staticProduct.flavor)}`;

          // Find best backend match
          const matchingBackendProducts = data.filter(p => {
            if (matchedBackendIds.has(p._id)) return false;
            const pBrand = normalize(p.brand);
            const pSeries = normalize(p.series);
            const pFlavor = normalize(p.flavor);
            const pName = normalize(p.name);

            const sBrand = normalize(staticProduct.brand);
            const sSeries = normalize(staticProduct.series);
            const sFlavor = normalize(staticProduct.flavor);

            const isIdMatch = p.sku === staticProduct.id || p._id === staticProduct.id;

            // Multi-stage fuzzy match:
            // 1. Direct field match (Primary)
            // 2. Name-contains-series match (Fallback for legacy DB items)
            const isFuzzyMatch = pBrand === sBrand && pFlavor === sFlavor && (
              pSeries === sSeries ||
              (sSeries !== '' && pName.includes(sSeries))
            );
            return isIdMatch || isFuzzyMatch;
          });

          if (matchingBackendProducts.length > 0) {
            const backendProduct = matchingBackendProducts[0];
            matchingBackendProducts.forEach(p => matchedBackendIds.add(p._id));

            const backendSpecs = backendProduct.specifications || {};
            const series = backendProduct.series || staticProduct.series || '';
            let flavor = backendProduct.flavor || staticProduct.flavor || '';
            if (normalize(flavor) === '') flavor = '';

            let finalTitle = backendProduct.name;
            if (!finalTitle || finalTitle.toLowerCase().includes('null')) {
              finalTitle = series;
              if (flavor && flavor.toLowerCase() !== 'null' && !finalTitle.toLowerCase().includes(flavor.toLowerCase())) {
                finalTitle += ` - ${flavor}`;
              }
            }
            // Final polish: remove any residual ' - null' or 'null'
            finalTitle = finalTitle.replace(/\s*-\s*null/gi, '').replace(/null/gi, '').trim();

            const finalProduct = {
              ...staticProduct,
              ...backendProduct,
              id: backendProduct._id || backendProduct.id,
              name: finalTitle,
              brand: staticProduct.brand,

              puffs: resolveSpec(backendSpecs.puffs || backendProduct.puffs, staticProduct.puffs, true),
              nicotine: resolveSpec(backendSpecs.nicotine || backendProduct.nicotine, staticProduct.nicotine),
              type: resolveSpec(backendSpecs.type || backendProduct.type, staticProduct.type),
              features: resolveSpec(backendSpecs.features || backendProduct.features, staticProduct.features),

              price: backendProduct.price || staticProduct.price,
              stock: (backendProduct.stock !== undefined && backendProduct.stock !== null) ? backendProduct.stock : 50,
              soldOut: (backendProduct.stock !== undefined && backendProduct.stock <= 0),
              isBestSelling: backendProduct.isBestSelling || staticProduct.isBestSelling
            };

            finalProductsMap.set(staticNameKey, finalProduct);
            seenNameKeys.add(staticNameKey);
          } else {
            const ghostProduct = {
              ...staticProduct,
              stock: staticProduct.stock || 0,
              soldOut: (staticProduct.stock || 0) <= 0
            };
            finalProductsMap.set(staticNameKey, ghostProduct);
            seenNameKeys.add(staticNameKey);
          }
        });

        // 2. Process remaining backend items
        data.filter(p => !matchedBackendIds.has(p._id)).forEach(p => {
          const normKey = `${normalize(p.brand)}|${normalize(p.series)}|${normalize(p.flavor)}`;
          if (finalProductsMap.has(normKey) || seenNameKeys.has(normKey)) return;

          const specs = p.specifications || {};
          const prototype = PRODUCTS.find(sp => normalize(sp.brand) === normalize(p.brand) && normalize(sp.series) === normalize(p.series));

          let flavor = p.flavor || '';
          if (normalize(flavor) === '') flavor = '';
          let finalTitle = p.name;
          if (!finalTitle || finalTitle.toLowerCase().includes('null')) {
            finalTitle = p.series || 'Vape Item';
            if (flavor && flavor.toLowerCase() !== 'null' && !finalTitle.toLowerCase().includes(flavor.toLowerCase())) {
              finalTitle += ` - ${flavor}`;
            }
          }
          finalTitle = finalTitle.replace(/\s*-\s*null/gi, '').replace(/null/gi, '').trim();

          const newProduct = {
            ...p,
            id: p._id || p.id,
            name: finalTitle,
            cardImage: p.images?.[0] || '',
            poster: p.images?.[0] || '',
            puffs: resolveSpec(specs.puffs || p.puffs, prototype?.puffs || 0, true),
            nicotine: resolveSpec(specs.nicotine || p.nicotine, prototype?.nicotine || ''),
            type: resolveSpec(specs.type || p.type, prototype?.type || ''),
            features: resolveSpec(specs.features || p.features, prototype?.features || ''),
            soldOut: (p.stock || 0) <= 0
          };

          finalProductsMap.set(normKey, newProduct);
          seenNameKeys.add(normKey);
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
    fetchProducts();
  }, []);

  const fetchUserData = async (token) => {
    if (!token) return;
    try {
      const cartData = await apiCall(API_ENDPOINTS.CART.GET, {
        headers: getAuthHeaders(token)
      });
      if (cartData && cartData.items) {
        setCartItems(cartData.items.map(item => {
          const product = backendProducts.find(p => p.id === item.productId || p._id === item.productId) || PRODUCTS.find(p => p.id === item.productId);
          return {
            ...item,
            id: item.productId,
            image: item.image || product?.cardImage || product?.poster || '',
            series: item.series || product?.series || '',
            name: item.name || product?.name || ''
          };
        }));
      }

      const ordersData = await apiCall(API_ENDPOINTS.ORDERS.GET_ALL, {
        headers: getAuthHeaders(token)
      });
      if (ordersData && ordersData.orders) {
        const mappedOrders = ordersData.orders.map(order => ({
          ...order,
          id: order._id,
          items: (order.items || []).map(item => ({
            ...item,
            id: item._id || item.productId
          }))
        }));
        setOrders(mappedOrders);
        localStorage.setItem('vapesmart_orders', JSON.stringify(mappedOrders));
      }

      const profileData = await apiCall(API_ENDPOINTS.USER.PROFILE, {
        headers: getAuthHeaders(token)
      });
      if (profileData) {
        setCustomerProfile(profileData);
        localStorage.setItem('vapesmart_profile', JSON.stringify(profileData));
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const prevOrdersRef = React.useRef(orders);

  const checkForStatusUpdates = (prev, current) => {
    if (!prev || prev.length === 0) return;

    current.forEach(currOrder => {
      const prevOrder = prev.find(p => (p._id || p.id) === (currOrder._id || currOrder.id));
      if (prevOrder && prevOrder.status !== currOrder.status) {
        setToast({
          type: 'info',
          message: `Update on Order #${(currOrder.orderNumber || currOrder._id || '').slice(-6).toUpperCase()}`,
          subTitle: `Status updated to: ${currOrder.status.toUpperCase()}`
        });
      }
    });
  };

  useEffect(() => {
    let interval;
    if (isLoggedIn && user?.token) {
      const pollOrders = async () => {
        try {
          const token = user.token;
          const ordersData = await apiCall(API_ENDPOINTS.ORDERS.GET_ALL, {
            headers: getAuthHeaders(token)
          });

          if (ordersData && ordersData.orders) {
            const mappedOrders = ordersData.orders.map(order => ({
              ...order,
              id: order._id,
              items: (order.items || []).map(item => ({
                ...item,
                id: item._id || item.productId
              }))
            }));

            checkForStatusUpdates(prevOrdersRef.current, mappedOrders);
            setOrders(mappedOrders);
            prevOrdersRef.current = mappedOrders;
            localStorage.setItem('vapesmart_orders', JSON.stringify(mappedOrders));
          }
        } catch (err) {
          // Silent 404 for poll errors since server might not be updated yet
          if (err.status !== 404) console.error('Poll error:', err);
        }
      };
      // Poll every 15 seconds to be gentler on the server
      interval = setInterval(() => {
        pollOrders();
        fetchProducts(); // Keep stock dynamic from admin side
      }, 15000);
    }
    return () => clearInterval(interval);
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (isLoggedIn && user?.token) {
      fetchUserData(user.token);
    }
  }, []);

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
        }, 500);
      }
    }
  }, [currentPage]);

  const handleLogin = (userData) => {
    // Clear any admin session to prevent UI mix-ups
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem('vapesmart_adminUser');
    localStorage.removeItem('vapesmart_isAdmin');
    localStorage.removeItem('vapesmart_adminToken');

    setUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem('vapesmart_user', JSON.stringify(userData))
    localStorage.setItem('vapesmart_isLoggedIn', 'true')
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    fetchUserData(userData.token);
  }

  const handleAdminLogin = (token, adminData) => {
    // Clear any user session
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('vapesmart_user');
    localStorage.removeItem('vapesmart_isLoggedIn');
    localStorage.removeItem('token');

    setIsAdminLoggedIn(true);
    setAdminUser(adminData);
    setAdminToken(token);
    setCurrentPage('adminDashboard');
    localStorage.setItem('vapesmart_adminToken', token);
    localStorage.setItem('vapesmart_adminUser', JSON.stringify(adminData));
    localStorage.setItem('vapesmart_isAdmin', 'true');
    setToast({ type: 'success', message: 'Admin login successful' });
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false)
    setAdminUser(null)
    setAdminToken(null)
    localStorage.removeItem('vapesmart_adminUser')
    localStorage.removeItem('vapesmart_isAdmin')
    localStorage.removeItem('vapesmart_adminToken')
    setToast({ type: 'info', message: 'Admin logged out' })
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
    setIsAdminLoggedIn(false)
    setAdminUser(null)
    localStorage.removeItem('vapesmart_user')
    localStorage.removeItem('vapesmart_isLoggedIn')
    localStorage.removeItem('vapesmart_isAdmin')
    localStorage.removeItem('vapesmart_adminUser')
    localStorage.removeItem('vapesmart_cart')
    localStorage.removeItem('vapesmart_orders')
    localStorage.removeItem('vapesmart_profile')
    localStorage.removeItem('token')
    setCartItems([])
    setOrders([])
    setCustomerProfile(null)
    setToast({ type: 'info', message: 'You have been logged out' })
  }

  const handleFilterChange = (filter) => {
    if (filter.type === 'clear') {
      setActiveFilters({})
    } else if (filter.value === null) {
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

  const handleAddToCart = async (product, quantity = 1, { redirectToCart = false } = {}) => {
    const existingItem = cartItems.find(item =>
      item.id === product.id &&
      (item.flavor || '') === (product.flavor || '') &&
      (item.series || '') === (product.series || '')
    )
    const newCart = existingItem
      ? cartItems.map(item =>
        (item.id === product.id && (item.flavor || '') === (product.flavor || '') && (item.series || '') === (product.series || ''))
          ? { ...item, quantity: (item.quantity || 0) + quantity }
          : item
      )
      : [...cartItems, { ...product, quantity }]

    setCartItems(newCart)
    localStorage.setItem('vapesmart_cart', JSON.stringify(newCart))

    setToast({
      type: 'success',
      message: 'Item added to cart!',
      subTitle: `${product.series || product.name || 'Item'} ${existingItem ? '(quantity updated)' : ''}`,
      actionLabel: 'View Cart',
      onAction: () => setCurrentPage('cart')
    })

    if (redirectToCart) setCurrentPage('cart')

    // Only sync with backend if logged in AND the product has a valid MongoDB ObjectId
    // Demo products have string IDs (e.g. "elfbar-...") and will cause 500 errors if sent to backend
    // Only sync with backend if logged in AND the product has a valid MongoDB ObjectId
    // Demo products have string IDs (e.g. "elfbar-...") and will cause 500 errors if sent to backend
    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
    const backendId = product._id || product.id;

    if (isLoggedIn && user?.token && isValidObjectId(backendId)) {
      try {
        await apiCall(API_ENDPOINTS.CART.ADD, {
          method: 'POST',
          headers: getAuthHeaders(user.token),
          body: JSON.stringify({
            productId: backendId,
            name: product.series || product.name || 'Item',
            price: product.price,
            image: product.image || product.cardImage || product.poster,
            flavor: product.flavor || '',
            series: product.series || '',
            quantity
          })
        });
      } catch (err) {
        console.error('Failed to sync cart with backend:', err);
      }
    }
  }

  const handleUpdateCartQuantity = async (productId, delta, options = {}) => {
    const { flavor = '', series = '' } = options;
    const item = cartItems.find(i =>
      i.id === productId && (i.flavor || '') === flavor && (i.series || '') === series
    );
    if (!item) return;

    const newQuantity = options.isAbsolute ? delta : (item.quantity || 1) + delta
    if (newQuantity < 1) return

    const newCart = cartItems.map(item =>
      (item.id === productId && (item.flavor || '') === flavor && (item.series || '') === series)
        ? { ...item, quantity: newQuantity }
        : item
    )
    setCartItems(newCart)
    localStorage.setItem('vapesmart_cart', JSON.stringify(newCart))

    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
    const backendId = item._id || item.id;

    if (isLoggedIn && user?.token && isValidObjectId(backendId)) {
      try {
        await apiCall(API_ENDPOINTS.CART.UPDATE, {
          method: 'PUT',
          headers: getAuthHeaders(user.token),
          body: JSON.stringify({
            productId: backendId,
            flavor: item.flavor || '',
            series: item.series || '',
            quantity: newQuantity
          })
        });
      } catch (err) {
        console.error('Failed to sync cart update with backend:', err);
      }
    }
  }

  const handleRemoveFromCart = async (productId, flavor = '', series = '') => {
    // Find item to get its _id before removing
    const item = cartItems.find(i =>
      i.id === productId && (i.flavor || '') === flavor && (i.series || '') === series
    );

    const newCart = cartItems.filter(item =>
      !(item.id === productId && (item.flavor || '') === flavor && (item.series || '') === series)
    )
    setCartItems(newCart)
    localStorage.setItem('vapesmart_cart', JSON.stringify(newCart))
    setToast({ type: 'info', message: 'Item removed from cart' })

    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
    const backendId = item?._id || productId;

    if (isLoggedIn && user?.token && isValidObjectId(backendId)) {
      try {
        await apiCall(API_ENDPOINTS.CART.REMOVE, {
          method: 'DELETE',
          headers: getAuthHeaders(user.token),
          body: JSON.stringify({ productId: backendId, flavor, series })
        });
      } catch (err) {
        console.error('Failed to sync cart removal with backend:', err);
      }
    }
  }

  // Refresh data
  const handleRefresh = () => {
    fetchData('/users', setUsers);
    fetchData('/client-requirements', setClientRequirements);
    fetchData('/orders', setOrders);
    fetchStats();
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setToast({ type: 'error', message: 'Your cart is empty' })
      return
    }
    if (!customerProfile || !customerProfile.address || !customerProfile.address.trim() || !customerProfile.phoneNumber) {
      setToast({
        type: 'error',
        message: 'Missing profile details',
        subTitle: 'Please provide your shipping address and phone number in My Account'
      })
      setCurrentPage('account')
      setAccountTab('profile')
      return
    }
    const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
    setPendingOrder({ id: Date.now(), items: [...cartItems], total, customerProfile: { ...customerProfile } })
    setCurrentPage('payment')
  }

  const handlePaymentSuccess = async (paymentData) => {
    if (!pendingOrder) return

    if (isLoggedIn && user?.token) {
      try {
        setToast({ type: 'info', message: 'Confirming order with server...' });
        const response = await apiCall(API_ENDPOINTS.ORDERS.CREATE, {
          method: 'POST',
          headers: getAuthHeaders(user.token),
          body: JSON.stringify({
            shippingAddress: paymentData.shippingAddress || pendingOrder.customerProfile.address || '',
            paymentMethod: paymentData.paymentMethod || 'cod',
            items: pendingOrder.items.map(item => ({
              product: item._id || item.id,
              quantity: item.quantity || 1,
              name: item.name || item.series,
              price: item.price, // CRITICAL: Send price to avoid ₹0 orders
              image: item.image || item.cardImage || item.poster || '',
              brand: item.brand,
              series: item.series,
              flavor: item.flavor
            })),
          })
        });

        if (response && response.order) {
          await fetchUserData(user.token);
          setCartItems([])
          localStorage.setItem('vapesmart_cart', JSON.stringify([]))
          setPendingOrder(null)
          setToast({ type: 'success', message: 'Order placed successfully!', subTitle: `Order ID: ${response.order._id || response.order.id}` })
          setCurrentPage('account')
          setAccountTab('orders')
          return;
        }
      } catch (err) {
        console.error('Failed to submit order to backend:', err);
      }
    }

    const trackingNumber = `TRK${Date.now()}${Math.floor(Math.random() * 10000)}`
    const now = new Date().toISOString()
    const newOrder = {
      id: pendingOrder.id,
      orderNumber: `ORD${pendingOrder.id}`,
      trackingNumber,
      placedAt: now,
      items: pendingOrder.items,
      total: pendingOrder.total,
      status: 'processing',
      paymentStatus: paymentData.paymentStatus || 'completed',
      paymentMethod: paymentData.paymentMethod || 'card',
      shippingAddress: pendingOrder.customerProfile.address || '',
      timeline: [{ status: 'order_placed', timestamp: now, message: 'Order placed successfully' }],
    }

    setOrders(prev => {
      const newOrders = [newOrder, ...prev]
      localStorage.setItem('vapesmart_orders', JSON.stringify(newOrders))
      return newOrders
    })
    setCartItems([])
    localStorage.setItem('vapesmart_cart', JSON.stringify([]))
    setPendingOrder(null)
    setToast({ type: 'success', message: 'Order placed successfully!', subTitle: `Tracking: ${trackingNumber}` })
    setCurrentPage('account')
    setAccountTab('orders')
  }

  const handlePaymentCancel = () => {
    setPendingOrder(null)
    setCurrentPage('cart')
  }

  const filteredProducts = useMemo(() => {
    let products = [...backendProducts]
    if (currentCategory === 'most-selling') products = products.filter(p => p.isBestSelling || p.isFeatured)
    else if (currentCategory === 'podkits') products = products.filter(p => p.mainCategory === 'podkits')
    else if (currentCategory === 'disposable') products = products.filter(p => p.mainCategory === 'disposable')
    else if (currentCategory === 'nic-salts') products = products.filter(p => p.nicotine && p.nicotine.includes('mg'))
    else if (currentCategory === 'pods-coils') products = products.filter(p => p.mainCategory === 'pods-coils' || (p.type?.toLowerCase().includes('pod') || p.type?.toLowerCase().includes('coil')))

    if (activeFilters.brand) products = products.filter(p => p.brand === activeFilters.brand)
    if (activeFilters.brand && activeFilters.subCategory) products = products.filter(p => p.series === activeFilters.subCategory)
    if (activeFilters.price) products = products.filter(p => p.price >= activeFilters.price.min && (activeFilters.price.max === Infinity ? true : p.price <= activeFilters.price.max))
    if (activeFilters.puffs) products = products.filter(p => p.puffs >= activeFilters.puffs.min && (activeFilters.puffs.max === Infinity ? true : (p.puffs || 0) <= activeFilters.puffs.max))


    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      products = products.filter(p => [p.brand, p.series, p.name, p.flavor, p.type].some(f => f?.toLowerCase().includes(q)))
    }
    return products
  }, [currentCategory, activeFilters, searchQuery, backendProducts])

  const featuredProducts = useMemo(() => backendProducts.filter(p => p.isBestSelling || p.isFeatured).slice(0, 3), [backendProducts])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  if (tempAdminBypass || (currentPage === 'adminDashboard' && isAdminLoggedIn)) {
    return (
      <div className="relative min-h-screen bg-black text-gray-100">
        <div className="fixed inset-0 -z-10 opacity-80"><VapeSmokeEffect density={40} speed={0.4} opacity={0.35} /></div>
        <AdminDashboard adminUser={adminUser || { username: 'Admin' }} adminToken={adminToken} onLogout={handleAdminLogout} onNavigateToStore={() => setCurrentPage('home')} onProductUpdate={fetchProducts} />
      </div>
    )
  }

  if (!isLoggedIn && currentPage !== 'adminLogin') {
    return <LoginSignup onLogin={handleLogin} />
  }

  if (currentPage === 'adminLogin' && !isAdminLoggedIn) {
    return <AdminLogin onAdminLogin={handleAdminLogin} />
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-darkPurple-950/20 to-black text-gray-100">
      <div className="fixed inset-0 z-10 pointer-events-none opacity-80"><VapeSmokeEffect density={100} speed={0.7} opacity={0.6} /></div>
      <Navbar
        user={user}
        onLogout={handleLogout}
        currentCategory={currentCategory}
        onCategoryChange={setCurrentCategory}
        onFilterChange={handleFilterChange}
        activeFilters={activeFilters}
        onNavigate={handleNavigate}
        cartItemCount={cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          if (query.trim() && currentPage !== 'home') {
            setCurrentPage('home');
            // Optional: reset category to show all matching results
            setCurrentCategory('all');
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        adminUser={adminUser}
        onAdminLogout={handleAdminLogout}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] px-4">
          <div className="flex items-center gap-4 bg-neutral-900/95 border border-neutral-700/60 rounded-2xl px-5 py-3 shadow-lg min-w-[260px] max-w-md">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : toast.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-sky-500/20 text-sky-300'}`}>
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : 'i'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{toast.message}</p>
              {toast.subTitle && <p className="text-xs text-neutral-400 mt-0.5">{toast.subTitle}</p>}
            </div>
            <button onClick={() => setToast(null)} className="text-neutral-500 hover:text-neutral-300 text-xs">×</button>
          </div>
        </div>
      )}

      <main className="w-full">
        {currentPage === 'home' && (
          <div className="container mx-auto px-4 pt-24 pb-8">
            {currentCategory === 'all' && Object.keys(activeFilters).length === 0 && (
              <LandingHero onNavigate={handleNavigate} onCategoryChange={setCurrentCategory} onFilterChange={handleFilterChange} />
            )}
            {featuredProducts.length > 0 && (
              <div className="mt-12">
                <Hero3D product={featuredProducts[0]} onNavigate={handleNavigate} onCategoryChange={setCurrentCategory} onFilterChange={handleFilterChange} onOpenProduct={setSelected} />
              </div>
            )}
            <section id="products" className="mt-12">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellowGradient-start via-yellowGradient-end to-yellowGradient-start bg-clip-text text-transparent">
                {currentCategory === 'all' ? 'Featured Products' : MAIN_CATEGORIES[currentCategory] || 'Products'}
              </h2>
              <ProductGrid products={filteredProducts} onOpen={setSelected} category={currentCategory} activeFilters={activeFilters} onFilterChange={handleFilterChange} onAddToCart={handleAddToCart} />
            </section>
          </div>
        )}

        {currentPage === 'account' && (
          <AccountSection
            activeTab={accountTab}
            products={backendProducts}
            profile={customerProfile}
            onSaveProfile={async (saved) => {
              setCustomerProfile(saved);
              localStorage.setItem('vapesmart_profile', JSON.stringify(saved));
              if (isLoggedIn && user?.token) {
                try {
                  await apiCall(API_ENDPOINTS.USER.UPDATE_PROFILE, { method: 'PUT', headers: getAuthHeaders(user.token), body: JSON.stringify(saved) });
                  // Re-fetch to ensure backend sync
                  await fetchUserData(user.token);
                } catch (err) { console.error('Failed to sync profile:', err); }
              }
              setToast({ type: 'success', message: 'Profile saved successfully' });
            }}
            orders={orders}
            onNotify={setToast}
          />
        )}

        {currentPage === 'cart' && <CartPage cartItems={cartItems} onUpdateQuantity={handleUpdateCartQuantity} onRemoveItem={handleRemoveFromCart} onCheckout={handleCheckout} />}
        {currentPage === 'payment' && pendingOrder && <PaymentPage cartItems={pendingOrder.items} total={pendingOrder.total} customerProfile={pendingOrder.customerProfile} onPaymentSuccess={handlePaymentSuccess} onCancel={handlePaymentCancel} />}
      </main>

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onAddToCart={handleAddToCart} onBuyNow={(p) => handleAddToCart(p, 1, { redirectToCart: true })} />}
    </div>
  )
}
