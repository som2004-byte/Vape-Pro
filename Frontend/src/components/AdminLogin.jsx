import React, { useState } from 'react';
import VapeSmokeEffect from './VapeSmokeEffect';
import logo from '../../public/images/vapesmart-logo.png';

export default function AdminLogin({ onAdminLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Admin login failed');
      }

      onAdminLogin(data.token, data.admin);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-darkPurple-950 via-darkPurple-950/20 to-black text-gray-100 overflow-hidden">
      <div className="fixed inset-0 z-0">
        <video 
          className="w-full h-full object-cover opacity-90"
          src="/videos/login-bg.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline
          onError={(e) => console.error("Video error:", e.target.error)}
        ></video>
      </div>
      <VapeSmokeEffect density={55} speed={0.55} opacity={0.4} />

      <div className="absolute inset-0 bg-black/60 via-black/55 to-black/85 z-[1]"></div>

      <div className="relative z-10 p-8 max-w-md w-full rounded-2xl shadow-purple-glow bg-gradient-to-br from-darkPurple-900/90 to-black/90 border border-darkPurple-700/60 backdrop-blur-sm">
        <div className="flex items-center justify-center mb-6">
          <img src={logo} alt="VapeSmart Logo" className="h-12 w-12 mr-3" />
          <h1 className="text-4xl font-bold text-yellowGradient-start">Admin Login</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-darkPurple-200">Username</label>
            <input
              type="text"
              id="username"
              className="mt-1 block w-full px-4 py-2 bg-darkPurple-800 border border-darkPurple-600 rounded-md text-gray-100 placeholder-darkPurple-400 focus:ring-yellowGradient-start focus:border-yellowGradient-start transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-darkPurple-200">Password</label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-4 py-2 bg-darkPurple-800 border border-darkPurple-600 rounded-md text-gray-100 placeholder-darkPurple-400 focus:ring-yellowGradient-start focus:border-yellowGradient-start transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-darkPurple-950 bg-yellowGradient-start hover:bg-yellowGradient-end focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellowGradient-start transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

