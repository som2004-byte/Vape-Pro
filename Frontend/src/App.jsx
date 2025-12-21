import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import VapeSmokeEffect from './components/VapeSmokeEffect';
import LandingHero from './components/LandingHero';
import Hero3D from './components/Hero3D';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import LoginSignup from './components/LoginSignup';
import { PRODUCTS, MAIN_CATEGORIES } from './data';
import AccountSection from './components/AccountSection';
import CartPage from './components/CartPage';
import PaymentPage from './components/PaymentPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminPortal from './components/AdminPortal';
// // Load persisted state from localStorage
// const loadPersistedState = () => {
//   try {
//     const savedUser = localStorage.getItem('vapesmart_user');
//     const savedLoginState = localStorage.getItem('vapesmart_isLoggedIn');
//     const savedCart = localStorage.getItem('vapesmart_cart');
//     const savedOrders = localStorage.getItem('vapesmart_orders');
//     const savedProfile = localStorage.getItem('vapesmart_profile');
//     const savedAdminUser = localStorage.getItem('vapesmart_adminUser');
//     const isAdmin = localStorage.getItem('vapesmart_isAdmin') === 'true';
    
//     return {
//       user: savedUser ? JSON.parse(savedUser) : null,
//       isLoggedIn: savedLoginState === 'true',
//       isAdminLoggedIn: isAdmin,
//       adminUser: isAdmin && savedAdminUser ? JSON.parse(savedAdminUser) : null,
//       cartItems: savedCart ? JSON.parse(savedCart) : [],
//       orders: savedOrders ? JSON.parse(savedOrders) : [],
//       profile: savedProfile ? JSON.parse(savedProfile) : null,
//     };
//   } catch (error) {
//     console.error('Error loading persisted state:', error);
//     return {
//       user: null,
//       isLoggedIn: false,
//       isAdminLoggedIn: false,
//       adminUser: null,
//       cartItems: [],
//       orders: [],
//       profile: null,
//     };
//   }
// };
// // Main App component
// export default function App() {
//   const [selected, setSelected] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [user, setUser] = useState(null);
//   const [currentCategory, setCurrentCategory] = useState('all');
//   const [activeFilters, setActiveFilters] = useState({});
//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentPage, setCurrentPage] = useState('home');
//   const [accountTab, setAccountTab] = useState('profile');
//   const [cartItems, setCartItems] = useState([]);
//   const [toast, setToast] = useState(null);
//   const [customerProfile, setCustomerProfile] = useState(null);
//   const [orders, setOrders] = useState([]);
//   const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
//   const [adminUser, setAdminUser] = useState(null);

//   // Load persisted state on component mount
//   useEffect(() => {
//     const persistedState = loadPersistedState();
//     setIsLoggedIn(persistedState.isLoggedIn);
//     setUser(persistedState.user);
//     setCartItems(persistedState.cartItems);
//     setOrders(persistedState.orders);
//     setCustomerProfile(persistedState.profile);
//     setIsAdminLoggedIn(persistedState.isAdminLoggedIn);
//     setAdminUser(persistedState.adminUser);
//   }, []);

//   // Handle user login
//   const handleLogin = (userData) => {
//     setUser(userData);
//     setIsLoggedIn(true);
//     localStorage.setItem('vapesmart_user', JSON.stringify(userData));
//     localStorage.setItem('vapesmart_isLoggedIn', 'true');
//     setCurrentPage('home');
//   };

//   // Handle admin login
//   const handleAdminLogin = (token, adminData) => {
//     setIsAdminLoggedIn(true);
//     setAdminUser(adminData);
//     setCurrentPage('adminDashboard');
//     localStorage.setItem('vapesmart_adminToken', token);
//     localStorage.setItem('vapesmart_adminUser', JSON.stringify(adminData));
//     localStorage.setItem('vapesmart_isAdmin', 'true');
//   };

//   // Handle logout
//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     setUser(null);
//     localStorage.removeItem('vapesmart_user');
//     localStorage.removeItem('vapesmart_isLoggedIn');
//     setCurrentPage('home');
//     setToast({ type: 'info', message: 'You have been logged out' });
//   };

//   // Handle admin logout
//   const handleAdminLogout = () => {
//     setIsAdminLoggedIn(false);
//     setAdminUser(null);
//     localStorage.removeItem('vapesmart_adminUser');
//     localStorage.removeItem('vapesmart_isAdmin');
//     localStorage.removeItem('vapesmart_adminToken');
//     setCurrentPage('home');
//     setToast({ type: 'info', message: 'Admin logged out' });
//   };

//   // Handle adding item to cart
//   const handleAddToCart = (product) => {
//     setCartItems(prevItems => {
//       const existingItem = prevItems.find(item => item.id === product.id);
//       const newItems = existingItem
//         ? prevItems.map(item =>
//             item.id === product.id
//               ? { ...item, quantity: (item.quantity || 1) + 1 }
//               : item
//           )
//         : [...prevItems, { ...product, quantity: 1 }];
      
//       localStorage.setItem('vapesmart_cart', JSON.stringify(newItems));
//       return newItems;
//     });
//     setToast({ type: 'success', message: 'Item added to cart!' });
//   };

//   // Handle updating cart item quantity
//   const updateCartItemQuantity = (productId, newQuantity) => {
//     if (newQuantity < 1) return;
    
//     setCartItems(prevItems => {
//       const newItems = prevItems.map(item =>
//         item.id === productId ? { ...item, quantity: newQuantity } : item
//       );
//       localStorage.setItem('vapesmart_cart', JSON.stringify(newItems));
//       return newItems;
//     });
//   };

//   // Handle removing item from cart
//   const removeFromCart = (productId) => {
//     setCartItems(prevItems => {
//       const newItems = prevItems.filter(item => item.id !== productId);
//       localStorage.setItem('vapesmart_cart', JSON.stringify(newItems));
//       return newItems;
//     });
//     setToast({ type: 'info', message: 'Item removed from cart' });
//   };

//   // Clear toast after delay
//   useEffect(() => {
//     if (toast) {
//       const timer = setTimeout(() => setToast(null), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   // Filter products based on search and filters
//   const filteredProducts = useMemo(() => {
//     return PRODUCTS.filter(product => {
//       const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
//       const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
      
