import React from 'react'
import VapeSmokeEffect from './VapeSmokeEffect'

const heroVideoSrc = '/videos/login-bg.mp4' // reuse login video for hero background

export default function LandingHero({ onNavigate }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-gray-800 bg-black px-6 py-16 md:px-12 md:py-24 min-h-[700px] flex items-center justify-center shadow-[0_30px_80px_rgba(0,0,0,0.35)] mx-4 md:mx-8 mt-4">
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover grayscale opacity-60"
        src={heroVideoSrc}
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Subtle vape smoke over video */}
      <div className="absolute inset-0 z-0">
        <VapeSmokeEffect
          density={55}
          speed={0.4}
          opacity={0.3}
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />

      {/* Background Logo Decoration */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none overflow-hidden select-none">
        <img
          src="/images/vapesmart-logo.png"
          alt=""
          className="w-[1200px] h-[1200px] object-contain opacity-[0.03] scale-150"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 w-full flex items-center justify-center">
        <div className="max-w-5xl w-full text-center space-y-10">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 px-8 py-3.5 text-xs uppercase tracking-[0.4em] text-purple-400 font-black animate-pulse">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
            Vape-Pro Network
          </div>

          <h1 className="text-7xl md:text-9xl font-black leading-[0.9] text-white tracking-tighter">
            PRO <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500">ADMIN</span><br />
            SOLUTIONS.
          </h1>

          <p className="text-darkPurple-300 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            A premium command center for your vaping fleet. Monitor activity, manage users, and process bulk requirements with real-time precision.
          </p>

          <div className="flex flex-wrap gap-6 justify-center pt-8">
            <button
              onClick={() => onNavigate?.('account')}
              className="group relative px-12 py-5 rounded-full bg-white text-black font-black text-sm uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              <span className="relative z-10">Manage Profile</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>

            <button
              onClick={() => {
                const adminSection = document.getElementById('admin-link');
                if (adminSection) adminSection.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-12 py-5 rounded-full border border-gray-700 text-white font-black text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all hover:border-white"
            >
              Network Status
            </button>
          </div>
        </div>
      </div>

      {/* Elegant bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
    </section>
  )
}
