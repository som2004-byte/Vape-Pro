import React from 'react'
import ProductCard from './ProductCard'

export default function ProductGrid({ products, onOpen }){
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(p => <ProductCard key={p.id} product={p} onOpen={onOpen} />)}
    </div>
  )
}