//       // Apply additional filters if any
//       const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
//         if (!value) return true;
//         return product[key] === value;
//       });
      
//       return matchesSearch && matchesCategory && matchesFilters;
//     });
//   }, [searchQuery, currentCategory, activeFilters]);

//   // Admin view
//   if (isAdminLoggedIn) {
//     return (
//       <div className="relative min-h-screen bg-gradient-to-b from-black via-darkPurple-950/20 to-black text-gray-100 overflow-hidden">
//         <VapeSmokeEffect />
//         <Navbar
//           user={adminUser}
//           onLogout={handleAdminLogout}
//           isAdmin={true}
//           onNavigate={setCurrentPage}
//         />
//         <AdminDashboard adminUser={adminUser} />
//       </div>
//     );
//   }

//   // Login/Signup view
//   if (!isLoggedIn) {
//     return <LoginSignup onLogin={handleLogin} />;
//   }

//   // Main app view
//   return (
//     <div className="relative min-h-screen bg-gradient-to-b from-black via-darkPurple-950/20 to-black text-gray-100 overflow-hidden">
//       <VapeSmokeEffect />
//       <Navbar
//         user={user}
//         onLogout={handleLogout}
//         currentCategory={currentCategory}
//         onCategoryChange={setCurrentCategory}
//         cartItemCount={cartItems.reduce((total, item) => total + (item.quantity || 1), 0)}
//         onNavigate={setCurrentPage}
//         onSearchChange={setSearchQuery}
//       />
      
//       <main className="container mx-auto px-4 py-8">
//         {currentPage === 'home' && (
//           <>
//             <LandingHero />
//             <ProductGrid 
//               products={filteredProducts} 
//               onProductClick={setSelected}
//               currentCategory={currentCategory}
//             />
//           </>
//         )}
        
//         {currentPage === 'account' && (
//           <AccountSection 
//             user={user} 
//             profile={customerProfile}
//             onUpdateProfile={setCustomerProfile}
//           />
//         )}
        
//         {currentPage === 'cart' && (
//           <CartPage 
//             cartItems={cartItems}
//             onUpdateQuantity={updateCartItemQuantity}
//             onRemoveItem={removeFromCart}
//             onCheckout={() => setCurrentPage('checkout')}
//           />
//         )}
        
//         {currentPage === 'checkout' && (
//           <PaymentPage 
//             cartItems={cartItems}
//             onPaymentSuccess={() => {
//               setCartItems([]);
//               localStorage.removeItem('vapesmart_cart');
//               setCurrentPage('account');
//               setToast({ type: 'success', message: 'Order placed successfully!' });
//             }}
//           />
//         )}
//       </main>

//       {selected && (
//         <ProductModal
//           product={selected}
//           onClose={() => setSelected(null)}
//           onAddToCart={handleAddToCart}
//         />
//       )}

//       {toast && (
//         <div className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg ${
//           toast.type === 'error' ? 'bg-red-600' : 
//           toast.type === 'success' ? 'bg-green-600' : 'bg-blue-600'
//         } text-white`}>
//           {toast.message}
//         </div>
//       )}
//     </div>
//   );
// }
//   const [currentCategory, setCurrentCategory] = useState('all')
//   const [activeFilters, setActiveFilters] = useState({})
//   const [searchQuery, setSearchQuery] = useState('') // Search query state
//   const [currentPage, setCurrentPage] = useState('home') // New state for current page
//   const [accountTab, setAccountTab] = useState('profile') // New state for account sub-page
//   const [cartItems, setCartItems] = useState(persistedState.cartItems) // State for cart items
//   const [toast, setToast] = useState(null) // Snackbar / toast notification state
//   const [customerProfile, setCustomerProfile] = useState(persistedState.profile) // Saved customer details for My Account
//   const [orders, setOrders] = useState(persistedState.orders) // Simple in-memory order history
//   const [pendingOrder, setPendingOrder] = useState(null) // Order pending payment
//   const [tempAdminBypass, setTempAdminBypass] = useState(false) // TEMPORARY: Admin bypass

//   const handleNavigate = (page, subPage = 'profile') => {
//     setCurrentPage(page)
//     if (page === 'account') {
//       setAccountTab(subPage)
//     }
//   }

//   useEffect(() => {
//     if (currentPage === 'home') {
//       const productsSection = document.getElementById('products');
//       if (productsSection) {
//         setTimeout(() => {
//           productsSection.scrollIntoView({ behavior: 'smooth' });
//         }, 500); // Increased delay to allow rendering and observe scroll
//       } else {
//         console.log('Products section not found.');
//       }
//     }
//   }, [currentPage]);

//   // Get featured products for landing page (limit to 12 best selling items)
//   const featuredProducts = useMemo(() => {
//     return PRODUCTS.filter(p => p.isBestSelling).slice(0, 3)
//   }, [])

//   const floatingItems = [
//     { src: '/images/elfbar-pineapple.png', title: 'Elfbar BC20000', flavor: 'Pineapple Ice' },
//     { src: '/images/elfbar-pineapple-clear.png', title: 'Elfbar BC20000', flavor: 'Pineapple Ice (Clear)' },
//     { src: '/images/Screenshot_20250127_143406_Chrome-300x300-removebg-preview.png', title: 'Star Bar', flavor: 'Cosmic Mix' },
//     { src: '/images/elfbar-watermelon.png', title: 'Elfbar BC20000', flavor: 'Watermelon Ice' }
//   ]
  
//   const handleLogin = (userData) => {
//     setUser(userData)
//     setIsLoggedIn(true)
//     // Persist login state to localStorage
//     localStorage.setItem('vapesmart_user', JSON.stringify(userData))
//     localStorage.setItem('vapesmart_isLoggedIn', 'true')
//   }
  
//   const handleAdminLogin = (token, adminData) => {
//     setIsAdminLoggedIn(true);
//     setAdminUser(adminData);
//     setCurrentPage('adminDashboard');
    
//     // Persist admin login state
//     localStorage.setItem('vapesmart_adminToken', token);
//     localStorage.setItem('vapesmart_adminUser', JSON.stringify(adminData));
//     localStorage.setItem('vapesmart_isAdmin', 'true');
    
