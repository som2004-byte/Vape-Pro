import React, { useState, useEffect } from 'react';
import VapeSmokeEffect from './VapeSmokeEffect';

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
  const [editMode, setEditMode] = useState(!profile);
  const [currentTab, setCurrentTab] = useState(activeTab);

  // When a saved profile is provided from the parent, pre-fill fields
  useEffect(() => {
    if (!profile) return;
    setName(profile.name || '');
    setEmail(profile.email || '');
    setPhoneNumber(profile.phoneNumber || '');
    setAddress(profile.address || '');
  }, [profile]);

  // Keep internal tab in sync with parent (e.g. when navigating to My Account / Orders)
  useEffect(() => {
    setCurrentTab(activeTab || 'profile');
  }, [activeTab]);

  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleRequestOtp = async () => {
    try {
      setVerifying(true);
      const response = await fetch('http://localhost:3000/api/request-email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          email,
          purpose: 'email_verification'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setShowEmailOtpInput(true);
      setOtpSent(true);
      
      onNotify?.({
        type: 'success',
        message: 'OTP sent to your email',
      });
    } catch (err) {
      onNotify?.({
        type: 'error',
        message: err.message || 'Failed to send OTP',
      });
    } finally {
      setVerifying(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setVerifying(true);
      
      if (!emailOtp || emailOtp.length < 6) {
        throw new Error('Please enter a valid 6-digit OTP');
      }

      const response = await fetch('http://localhost:3000/api/verify-email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          email,
          otp: emailOtp,
          purpose: 'email_verification'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      setIsEmailVerified(true);
      setShowEmailOtpInput(false);
      setEmailOtp('');

      onNotify?.({
        type: 'success',
        message: 'Email verified successfully',
      });

    } catch (err) {
      onNotify?.({
        type: 'error',
        message: err.message || 'Verification failed',
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

    // Check if address contains Pune (case-insensitive)
    const normalizedAddress = trimmedAddress.toLowerCase();
    if (normalizedAddress.includes('pune')) {
      setIsAddressVerified(true);
      onNotify?.({
        type: 'success',
        message: 'Address verified successfully',
        subTitle: 'Address verified within Pune',
      });
    } else {
      setIsAddressVerified(false);
      onNotify?.({
        type: 'error',
        message: 'Address verification failed',
        subTitle: 'Address must be within Pune',
      });
    }
  };

  const generateEmailOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setEmailOtp(newOtp);
    onNotify?.({
      type: 'info',
      message: 'Demo OTP generated for email verification',
      subTitle: `Use ${newOtp} to verify your email (dev mode)`,
    });
    setShowEmailOtpInput(true);
  };

  const verifyEmail = () => {
    if (!emailOtp || emailOtp.length < 6) {
      onNotify?.({
        type: 'error',
        message: 'Please enter the OTP sent to your email address',
      });
      return;
    }
    setIsEmailVerified(true);
    onNotify?.({
      type: 'success',
      message: 'Email address verified successfully',
    });
    setShowEmailOtpInput(false);
    setEmailOtp('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAddressVerified) {
      onNotify?.({
        type: 'error',
        message: 'Please verify your address before saving details',
      });
      return;
    }
    if (!isEmailVerified) {
      onNotify?.({
        type: 'error',
        message: 'Please verify your email address before saving details',
      });
      return;
    }
    const saved = { name, email, phoneNumber, address };
    console.log('Account Details:', {
      ...saved,
      isAddressVerified,
      isEmailVerified,
    });
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
      <div className="absolute inset-0">
        <VapeSmokeEffect density={55} speed={0.55} opacity={0.4} />
      </div>

      {/* Subtle overlay for readability - lighter to blend better */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/25 to-black/50" />

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4 py-8">
        <div className="bg-gradient-to-br from-darkPurple-950/90 to-black/90 backdrop-blur-sm p-8 rounded-lg shadow-lg max-w-2xl w-full border border-darkPurple-700/50 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-yellowGradient-start via-yellowGradient-end to-yellowGradient-start bg-clip-text text-transparent">
          My Account
        </h2>

        {/* Simple tabs: Profile / Orders */}
        <div className="flex mb-6 bg-darkPurple-950/60 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setCurrentTab('profile')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              currentTab === 'profile'
                ? 'bg-darkPurple-700 text-white'
                : 'text-darkPurple-300 hover:text-white'
            }`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('orders')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              currentTab === 'orders'
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
                    switch(status) {
                      case 'delivered': return 'text-green-400';
                      case 'shipped': return 'text-blue-400';
                      case 'processing': return 'text-yellow-400';
                      case 'cancelled': return 'text-red-400';
                      default: return 'text-gray-400';
                    }
                  };
                  const getStatusBadge = (status) => {
                    switch(status) {
                      case 'delivered': return 'bg-green-500/20 border-green-500/50 text-green-400';
                      case 'shipped': return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
                      case 'processing': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
                      case 'cancelled': return 'bg-red-500/20 border-red-500/50 text-red-400';
                      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
                    }
                  };

                  return (
                    <div
                      key={order.id}
                      className="border border-darkPurple-700/70 rounded-lg p-4 bg-black/40"
                    >
                      {/* Order Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-100">
                            {order.orderNumber || `Order #${order.id.toString().slice(-6)}`}
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
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </div>
                      <ul className="text-xs text-gray-200 space-y-1 mb-3">
                        {order.items.map(item => (
                          <li key={item.id} className="flex justify-between">
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
                                <div className={`w-2 h-2 rounded-full mt-1 ${
                                  idx === order.timeline.length - 1 ? 'bg-yellow-400' : 'bg-green-400'
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
            <div className="flex items-center gap-2">
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 rounded-lg bg-darkPurple-900/50 border border-darkPurple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isEmailVerified}
              />
              <div className="flex items-center gap-2">
                {!isEmailVerified ? (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={verifying || otpSent}
                    className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold text-sm hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/70 whitespace-nowrap disabled:opacity-50"
                  >
                    {otpSent ? 'OTP Sent' : 'Get OTP'}
                  </button>
                ) : (
                  <span className="text-green-400 text-sm font-medium">Verified!</span>
                )}
              </div>
            </div>
            {showEmailOtpInput && !isEmailVerified && (
              <div className="flex items-center gap-2 mt-2">
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
            )}
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-darkPurple-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              className="w-full px-4 py-2 rounded-lg bg-darkPurple-900/50 border border-darkPurple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
              placeholder="e.g., +91 9876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-darkPurple-300 mb-1">
              Address
            </label>
            <div className="flex items-center gap-2">
              <textarea
                id="address"
                rows="3"
                className="w-full px-4 py-2 rounded-lg bg-darkPurple-900/50 border border-darkPurple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
                placeholder="Your complete address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                disabled={isAddressVerified}
              ></textarea>
              {!isAddressVerified && (
                <button
                  type="button"
                  onClick={verifyAddress}
                  className="px-4 py-2 rounded-lg bg-green-500 text-black font-semibold text-sm hover:bg-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400/70 whitespace-nowrap"
                >
                  Verify Address
                </button>
              )}
              {isAddressVerified && (
                <span className="text-green-400 text-sm font-medium">Verified!</span>
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
    </div>
  );
}
