import React, { useState } from 'react';
import VapeSmokeEffect from './VapeSmokeEffect';
import API_BASE_URL from '../config';

const logo = '/images/vapesmart-logo.png';

export default function AdminLogin({ onAdminLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

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

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Admin signup failed');
      }

      setSuccess('Admin account created successfully! You can now login.');
      setIsLogin(true);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black text-gray-100 overflow-hidden">
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

      <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-purple-900/40 z-[1]"></div>

      <div className="relative z-10 p-10 max-w-md w-full rounded-[40px] bg-black/60 border border-white/10 backdrop-blur-3xl shadow-[0_0_100px_rgba(168,85,247,0.15)]">
        <div className="flex flex-col items-center mb-10">
          <img src={logo} alt="Logo" className="h-16 w-16 mb-4 filter drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
            {isLogin ? 'Admin Access' : 'Register Node'}
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-2 uppercase tracking-widest">
            {isLogin ? 'Authorized Personnel Only' : 'System Administrator Invite'}
          </p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 text-green-400 rounded-2xl text-sm font-bold italic">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-2xl text-sm font-bold italic">
            {error}
          </div>
        )}

        <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input
                type="text"
                className="w-full px-6 py-4 bg-black border border-gray-800 rounded-2xl text-white placeholder-gray-700 focus:border-purple-500 transition-all outline-none font-bold italic"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Node</label>
            <input
              type="email"
              className="w-full px-6 py-4 bg-black border border-gray-800 rounded-2xl text-white placeholder-gray-700 focus:border-purple-500 transition-all outline-none font-bold italic"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@vapesmart.ai"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Access Key</label>
            <input
              type="password"
              className="w-full px-6 py-4 bg-black border border-gray-800 rounded-2xl text-white placeholder-gray-700 focus:border-purple-500 transition-all outline-none font-bold italic"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Confirm Key</label>
              <input
                type="password"
                className="w-full px-6 py-4 bg-black border border-gray-800 rounded-2xl text-white placeholder-gray-700 focus:border-purple-500 transition-all outline-none font-bold italic"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-5 px-4 mt-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-xl shadow-white/5 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Initiate Login' : 'Create Admin')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
            className="text-[10px] font-black text-gray-500 hover:text-purple-400 uppercase tracking-widest transition-colors"
          >
            {isLogin ? "Need a master node? Register here" : "Return to authorized entry"}
          </button>
        </div>
      </div>
    </div>
  );
}
