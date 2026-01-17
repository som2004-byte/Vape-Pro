import React, { useState } from 'react';
import VapeSmokeEffect from './VapeSmokeEffect';
import API_BASE_URL from '../config';

const logo = '/images/vapesmart-logo.png';

export default function AdminLogin({ onAdminLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Admin login failed');
      }

      onAdminLogin(data.token, data.admin || data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-gray-100 overflow-hidden font-sans selection:bg-purple-500/30">
      <div className="fixed inset-0 z-0">
        <video
          className="w-full h-full object-cover opacity-40 grayscale"
          src="/videos/login-bg.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-purple-900/20 via-black/80 to-black/90 pointer-events-none" />
      <VapeSmokeEffect density={40} speed={0.3} opacity={0.4} />

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full px-8 py-6 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
          <div className="flex flex-col">
            <h1 className="text-xl font-black italic tracking-tighter text-white leading-none">VAPESMART</h1>
            <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Platform Console</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-black/80 border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl backdrop-blur-xl">

          {/* Card Internal Header */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="mb-6 relative group">
              <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src={logo} alt="Logo" className="relative h-14 w-auto filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
            </div>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-2">
              Admin Access
            </h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.25em]">
              Authorized Personnel Only
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-[0.15em] ml-2">Email Node</label>
              <input
                type="email"
                className="w-full px-6 py-3.5 bg-black/50 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:border-white/30 focus:bg-black transition-all outline-none font-bold italic text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vapesmart.ai"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-[0.15em] ml-2">Access Key</label>
              <input
                type="password"
                className="w-full px-6 py-3.5 bg-black/50 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:border-white/30 focus:bg-black transition-all outline-none font-bold italic text-sm tracking-widest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 mt-6 rounded-2xl bg-white text-black font-black uppercase tracking-[0.15em] hover:bg-gray-200 hover:scale-[1.01] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Initiate Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => alert('Please contact the System Supervisor for access key reset protocols.')}
              className="text-[9px] font-bold text-gray-500 hover:text-white uppercase tracking-[0.15em] transition-colors mb-4 block w-full"
            >
              Forgot Access Key?
            </button>
            <a href="#" className="text-[9px] font-bold text-gray-600 hover:text-gray-400 uppercase tracking-[0.15em] transition-colors">
              Need a master node? Register Here
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
