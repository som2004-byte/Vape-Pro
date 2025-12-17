import React, { useState } from 'react';

export default function AccountSection() {
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
    console.log('Account Details:', { name, email, phoneNumber, address, isPhoneVerified, isAddressVerified, isEmailVerified });
    // In a real application, you would send this data to a backend
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black text-gray-100 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-950 to-black p-8 rounded-lg shadow-lg max-w-md w-full border border-purple-700/50">
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-white via-yellow-400 to-white bg-clip-text text-transparent">
          My Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-purple-300 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 rounded-lg bg-purple-900/50 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
              placeholder="Your Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-purple-300 mb-1">
              Email Address
            </label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 rounded-lg bg-purple-900/50 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
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
                  className="w-full px-4 py-2 rounded-lg bg-purple-900/50 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
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
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-purple-300 mb-1">
              Phone Number
            </label>
            <div className="flex items-center gap-2">
              <input
                type="tel"
                id="phoneNumber"
                className="w-full px-4 py-2 rounded-lg bg-purple-900/50 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
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
                  className="w-full px-4 py-2 rounded-lg bg-purple-900/50 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
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
            <label htmlFor="address" className="block text-sm font-medium text-purple-300 mb-1">
              Address
            </label>
            <div className="flex items-center gap-2">
              <textarea
                id="address"
                rows="3"
                className="w-full px-4 py-2 rounded-lg bg-purple-900/50 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
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
        </form>
      </div>
    </div>
  );
}