//     setToast({ type: 'success', message: 'Admin login successful' });
//   };

//   const handleAdminLogout = () => {
//     setIsAdminLoggedIn(false)
//     setAdminUser(null)
//     localStorage.removeItem('vapesmart_adminUser')
//     localStorage.removeItem('vapesmart_isAdmin')
//     localStorage.removeItem('vapesmart_adminToken')
//     setToast({ type: 'info', message: 'Admin logged out' })
//   }
  
//   const handleLogout = () => {
//     setIsLoggedIn(false)
//     setUser(null)
//     setIsAdminLoggedIn(false)
//     setAdminUser(null)
//     // Clear persisted data on logout
//     localStorage.removeItem('vapesmart_user')
//     localStorage.removeItem('vapesmart_isLoggedIn')
//     localStorage.removeItem('vapesmart_isAdmin')
//     localStorage.removeItem('vapesmart_adminUser')
//     localStorage.removeItem('vapesmart_cart')
//     localStorage.removeItem('vapesmart_orders')
//     localStorage.removeItem('vapesmart_profile')
//     // Clear state
//     setCartItems([])
//     setOrders([])
//     setCustomerProfile(null)
//     setToast({ type: 'info', message: 'You have been logged out' })
//   }

//   // Auto-hide toast after a short delay
//   useEffect(() => {
//     if (!toast) return
//     const timer = setTimeout(() => setToast(null), 2500)
//     return () => clearTimeout(timer)
//   }, [toast])

//   const handleFilterChange = (filter) => {
//     if (filter.type === 'clear') {
//       setActiveFilters({})
//     } else if (filter.value === null) {
//       // Remove filter when value is null
//       setActiveFilters(prev => {
//         const newFilters = { ...prev }
//         delete newFilters[filter.type]
//         return newFilters
//       })
//     } else {
//       setActiveFilters(prev => ({
//         ...prev,
//         [filter.type]: filter.value
//       }))
//     }
//   }

//   const handleAddToCart = (product, quantity = 1, { redirectToCart = false } = {}) => {
//     let previousCart = []
//     setCartItems(prevItems => {
//       previousCart = prevItems
//       const existingItem = prevItems.find(item => item.id === product.id)
//       const newCart = existingItem
//         ? prevItems.map(item => 
//             item.id === product.id ? { ...item, quantity: (item.quantity || 0) + quantity } : item
//           )
//         : [...prevItems, { ...product, quantity }]
//       // Persist cart to localStorage
//       localStorage.setItem('vapesmart_cart', JSON.stringify(newCart))
//       return newCart
//     })

//     setToast({
//       type: 'success',
//       message: `${product.series || product.name || 'Item'} added to cart`,
//       actionLabel: 'Undo',
//       onAction: () => {
//         setCartItems(previousCart)
//         localStorage.setItem('vapesmart_cart', JSON.stringify(previousCart))
//       }
//     })

//     if (redirectToCart) {
//     setCurrentPage('cart')
//     }
//   }

//   const handleUpdateCartQuantity = (productId, quantity) => {
//     setCartItems(prevItems => {
//       const newCart = quantity <= 0
//         ? prevItems.filter(item => item.id !== productId)
//         : prevItems.map(item => 
//         item.id === productId ? { ...item, quantity } : item
//       )
//       // Persist cart to localStorage
//       localStorage.setItem('vapesmart_cart', JSON.stringify(newCart))
//       return newCart
//     })
//   }

//   const handleRemoveFromCart = (productId) => {
//     setCartItems(prevItems => {
//       const newCart = prevItems.filter(item => item.id !== productId)
//       // Persist cart to localStorage
//       localStorage.setItem('vapesmart_cart', JSON.stringify(newCart))
//       return newCart
//     })
//     setToast({
//       type: 'info',
//       message: 'Item removed from cart',
//     })
//   }

//   const handleCheckout = () => {
//     if (cartItems.length === 0) {
//       setToast({ type: 'error', message: 'Your cart is empty' })
//       return
//     }

//     if (!customerProfile) {
//       setToast({ 
//         type: 'error', 
//         message: 'Please complete your profile first',
//         subTitle: 'Go to My Account to add your details'
//       })
//       setCurrentPage('account')
//       setAccountTab('profile')
//       return
//     }

//     const total = cartItems.reduce(
//       (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
//       0
//     )

//     // Create pending order (will be confirmed after payment)
//     const pendingOrderData = {
//       id: Date.now(),
//       items: [...cartItems],
//       total,
//       customerProfile: { ...customerProfile },
//     }

//     setPendingOrder(pendingOrderData)
//     setCurrentPage('payment')
//   }

//   const handlePaymentSuccess = (paymentData) => {
//     if (!pendingOrder) return

//     // Generate tracking number
//     const trackingNumber = `TRK${Date.now()}${Math.floor(Math.random() * 10000)}`
//     const now = new Date().toISOString()

//     // Create confirmed order with full details
//     const newOrder = {
//       id: pendingOrder.id,
//       orderNumber: `ORD${pendingOrder.id}`,
//       trackingNumber,
//       placedAt: now,
//       items: pendingOrder.items,
//       total: pendingOrder.total,
//       status: 'processing', // processing -> shipped -> delivered
//       paymentStatus: paymentData.paymentStatus || 'completed',
//       paymentMethod: paymentData.paymentMethod || 'card',
//       transactionId: paymentData.transactionId,
//       paidAt: paymentData.paidAt,
//       shippingAddress: pendingOrder.customerProfile.address || '',
//       // Tracking timeline
//       timeline: [
//         { status: 'order_placed', timestamp: now, message: 'Order placed successfully' },
//         ...(paymentData.paymentMethod === 'cod' 
//           ? [{ status: 'payment_pending', timestamp: now, message: 'Payment pending - Cash on Delivery' }]
//           : paymentData.paidAt 
//             ? [{ status: 'payment_completed', timestamp: paymentData.paidAt, message: 'Payment completed' }]
//             : []
//         ),
//         { status: 'processing', timestamp: now, message: 'Order is being processed' },
//       ],
//     }

