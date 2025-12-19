import React, { useState, useEffect } from 'react';
import VapeSmokeEffect from './VapeSmokeEffect';

export default function PaymentPage({
  cartItems = [],
  total,
  customerProfile,
  onPaymentSuccess,
  onCancel,
}) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'processing', 'success', 'failed'
  const videoSrc = '/videos/login-bg.mp4';

  // Generate a random transaction ID
  const generateTransactionId = () => {
    return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  // Simulate payment processing
  const handlePayment = async () => {
    // Handle Cash on Delivery differently
    if (paymentMethod === 'cod') {
      setIsProcessing(true);
      setPaymentStatus('processing');
      
      // For COD, immediately confirm order (no payment processing needed)
      setTimeout(() => {
        setPaymentStatus('success');
        const transactionId = `COD${Date.now()}${Math.floor(Math.random() * 1000)}`;
        
        setTimeout(() => {
          onPaymentSuccess({
            transactionId,
            paymentMethod: 'cod',
            paymentStatus: 'pending', // COD orders are pending until delivery
            paidAt: null, // Not paid yet for COD
          });
        }, 1500);
      }, 1000); // Shorter delay for COD
      return;
    }

    // For card payment, validate card details
    if (paymentMethod === 'card') {
      if (!cardNumber || !cardName || !expiry || !cvv) {
        alert('Please fill in all payment details');
        return;
      }
    }

    // For UPI payment, validate UPI ID
    if (paymentMethod === 'upi') {
      const upiInput = document.getElementById('upiId');
      if (!upiInput || !upiInput.value.trim()) {
        alert('Please enter your UPI ID');
        return;
      }
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    // Simulate payment processing delay (3 seconds)
    setTimeout(() => {
      // Simulate 90% success rate for demo
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        setPaymentStatus('success');
        const transactionId = generateTransactionId();
        
        // Wait a moment then call success handler
        setTimeout(() => {
          onPaymentSuccess({
            transactionId,
            paymentMethod,
            paymentStatus: 'completed',
            paidAt: new Date().toISOString(),
          });
        }, 1500);
      } else {
        setPaymentStatus('failed');
        setIsProcessing(false);
      }
    }, 3000);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setExpiry(value);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-90"
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0">
          <VapeSmokeEffect density={55} speed={0.55} opacity={0.4} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/25 to-black/50" />
        <div className="relative z-10 text-center p-8">
          <div className="bg-gradient-to-br from-darkPurple-950/90 to-black/90 backdrop-blur-sm p-8 rounded-lg shadow-lg max-w-md w-full border border-green-500/50">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-3xl font-bold text-green-400 mb-2">
              {paymentMethod === 'cod' ? 'Order Placed Successfully!' : 'Payment Successful!'}
            </h2>
            <p className="text-darkPurple-300 mb-4">
              {paymentMethod === 'cod' 
                ? 'Your order has been placed. Pay cash on delivery when your order arrives.'
                : 'Your order has been placed successfully.'}
            </p>
            <p className="text-sm text-darkPurple-400">Redirecting to your orders...</p>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="relative min-h-screen text-gray-100 p-4">
        <div className="container mx-auto max-w-4xl py-8">
          <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-yellowGradient-start via-yellowGradient-end to-yellowGradient-start bg-clip-text text-transparent">
            Payment & Checkout
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="md:col-span-1 bg-gradient-to-br from-darkPurple-950/90 to-black/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-darkPurple-700/50 h-fit">
              <h3 className="text-2xl font-bold text-white mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-darkPurple-300">
                    <span>{item.series || item.name} x{item.quantity}</span>
                    <span>₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-darkPurple-700 my-4"></div>
              <div className="flex justify-between items-center text-white text-xl font-bold mb-4">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              {customerProfile && (
                <div className="mt-4 pt-4 border-t border-darkPurple-700">
                  <p className="text-xs text-darkPurple-400 mb-1">Shipping to:</p>
                  <p className="text-sm text-darkPurple-300">{customerProfile.address || 'No address provided'}</p>
                </div>
              )}
            </div>

            {/* Payment Form */}
            <div className="md:col-span-2 bg-gradient-to-br from-darkPurple-950/90 to-black/90 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-darkPurple-700/50">
              <h3 className="text-2xl font-bold text-white mb-6">Payment Details</h3>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-darkPurple-300 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'border-darkPurple-700 hover:border-darkPurple-600'
                    }`}
                  >
                    <div className="text-white font-semibold text-sm">Credit/Debit Card</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'upi'
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'border-darkPurple-700 hover:border-darkPurple-600'
                    }`}
                  >
                    <div className="text-white font-semibold text-sm">UPI</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'cod'
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'border-darkPurple-700 hover:border-darkPurple-600'
                    }`}
                  >
                    <div className="text-white font-semibold text-sm">Cash on Delivery</div>
                  </button>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-darkPurple-300 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      maxLength="19"
                      className="w-full px-4 py-2 rounded-lg bg-darkPurple-900/50 border border-darkPurple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-darkPurple-300 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      className="w-full px-4 py-2 rounded-lg bg-darkPurple-900/50 border border-darkPurple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry" className="block text-sm font-medium text-darkPurple-300 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiry"
                        maxLength="5"
                        className="w-full px-4 py-2 rounded-lg bg-darkPurple-900/50 border border-darkPurple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={handleExpiryChange}
                        disabled={isProcessing}
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-darkPurple-300 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        maxLength="4"
                        className="w-full px-4 py-2 rounded-lg bg-darkPurple-900/50 border border-darkPurple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="upiId" className="block text-sm font-medium text-darkPurple-300 mb-1">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      id="upiId"
                      className="w-full px-4 py-2 rounded-lg bg-darkPurple-900/50 border border-darkPurple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-white"
                      placeholder="yourname@paytm"
                      disabled={isProcessing}
                    />
                  </div>
                  <p className="text-sm text-darkPurple-400">
                    You will be redirected to your UPI app to complete the payment.
                  </p>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-yellow-400 font-semibold mb-1">Cash on Delivery</p>
                        <p className="text-sm text-darkPurple-300">
                          Pay with cash when your order is delivered. Please keep exact change ready for the delivery person.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-darkPurple-900/30 rounded-lg">
                    <p className="text-sm text-darkPurple-300">
                      <span className="font-semibold text-white">Delivery Time:</span> 3-5 business days
                    </p>
                    <p className="text-sm text-darkPurple-300 mt-1">
                      <span className="font-semibold text-white">COD Charges:</span> No additional charges
                    </p>
                  </div>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-300 text-sm">
                    Payment failed. Please try again or use a different payment method.
                  </p>
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-3 px-4 rounded-lg bg-darkPurple-900 text-gray-100 text-lg hover:bg-darkPurple-800 transition-colors"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePayment}
                  className="flex-1 py-3 px-4 rounded-lg bg-yellow-500 text-black font-semibold text-lg hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/70 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      {paymentMethod === 'cod' ? 'Placing Order...' : 'Processing...'}
                    </span>
                  ) : (
                    paymentMethod === 'cod' 
                      ? `Place Order (₹${total.toLocaleString()})`
                      : `Pay ₹${total.toLocaleString()}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

