import React from 'react'
import VapeSmokeEffect from './VapeSmokeEffect'

const heroVideoSrc = '/videos/login-bg.mp4' // reuse login video for hero background

export default function LandingHero({ onNavigate, onCategoryChange, onFilterChange }){
  return (
    <section className="relative overflow-hidden rounded-3xl border border-gray-800 bg-black px-6 py-16 md:px-12 md:py-24 min-h-[600px] flex items-center justify-center shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
      {/* Background video (same style as login) */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={heroVideoSrc}
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Subtle vape smoke over video for extra depth */}
      <div className="absolute inset-0 z-0">
        <VapeSmokeEffect 
          density={55} 
          speed={0.55} 
          opacity={0.45}
        />
      </div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/55 to-black/85" />

      {/* Background Logo */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none overflow-hidden">
        <img 
          src="/images/vapesmart-logo.png" 
          alt="VapeSmart Logo" 
          onError={(e) => {
            console.error('Logo image failed to load. Please ensure the image is at /public/images/vapesmart-logo.png');
          }}
          className="w-[1100px] h-[1100px] object-contain opacity-100"
          style={{ filter: 'blur(10px)' }}
        />
      </div>

      {/* Centered Text Content */}
      <div className="relative z-20 w-full flex items-center justify-center">
        <div className="max-w-4xl w-full text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-darkPurple-700 to-yellowGradient-end border border-darkPurple-700/50 px-6 py-3 text-sm uppercase tracking-[0.25em] text-black font-bold">Cloudy Vapes</div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold leading-[1.05] text-white">
            Elevate your <span className="text-yellowGradient-end">vape</span> experience
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-xl md:text-2xl">Floaty, futuristic, and responsive. Tap a device to spin it in 3D, or hover to watch it gently levitate.</p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <button 
              onClick={() => {
                // Show ALL products: clear filters, category = all
                onNavigate?.('home');
                onCategoryChange?.('all');
                onFilterChange?.({ type: 'clear' });

                setTimeout(() => {
                  const productsSection = document.getElementById('products');
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 300);
              }}
              className="px-10 py-5 rounded-full bg-gradient-to-r from-yellowGradient-start to-yellowGradient-end text-black font-bold text-lg md:text-xl shadow-lg hover:from-yellowGradient-end hover:to-yellowGradient-start transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(255,215,0,0.4)]"
            >
              Shop Now
            </button>
            <button 
              onClick={() => {
                // View Flavours: keep only products that have a flavour defined
                onNavigate?.('home');
                onCategoryChange?.('all');
                onFilterChange?.({ type: 'clear' });
                onFilterChange?.({ type: 'flavorOnly', value: true });

                setTimeout(() => {
                  const productsSection = document.getElementById('products');
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 300);
              }}
              className="px-10 py-5 rounded-full border-2 border-darkPurple-700 text-darkPurple-100 hover:border-yellowGradient-start hover:text-yellowGradient-start transition text-lg md:text-xl font-semibold"
            >
              View Flavours
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
