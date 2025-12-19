import React from 'react'
import { Dialog } from '@headlessui/react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import VapeSmokeEffect from './VapeSmokeEffect'

function Model({ url }){
  const { scene } = useGLTF(url)
  return <primitive object={scene} dispose={null} />
}

const modalVideoSrc = '/videos/login-bg.mp4' // reuse hero/login background

export default function ProductModal({ product, onClose, onAddToCart, onBuyNow }){
  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="bg-neutral-900 rounded-2xl max-w-4xl w-full mx-4 p-6 z-10">
        <div className="flex justify-between items-start">
          <div>
            {product.brand && (
              <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">{product.brand}</p>
            )}
            <h3 className="text-2xl font-semibold">
              {product.series || product.name}
              {product.flavor && ` - ${product.flavor}`}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Product visual with video + smoke background */}
          <div className="relative h-96 rounded-md bg-black/40 overflow-hidden">
            {/* Background video */}
            <video
              className="absolute inset-0 w-full h-full object-cover opacity-60"
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
            <div className="relative z-10 h-full flex items-center justify-center p-2">
              {product.modelUrl ? (
                <Canvas camera={{ fov: 35, position: [0,0,3] }}>
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[5,10,5]} intensity={1.2} />
                  <Suspense fallback={<img src={product.poster} alt="poster" className="w-full h-full object-cover" />}>
                    <Model url={product.modelUrl} />
                    <Environment preset="city" />
                  </Suspense>
                  <OrbitControls />
                </Canvas>
              ) : (
                <img
                  src={product.poster || product.cardImage}
                  alt={product.series || product.name}
                  className="w-full h-full object-contain float-soft"
                />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-yellowGradient-end font-bold text-2xl">₹{product.price?.toLocaleString()}</div>
            <div className="space-y-1 text-gray-300">
              {product.type && <p className="text-sm"><span className="text-gray-500">Type:</span> {product.type}</p>}
              {product.puffs && <p className="text-sm"><span className="text-gray-500">Puffs:</span> {product.puffs.toLocaleString()}</p>}
              {product.nicotine && <p className="text-sm"><span className="text-gray-500">Nicotine:</span> {product.nicotine}</p>}
              {product.features && <p className="text-sm"><span className="text-gray-500">Features:</span> {product.features}</p>}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="px-4 py-3 rounded-full bg-yellowGradient-end text-black font-semibold hover:bg-yellow-300 transition-colors"
                onClick={() => {
                  if (onBuyNow) {
                    onBuyNow(product)
                  } else if (onAddToCart) {
                    onAddToCart(product)
                  }
                  onClose?.()
                }}
              >
                Buy now
              </button>
              <button
                className="px-4 py-3 rounded-full border border-neutral-700 hover:bg-neutral-800/60 transition-colors"
                onClick={() => {
                  onAddToCart?.(product)
                  onClose?.()
                }}
              >
                Add to cart
              </button>
            </div>
            <div className="text-sm text-gray-400 mt-4">⚠️ Products may be subject to local law. Verify age and legality before purchase.</div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
