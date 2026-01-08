import React, { useState } from 'react';

export default function Navbar({
  user,
  onLogout,
  onNavigate,
  isAdminLoggedIn,
  adminUser,
  onAdminLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] bg-black/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => onNavigate?.('home')}
              className="flex-shrink-0 flex items-center gap-4 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <img
                  className="h-10 w-auto relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                  src="/images/vapesmart-logo.png"
                  alt="VapeSmart"
                />
              </div>
              <div className="flex flex-col items-start relative z-10">
                <span className="text-2xl font-black bg-gradient-to-r from-white via-purple-400 to-pink-500 bg-clip-text text-transparent leading-none tracking-tighter uppercase italic">
                  VapeMaster {isAdminLoggedIn ? <span className="text-purple-500 not-italic">Pro</span> : ''}
                </span>
                <span className="text-[9px] uppercase tracking-[0.4em] font-black text-white/30 group-hover:text-purple-400/60 transition-colors">
                  Platform Console
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <button
              onClick={() => onNavigate?.('home')}
              className="text-[11px] font-black text-gray-400 hover:text-white transition-all uppercase tracking-[0.2em] relative group"
            >
              Home Console
              <span className="absolute -bottom-1 left-0 w-0 h-[3px] bg-purple-600 transition-all group-hover:w-full" />
            </button>

            {(user || isAdminLoggedIn) && (
              <button
                onClick={() => onNavigate?.('account')}
                className="text-[11px] font-black text-gray-400 hover:text-white transition-all uppercase tracking-[0.2em] relative group"
              >
                Access Profile
                <span className="absolute -bottom-1 left-0 w-0 h-[3px] bg-purple-600 transition-all group-hover:w-full" />
              </button>
            )}

            {!isAdminLoggedIn && (
              <button
                onClick={() => onNavigate?.('adminLogin')}
                className="text-[11px] font-black text-gray-500 hover:text-purple-400 transition-all uppercase tracking-[0.2em]"
              >
                Admin Access
              </button>
            )}

            {isAdminLoggedIn && (
              <button
                onClick={() => onNavigate?.('adminDashboard')}
                className="px-6 py-2 rounded-xl bg-purple-600/10 border border-purple-500/30 text-purple-400 text-[11px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all shadow-lg shadow-purple-600/20"
              >
                Command Center
              </button>
            )}

            <div className="h-6 w-[1px] bg-white/10" />

            {user || isAdminLoggedIn ? (
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-white truncate max-w-[150px] uppercase tracking-tighter">
                    {(user && (user.username || user.email)) || (isAdminLoggedIn && adminUser && adminUser.username)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">
                      {isAdminLoggedIn ? 'Superuser' : 'Operator'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={isAdminLoggedIn ? onAdminLogout : onLogout}
                  className="px-6 py-2.5 rounded-xl bg-white text-black text-[10px] font-black shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                >
                  Terminate
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate?.('login')}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-black shadow-2xl shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest border border-white/10"
              >
                Authorized Login
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-3 rounded-xl bg-gray-900 border border-white/5 text-gray-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 bg-black/98 backdrop-blur-2xl md:hidden transition-all duration-500 ease-in-out ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
        <div className="flex flex-col items-center justify-center h-full space-y-10 p-6">
          <button onClick={() => { onNavigate?.('home'); setMobileMenuOpen(false); }} className="text-4xl font-black text-white italic uppercase tracking-tighter">Home</button>
          {(user || isAdminLoggedIn) && (
            <button onClick={() => { onNavigate?.('account'); setMobileMenuOpen(false); }} className="text-4xl font-black text-white italic uppercase tracking-tighter">Profile</button>
          )}

          <div className="w-12 h-1 bg-white/10 rounded-full" />

          {!isAdminLoggedIn && (
            <button onClick={() => { onNavigate?.('adminLogin'); setMobileMenuOpen(false); }} className="text-2xl font-bold text-gray-500 uppercase tracking-widest">Admin Master</button>
          )}

          {isAdminLoggedIn && (
            <button onClick={() => { onNavigate?.('adminDashboard'); setMobileMenuOpen(false); }} className="text-4xl font-black text-purple-500 italic uppercase tracking-tighter">Dashboard</button>
          )}

          {user || isAdminLoggedIn ? (
            <button
              onClick={() => {
                if (isAdminLoggedIn) onAdminLogout?.();
                else onLogout?.();
                setMobileMenuOpen(false);
              }}
              className="px-12 py-5 rounded-2xl bg-red-600 text-white font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-red-600/30"
            >
              Terminate Session
            </button>
          ) : (
            <button
              onClick={() => { onNavigate?.('login'); setMobileMenuOpen(false); }}
              className="px-12 py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-purple-600/40"
            >
              Auth Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
