import React, { useState } from 'react'

export default function ProductCard({ product, onOpen, onAddToCart }){
  const [imageError, setImageError] = useState(false)

  return (
    <div className="group bg-gradient-to-br from-darkPurple-950/30 via-black to-darkPurple-950/30 border border-darkPurple-900/30 rounded-lg overflow-hidden hover:border-yellowGradient-end/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(168,85,247,0.2)]">
      {/* Product Image Container */}
      <div className="relative h-72 bg-black flex items-center justify-center overflow-hidden">
        {product.cardImage && !imageError ? (
          <img 
            src={product.cardImage} 
            alt={product.series || product.name || `${product.brand} ${product.flavor}`} 
            className="object-contain h-full w-full p-4 group-hover:scale-110 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-gray-600 text-center p-8">
            <p className="text-sm">{product.series || product.name || `${product.brand} ${product.flavor}`}</p>
          </div>
        )}
        
        {/* Sold Out Badge */}
        {product.soldOut && (
          <div className="absolute bottom-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Sold out
          </div>
        )}
        
        {/* View on hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-darkPurple-950/90 via-darkPurple-950/70 to-darkPurple-950/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            onClick={() => onOpen(product)}
            className="bg-gradient-to-r from-yellowGradient-start to-yellowGradient-end text-black px-6 py-3 rounded-full font-semibold transform scale-0 group-hover:scale-100 transition-transform duration-300 hover:from-yellowGradient-end hover:to-yellowGradient-start"
          >
            Quick View
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        <div>
          {product.brand && (
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.brand}</p>
          )}
          <h3 className="font-bold text-lg text-white line-clamp-2 min-h-[3.5rem]">
            {product.series || product.name}
            {product.flavor && ` - ${product.flavor}`}
          </h3>
          {(product.features || product.type) && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-1">
              {product.type && `${product.type}`}
              {product.type && product.features && ' | '}
              {product.features}
            </p>
          )}
          {product.short && !product.type && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-1">{product.short}</p>
          )}
        </div>

        {/* Product Details */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{product.puffs?.toLocaleString() || 'N/A'} puffs</span>
          <span className="text-gray-500">·</span>
          <span>{product.nicotine || 'N/A'}</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-yellowGradient-start to-yellowGradient-end bg-clip-text text-transparent">
            ₹{product.price?.toLocaleString() || 'N/A'}
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="text-sm text-gray-500 line-through">
              ₹{product.originalPrice.toLocaleString()}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button 
            onClick={() => onOpen(product)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-darkPurple-900/50 text-white text-sm font-semibold hover:bg-darkPurple-800/50 border border-darkPurple-800/50 transition-colors"
          >
            View
          </button>
          <button
            onClick={() => onAddToCart(product)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              product.soldOut 
                ? 'bg-darkPurple-950/30 text-darkPurple-600 cursor-not-allowed border border-darkPurple-900/30' 
                : 'bg-gradient-to-r from-yellowGradient-start to-yellowGradient-end text-black hover:from-yellowGradient-end hover:to-yellowGradient-start border border-yellowGradient-end/50'
            }`}
            disabled={product.soldOut}
          >
            {product.soldOut ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}