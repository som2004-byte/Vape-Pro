import React from 'react'

const PRODUCTS = [
  {
    id: 'pineapple',
    name: 'Elfbar BC20000',
    flavor: 'Pineapple Ice',
    image: '/images/elfbar-pineapple.png'
  },
  {
    id: 'pineapple-clear',
    name: 'Elfbar BC20000',
    flavor: 'Pineapple Ice (Clear)',
    image: '/images/elfbar-pineapple-clear.png'
  },
  {
    id: 'watermelon',
    name: 'Elfbar BC20000',
    flavor: 'Watermelon Ice',
    image: '/images/elfbar-watermelon.png',
    fallback: '/images/elfbar-product.png'
  }
]

export default function LandingHero(){
  return (
    <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-br from-indigo-900 via-purple-900 to-black px-6 py-12 md:px-12 md:py-16 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 bg-gradient-radial from-purple-700/25 via-transparent to-black" aria-hidden="true" />
      <div className="relative grid gap-10 md:grid-cols-[1.3fr_1fr] items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-purple-100">Cloudy Vapes</div>
          <h1 className="text-5xl md:text-6xl font-bold leading-[1.05]">
            Elevate your <span className="text-gradient">vape</span> experience
          </h1>
          <p className="text-gray-200/90 max-w-xl">Floaty, futuristic, and responsive. Tap a device to spin it in 3D, or hover to watch it gently levitate.</p>
          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 text-black font-semibold shadow-lg shadow-purple-700/30">Shop Now</button>
            <button className="px-6 py-3 rounded-full border border-white/20 text-white/90 hover:border-white/40 transition">View Flavours</button>
          </div>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRODUCTS.map((item, idx) => (
            <div
              key={item.id}
              className="relative rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 overflow-hidden hover:border-white/20 transition"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" aria-hidden="true" />
              <img
                src={item.image}
                alt={item.name}
                className={`relative mx-auto h-72 object-contain cursor-pointer drop-shadow-[0_30px_60px_rgba(0,0,0,0.35)] hover-spin ${
                  idx % 2 === 0 ? 'float-soft' : 'float-soft-delay'
                }`}
              />
              <div className="relative mt-3 text-center">
                <p className="text-sm uppercase tracking-[0.2em] text-purple-200">Tap to rotate</p>
                <p className="text-lg font-semibold text-white">{item.name}</p>
                <p className="text-sm text-gray-300">{item.flavor}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

