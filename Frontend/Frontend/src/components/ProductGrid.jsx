import React, { useState } from 'react'
import ProductCard from './ProductCard'

export default function ProductGrid({
  products,
  onOpen,
  category,
  activeFilters,
  onFilterChange,
  onAddToCart // Accept onAddToCart prop
}) {
  const [sortBy, setSortBy] = useState('best-selling')
  const [filterAvailability, setFilterAvailability] = useState('all')

  // Filter products
  let filteredProducts = [...products]
  
  // Availability filter
  if (filterAvailability === 'in-stock') {
    filteredProducts = filteredProducts.filter(p => !p.soldOut)
  } else if (filterAvailability === 'sold-out') {
    filteredProducts = filteredProducts.filter(p => p.soldOut)
  }

  // Sort products
  switch(sortBy) {
    case 'price-low':
      filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0))
      break
    case 'price-high':
      filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0))
      break
    case 'name':
      filteredProducts.sort((a, b) => {
        const nameA = a.series || a.name || `${a.brand} ${a.flavor || ''}`
        const nameB = b.series || b.name || `${b.brand} ${b.flavor || ''}`
        return nameA.localeCompare(nameB)
      })
      break
    case 'best-selling':
    default:
      // Sort by best selling first
      filteredProducts.sort((a, b) => {
        if (a.isBestSelling && !b.isBestSelling) return -1
        if (!a.isBestSelling && b.isBestSelling) return 1
        return 0
      })
      break
  }

  const clearFilters = () => {
    setFilterAvailability('all')
    onFilterChange?.({ type: 'clear' })
  }

  const hasActiveFilters = filterAvailability !== 'all' || activeFilters.brand || activeFilters.subCategory || activeFilters.price || activeFilters.puffs

  return (
    <div className="space-y-6">
      {/* Filters and Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-purple-900/30">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-purple-300 text-sm font-medium">Filter:</span>
          
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="px-4 py-2 bg-purple-950/50 border border-purple-800/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 cursor-pointer"
          >
            <option value="all">Availability</option>
            <option value="in-stock">In Stock</option>
            <option value="sold-out">Sold Out</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-700/50 rounded-lg text-purple-200 text-sm hover:bg-purple-800/50 transition-colors"
            >
              Clear Filters
            </button>
          )}

          {/* Active filter badges */}
          {activeFilters.brand && (
            <span className="px-3 py-1 bg-yellow-400/20 border border-yellow-400/30 rounded-full text-yellow-400 text-xs font-medium">
              Brand: {activeFilters.brand} ×
            </span>
          )}
          {activeFilters.subCategory && (
            <span className="px-3 py-1 bg-yellow-400/20 border border-yellow-400/30 rounded-full text-yellow-400 text-xs font-medium">
              Series: {activeFilters.subCategory} ×
            </span>
          )}
          {activeFilters.price && (
            <span className="px-3 py-1 bg-yellow-400/20 border border-yellow-400/30 rounded-full text-yellow-400 text-xs font-medium">
              Price: {activeFilters.price.label} ×
            </span>
          )}
          {activeFilters.puffs && (
            <span className="px-3 py-1 bg-yellow-400/20 border border-yellow-400/30 rounded-full text-yellow-400 text-xs font-medium">
              Puffs: {activeFilters.puffs.label} ×
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-purple-300 text-sm font-medium">{filteredProducts.length} products</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-purple-950/50 border border-purple-800/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 cursor-pointer"
          >
            <option value="best-selling">Sort by: Best selling</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ProductCard 
                product={product} 
                onOpen={onOpen}
                onAddToCart={onAddToCart} // Pass onAddToCart to ProductCard
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-purple-400 text-lg">No products found</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-700/50 rounded-lg text-purple-200 hover:bg-purple-800/50 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}