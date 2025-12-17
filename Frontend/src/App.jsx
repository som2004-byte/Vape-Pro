import React, { useState } from 'react'
import Navbar from './components/Navbar'
import LandingHero from './components/LandingHero'
import Hero3D from './components/Hero3D'
import FloatingShowcase from './components/FloatingShowcase'
import ProductGrid from './components/ProductGrid'
import ProductModal from './components/ProductModal'
import LoginSignup from './components/LoginSignup'
import { PRODUCTS } from './data'

export default function App(){
  const [selected, setSelected] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  
  const floatingItems = [
    { src: '/images/elfbar-pineapple.png', title: 'Elfbar BC20000', flavor: 'Pineapple Ice' },
    { src: '/images/elfbar-pineapple-clear.png', title: 'Elfbar BC20000', flavor: 'Pineapple Ice (Clear)' },
    { src: '/images/Screenshot_20250127_143406_Chrome-300x300-removebg-preview.png', title: 'Star Bar', flavor: 'Cosmic Mix' },
    { src: '/images/elfbar-watermelon.png', title: 'Elfbar BC20000', flavor: 'Watermelon Ice' }
  ]
  
  const handleLogin = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
  }
  
  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
  }
  
  if (!isLoggedIn) {
    return <LoginSignup onLogin={handleLogin} />
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-zinc-900 text-gray-100">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-8">
        <LandingHero />
        <div className="mt-12">
          <Hero3D product={PRODUCTS[0]} />
        </div>
        <FloatingShowcase items={floatingItems} />
        <section id="grid" className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Featured</h2>
          <ProductGrid products={PRODUCTS} onOpen={(p)=>setSelected(p)} />
        </section>
      </main>
      {selected && <ProductModal product={selected} onClose={()=>setSelected(null)} />}
    </div>
  )
}
