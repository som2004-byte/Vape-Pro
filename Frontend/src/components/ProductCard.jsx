import React from 'react'

export default function ProductCard({ product, onOpen }){
  return (
    <div className="bg-gradient-to-br from-black/30 to-neutral-900 border border-neutral-800 rounded-xl p-4 hover:shadow-[0_10px_30px_rgba(124,58,237,0.12)] transition-transform transform hover:-translate-y-1">
      <div className="h-64 rounded-md bg-black/60 flex items-center justify-center overflow-hidden">
        <img src={product.cardImage || product.poster} alt={product.name} className="object-contain h-full hover-spin" />
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-xs text-purple-300 mt-1">{product.short}</p>
          </div>
          <div className="text-yellow-400 font-bold">₹{product.price}</div>
        </div>
        <p className="text-sm text-gray-400 mt-2">{product.puffs} puffs · {product.nicotine}</p>
        <div className="mt-3 flex gap-2">
          <button onClick={() => onOpen(product)} className="px-3 py-2 rounded-full bg-purple-700 text-sm">View</button>
          <button className="px-3 py-2 rounded-full border border-neutral-700 text-sm">Add</button>
        </div>
      </div>
    </div>
  )
}
