import React, { useState, useEffect } from 'react';

// My Account section (Profile + Orders)
// - Profile: add/edit customer details
// - Orders: read-only list of past orders from this session
export default function AccountSection({ activeTab = 'profile', profile, onSaveProfile, orders = [] }) {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
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

  const generateOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(newOtp);
    alert(`OTP for phone verification: ${newOtp}`); // Simulate sending OTP
    setShowOtpInput(true);
  };

  const verifyPhoneNumber = () => {
    const enteredOtp = prompt('Please enter the OTP sent to your phone number:');
    if (enteredOtp === otp) {
      setIsPhoneVerified(true);
      alert('Phone number verified successfully!');
      setShowOtpInput(false);
      setOtp('');
    } else {
      alert('Invalid OTP. Please try again.');
    }
  };

  const verifyAddress = async () => {
    if (!address) {
      alert('Please enter an address to verify.');
      return;
    }
    // Placeholder for Google Maps API integration
    alert('Address verification is a complex feature requiring Google Maps API integration.\nThis would involve: 1. Loading Google Maps JavaScript API. 2. Using Geocoding API to convert address to coordinates. 3. Checking if coordinates are within Pune, Maharashtra, India. 4. Displaying a map with a marker.\nFor demonstration purposes, I will simulate a successful verification for addresses containing "Pune".');

    const normalizedAddress = address.toLowerCase();
    if (normalizedAddress.includes('pune') && normalizedAddress.includes('maharashtra') && normalizedAddress.includes('india')) {
      setIsAddressVerified(true);
      alert('Address verified successfully within Pune, Maharashtra, India!');
    } else {
      setIsAddressVerified(false);
      alert('Address is outside our service area (Pune, Maharashtra, India) or invalid.');
    }
  };

  const generateEmailOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setEmailOtp(newOtp);
    alert(`OTP for email verification: ${newOtp}`); // Simulate sending OTP
    setShowEmailOtpInput(true);
  };

  const verifyEmail = () => {
    const enteredOtp = prompt('Please enter the OTP sent to your email address:');
    if (enteredOtp === emailOtp) {
      setIsEmailVerified(true);
      alert('Email address verified successfully!');
      setShowEmailOtpInput(false);
      setEmailOtp('');
    } else {
      alert('Invalid OTP. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isPhoneVerified) {
      alert('Please verify your phone number before saving details.');
      return;
    }
    if (!isAddressVerified) {
      alert('Please verify your address before saving details.');
      return;
    }
    if (!isEmailVerified) {
      alert('Please verify your email address before saving details.');
      return;
    }
    const saved = { name, email, phoneNumber, address };
    console.log('Account Details:', {
      ...saved,
      isPhoneVerified,
      isAddressVerified,
      isEmailVerified,
    });
    onSaveProfile?.(saved);
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-darkPurple-950/20 to-black text-gray-100 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-darkPurple-950 to-black p-8 rounded-lg shadow-lg max-w-md w-full border border-darkPurple-700/50">
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
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className="border border-darkPurple-700/70 rounded-lg p-4 bg-black/40"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-gray-100">
                        Order #{order.id.toString().slice(-6)}
                      </div>
                      <div className="text-xs text-darkPurple-300">
                        {new Date(order.placedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-darkPurple-300 mb-2">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </div>
                    <ul className="text-xs text-gray-200 space-y-1 mb-2">
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
                    <div className="flex justify-between items-center pt-2 border-t border-darkPurple-800/70 text-sm font-semibold text-yellowGradient-end">
                      <span>Total</span>
                      <span>₹{(order.total || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
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
              {!isEmailVerified && (
                <button
                  type="button"
                  onClick={generateEmailOtp}
                  className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold text-sm hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/70 whitespace-nowrap"
                >
                  Generate OTP
                </button>
              )}
              {isEmailVerified && (
                <span className="text-green-400 text-sm font-medium">Verified!</span>
              )}
            </div>
            {showEmailOtpInput && !isEmailVerified && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg bg-darkPurple-900/50 border border-darkPurple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
                  placeholder="Enter Email OTP"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={verifyEmail}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold text-sm hover:bg-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/70 whitespace-nowrap"
                >
                  Verify
                </button>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-darkPurple-300 mb-1">
              Phone Number
            </label>
            <div className="flex items-center gap-2">
              <input
                type="tel"
                id="phoneNumber"
                className="w-full px-4 py-2 rounded-lg bg-darkPurple-900/50 border border-darkPurple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
                placeholder="e.g., +91 9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={isPhoneVerified}
              />
              {!isPhoneVerified && (
                <button
                  type="button"
                  onClick={generateOtp}
                  className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold text-sm hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/70 whitespace-nowrap"
                >
                  Generate OTP
                </button>
              )}
              {isPhoneVerified && (
                <span className="text-green-400 text-sm font-medium">Verified!</span>
              )}
            </div>
            {showOtpInput && !isPhoneVerified && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg bg-darkPurple-900/50 border border-darkPurple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={verifyPhoneNumber}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold text-sm hover:bg-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/70 whitespace-nowrap"
                >
                  Verify
                </button>
              </div>
            )}
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
  );
}