//     setOrders(prev => {
//       const newOrders = [newOrder, ...prev]
//       // Persist orders to localStorage
//       localStorage.setItem('vapesmart_orders', JSON.stringify(newOrders))
//       return newOrders
//     })
//     setCartItems([])
//     localStorage.setItem('vapesmart_cart', JSON.stringify([]))
//     setPendingOrder(null)
//     setToast({ 
//       type: 'success', 
//       message: 'Order placed successfully!',
//       subTitle: `Tracking: ${trackingNumber}`
//     })
//     setCurrentPage('account')
//     setAccountTab('orders')

//     // Simulate order progression: Update status after delays
//     // After 5 seconds, mark as shipped
//     setTimeout(() => {
//       setOrders(prev => prev.map(order => 
//         order.id === newOrder.id 
//           ? {
//               ...order,
//               status: 'shipped',
//               timeline: [
//                 ...order.timeline,
//                 { 
//                   status: 'shipped', 
//                   timestamp: new Date().toISOString(), 
//                   message: 'Order has been shipped' 
//                 }
//               ]
//             }
//           : order
//       ))
//       setToast({
//         type: 'info',
//         message: `Order ${newOrder.orderNumber} has been shipped!`,
//         subTitle: `Track with: ${trackingNumber}`
//       })
//     }, 5000)

//     // After 15 seconds, mark as delivered
//     setTimeout(() => {
//       setOrders(prev => prev.map(order => 
//         order.id === newOrder.id 
//           ? {
//               ...order,
//               status: 'delivered',
//               timeline: [
//                 ...order.timeline,
//                 { 
//                   status: 'delivered', 
//                   timestamp: new Date().toISOString(), 
//                   message: 'Order has been delivered' 
//                 }
//               ]
//             }
//           : order
//       ))
//       setToast({
//         type: 'success',
//         message: `Order ${newOrder.orderNumber} has been delivered!`,
//       })
//     }, 15000)
//   }

//   const handlePaymentCancel = () => {
//     setPendingOrder(null)
//     setCurrentPage('cart')
//   }

//   // Filter products based on category, active filters, and search query
//   const filteredProducts = useMemo(() => {
//     let products = [...PRODUCTS]

//     // Filter by main category
//     if (currentCategory === 'all') {
//       // Show all products
//     } else if (currentCategory === 'most-selling') {
//       products = products.filter(p => p.isBestSelling)
//     } else if (currentCategory === 'podkits') {
//       products = products.filter(p => p.mainCategory === 'podkits')
//     } else if (currentCategory === 'disposable') {
//       products = products.filter(p => p.mainCategory === 'disposable')
//     } else if (currentCategory === 'nic-salts') {
//       products = products.filter(p => p.nicotine && p.nicotine.includes('mg'))
//     } else if (currentCategory === 'pods-coils') {
//       // Pods & Coils: try explicit mainCategory first, then fall back to type text
//       products = products.filter(p => {
//         if (p.mainCategory === 'pods-coils') return true
//         if (!p.type) return false
//         const t = p.type.toLowerCase()
//         return t.includes('pod') || t.includes('coil')
//       })
//     }

//     // Apply additional filters
//     if (activeFilters.brand) {
//       products = products.filter(p => p.brand === activeFilters.brand)
//     }

//     // Filter by sub-category (series) if brand is selected
//     if (activeFilters.brand && activeFilters.subCategory) {
//       products = products.filter(p => p.series === activeFilters.subCategory)
//     }

//     if (activeFilters.price) {
//       const { min, max } = activeFilters.price
//       products = products.filter(p => {
//         if (max === Infinity) {
//           return p.price >= min
//         }
//         return p.price >= min && p.price <= max
//       })
//     }

//     if (activeFilters.puffs) {
//       const { min, max } = activeFilters.puffs
//       products = products.filter(p => {
//         if (!p.puffs) return false
//         if (max === Infinity) {
//           return p.puffs >= min
//         }
//         return p.puffs >= min && p.puffs <= max
//       })
//     }

//     // Optional: flavour-specific filter (used by View Flavours button)
//     if (activeFilters.flavorOnly) {
//       products = products.filter(p => !!p.flavor)
//     }

//     // Apply search query filter
//     if (searchQuery.trim()) {
//       const query = searchQuery.toLowerCase().trim()
//       products = products.filter(p => {
//         // Search in multiple fields
//         const searchFields = [
//           p.brand?.toLowerCase() || '',
//           p.series?.toLowerCase() || '',
//           p.name?.toLowerCase() || '',
//           p.flavor?.toLowerCase() || '',
//           p.type?.toLowerCase() || '',
//           p.features?.toLowerCase() || '',
//           p.short?.toLowerCase() || '',
//           p.puffs?.toString() || '',
//           p.nicotine?.toLowerCase() || '',
//         ]
        
//         // Check if any field contains the search query
//         return searchFields.some(field => field.includes(query))
//       })
//     }

//     return products
//   }, [currentCategory, activeFilters, searchQuery])

//   const hasActiveFilters = Object.keys(activeFilters).length > 0

//   // Determine which products to display based on category and active filters
//   const displayProducts = useMemo(() => {
//     // Always base the grid on the filtered list so "Shop Now" truly shows all,
//     // and any filters (including flavour) are respected.
//     return filteredProducts;
//   }, [filteredProducts]);
  
