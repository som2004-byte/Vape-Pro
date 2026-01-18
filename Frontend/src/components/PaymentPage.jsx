import React, { useState, useEffect } from 'react';
import VapeSmokeEffect from './VapeSmokeEffect';

export default function PaymentPage({
  cartItems = [],
  total,
  customerProfile,
  onPaymentSuccess,
  onCancel,
}) {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);

  const videoSrc = '/videos/login-bg.mp4';
  // Determine available addresses - handle both list and legacy string
  const addresses = (customerProfile?.addresses?.length > 0)
    ? customerProfile.addresses
    : (customerProfile?.address ? [{
      id: 'legacy',
      label: 'Default',
      building: customerProfile.address,
      houseNo: '',
      landmark: '',
      receiverName: customerProfile.name || '',
      receiverPhone: customerProfile.phoneNumber || customerProfile.phone || ''
    }] : []);

  const handlePayment = async () => {
    const selectedAddress = addresses[selectedAddressIndex];

    if (!selectedAddress) {
      alert('Please provide a valid shipping address in your profile before placing the order.');
      return;
    }

    const phoneRegex = /^(\+91)?[6789]\d{9}$/;
    const phoneToVerify = selectedAddress.receiverPhone || customerProfile?.phoneNumber || customerProfile?.phone || '';
    const sanitizedPhone = phoneToVerify.replace(/[\s\-]/g, '');

    if (!sanitizedPhone || !phoneRegex.test(sanitizedPhone)) {
      alert('Please provide a valid Indian mobile number for the receiver before placing the order.');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      const addressString = [selectedAddress.houseNo, selectedAddress.building, selectedAddress.landmark]
        .filter(Boolean)
        .join(', ');

      const response = await fetch(`${window.location.origin.includes('localhost') ? 'http://localhost:3000' : 'https://vape-pro-2.onrender.com'}/api/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          shippingAddress: addressString,
          paymentMethod,
          items: cartItems.map(item => ({
            product: item._id || item.id,
            quantity: item.quantity || 1,
            name: item.name,
            brand: item.brand,
            series: item.series,
            flavor: item.flavor
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }

      const data = await response.json();
      setPaymentStatus('success');

      setTimeout(() => {
        onPaymentSuccess({
          transactionId: data.order?._id || data.order?.id || `ORD${Date.now()}`,
          paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
          paidAt: paymentMethod === 'cod' ? null : new Date().toISOString(),
          shippingAddress: addressString
        });
      }, 2000);

    } catch (err) {
      console.error('Checkout error:', err);
      alert(err.message || 'Checkout failed. Please try again.');
      setPaymentStatus(null);
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-black">
        <video className="absolute inset-0 w-full h-full object-cover opacity-60" src={videoSrc} autoPlay muted loop playsInline />
        <div className="relative z-10 text-center p-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 p-12 rounded-[40px] shadow-2xl max-w-md">
            <div className="h-20 w-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Order Received!</h2>
            <p className="text-emerald-100/70 font-medium mb-6">
              {paymentMethod === 'cod' ? 'Your order is being processed for cash on delivery.' : 'Payment confirmed. Your order is on the way.'}
            </p>
            <div className="h-1 w-full bg-emerald-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 animate-[progress_2s_ease-in-out]" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      <div className="fixed inset-0 z-0">
        <video className="w-full h-full object-cover opacity-50" src={videoSrc} autoPlay muted loop playsInline />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-black" />
        <VapeSmokeEffect density={40} speed={0.4} opacity={0.3} />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">Checkout</h2>
            <p className="text-gray-400 font-medium mt-2">Finish your order and start vaping smart</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Delivery & Payment Selection */}
            <div className="lg:col-span-8 space-y-8">

              {/* Address Selection */}
              <section className="bg-neutral-900/40 backdrop-blur-2xl border border-white/5 rounded-[32px] p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-black">1</span>
                    DELIVERY ADDRESS
                  </h3>
                </div>

                {addresses.length === 0 ? (
                  <div className="p-8 bg-black/40 border border-dashed border-red-500/20 rounded-2xl text-center">
                    <svg className="w-12 h-12 text-red-500/40 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <p className="text-gray-400 text-sm font-medium mb-1">No saved addresses discovered</p>
                    <p className="text-red-400/80 text-[10px] font-bold uppercase tracking-widest">Please add an address in your profile</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr, idx) => (
                      <button
                        key={addr._id || addr.id || idx}
                        onClick={() => setSelectedAddressIndex(idx)}
                        className={`text-left p-6 rounded-2xl transition-all duration-300 border relative group ${selectedAddressIndex === idx
                          ? 'bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                          : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100 hover:bg-white/10'}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${selectedAddressIndex === idx ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-white/10 text-gray-400 border-white/10'}`}>
                            {addr.label || 'Other'}
                          </span>
                          {selectedAddressIndex === idx ? (
                            <div className="h-5 w-5 bg-cyan-500 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-300">
                              <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                            </div>
                          ) : (
                            <div className="h-5 w-5 border-2 border-white/10 rounded-full group-hover:border-white/30 transition-colors" />
                          )}
                        </div>
                        <p className="text-white font-bold text-base leading-tight">
                          {addr.houseNo ? `${addr.houseNo}, ` : ''}{addr.building}
                        </p>
                        {addr.landmark && <p className="text-gray-400 text-xs mt-1.5 font-medium">{addr.landmark}</p>}
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-cyan-500/40" />
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                            {addr.receiverName || 'Receiver'} · {addr.receiverPhone || ''}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Payment Method */}
              <section className="bg-neutral-900/40 backdrop-blur-2xl border border-white/5 rounded-[32px] p-8">
                <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-8">
                  <span className="h-8 w-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-black">2</span>
                  PAYMENT METHOD
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center gap-4 p-6 rounded-2xl border transition-all ${paymentMethod === 'cod' ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                  >
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400'}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div className="text-left">
                      <p className={`font-bold ${paymentMethod === 'cod' ? 'text-white' : 'text-gray-400'}`}>CASH ON DELIVERY</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Pay when you receive</p>
                    </div>
                  </button>

                  <button
                    disabled
                    className="flex items-center gap-4 p-6 rounded-2xl border border-white/5 bg-white/5 opacity-30 cursor-not-allowed group"
                  >
                    <div className="h-12 w-12 rounded-xl bg-white/10 text-gray-500 flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <div className="text-left">
                      <p className="text-gray-500 font-bold">ONLINE PAYMENT</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 italic">Coming Soon</p>
                    </div>
                  </button>
                </div>

                {paymentMethod === 'cod' && (
                  <div className="mt-8 p-6 bg-cyan-950/20 border border-cyan-500/10 rounded-2xl flex gap-4 items-start">
                    <svg className="w-6 h-6 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-sm text-gray-300">
                      You've selected <span className="text-white font-bold">Cash on Delivery</span>. No extra charges apply. Please ensure someone is available at the provided address to receive the order and make the payment.
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* Side Column: Summary & Place Order */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 shadow-2xl sticky top-32">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8 italic">Order Summary</h3>

                <div className="space-y-4 mb-8 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 font-medium">
                        <span className="text-white font-bold">{item.quantity}x</span> {item.series || item.name}
                      </span>
                      <span className="text-white font-mono font-bold">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                    <span>Items Total</span>
                    <span className="text-gray-300">₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                    <span>Delivery</span>
                    <span className="text-emerald-400">FREE</span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-lg font-black text-white uppercase italic tracking-tighter">Grand Total</span>
                    <span className="text-3xl font-black text-cyan-400">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing || addresses.length === 0}
                  className="w-full bg-cyan-400 hover:bg-cyan-300 text-black py-5 rounded-2xl font-black text-md uppercase tracking-widest shadow-[0_10px_35px_rgba(34,211,238,0.3)] transition-all mt-10 disabled:opacity-50 disabled:grayscale"
                >
                  {isProcessing ? 'PROCESSING...' : 'COMPLETE ORDER'}
                </button>

                <button
                  onClick={onCancel}
                  disabled={isProcessing}
                  className="w-full text-gray-500 hover:text-white font-bold text-xs uppercase tracking-widest mt-6 transition-colors"
                >
                  Go Back
                </button>

                <div className="mt-8 pt-8 border-t border-white/5">
                  <div className="flex items-center gap-3 opacity-40">
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-tight">Secure 256-bit SSL<br />encrypted checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes progress { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .center-input::placeholder { text-align: center; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}} />
    </div>
  );
}
