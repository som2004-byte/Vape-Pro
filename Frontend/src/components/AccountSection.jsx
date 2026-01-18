import React, { useState, useEffect } from 'react';
import VapeSmokeEffect from './VapeSmokeEffect';
import { API_ENDPOINTS, apiCall, getAuthHeaders } from '../utils/apiConfig';

export default function AccountSection({
  activeTab = 'profile',
  profile,
  onSaveProfile,
  orders = [],
  products = [],
  onNotify,
}) {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [editMode, setEditMode] = useState(!profile);

  // Basic Info State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Current Address Form State
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    houseNo: '',
    building: '',
    landmark: '',
    receiverName: '',
    receiverPhone: '',
  });

  // Verification States
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [devOtp, setDevOtp] = useState(null);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || '');
    setEmail(profile.email || '');
    setPhoneNumber(profile.phoneNumber || '');
    setAddresses(profile.addresses || []);
    setIsEmailVerified(profile.emailVerified === true);

    // If they have the old single address string, migrate it to the list if list is empty
    if ((!profile.addresses || profile.addresses.length === 0) && profile.address) {
      setAddresses([{
        id: Date.now(),
        label: 'Primary',
        houseNo: '',
        building: profile.address,
        landmark: '',
        receiverName: profile.name || '',
        receiverPhone: profile.phoneNumber || '',
        isDefault: true
      }]);
    }
  }, [profile]);

  useEffect(() => {
    setCurrentTab(activeTab || 'profile');
  }, [activeTab]);

  const handleRequestOtp = async () => {
    try {
      setVerifying(true);
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail || !trimmedEmail.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      await apiCall(API_ENDPOINTS.USER.VERIFY_EMAIL, {
        method: 'POST',
        headers: getAuthHeaders(localStorage.getItem('token')),
        body: JSON.stringify({ email: trimmedEmail, purpose: 'email_verification' }),
      });

      setShowEmailOtpInput(true);
      setOtpSent(true);
      onNotify?.({ type: 'success', message: 'OTP sent!', subTitle: `Check ${trimmedEmail}` });
    } catch (err) {
      if (err.dev_otp) {
        setDevOtp(err.dev_otp);
        onNotify?.({ type: 'info', message: 'Email Service Bypass', subTitle: `Use OTP: ${err.dev_otp}` });
        setShowEmailOtpInput(true);
        setOtpSent(true);
      } else {
        onNotify?.({ type: 'error', message: 'OTP Failed', subTitle: err.message });
      }
    } finally {
      setVerifying(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setVerifying(true);
      if (!emailOtp || emailOtp.length < 6) throw new Error('Please enter 6-digit OTP');

      await apiCall(API_ENDPOINTS.USER.VERIFY_OTP, {
        method: 'POST',
        headers: getAuthHeaders(localStorage.getItem('token')),
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: emailOtp, purpose: 'email_verification' }),
      });

      setIsEmailVerified(true);
      setShowEmailOtpInput(false);
      setEmailOtp('');
      onNotify?.({ type: 'success', message: 'Email verified successfully' });
    } catch (err) {
      onNotify?.({ type: 'error', message: 'Verification failed', subTitle: err.message });
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveAddress = () => {
    if (!addressForm.houseNo || !addressForm.building || !addressForm.receiverName || !addressForm.receiverPhone) {
      onNotify?.({ type: 'error', message: 'Missing fields', subTitle: 'Please fill all required fields' });
      return;
    }

    const newAddress = {
      ...addressForm,
      _id: editingAddressId || `temp-${Date.now()}`,
      isDefault: addresses.length === 0 || addressForm.isDefault
    };

    let updatedAddresses;
    if (editingAddressId) {
      updatedAddresses = addresses.map(addr => (addr._id === editingAddressId || addr.id === editingAddressId) ? newAddress : addr);
    } else {
      updatedAddresses = [...addresses, newAddress];
    }

    setAddresses(updatedAddresses);
    setIsAddingAddress(false);
    setEditingAddressId(null);
    setAddressForm({ label: 'Home', houseNo: '', building: '', landmark: '', receiverName: name, receiverPhone: phoneNumber });
    onNotify?.({ type: 'success', message: 'Address saved locally', subTitle: 'Remember to save profile to persist changes' });
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter(a => (a._id || a.id) !== id));
  };

  const handleSubmitProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) return onNotify?.({ type: 'error', message: 'Name is required' });
    if (!isEmailVerified) return onNotify?.({ type: 'error', message: 'Verify email first' });
    if (addresses.length === 0) return onNotify?.({ type: 'error', message: 'Add at least one address' });

    const saved = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(), // Use phoneNumber to match profile schema
      addresses: addresses,
      address: addresses[0] ? `${addresses[0].houseNo ? addresses[0].houseNo + ', ' : ''}${addresses[0].building}${addresses[0].landmark ? ', ' + addresses[0].landmark : ''}` : '',
      emailVerified: isEmailVerified,
      phoneVerified: true
    };

    onSaveProfile?.(saved);
    setEditMode(false);
  };

  return (
    <div className="relative min-h-screen bg-black">
      {/* Premium Background */}
      <div className="fixed inset-0 z-0">
        <video className="w-full h-full object-cover opacity-40 blur-[2px]" src="/videos/login-bg.mp4" autoPlay muted loop playsInline />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <VapeSmokeEffect density={30} speed={0.5} opacity={0.4} />
      </div>

      <div className="relative z-10 pt-28 pb-12 px-4 container mx-auto max-w-4xl">
        <div className="bg-neutral-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col md:flex-row">

          {/* Sidebar Navigation */}
          <div className="w-full md:w-72 bg-black/60 border-b md:border-b-0 md:border-r border-white/5 p-8 space-y-3">
            <div className="mb-10 px-2">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">My Account</h2>
              <div className="h-1 w-12 bg-cyan-500 mt-2 rounded-full" />
            </div>

            <button
              onClick={() => setCurrentTab('profile')}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group ${currentTab === 'profile' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-4">
                <svg className={`w-5 h-5 transition-transform duration-300 ${currentTab === 'profile' ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="font-bold text-sm uppercase tracking-widest">Profile</span>
              </div>
              {currentTab === 'profile' && <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />}
            </button>

            <button
              onClick={() => setCurrentTab('orders')}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group ${currentTab === 'orders' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-4">
                <svg className={`w-5 h-5 transition-transform duration-300 ${currentTab === 'orders' ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                <span className="font-bold text-sm uppercase tracking-widest">Orders</span>
              </div>
            </button>
            <button
              onClick={() => setCurrentTab('addresses')}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group ${currentTab === 'addresses' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-4">
                <svg className={`w-5 h-5 transition-transform duration-300 ${currentTab === 'addresses' ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="font-bold text-sm uppercase tracking-widest">Addresses</span>
              </div>
              {currentTab === 'addresses' && <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />}
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 md:p-10 overflow-y-auto max-h-[85vh]">

            {currentTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Personal Info</h3>
                    <p className="text-gray-400 text-sm mt-1">Manage your identity and addresses</p>
                  </div>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-6 py-2 rounded-full border border-cyan-500/30 text-cyan-400 text-sm font-bold hover:bg-cyan-500 hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    >
                      EDIT DETAILS
                    </button>
                  )}
                </div>

                {!editMode ? (
                  /* Summary View */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Full Name</label>
                        <p className="text-white text-lg font-bold truncate">{profile?.name || '--'}</p>
                      </div>

                      <div className="bg-white/5 rounded-2xl p-5 border border-white/5 relative group overflow-hidden">
                        <div className="pr-16">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Email</label>
                          <p className="text-white text-lg font-bold break-all leading-tight">{profile?.email || '--'}</p>
                        </div>
                        {isEmailVerified && (
                          <div className="absolute top-5 right-5">
                            <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                              Verified
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Phone</label>
                        <p className="text-white text-lg font-bold">{profile?.phoneNumber || '--'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">Saved Addresses</label>
                      {addresses.length === 0 ? (
                        <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-8 text-center">
                          <p className="text-gray-500 text-sm font-medium">No addresses saved yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {addresses.map((addr) => (
                            <div key={addr._id || addr.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 relative group hover:border-cyan-500/30 transition-all duration-300">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="text-[9px] font-black uppercase tracking-widest bg-cyan-500 text-black px-2 py-0.5 rounded-md">
                                  {addr.label || 'Home'}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                                    <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-white text-sm font-bold leading-relaxed pr-8 line-clamp-2">
                                {addr.houseNo ? addr.houseNo + ', ' : ''}{addr.building}
                              </p>
                              {addr.landmark && (
                                <p className="text-gray-400 text-xs mt-1 italic opacity-80">{addr.landmark}</p>
                              )}
                              <div className="mt-4 pt-3 border-t border-white/5">
                                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">
                                  {addr.receiverName || profile?.name} · <span className="text-gray-400">{addr.receiverPhone || profile?.phoneNumber}</span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Edit Form */
                  <form onSubmit={handleSubmitProfile} className="space-y-8 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium"
                          placeholder="Your Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={e => setPhoneNumber(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium"
                          placeholder="10-digit primary phone"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={e => {
                            setEmail(e.target.value);
                            setIsEmailVerified(false);
                            setOtpSent(false);
                            setShowEmailOtpInput(false);
                          }}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium"
                          placeholder="email@example.com"
                        />
                        {!isEmailVerified && !showEmailOtpInput && (
                          <button
                            type="button"
                            onClick={handleRequestOtp}
                            disabled={verifying}
                            className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 rounded-xl font-bold text-xs uppercase transition-all disabled:opacity-50"
                          >
                            {verifying ? '...' : 'Verify'}
                          </button>
                        )}
                      </div>

                      {showEmailOtpInput && !isEmailVerified && (
                        <div className="mt-4 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95">
                          <input
                            type="text"
                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white center font-mono tracking-widest"
                            placeholder="OTP"
                            value={emailOtp}
                            onChange={e => setEmailOtp(e.target.value.slice(0, 6))}
                          />
                          <button
                            type="button"
                            onClick={verifyOtp}
                            className="bg-white text-black px-4 py-2 rounded-lg font-bold text-xs uppercase"
                          >
                            CONFIRM
                          </button>
                        </div>
                      )}
                      {devOtp && (
                        <p className="text-cyan-400 text-[10px] font-mono mt-1 opacity-60">TEST MODE: Your OTP is {devOtp}</p>
                      )}
                    </div>

                    {/* Multi-Address Management */}
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Addresses</label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingAddress(true);
                            setAddressForm({ label: 'Home', houseNo: '', building: '', landmark: '', receiverName: name, receiverPhone: phoneNumber });
                          }}
                          className="text-cyan-400 text-xs font-bold flex items-center gap-1 hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          ADD NEW
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {addresses.map(addr => (
                          <div key={addr._id || addr.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                              <div className="bg-cyan-500/20 h-10 w-10 rounded-full flex items-center justify-center text-cyan-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-white text-sm font-bold">{addr.label}</p>
                                  <span className="text-gray-500 text-[10px] font-medium leading-none mt-0.5">{addr.houseNo}</span>
                                </div>
                                <p className="text-gray-400 text-xs truncate max-w-[200px]">{addr.building}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr._id || addr.id)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 transition-all"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button
                        type="submit"
                        disabled={!isEmailVerified}
                        className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
                      >
                        SAVE ALL CHANGES
                      </button>
                      {profile && (
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          className="px-8 border border-white/10 text-gray-400 hover:text-white rounded-2xl font-bold text-xs uppercase transition-all"
                        >
                          CANCEL
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

            {currentTab === 'orders' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Order History</h3>
                    <p className="text-gray-400 text-sm mt-1">Track your deliveries and sessions</p>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl opacity-60">
                    <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    <p className="text-gray-400 font-medium">No orders discovered yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order._id || order.id} className="bg-black/20 border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                          <div>
                            <p className="text-cyan-400 font-mono text-[10px] uppercase font-bold tracking-widest">ORDER #{(order.orderNumber || (order._id || '------').slice(-6)).toUpperCase()}</p>
                            <p className="text-white font-bold mt-1">{new Date(order.placedAt || order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              order.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                              }`}>
                              {order.status || 'Processing'}
                            </span>
                            <p className="text-gray-500 text-[10px] mt-2 font-bold tracking-wide">{order.paymentMethod?.toUpperCase()} · {order.paymentStatus === 'completed' ? 'PAID' : 'PENDING'}</p>
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          {(order.items || []).map((item, idx) => {
                            // Clean names and heal prices
                            let cleanName = (item.name || item.series || 'Product').replace(/\s*-\s*null/gi, '').replace(/null/gi, '').trim();
                            if (item.flavor && item.flavor.toLowerCase() !== 'null') {
                              cleanName += ` · ${item.flavor}`;
                            }
                            // Heal zero price using backendProducts if available
                            let itemPrice = (item.price && item.price > 0) ? item.price : 0;

                            if (itemPrice === 0) {
                              // Try to find product in the passed products list
                              const prodId = item.productId || item.product || item.id;
                              const p = products.find(p =>
                                (p._id && p._id.toString() === prodId?.toString()) ||
                                (p.id && p.id.toString() === prodId?.toString()) ||
                                (p.sku && p.sku === prodId)
                              );

                              if (p && p.price) {
                                itemPrice = p.price;
                              } else if (item.name) {
                                // Fallback by name
                                const pByName = products.find(p => p.name === item.name);
                                if (pByName && pByName.price) itemPrice = pByName.price;
                              }
                            }

                            return (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3">
                                  <div className="h-4 w-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-[10px] font-black">{item.quantity}</div>
                                  <span className="text-gray-300">{cleanName}</span>
                                </div>
                                <span className="text-white font-mono font-bold">₹{(itemPrice * (item.quantity || 1)).toLocaleString()}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                          <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Amount</span>
                          <span className="text-2xl font-black text-white">
                            ₹{(order.total && order.total > 0 ? order.total : (order.items || []).reduce((sum, item) => {
                              let startPrice = (item.price && item.price > 0) ? item.price : 0;
                              if (startPrice === 0) {
                                const prodId = item.productId || item.product || item.id;
                                const p = products.find(p =>
                                  (p._id && p._id.toString() === prodId?.toString()) ||
                                  (p.id && p.id.toString() === prodId?.toString()) ||
                                  (p.sku && p.sku === prodId)
                                );
                                if (p && p.price) startPrice = p.price;
                                else if (item.name) {
                                  const pByName = products.find(p => p.name === item.name);
                                  if (pByName && pByName.price) startPrice = pByName.price;
                                }
                              }
                              return sum + (startPrice * (item.quantity || 1));
                            }, 0)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentTab === 'addresses' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Saved Addresses</h3>
                    <p className="text-gray-400 text-sm mt-1">Manage your delivery locations</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsAddingAddress(true);
                      setAddressForm({ label: 'Home', houseNo: '', building: '', landmark: '', receiverName: name, receiverPhone: phoneNumber });
                    }}
                    className="flex items-center gap-2 px-6 py-2 rounded-full border border-cyan-500/30 text-cyan-400 text-sm font-bold hover:bg-cyan-500 hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    ADD NEW
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl opacity-60">
                    <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <p className="text-gray-400 font-medium">No addresses saved yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr._id || addr.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 relative group hover:border-cyan-500/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest bg-cyan-500 text-black px-2.5 py-1 rounded-md">
                            {addr.label || 'Home'}
                          </span>
                          <div className="flex gap-2">
                            {addr.isDefault && (
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Default
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteAddress(addr._id || addr.id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                              title="Delete Address"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>

                        <p className="text-white text-lg font-bold leading-snug mb-2">
                          {addr.houseNo ? addr.houseNo + ', ' : ''}{addr.building}
                        </p>

                        {addr.landmark && (
                          <p className="text-gray-400 text-sm italic opacity-80 mb-4 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {addr.landmark}
                          </p>
                        )}

                        <div className="pt-4 border-t border-white/5 mt-auto">
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <span className="text-cyan-400">{addr.receiverName || profile?.name}</span>
                            <span>•</span>
                            <span className="text-gray-300 font-mono text-xs">{addr.receiverPhone || profile?.phoneNumber}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Add Address Modal (Overlay) */}
      {isAddingAddress && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAddingAddress(false)} />
          <div className="relative bg-neutral-900 border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

            <div className="p-6 pb-0 flex items-center justify-between">
              <h4 className="text-xl font-bold text-white tracking-tight">Add Address Details</h4>
              <button onClick={() => setIsAddingAddress(false)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Google Map Placeholder Image style from screenshot */}
              <div className="h-28 bg-white/5 rounded-2xl overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-50 gray-grayscale" alt="Map View" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Label this address as</p>
                <div className="flex gap-2 pt-1">
                  {['Home', 'Work', 'Other'].map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, label: l })}
                      className={`flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 border ${addressForm.label === l
                        ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-black/40 text-gray-400 border-white/5 hover:border-white/20 hover:text-white'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">House No. & Floor *</label>
                  <input
                    type="text"
                    value={addressForm.houseNo}
                    onChange={e => setAddressForm({ ...addressForm, houseNo: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all"
                    placeholder="e.g. A-402, 4th Floor"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Building & Block Name *</label>
                  <input
                    type="text"
                    value={addressForm.building}
                    onChange={e => setAddressForm({ ...addressForm, building: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all"
                    placeholder="Building Name / Area Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Landmark & Area (Optional)</label>
                  <input
                    type="text"
                    value={addressForm.landmark}
                    onChange={e => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all"
                    placeholder="Near XYZ Circle"
                  />
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Receiver Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={addressForm.receiverName}
                        onChange={e => setAddressForm({ ...addressForm, receiverName: e.target.value })}
                        className="w-full bg-black/60 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/30"
                        placeholder="Name"
                      />
                    </div>
                    <div className="space-y-1">
                      <input
                        type="tel"
                        value={addressForm.receiverPhone}
                        onChange={e => setAddressForm({ ...addressForm, receiverPhone: e.target.value })}
                        className="w-full bg-black/60 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/30"
                        placeholder="Phone"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveAddress}
                className="w-full bg-cyan-500 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_4px_25px_rgba(6,182,212,0.3)] hover:bg-cyan-400 hover:scale-[1.02] active:scale-95 transition-all mt-4"
              >
                SAVE ADDRESS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