//   if (tempAdminBypass) {
//     return (
//       <div className="relative min-h-screen bg-gradient-to-b from-black via-darkPurple-950/20 to-black text-gray-100 overflow-hidden">
//         {/* Site-wide subtle vape smoke background */}
//         <div className="fixed inset-0 -z-10 pointer-events-none opacity-80">
//           <VapeSmokeEffect density={40} speed={0.4} opacity={0.35} />
//         </div>
//         <Navbar
//           user={adminUser} // Use adminUser for Navbar even in bypass
//           onLogout={handleAdminLogout}
//           isAdmin={true}
//           onNavigate={handleNavigate}
//           isAdminLoggedIn={isAdminLoggedIn}
//           adminUser={adminUser}
//           onAdminLogout={handleAdminLogout}
//           setTempAdminBypass={setTempAdminBypass} // Pass the setter
//         />
//         <AdminDashboard adminUser={adminUser} adminToken={localStorage.getItem('vapesmart_adminToken')} />
//       </div>
//     )
//   } else if (!isLoggedIn && currentPage !== 'adminLogin') {
//     return <LoginSignup onLogin={handleLogin} />
//   } else if (currentPage === 'adminLogin' && !isAdminLoggedIn) {
//     return <AdminLogin onAdminLogin={handleAdminLogin} />
//   } else if ((currentPage === 'adminLogin' || currentPage === 'adminDashboard') && isAdminLoggedIn) {
//     return (
//       <div className="relative min-h-screen bg-gradient-to-b from-black via-darkPurple-950/20 to-black text-gray-100 overflow-hidden">
//         {/* Site-wide subtle vape smoke background */}
//         <div className="fixed inset-0 -z-10 pointer-events-none opacity-80">
//           <VapeSmokeEffect density={40} speed={0.4} opacity={0.35} />
//         </div>
//         <Navbar
//           user={adminUser}
//           onLogout={handleAdminLogout}
//           isAdmin={true}
//           onNavigate={handleNavigate}
//           isAdminLoggedIn={isAdminLoggedIn}
//           adminUser={adminUser}
//           onAdminLogout={handleAdminLogout}
//           setTempAdminBypass={setTempAdminBypass} // Pass the setter
//         />
//         <AdminDashboard adminUser={adminUser} adminToken={localStorage.getItem('vapesmart_adminToken')} />
//       </div>
//     )
//   }
  
//   // Using the handleAdminLogin and handleAdminLogout functions defined earlier

//   // Render the appropriate interface based on login state
//   const renderContent = () => {
//     // Admin interface
//     if (isAdminLoggedIn) {
//       return (
//         <AdminDashboard 
//           adminUser={adminUser} 
//           onLogout={handleAdminLogout} 
//         />
//       );
//     }
    
//     // User interface
//     return (
//       <>
//         <Navbar
//           user={user}
//           onLogout={handleLogout}
//           currentCategory={currentCategory}
//           onCategoryChange={setCurrentCategory}
//           onFilterChange={handleFilterChange}
//           activeFilters={activeFilters}
//           cartItemCount={cartItems.reduce((total, item) => total + (item.quantity || 1), 0)}
//           onNavigate={setCurrentPage}
//           currentPage={currentPage}
//           searchQuery={searchQuery}
//           onSearchChange={setSearchQuery}
//           isAdminLoggedIn={isAdminLoggedIn}
//           adminUser={adminUser}
//           onAdminLogout={handleAdminLogout}
//         />

//         <main className="min-h-screen">
//           {currentPage === 'home' && (
//             <>
//               <LandingHero />
//               <section id="products" className="py-16 px-4 sm:px-6 lg:px-8">
//                 <ProductGrid 
//                   products={displayProducts} 
//                   onProductClick={setSelected} 
//                   onAddToCart={handleAddToCart}
//                   onFilterChange={handleFilterChange}
//                   activeFilters={activeFilters}
//                   hasActiveFilters={Object.keys(activeFilters).length > 0}
//                   onClearFilters={() => setActiveFilters({})}
//                 />
//               </section>
//             </>
//           )}

//           {currentPage === 'account' && (
//             <AccountSection 
//               user={user} 
//               orders={orders}
//               profile={customerProfile}
//               onUpdateProfile={setCustomerProfile}
//               activeTab={accountTab}
//               onTabChange={setAccountTab}
//             />
//           )}

//           {currentPage === 'cart' && (
//             <CartPage 
//               cartItems={cartItems}
//               onUpdateQuantity={handleUpdateCartQuantity}
//               onRemoveItem={handleRemoveFromCart}
//               onCheckout={handleCheckout}
//               onContinueShopping={() => setCurrentPage('home')}
//             />
//           )}

//           {currentPage === 'payment' && pendingOrder && (
//             <PaymentPage 
//               order={pendingOrder}
//               onPaymentSuccess={handlePaymentSuccess}
//               onPaymentCancel={handlePaymentCancel}
//             />
//           )}

//           {currentPage === 'adminLogin' && !isAdminLoggedIn && (
//             <AdminLogin onAdminLogin={handleAdminLogin} />
//           )}
//         </main>
//       </>
//     );
//   };

