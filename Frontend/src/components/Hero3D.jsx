import React, { Suspense, useState, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import { PRODUCTS } from '../data'

function Model({ url }){
  const { scene } = useGLTF(url)
  return <primitive object={scene} dispose={null} />
}

export default function Hero3D({ product, onNavigate, onCategoryChange, onFilterChange, onOpenProduct }){
  // Build a curated "premium collection" carousel from best-selling products
  const premiumProducts = useMemo(
    () =>
      PRODUCTS.filter((p) => p.isBestSelling)
        // keep disposable and podkits first to match hero vibe
        .sort((a, b) => {
          const order = { disposable: 0, podkits: 1, nic: 2 }
          return (order[a.mainCategory] || 99) - (order[b.mainCategory] || 99)
        }),
    []
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [show3D, setShow3D] = useState(false)
  const touchStartX = useRef(null)

  const currentProduct =
    premiumProducts[currentIndex] || product || premiumProducts[0]

  const hasModel = !!currentProduct?.modelUrl

  const goToIndex = (index) => {
    if (!premiumProducts.length) return
    const total = premiumProducts.length
    const next = (index + total) % total
    setCurrentIndex(next)
    setShow3D(false)
  }

  const handleSwipeStart = (e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? null
  }

  const handleSwipeEnd = (e) => {
    if (touchStartX.current == null) return
    const endX = e.changedTouches?.[0]?.clientX ?? touchStartX.current
    const delta = endX - touchStartX.current
    const threshold = 40
    if (delta > threshold) {
      goToIndex(currentIndex - 1)
    } else if (delta < -threshold) {
      goToIndex(currentIndex + 1)
    }
    touchStartX.current = null
  }

  return (
    <section className="grid md:grid-cols-2 gap-6 items-center py-10">
      <div>
        <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-darkPurple-700 to-yellowGradient-end text-black text-xs font-semibold">Premium Collection</div>
        <h1 className="mt-6 text-5xl md:text-6xl font-serif leading-tight text-white">
          BREATHE <span className="text-yellowGradient-start">ROYALTY</span>
        </h1>
        <p className="mt-4 text-darkPurple-300 max-w-xl">Experience the pinnacle of vaping technology — precision engineering, luxury finishes, and unforgettable flavours.</p>
        <div className="mt-6 flex gap-3">
          <button
            className="px-6 py-3 rounded-full bg-gradient-to-r from-darkPurple-700 to-yellowGradient-end text-black font-semibold"
            onClick={() => {
              // Show ALL products
              onNavigate?.('home')
              onCategoryChange?.('all')
              onFilterChange?.({ type: 'clear' })
              setTimeout(() => {
                const productsSection = document.getElementById('products')
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: 'smooth' })
                }
              }, 300)
            }}
          >
            Shop now
          </button>
          <button
            className="px-6 py-3 rounded-full border border-darkPurple-700 text-darkPurple-100 hover:border-yellowGradient-end hover:text-yellowGradient-end transition-colors"
            onClick={() => {
              // View this collection: filter by this product's brand so all its sub-variants show
              onNavigate?.('home')
              onCategoryChange?.('all')
              onFilterChange?.({ type: 'clear' })
              if (product?.brand) {
                onFilterChange?.({ type: 'brand', value: product.brand })
              }
              setTimeout(() => {
                const productsSection = document.getElementById('products')
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: 'smooth' })
                }
              }, 300)
            }}
          >
            View collection
          </button>
        </div>
      </div>

      {/* Premium collection carousel */}
      <div
        className="h-[26rem] rounded-2xl bg-black/40 p-4 flex flex-col justify-between overflow-hidden border border-neutral-800 group"
        onTouchStart={handleSwipeStart}
        onTouchEnd={handleSwipeEnd}
      >
        <div
          className="relative flex-1 flex items-center justify-center cursor-pointer"
          onClick={() => currentProduct && onOpenProduct?.(currentProduct)}
        >
          {!hasModel || !show3D ? (
            <>
              {/* Blurred background using same product image */}
              <div className="absolute inset-0 scale-110 opacity-70">
                <img
                  src={currentProduct?.poster}
                  alt=""
                  className="w-full h-full object-cover blur-xl transform scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/40 to-black/80" />
              </div>

              {/* Foreground product */}
              <img
                src={currentProduct?.poster}
                alt={currentProduct?.name || currentProduct?.flavor || 'Premium collection product'}
                className="relative object-contain max-h-[18rem] w-auto transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_20px_60px_rgba(0,0,0,0.9)] float-soft-slower"
              />
              {hasModel && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShow3D(true)
                  }}
                  className="absolute right-4 bottom-4 bg-purple-700/90 text-white px-3 py-1 rounded-full text-sm shadow-lg"
                >
                  View 3D
                </button>
              )}
            </>
          ) : (
            <Canvas camera={{ fov: 35, position: [0, 0, 3] }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 10, 5]} intensity={1.2} />
              <Suspense
                fallback={
                  <img
                    src={currentProduct?.poster}
                    alt="poster"
                    className="w-full h-full object-cover"
                  />
                }
              >
                <Model url={currentProduct.modelUrl} />
                <Environment preset="studio" />
              </Suspense>
              <OrbitControls enablePan={false} />
            </Canvas>
          )}

          {/* Left/Right controls */}
          {premiumProducts.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goToIndex(currentIndex - 1)
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 border border-white/10 p-2 text-white hover:bg-black/80 transition-colors"
                aria-label="Previous product"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goToIndex(currentIndex + 1)
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 border border-white/10 p-2 text-white hover:bg-black/80 transition-colors"
                aria-label="Next product"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Product meta + dots */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-darkPurple-300">
              {currentProduct?.brand} {currentProduct?.series}
            </p>
            <p className="text-base text-gray-300">
              {currentProduct?.flavor || currentProduct?.type || ''}
            </p>
          </div>
          {premiumProducts.length > 1 && (
            <div className="flex items-center gap-1">
              {premiumProducts.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => goToIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-5 bg-yellowGradient-end'
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
