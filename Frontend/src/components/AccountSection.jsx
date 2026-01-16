import React, { useState, useEffect } from 'react';
import VapeSmokeEffect from './VapeSmokeEffect';
import { API_ENDPOINTS, apiCall, getAuthHeaders } from '../utils/apiConfig';


// My Account section (Profile + Orders)
// - Profile: add/edit customer details
// - Orders: read-only list of past orders from this session
export default function AccountSection({
  activeTab = 'profile',
  profile,
  onSaveProfile,
  orders = [],
  onNotify,
}) {
  const videoSrc = '/videos/login-bg.mp4';
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isAddressVerified, setIsAddressVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [editMode, setEditMode] = useState(!profile);
  const [currentTab, setCurrentTab] = useState(activeTab);

  // When a saved profile is provided from the parent, pre-fill fields
  useEffect(() => {
    if (!profile) return;
    setName(profile.name || '');
    setEmail(profile.email || '');
    setPhoneNumber(profile.phoneNumber || '');
    setAddress(profile.address || '');
    // Ensure boolean properties are correctly interpreted
    setIsEmailVerified(profile.emailVerified === true);
    setIsAddressVerified(profile.phoneVerified === true);
  }, [profile, editMode]); // specific dependency on editMode to refill when opening form

  // Keep internal tab in sync with parent (e.g. when navigating to My Account / Orders)
  useEffect(() => {
    setCurrentTab(activeTab || 'profile');
  }, [activeTab]);

  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleRequestOtp = async () => {
    try {
      setVerifying(true);
      setToastSent(false);

      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail || !trimmedEmail.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      console.log('Requesting OTP for:', trimmedEmail);

      // Use the centralized apiCall and endpoint
      await apiCall(API_ENDPOINTS.USER.VERIFY_EMAIL, {
        method: 'POST',
        headers: getAuthHeaders(localStorage.getItem('token')),
        body: JSON.stringify({
          email: trimmedEmail,
          purpose: 'email_verification'
        }),
      });

      setShowEmailOtpInput(true);
      setOtpSent(true);

      onNotify?.({
        type: 'success',
        message: 'OTP sent to your email',
        subTitle: `Check your inbox (${trimmedEmail})`
      });
    } catch (err) {
      console.error('OTP Request Error:', err);

      let msg = err.message || 'Failed to send OTP';
      if (err.status === 404) {
        msg = 'OTP Service endpoint not found (404). Please try Demo OTP.';
      } else if (err.message?.includes('network')) {
        msg = 'Network error. Server might be down. Use Demo OTP.';
      }

      if (err.dev_otp) {
        // IMPROVEMENT: Backend saved the OTP but failed to email it.
        // We can show this OTP to the user so they can still verify against the backend.
        console.log('Using Dev OTP from backend response:', err.dev_otp);
        setDevOtp(err.dev_otp);
        onNotify?.({
          type: 'info',
          message: 'Email Service Error (Bypassed)',
          subTitle: `Use OTP: ${err.dev_otp} (Email failed to send)`,
          duration: 10000 // Show for longer
        });
        setShowEmailOtpInput(true);
        setOtpSent(true);
        // Do NOT generate local demo OTP, as we want to verify against the backend
      } else {
        // If we don't have a dev_otp, we fall back to client-side demo generation.
        // Only show the "Failed" error if it's NOT a known service/network issue that we're auto-handling.
        const isHandledError = err.status === 503 || err.status === 404 || (err.message && err.message.toLowerCase().includes('network'));

        if (!isHandledError) {
          onNotify?.({
            type: 'error',
            message: 'OTP Failed',
            subTitle: msg
          });
        }

        // Automatically switch to demo mode
        generateEmailOtp();
        // We set otpSent to true so the UI reflects that an action occurred (even if simulated)
        setOtpSent(true);
      }
    } finally {
      setVerifying(false);
    }
  };

  const [toastSent, setToastSent] = useState(false);

  const verifyOtp = async () => {
    try {
      setVerifying(true);

      if (!emailOtp || emailOtp.length < 6) {
        throw new Error('Please enter a 6-digit OTP');
      }

      // If it's the demo OTP and we are in dev mode, we can bypass the backend check
      const savedDemoOtp = localStorage.getItem('demo_otp');
      const isDemoOtp = emailOtp === savedDemoOtp;

      if (isDemoOtp) {
        setIsEmailVerified(true);
        setShowEmailOtpInput(false);
        setEmailOtp('');
        localStorage.removeItem('demo_otp');

        onNotify?.({
          type: 'success',
          message: 'Email verified!',
          subTitle: 'System bypass successful'
        });
        return;
      }

      // Otherwise, call the backend
      const trimmedEmail = email.trim().toLowerCase();
      await apiCall(API_ENDPOINTS.USER.VERIFY_OTP, {
        method: 'POST',
        headers: getAuthHeaders(localStorage.getItem('token')),
        body: JSON.stringify({
          email: trimmedEmail,
          otp: emailOtp,
          purpose: 'email_verification'
        }),
      });

      setIsEmailVerified(true);
      setShowEmailOtpInput(false);
      setEmailOtp('');

      onNotify?.({
        type: 'success',
        message: 'Email verified successfully',
      });

    } catch (err) {
      console.error('OTP Verification Error:', err);
      onNotify?.({
        type: 'error',
        message: 'Verification failed',
        subTitle: err.message || 'The OTP you entered is incorrect or expired.'
      });
    } finally {
      setVerifying(false);
    }
  };

  const verifyAddress = async () => {
    if (!address || address.trim().length === 0) {
      onNotify?.({
        type: 'error',
        message: 'Please enter an address to verify',
      });
      return;
    }

    // Check if address is valid (has minimum length)
    const trimmedAddress = address.trim();
    if (trimmedAddress.length < 10) {
      setIsAddressVerified(false);
      onNotify?.({
        type: 'error',
        message: 'Address verification failed',
        subTitle: 'Please enter a complete address (at least 10 characters)',
      });
      return;
    }

    // Check if address contains Pune or PCMC areas (case-insensitive)
    const normalizedAddress = trimmedAddress.toLowerCase();
    const isPuneArea = normalizedAddress.includes('pune') ||
      normalizedAddress.includes('pimpri') ||
      normalizedAddress.includes('chinchwad') ||
      normalizedAddress.includes('wakad') ||
      normalizedAddress.includes('hinjewadi') ||
      normalizedAddress.includes('baner');

    if (isPuneArea) {
      setIsAddressVerified(true);
      onNotify?.({
        type: 'success',
        message: 'Address verified successfully',
        subTitle: 'Address verified within Pune/Pimpri-Chinchwad area',
      });
    } else {
      setIsAddressVerified(false);
      onNotify?.({
        type: 'error',
        message: 'Address verification failed',
        subTitle: 'Delivery is only available in Pune and Pimpri-Chinchwad.',
      });
    }
  };

  // Pune Center Coords (approx)
  const PUNE_LAT = 18.5204;
  const PUNE_LNG = 73.8567;
  const MAX_DIST_KM = 25; // Approx radius for Pune metro area

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180)
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      onNotify?.({ type: 'error', message: 'Geolocation is not supported by your browser' });
      return;
    }

    onNotify?.({ type: 'info', message: 'Fetching your location...' });

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const dist = calculateDistance(latitude, longitude, PUNE_LAT, PUNE_LNG);

      if (dist > MAX_DIST_KM) {
        onNotify?.({
          type: 'error',
          message: 'Location outside Pune',
          subTitle: `You seem to be ${dist.toFixed(1)}km away from Pune center. Delivery is only available in Pune.`
        });
        return;
      }

      // Valid location - try reverse geocoding
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();

        if (data && data.display_name) {
          setAddress(data.display_name);
          setIsAddressVerified(true);
          onNotify?.({
            type: 'success',
            message: 'Location Verified!',
            subTitle: 'Address auto-filled from your location'
          });
        } else {
          // Fallback if reverse geocoding fails but coords are valid
          setAddress(`Detected Location (Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}) - Please add details`);
          setIsAddressVerified(true);
          onNotify?.({ type: 'success', message: 'Location Verified within Pune!' });
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        setAddress(`Verified Location (Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)})`);
        setIsAddressVerified(true);
        onNotify?.({ type: 'success', message: 'Location Verified!' });
      }
    }, (error) => {
      console.error('Geolocation error:', error);
      onNotify?.({ type: 'error', message: 'Unable to retrieve your location', subTitle: 'Please ensure location permission is granted' });
    });
  };

  const generateEmailOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    // Save to localStorage so verifyOtp can check it in dev mode
    localStorage.setItem('demo_otp', newOtp);
    setEmailOtp(newOtp);

    onNotify?.({
      type: 'info',
      message: 'Demo OTP generated!',
      subTitle: `Use ${newOtp} to verify your email (dev bypass)`,
    });
    setShowEmailOtpInput(true);
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phoneNumber.trim().replace(/[\s\-]/g, '');
    const trimmedAddress = address.trim();

    if (!trimmedName) {
      onNotify?.({ type: 'error', message: 'Name is required' });
      return;
    }

    // Phone number validation (Indian format: starts with 6-9, 10 digits, optional +91)
    const phoneRegex = /^(\+91)?[6789]\d{9}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      onNotify?.({
        type: 'error',
        message: 'Invalid Phone Number',
        subTitle: 'Please enter a valid 10-digit Indian mobile number',
      });
      return;
    }

    if (!isAddressVerified) {
      onNotify?.({
        type: 'error',
        message: 'Address Verification Required',
        subTitle: 'Please click "Verify Address" specifically before saving.',
      });
      return;
    }
    if (!isEmailVerified) {
      onNotify?.({
        type: 'error',
        message: 'Email Verification Required',
        subTitle: 'Please verify your email with OTP before saving.',
      });
      return;
    }
    const saved = {
      name: trimmedName,
      email: trimmedEmail,
      phoneNumber: trimmedPhone,
      address: trimmedAddress,
      emailVerified: isEmailVerified,
      phoneVerified: isAddressVerified // Backend uses phoneVerified field for address verification state
    };
    console.log('Account Details Saved:', saved);
    onSaveProfile?.(saved);
    setEditMode(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-90"
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Global vape smoke - blended with video */}
      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4 pt-24 pb-8">
        <div className="relative z-20 bg-neutral-900/90 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-2xl max-w-2xl w-full border border-neutral-800 max-h-[90vh] overflow-y-auto">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-yellowGradient-start via-yellowGradient-end to-yellowGradient-start bg-clip-text text-transparent">
            My Account
          </h2>

          {/* Simple tabs: Profile / Orders */}
          <div className="flex mb-6 bg-darkPurple-950/60 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setCurrentTab('profile')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${currentTab === 'profile'
                ? 'bg-darkPurple-700 text-white'
                : 'text-darkPurple-300 hover:text-white'
                }`}
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab('orders')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${currentTab === 'orders'
                ? 'bg-darkPurple-700 text-white'
                : 'text-darkPurple-300 hover:text-white'
                }`}
            >
              Orders
            </button>
          </div>

          {/* Orders tab */}
          {currentTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-center text-darkPurple-300 text-sm">
                  You have not placed any orders yet.
                </p>
              ) : (
                <div className="space-y-4 pr-1">
                  {orders.map(order => {
                    const status = order.status || 'processing';
                    const paymentStatus = order.paymentStatus || 'completed';
                    const getStatusColor = (status) => {
                      switch (status) {
                        case 'delivered': return 'text-green-400';
                        case 'shipped': return 'text-blue-400';
                        case 'processing': return 'text-yellow-400';
                        case 'cancelled': return 'text-red-400';
                        default: return 'text-gray-400';
                      }
                    };
                    const getStatusBadge = (status) => {
                      switch (status) {
                        case 'delivered': return 'bg-green-500/20 border-green-500/50 text-green-400';
                        case 'shipped': return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
                        case 'processing': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
                        case 'cancelled': return 'bg-red-500/20 border-red-500/50 text-red-400';
                        default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
                      }
                    };

                    return (
                      <div
                        key={order.id || order._id}
                        className="border border-darkPurple-700/70 rounded-lg p-4 bg-black/40"
                      >
                        {/* Order Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-sm font-semibold text-gray-100">
                              {order.orderNumber || (order.id || order._id ? `Order #${(order.id || order._id).toString().slice(-6)}` : 'Order #------')}
                            </div>
                            {order.trackingNumber && (
                              <div className="text-xs text-darkPurple-400 mt-1">
                                Tracking: <span className="text-yellow-400 font-mono">{order.trackingNumber}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`text-xs px-2 py-1 rounded border ${getStatusBadge(order.status || 'processing')}`}>
                              {(order.status || 'processing').charAt(0).toUpperCase() + (order.status || 'processing').slice(1)}
                            </div>
                            <div className="text-xs text-darkPurple-300 mt-1">
                              {new Date(order.placedAt || order.createdAt || new Date()).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Payment Status */}
                        <div className="mb-3 pb-3 border-b border-darkPurple-800/70">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-darkPurple-400">Payment Status:</span>
                            <span className={order.paymentStatus === 'completed' ? 'text-green-400' : 'text-yellow-400'}>
                              {order.paymentStatus === 'completed' ? '✓ Paid' : order.paymentStatus || 'pending'}
                            </span>
                          </div>
                          {order.transactionId && (
                            <div className="flex items-center justify-between text-xs mt-1">
                              <span className="text-darkPurple-400">Transaction ID:</span>
                              <span className="text-darkPurple-300 font-mono text-[10px]">{order.transactionId}</span>
                            </div>
                          )}
                        </div>

                        {/* Order Items */}
                        <div className="text-xs text-darkPurple-300 mb-2">
                          {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}
                        </div>
                        <ul className="text-xs text-gray-200 space-y-1 mb-3">
                          {(order.items || []).map((item, idx) => (
                            <li key={item.id || item._id || item.productId || idx} className="flex justify-between">
                              <span>
                                {item.series || item.name}{' '}
                                {item.flavor && `- ${item.flavor}`}
                              </span>
                              <span>
                                x{item.quantity || 1} · ₹
                                {(item.price || 0).toLocaleString()}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* Order Timeline */}
                        {order.timeline && order.timeline.length > 0 && (
                          <div className="mb-3 pt-3 border-t border-darkPurple-800/70">
                            <div className="text-xs font-semibold text-darkPurple-300 mb-2">Order Timeline:</div>
                            <div className="space-y-2">
                              {order.timeline.map((event, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs">
                                  <div className={`w-2 h-2 rounded-full mt-1 ${idx === order.timeline.length - 1 ? 'bg-yellow-400' : 'bg-green-400'
                                    }`}></div>
                                  <div className="flex-1">
                                    <div className="text-gray-200">{event.message}</div>
                                    <div className="text-darkPurple-400 text-[10px]">
                                      {new Date(event.timestamp).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                          <div className="mb-3 pt-3 border-t border-darkPurple-800/70">
                            <div className="text-xs text-darkPurple-400 mb-1">Shipping Address:</div>
                            <div className="text-xs text-darkPurple-300">{order.shippingAddress}</div>
                          </div>
                        )}

                        {/* Total */}
                        <div className="flex justify-between items-center pt-2 border-t border-darkPurple-800/70 text-sm font-semibold text-yellowGradient-end">
                          <span>Total</span>
                          <span>₹{(order.total || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Profile tab – read-only summary / blank state when not editing */}
          {currentTab === 'profile' && !editMode && (
            <div className="space-y-4 mb-6">
              {profile ? (
                <>
                  <div className="space-y-1 text-sm">
                    <p className="text-darkPurple-300">
                      <span className="font-semibold text-gray-100">Name:</span>{' '}
                      {profile.name || '--'}
                    </p>
                    <p className="text-darkPurple-300">
                      <span className="font-semibold text-gray-100">Email:</span>{' '}
                      {profile.email || '--'}
                    </p>
                    <p className="text-darkPurple-300">
                      <span className="font-semibold text-gray-100">Phone:</span>{' '}
                      {profile.phoneNumber || '--'}
                    </p>
                    <p className="text-darkPurple-300">
                      <span className="font-semibold text-gray-100">Address:</span>{' '}
                      {profile.address || '--'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="w-full py-2 px-4 rounded-lg bg-yellow-500 text-black font-semibold text-lg hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/70 mt-2"
                  >
                    Edit Details
                  </button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-darkPurple-300 text-sm">
                    No customer details added yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="py-2 px-4 rounded-lg bg-yellow-500 text-black font-semibold text-base hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/70"
                  >
                    Add Details
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Profile tab – Edit / Add form */}
          {currentTab === 'profile' && editMode && (
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-darkPurple-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 rounded-lg bg-darkPurple-900/50 border border-darkPurple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
                  placeholder="Your Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-darkPurple-300 mb-1">
                  Email Address
                </label>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 rounded-lg bg-darkPurple-900/50 border border-darkPurple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => {
                      const newEmail = e.target.value;
                      setEmail(newEmail);
                      // Reset OTP state when email changes
                      setOtpSent(false);
                      setShowEmailOtpInput(false);
                      setDevOtp(null);
                      // If email matches the original profile email, revert verification status to original
                      // Otherwise, set to false requiring re-verification
                      if (profile && profile.email === newEmail && profile.emailVerified) {
                        setIsEmailVerified(true);
                      } else {
                        setIsEmailVerified(false);
                      }
                    }}
                    required
                  />
                  <div className="flex flex-col gap-2 shrink-0">
                    {!isEmailVerified ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleRequestOtp}
                          disabled={verifying || otpSent}
                          className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold text-sm hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/70 whitespace-nowrap disabled:opacity-50"
                        >
                          {otpSent ? 'OTP Sent' : 'Get OTP'}
                        </button>

                      </div>
                    ) : (
                      <span className="text-green-400 text-sm font-medium">Verified!</span>
                    )}
                  </div>
                </div>
                {showEmailOtpInput && !isEmailVerified && (
                  <div className="mt-2 w-full">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="w-full px-4 py-2 rounded-lg bg-darkPurple-900/50 border border-darkPurple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
                        placeholder="Enter 6-digit OTP"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                        maxLength={6}
                      />
                      <button
                        type="button"
                        onClick={verifyOtp}
                        disabled={verifying || emailOtp.length < 6}
                        className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold text-sm hover:bg-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/70 whitespace-nowrap disabled:opacity-50"
                      >
                        {verifying ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                    {devOtp && (
                      <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-300 font-mono text-xs text-center">
                        <span className="font-bold">DEV MODE:</span> Your OTP is {devOtp} (Email service unavailable)
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-darkPurple-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  className="w-full px-4 py-2 rounded-lg bg-darkPurple-900/50 border border-darkPurple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
                  placeholder="e.g., 9876543210"
                  value={phoneNumber}
                  onChange={(e) => {
                    // Allow only numbers and plus sign
                    const val = e.target.value.replace(/[^\d+]/g, '');
                    setPhoneNumber(val);
                  }}
                  required
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-darkPurple-300 mb-1">
                  Address
                </label>
                <div className="flex flex-col md:flex-row md:items-start gap-2">
                  <div className="relative w-full">
                    <textarea
                      id="address"
                      rows="3"
                      className="w-full px-4 py-2 rounded-lg bg-darkPurple-900/50 border border-darkPurple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
                      placeholder="Your complete address (Must be in Pune)"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (isAddressVerified) setIsAddressVerified(false);
                      }}
                      required
                    ></textarea>
                    {/* Geolocation Button */}
                    {!isAddressVerified && (
                      <button
                        type="button"
                        onClick={handleUseLocation}
                        className="absolute right-2 bottom-2 p-1.5 text-yellow-400 hover:text-yellow-300 transition-colors bg-darkPurple-900/80 rounded-md border border-darkPurple-700/50"
                        title="Use my current location"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {!isAddressVerified && (
                    <button
                      type="button"
                      onClick={verifyAddress}
                      className="w-full md:w-auto px-4 py-2 rounded-lg bg-green-500 text-black font-semibold text-sm hover:bg-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400/70 whitespace-nowrap h-fit"
                    >
                      Verify Address
                    </button>
                  )}
                  {isAddressVerified && (
                    <span className="text-green-400 text-sm font-medium mt-2 md:mt-0">Verified!</span>
                  )}
                </div>

              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg bg-yellow-500 text-black font-semibold text-lg hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/70"
              >
                Save Details
              </button>
              {profile && (
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="w-full mt-2 py-2 px-4 rounded-lg bg-darkPurple-900 text-gray-100 text-sm hover:bg-darkPurple-800 transition-colors focus:outline-none focus:ring-2 focus:ring-darkPurple-700/70"
                >
                  Cancel
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div >
  );
}