//   return (
//     <div className="relative min-h-screen bg-gradient-to-b from-black via-darkPurple-950/20 to-black text-gray-100 overflow-hidden">
//       {/* Site-wide subtle vape smoke background */}
//       <div className="fixed inset-0 -z-10 pointer-events-none opacity-80">
//         <VapeSmokeEffect density={40} speed={0.4} opacity={0.35} />
//       </div>
//       <Navbar 
//         user={user} 
//         onLogout={handleLogout}
//         currentCategory={currentCategory}
//         onCategoryChange={setCurrentCategory}
//         onFilterChange={handleFilterChange}
//         activeFilters={activeFilters}
//         onNavigate={handleNavigate} // Pass onNavigate to Navbar
//         cartItemCount={cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
//         searchQuery={searchQuery}
//         onSearchChange={setSearchQuery}
//         onAdminLogout={handleAdminLogout}
//         isAdminLoggedIn={isAdminLoggedIn}
//         adminUser={adminUser}
//         setTempAdminBypass={setTempAdminBypass} // Pass the setter for the bypass
//       />
//       {/* Simple toast notification for cart actions */}
//       {toast && (
//         <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] px-4">
//           <div className="flex items-center gap-4 bg-neutral-900/95 border border-neutral-700/60 rounded-2xl px-5 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.75)] min-w-[260px] max-w-md">
//             <div
//               className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold
//                 ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50' :
//                   toast.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-400/50' :
//                   'bg-sky-500/20 text-sky-300 border border-sky-400/50'}`}
//             >
//               {toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : 'i'}
//             </div>
//             <div className="flex-1">
//               <p className="text-sm font-semibold text-white">{toast.message}</p>
//               {toast.subTitle && (
//                 <p className="text-xs text-neutral-400 mt-0.5">{toast.subTitle}</p>
//               )}
//             </div>
//             {toast.actionLabel && toast.onAction && (
//               <button
//                 type="button"
//                 onClick={() => {
//                   toast.onAction?.()
//                   setToast(null)
//                 }}
//                 className="text-xs font-semibold text-yellowGradient-end hover:text-yellowGradient-start px-2 py-1 rounded-lg hover:bg-white/5"
//               >
//                 {toast.actionLabel}
//               </button>
//             )}
//             <button
//               type="button"
//               onClick={() => setToast(null)}
//               className="text-neutral-500 hover:text-neutral-300 text-xs"
//               aria-label="Close notification"
//             >
//               ×
//             </button>
//           </div>
//         </div>
//       )}
//       <main className="container mx-auto px-4 py-8 overflow-visible">
//         {currentPage === 'home' && (
//           <>
//             {currentCategory === 'all' && !hasActiveFilters && (
//               <LandingHero 
//                 onNavigate={handleNavigate}
//                 onCategoryChange={setCurrentCategory}
//                 onFilterChange={handleFilterChange}
//               />
//             )}
//             {featuredProducts.length > 0 && (
//               <div className="mt-12">
//                 <Hero3D
//                   product={featuredProducts[0]}
//                   onNavigate={handleNavigate}
//                   onCategoryChange={setCurrentCategory}
//                   onFilterChange={handleFilterChange}
//                   onOpenProduct={(p) => setSelected(p)}
//                 />
//               </div>
//             )}
//           </>
//         )}
//         {currentPage === 'home' && (
//           <section id="products" className="mt-12">
//             <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellowGradient-start via-yellowGradient-end to-yellowGradient-start bg-clip-text text-transparent">
//               {currentCategory === 'all' ? 'Featured Products' : MAIN_CATEGORIES[currentCategory] || 'Products'}
//             </h2>
//             <ProductGrid 
//               products={displayProducts} 
//               onOpen={(p)=>setSelected(p)}
//               category={currentCategory}
//               activeFilters={activeFilters}
//               onFilterChange={handleFilterChange}
//               onAddToCart={(product) => handleAddToCart(product, 1, { redirectToCart: false })} // Add to cart but stay on page
//             />
//           </section>
//         )}
//         {currentPage === 'account' && (
//           <AccountSection
//             activeTab={accountTab}
//             profile={customerProfile}
//             onSaveProfile={(saved) => {
//               setCustomerProfile(saved)
//               // Persist profile to localStorage
//               localStorage.setItem('vapesmart_profile', JSON.stringify(saved))
//               setToast({
//                 type: 'success',
//                 message: customerProfile ? 'Profile updated successfully' : 'Profile added successfully',
//               })
//             }}
//             orders={orders}
//             onNotify={(payload) => {
//               if (!payload) return
//               setToast({
//                 type: payload.type || 'info',
//                 message: payload.message || '',
//                 subTitle: payload.subTitle,
//               })
//             }}
//           />
//         )}
//         {currentPage === 'cart' && (
//           <CartPage 
//             cartItems={cartItems}
//             onUpdateQuantity={handleUpdateCartQuantity}
//             onRemoveItem={handleRemoveFromCart}
//             onCheckout={handleCheckout}
//           />
//         )}
//         {currentPage === 'payment' && pendingOrder && (
//           <PaymentPage
//             cartItems={pendingOrder.items}
//             total={pendingOrder.total}
//             customerProfile={pendingOrder.customerProfile}
//             onPaymentSuccess={handlePaymentSuccess}
//             onCancel={handlePaymentCancel}
//           />
//         )}
//       </main>
//       {selected && (
//         <ProductModal
//           product={selected}
//           onClose={() => setSelected(null)}
//           onAddToCart={(product) => handleAddToCart(product, 1, { redirectToCart: false })}
//           onBuyNow={(p) => {
//             handleAddToCart(p, 1, { redirectToCart: true })
//           }}
//         />
//       )}
//     </div>
//   )
// }


