import React from 'react'
export default function Navbar({ user, onLogout }){
  return (
    <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-md border-b border-black/30">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/images/elfbar-pack.png" alt="logo" className="h-8 w-8 object-cover rounded-sm" />
          <div className="font-semibold text-lg">Royal Vapes</div>
        </div>

        <div className="flex-1 max-w-xl mx-6">
          <input aria-label="Search"
            className="w-full rounded-full py-2 px-4 bg-black/60 placeholder-gray-400 border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
            placeholder="Search flavour, puffs, brand..." />
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-gray-300 text-sm px-3 py-2">
              {user.username || user.email}
            </span>
          )}
          <button 
            onClick={onLogout}
            className="px-3 py-2 rounded-full bg-transparent border border-neutral-800 hover:border-purple-600 transition-colors"
          >
            {user ? 'Logout' : 'Account'}
          </button>
          <button className="px-3 py-2 rounded-full bg-yellow-500 text-black font-medium">Cart</button>
        </div>
      </div>
    </header>
  )
}
