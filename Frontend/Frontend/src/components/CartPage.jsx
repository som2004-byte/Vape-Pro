import React from 'react';

export default function CartPage({
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black text-gray-100 p-4">
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white via-yellow-400 to-white bg-clip-text text-transparent">
          Your Cart ({totalItems} items)
        </h2>

        {cartItems.length === 0 ? (
          <p className="text-purple-300 text-lg">Your cart is empty. Start shopping now!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center bg-gradient-to-br from-purple-950/70 to-black/70 rounded-lg shadow-lg p-4 border border-purple-700/40"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-contain rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                    <p className="text-purple-300">{item.flavor}</p>
                    <p className="text-yellow-400 font-bold mt-1">₹{item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-purple-700 rounded-md">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-3 py-1 text-yellow-400 hover:bg-purple-800 rounded-l-md disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-white bg-purple-900/50">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-yellow-400 hover:bg-purple-800 rounded-r-md"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1 bg-gradient-to-br from-purple-950 to-black p-6 rounded-lg shadow-lg border border-purple-700/50 h-fit">
              <h3 className="text-2xl font-bold text-white mb-4">Order Summary</h3>
              <div className="flex justify-between items-center text-purple-200 mb-2">
                <span>Subtotal ({totalItems} items):</span>
                <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-purple-200 mb-4">
                <span>Shipping:</span>
                <span className="font-semibold">Calculated at checkout</span>
              </div>
              <div className="border-t border-purple-700 my-4"></div>
              <div className="flex justify-between items-center text-white text-xl font-bold">
                <span>Order Total:</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full py-3 mt-6 rounded-lg bg-yellow-500 text-black font-semibold text-lg hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/70"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