export default function App(){
  // Load persisted login state from localStorage
  const loadPersistedState = () => {
    try {
      const savedUser = localStorage.getItem('vapesmart_user')
      const savedLoginState = localStorage.getItem('vapesmart_isLoggedIn')
      const savedCart = localStorage.getItem('vapesmart_cart')
      const savedOrders = localStorage.getItem('vapesmart_orders')
      const savedProfile = localStorage.getItem('vapesmart_profile')
      
      return {
        user: savedUser ? JSON.parse(savedUser) : null,
        isLoggedIn: savedLoginState === 'true',
        isAdminLoggedIn: savedLoginState === 'true' && localStorage.getItem('vapesmart_isAdmin') === 'true',
        adminUser: savedLoginState === 'true' && localStorage.getItem('vapesmart_adminUser') ? JSON.parse(localStorage.getItem('vapesmart_adminUser')) : null,
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
        cartItems: [],
        orders: [],
        profile: null,
      }
    }
  }

  const persistedState = loadPersistedState()

  const [selected, setSelected] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(persistedState.isLoggedIn)
  const [user, setUser] = useState(persistedState.user)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(persistedState.isAdminLoggedIn)
  const [adminUser, setAdminUser] = useState(persistedState.adminUser)
  const [currentCategory, setCurrentCategory] = useState('all')
  const [activeFilters, setActiveFilters] = useState({})
  const [searchQuery, setSearchQuery] = useState('') // Search query state
  const [currentPage, setCurrentPage] = useState('home') // New state for current page
  const [accountTab, setAccountTab] = useState('profile') // New state for account sub-page
  const [cartItems, setCartItems] = useState(persistedState.cartItems) // State for cart items
  const [toast, setToast] = useState(null) // Snackbar / toast notification state
  const [customerProfile, setCustomerProfile] = useState(persistedState.profile) // Saved customer details for My Account
  const [orders, setOrders] = useState(persistedState.orders) // Simple in-memory order history
  const [pendingOrder, setPendingOrder] = useState(null) // Order pending payment
  const [tempAdminBypass, setTempAdminBypass] = useState(false) // TEMPORARY: Admin bypass

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
    // Persist login state to localStorage
    localStorage.setItem('vapesmart_user', JSON.stringify(userData))
    localStorage.setItem('vapesmart_isLoggedIn', 'true')
  }
  
  const handleAdminLogin = (token, adminData) => {
    setIsAdminLoggedIn(true);
    setAdminUser(adminData);
    setCurrentPage('adminDashboard');
    
    // Persist admin login state
    localStorage.setItem('vapesmart_adminToken', token);
    localStorage.setItem('vapesmart_adminUser', JSON.stringify(adminData));
    localStorage.setItem('vapesmart_isAdmin', 'true');
    
    setToast({ type: 'success', message: 'Admin login successful' });
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false)
    setAdminUser(null)
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
    // Clear persisted data on logout
    localStorage.removeItem('vapesmart_user')
    localStorage.removeItem('vapesmart_isLoggedIn')
    localStorage.removeItem('vapesmart_isAdmin')
    localStorage.removeItem('vapesmart_adminUser')
    localStorage.removeItem('vapesmart_cart')
    localStorage.removeItem('vapesmart_orders')
    localStorage.removeItem('vapesmart_profile')
    // Clear state
    setCartItems([])
    setOrders([])
    setCustomerProfile(null)
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
      const newCart = existingItem
        ? prevItems.map(item => 
            item.id === product.id ? { ...item, quantity: (item.quantity || 0) + quantity } : item
          )
        : [...prevItems, { ...product, quantity }]
      // Persist cart to localStorage
      localStorage.setItem('vapesmart_cart', JSON.stringify(newCart))
      return newCart
    })

    setToast({
      type: 'success',
      message: `${product.series || product.name || 'Item'} added to cart`,
      actionLabel: 'Undo',
      onAction: () => {
        setCartItems(previousCart)
        localStorage.setItem('vapesmart_cart', JSON.stringify(previousCart))
      }
    })

    if (redirectToCart) {
    setCurrentPage('cart')
    }
  }

  const handleUpdateCartQuantity = (productId, quantity) => {
    setCartItems(prevItems => {
      const newCart = quantity <= 0
        ? prevItems.filter(item => item.id !== productId)
        : prevItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
      // Persist cart to localStorage
      localStorage.setItem('vapesmart_cart', JSON.stringify(newCart))
      return newCart
    })
  }

  const handleRemoveFromCart = (productId) => {
    setCartItems(prevItems => {
      const newCart = prevItems.filter(item => item.id !== productId)
      // Persist cart to localStorage
      localStorage.setItem('vapesmart_cart', JSON.stringify(newCart))
      return newCart
    })
    setToast({
      type: 'info',
      message: 'Item removed from cart',
    })
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setToast({ type: 'error', message: 'Your cart is empty' })
      return
    }

    if (!customerProfile) {
      setToast({ 
        type: 'error', 
        message: 'Please complete your profile first',
        subTitle: 'Go to My Account to add your details'
      })
      setCurrentPage('account')
      setAccountTab('profile')
      return
    }

    const total = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    )

    // Create pending order (will be confirmed after payment)
    const pendingOrderData = {
      id: Date.now(),
      items: [...cartItems],
      total,
      customerProfile: { ...customerProfile },
    }

    setPendingOrder(pendingOrderData)
    setCurrentPage('payment')
  }

  const handlePaymentSuccess = (paymentData) => {
    if (!pendingOrder) return

    // Generate tracking number
    const trackingNumber = `TRK${Date.now()}${Math.floor(Math.random() * 10000)}`
    const now = new Date().toISOString()

    // Create confirmed order with full details
    const newOrder = {
      id: pendingOrder.id,
      orderNumber: `ORD${pendingOrder.id}`,
      trackingNumber,
      placedAt: now,
      items: pendingOrder.items,
      total: pendingOrder.total,
      status: 'processing', // processing -> shipped -> delivered
      paymentStatus: paymentData.paymentStatus || 'completed',
      paymentMethod: paymentData.paymentMethod || 'card',
      transactionId: paymentData.transactionId,
      paidAt: paymentData.paidAt,
      shippingAddress: pendingOrder.customerProfile.address || '',
      // Tracking timeline
      timeline: [
        { status: 'order_placed', timestamp: now, message: 'Order placed successfully' },
        ...(paymentData.paymentMethod === 'cod' 
          ? [{ status: 'payment_pending', timestamp: now, message: 'Payment pending - Cash on Delivery' }]
          : paymentData.paidAt 
            ? [{ status: 'payment_completed', timestamp: paymentData.paidAt, message: 'Payment completed' }]
            : []
        ),
        { status: 'processing', timestamp: now, message: 'Order is being processed' },
      ],
    }

    setOrders(prev => {
      const newOrders = [newOrder, ...prev]
      // Persist orders to localStorage
      localStorage.setItem('vapesmart_orders', JSON.stringify(newOrders))
      return newOrders
    })
    setCartItems([])
    localStorage.setItem('vapesmart_cart', JSON.stringify([]))
    setPendingOrder(null)
    setToast({ 
      type: 'success', 
      message: 'Order placed successfully!',
      subTitle: `Tracking: ${trackingNumber}`
    })
    setCurrentPage('account')
    setAccountTab('orders')

    // Simulate order progression: Update status after delays
    // After 5 seconds, mark as shipped
    setTimeout(() => {
      setOrders(prev => prev.map(order => 
        order.id === newOrder.id 
          ? {
              ...order,
              status: 'shipped',
              timeline: [
                ...order.timeline,
                { 
                  status: 'shipped', 
                  timestamp: new Date().toISOString(), 
                  message: 'Order has been shipped' 
                }
              ]
            }
          : order
      ))
      setToast({
        type: 'info',
        message: `Order ${newOrder.orderNumber} has been shipped!`,
        subTitle: `Track with: ${trackingNumber}`
      })
    }, 5000)

    // After 15 seconds, mark as delivered
    setTimeout(() => {
      setOrders(prev => prev.map(order => 
        order.id === newOrder.id 
          ? {
              ...order,
              status: 'delivered',
              timeline: [
                ...order.timeline,
                { 
                  status: 'delivered', 
                  timestamp: new Date().toISOString(), 
                  message: 'Order has been delivered' 
                }
              ]
            }
          : order
      ))
      setToast({
        type: 'success',
        message: `Order ${newOrder.orderNumber} has been delivered!`,
      })
    }, 15000)
  }

  const handlePaymentCancel = () => {
    setPendingOrder(null)
    setCurrentPage('cart')
  }

  // Filter products based on category, active filters, and search query
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

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      products = products.filter(p => {
        // Search in multiple fields
        const searchFields = [
          p.brand?.toLowerCase() || '',
          p.series?.toLowerCase() || '',
          p.name?.toLowerCase() || '',
          p.flavor?.toLowerCase() || '',
          p.type?.toLowerCase() || '',
          p.features?.toLowerCase() || '',
          p.short?.toLowerCase() || '',
          p.puffs?.toString() || '',
          p.nicotine?.toLowerCase() || '',
        ]
        
        // Check if any field contains the search query
        return searchFields.some(field => field.includes(query))
      })
    }

    return products
  }, [currentCategory, activeFilters, searchQuery])

  const hasActiveFilters = Object.keys(activeFilters).length > 0

  // Determine which products to display based on category and active filters
  const displayProducts = useMemo(() => {
    // Always base the grid on the filtered list so "Shop Now" truly shows all,
    // and any filters (including flavour) are respected.
    return filteredProducts;
  }, [filteredProducts]);
  
  if (tempAdminBypass) {
    return (
      <div className="relative min-h-screen bg-gradient-to-b from-black via-darkPurple-950/20 to-black text-gray-100 overflow-hidden">
        {/* Site-wide subtle vape smoke background */}
        <div className="fixed inset-0 -z-10 pointer-events-none opacity-80">
          <VapeSmokeEffect density={40} speed={0.4} opacity={0.35} />
        </div>
        <Navbar
          user={adminUser} // Use adminUser for Navbar even in bypass
          onLogout={handleAdminLogout}
          isAdmin={true}
          onNavigate={handleNavigate}
          isAdminLoggedIn={isAdminLoggedIn}
          adminUser={adminUser}
          onAdminLogout={handleAdminLogout}
          setTempAdminBypass={setTempAdminBypass} // Pass the setter
        />
        <AdminDashboard adminUser={adminUser} adminToken={localStorage.getItem('vapesmart_adminToken')} />
      </div>
    )
  } else if (!isLoggedIn && currentPage !== 'adminLogin') {
    return <LoginSignup onLogin={handleLogin} />
  } else if (currentPage === 'adminLogin' && !isAdminLoggedIn) {
    return <AdminLogin onAdminLogin={handleAdminLogin} />
  } else if ((currentPage === 'adminLogin' || currentPage === 'adminDashboard') && isAdminLoggedIn) {
    return (
      <div className="relative min-h-screen bg-gradient-to-b from-black via-darkPurple-950/20 to-black text-gray-100 overflow-hidden">
        {/* Site-wide subtle vape smoke background */}
        <div className="fixed inset-0 -z-10 pointer-events-none opacity-80">
          <VapeSmokeEffect density={40} speed={0.4} opacity={0.35} />
        </div>
        <Navbar
          user={adminUser}
          onLogout={handleAdminLogout}
          isAdmin={true}
          onNavigate={handleNavigate}
          isAdminLoggedIn={isAdminLoggedIn}
          adminUser={adminUser}
          onAdminLogout={handleAdminLogout}
          setTempAdminBypass={setTempAdminBypass} // Pass the setter
        />
        <AdminDashboard adminUser={adminUser} adminToken={localStorage.getItem('vapesmart_adminToken')} />
      </div>
    )
  }
  
  // Using the handleAdminLogin and handleAdminLogout functions defined earlier

  // Render the appropriate interface based on login state
  const renderContent = () => {
    // Admin interface
    if (isAdminLoggedIn) {
      return (
        <AdminDashboard 
          adminUser={adminUser} 
          onLogout={handleAdminLogout} 
        />
      );
    }
    
    // User interface
    return (
      <>
        <Navbar
          user={user}
          onLogout={handleLogout}
          currentCategory={currentCategory}
          onCategoryChange={setCurrentCategory}
          onFilterChange={handleFilterChange}
          activeFilters={activeFilters}
          cartItemCount={cartItems.reduce((total, item) => total + (item.quantity || 1), 0)}
          onNavigate={setCurrentPage}
          currentPage={currentPage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isAdminLoggedIn={isAdminLoggedIn}
          adminUser={adminUser}
          onAdminLogout={handleAdminLogout}
        />

        <main className="min-h-screen">
          {currentPage === 'home' && (
            <>
              <LandingHero />
              <section id="products" className="py-16 px-4 sm:px-6 lg:px-8">
                <ProductGrid 
                  products={displayProducts} 
                  onProductClick={setSelected} 
                  onAddToCart={handleAddToCart}
                  onFilterChange={handleFilterChange}
                  activeFilters={activeFilters}
                  hasActiveFilters={Object.keys(activeFilters).length > 0}
                  onClearFilters={() => setActiveFilters({})}
                />
              </section>
            </>
          )}

          {currentPage === 'account' && (
            <AccountSection 
              user={user} 
              orders={orders}
              profile={customerProfile}
              onUpdateProfile={setCustomerProfile}
              activeTab={accountTab}
              onTabChange={setAccountTab}
            />
          )}

          {currentPage === 'cart' && (
            <CartPage 
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveFromCart}
              onCheckout={handleCheckout}
              onContinueShopping={() => setCurrentPage('home')}
            />
          )}

          {currentPage === 'payment' && pendingOrder && (
            <PaymentPage 
              order={pendingOrder}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentCancel={handlePaymentCancel}
            />
          )}

          {currentPage === 'adminLogin' && !isAdminLoggedIn && (
            <AdminLogin onAdminLogin={handleAdminLogin} />
          )}
        </main>
      </>
    );
  };

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
        onNavigate={handleNavigate}
        cartItemCount={cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAdminLoggedIn={isAdminLoggedIn}
        adminUser={adminUser}
        onAdminLogout={handleAdminLogout}
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
              // Persist profile to localStorage
              localStorage.setItem('vapesmart_profile', JSON.stringify(saved))
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
        {currentPage === 'payment' && pendingOrder && (
          <PaymentPage
            cartItems={pendingOrder.items}
            total={pendingOrder.total}
            customerProfile={pendingOrder.customerProfile}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
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

