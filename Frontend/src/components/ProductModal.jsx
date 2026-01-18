import React from 'react'
import { Dialog } from '@headlessui/react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import VapeSmokeEffect from './VapeSmokeEffect'

function Model({ url }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} dispose={null} />
}

const modalVideoSrc = '/videos/login-bg.mp4' // reuse hero/login background

export default function ProductModal({ product, onClose, onAddToCart, onBuyNow }) {
  return (
    <Dialog open={true} onClose={onClose} className="relative z-[2000]">
      <div className="fixed inset-0 bg-black/90" aria-hidden="true" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all border border-neutral-800">
            <div className="flex justify-between items-start mb-4">
              <div className="pr-8">
                {product.brand && (
                  <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">{product.brand}</p>
                )}
                <h3 className="text-xl md:text-2xl font-semibold text-white leading-tight">
                  {product.name || (product.series + (product.flavor ? ` - ${product.flavor}` : ''))}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-700 rounded-full transition-colors z-20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product visual with video + smoke background */}
              <div className="relative h-64 md:h-96 rounded-xl bg-black/40 overflow-hidden w-full group">
                {/* Background video */}
                <video
                  className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
                  src={modalVideoSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                />

                {/* Smoke effect over video */}
                <div className="absolute inset-0">
                  <VapeSmokeEffect density={45} speed={0.5} opacity={0.45} />
                </div>

                {/* Dark overlay for contrast */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/65 to-black/85" />

                {/* Foreground product content */}
                <div className="relative z-10 h-full flex items-center justify-center p-4">
                  {product.modelUrl ? (
                    <Canvas camera={{ fov: 35, position: [0, 0, 3] }}>
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[5, 10, 5]} intensity={1.2} />
                      <Suspense fallback={<img src={product.poster} alt="poster" className="w-full h-full object-contain" />}>
                        <Model url={product.modelUrl} />
                        <Environment preset="city" />
                      </Suspense>
                      <OrbitControls enableZoom={false} />
                    </Canvas>
                  ) : (
                    <img
                      src={product.poster || product.cardImage}
                      alt={product.series || product.name}
                      className="w-full h-full object-contain float-soft drop-shadow-2xl"
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="flex items-center gap-3">
                        <span className="text-xl text-gray-400 line-through">
                          ₹{product.originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-sm font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                          SAVE {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                      </div>
                    )}
                    <div className="text-4xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent mt-1">
                      ₹{product.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="space-y-3 bg-neutral-800/30 p-4 rounded-xl border border-neutral-800">
                    {product.type && (
                      <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-2 last:border-0 last:pb-0">
                        <span className="text-gray-500 font-medium">Type</span>
                        <span className="text-gray-200">{product.type}</span>
                      </div>
                    )}
                    {product.puffs && (
                      <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-2 last:border-0 last:pb-0">
                        <span className="text-gray-500 font-medium">Puffs</span>
                        <span className="text-gray-200">{product.puffs.toLocaleString()}</span>
                      </div>
                    )}
                    {product.nicotine && (
                      <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-2 last:border-0 last:pb-0">
                        <span className="text-gray-500 font-medium">Nicotine</span>
                        <span className="text-gray-200">{product.nicotine}</span>
                      </div>
                    )}
                    {product.features && (
                      <div className="flex justify-between items-top text-sm border-b border-neutral-800 pb-2 last:border-0 last:pb-0">
                        <span className="text-gray-500 font-medium">Features</span>
                        <span className="text-gray-200 text-right max-w-[60%]">{product.features}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className={`px-4 py-3.5 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg ${product.soldOut
                        ? 'bg-neutral-800 text-gray-500 cursor-not-allowed shadow-none'
                        : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-yellow-500/20'}`}
                      disabled={product.soldOut}
                      onClick={() => {
                        if (product.soldOut) return;
                        if (onBuyNow) {
                          onBuyNow(product)
                        } else if (onAddToCart) {
                          onAddToCart(product)
                        }
                        onClose?.()
                      }}
                    >
                      {product.soldOut ? 'Unavailable' : 'Buy Now'}
                    </button>
                    <button
                      className={`px-4 py-3.5 rounded-xl border font-semibold transition-all transform active:scale-95 ${product.soldOut
                        ? 'border-neutral-800 bg-neutral-900 text-gray-600 cursor-not-allowed'
                        : 'border-neutral-700 bg-neutral-800/50 text-white hover:bg-neutral-800 hover:border-neutral-600'}`}
                      disabled={product.soldOut}
                      onClick={() => {
                        if (product.soldOut) return;
                        onAddToCart?.(product)
                        onClose?.()
                      }}
                    >
                      {product.soldOut ? 'Sold Out' : 'Add to Cart'}
                    </button>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-500 bg-neutral-950/50 p-3 rounded-lg">
                    <span className="text-yellow-500 text-base">⚠️</span>
                    <p>Products may be subject to local law. Verify age and legality before purchase.</p>
                  </div>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  )
}
