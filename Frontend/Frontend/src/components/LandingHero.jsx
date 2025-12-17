import React from 'react'
import VapeSmokeEffect from './VapeSmokeEffect'

export default function LandingHero(){
  return (
    <section className="relative overflow-hidden rounded-3xl border border-gray-800 bg-black px-6 py-16 md:px-12 md:py-24 min-h-[600px] flex items-center justify-center shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
      {/* Luxury Vape Smoke Effect - Behind everything */}
      {/* <div className="absolute inset-0 z-0">
        <VapeSmokeEffect 
          density={60} 
          speed={0.6} 
          opacity={0.5}
        />
      </div> */}

      {/* Background Logo */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none overflow-hidden">
        <img 
          src="/images/vapesmart-logo.png" 
          alt="VapeSmart Logo" 
          onError={(e) => {
            console.error('Logo image failed to load. Please ensure the image is at /public/images/vapesmart-logo.png');
          }}
          className="w-[1100px] h-[1100px] object-contain opacity-100"
          style={{ filter: 'blur(6px)' }}
        />
      </div>

      {/* Centered Text Content */}
      <div className="relative z-20 w-full flex items-center justify-center">
        <div className="max-w-4xl w-full text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-900 border border-gray-800 px-6 py-3 text-sm uppercase tracking-[0.25em] text-gray-300">Cloudy Vapes</div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold leading-[1.05] text-white">
            Elevate your <span className="text-yellow-500">vape</span> experience
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-xl md:text-2xl">Floaty, futuristic, and responsive. Tap a device to spin it in 3D, or hover to watch it gently levitate.</p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <button className="px-10 py-5 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold text-lg md:text-xl shadow-lg hover:opacity-90 transition-opacity">Shop Now</button>
            <button className="px-10 py-5 rounded-full border-2 border-gray-700 text-white hover:border-gray-600 transition text-lg md:text-xl font-semibold">View Flavours</button>
          </div>
        </div>
      </div>
    </section>
  )
}

