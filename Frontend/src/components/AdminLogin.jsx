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
    <div className="relative min-h-screen flex items-center justify-center bg-black text-gray-100 overflow-hidden font-sans">
      <div className="fixed inset-0 z-0">
        <video
          className="w-full h-full object-cover opacity-60 grayscale"
          src="/videos/login-bg.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
      <VapeSmokeEffect density={60} speed={0.4} opacity={0.3} />

      {/* Cyberpunk Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,24,0.9),rgba(18,18,24,0.9)),linear-gradient(0deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] z-[1] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-lg p-8 md:p-12 rounded-[2rem] bg-black/40 border border-white/5 backdrop-blur-3xl shadow-[0_0_80px_rgba(139,92,246,0.15)] overflow-hidden group">

        {/* Animated Glow Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
            <img src={logo} alt="Logo" className="relative h-20 w-auto filter drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-2">
            Admin Access
          </h1>
          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-3 opacity-50" />
          <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-[0.3em]">
            Authorized Personnel Only
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border-l-4 border-red-500 text-red-200 rounded-r-lg text-sm font-medium shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="group/input">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1 group-focus-within/input:text-purple-400 transition-colors">Email Node</label>
            <div className="relative">
              <input
                type="email"
                className="w-full pl-4 pr-4 py-4 bg-black/60 border-2 border-white/5 rounded-xl text-white placeholder-gray-600 focus:border-purple-500/50 focus:bg-black/80 focus:shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all outline-none font-mono text-sm tracking-wide"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vapesmart.ai"
                required
              />
            </div>
          </div>

          <div className="group/input">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1 group-focus-within/input:text-purple-400 transition-colors">Access Key</label>
            <div className="relative">
              <input
                type="password"
                className="w-full pl-4 pr-4 py-4 bg-black/60 border-2 border-white/5 rounded-xl text-white placeholder-gray-600 focus:border-purple-500/50 focus:bg-black/80 focus:shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all outline-none font-mono text-sm tracking-wide"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="relative w-full py-4 mt-6 rounded-xl overflow-hidden group/btn font-black uppercase tracking-widest text-white shadow-2xl shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 transition-all duration-300 group-hover/btn:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Authenticating...
                </>
              ) : (
                <>Initiate Login <span className="text-lg">→</span></>
              )}
            </span>
          </button>
        </form>
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-6 text-center w-full">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest">© 2024 VapeSmart Secure Systems • v2.1.0-RC</p>
      </div>
    </div>
  );
}
