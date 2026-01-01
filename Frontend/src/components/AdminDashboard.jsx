import React, { useState, useEffect } from 'react';
import API_BASE_URL_ROOT from '../config';

export default function AdminDashboard({ adminUser, adminToken, onLogout }) {
  // Navigation and view states
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRequirement, setSelectedRequirement] = useState(null);

  // Data states
  const [users, setUsers] = useState([]);
  const [clientRequirements, setClientRequirements] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRequirements: 0,
    pendingRequirements: 0
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE_URL = `${API_BASE_URL_ROOT}/api/admin`;

  // Fetch data from API
  const fetchData = async (endpoint, setter) => {
    try {
      if (!adminToken) return;
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setter(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      if (!adminToken) return;
      const response = await fetch(`${API_BASE_URL}/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchData('/users', setUsers);
    fetchData('/client-requirements', setClientRequirements);
    fetchStats();
  };

  // Initial data load
  useEffect(() => {
    handleRefresh();
  }, [adminToken]);

  // Filter functions
  const filteredUsers = Array.isArray(users) ? users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const filteredRequirements = Array.isArray(clientRequirements) ? clientRequirements.filter(req =>
    req.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const requirementStatusColors = {
    'Urgent': 'bg-red-500/20 border-red-500 text-red-400',
    'New': 'bg-cyan-500/20 border-cyan-500 text-cyan-400',
    'In Review': 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
    'Processed': 'bg-green-500/20 border-green-500 text-green-400',
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">
                Portal<span className="text-purple-500">Master</span> <span className="text-sm font-medium text-gray-500 not-italic tracking-normal lowercase ml-2">v2.4.0</span>
              </h1>
            </div>
            <p className="text-darkPurple-400 font-medium">Welcome back, <span className="text-white">{adminUser?.name || 'Administrator'}</span>. System status is nominal.</p>
          </div>

          <div className="flex items-center gap-4">
            {(selectedUser || selectedRequirement) && (
              <button
                onClick={() => { setSelectedUser(null); setSelectedRequirement(null); }}
                className="px-5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Return
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-500/50 transition-all"
              title="Refresh Data"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            <button
              onClick={onLogout}
              className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Global Tabs */}
        {!selectedUser && !selectedRequirement && (
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'overview', label: 'Command Center', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { id: 'users', label: 'User Fleet', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
              { id: 'requirements', label: 'Requirement Log', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${activeTab === tab.id
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        {activeTab === 'overview' && !selectedUser && !selectedRequirement && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Col */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
                  <p className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Total Registry</p>
                  <div className="flex items-end justify-between">
                    <span className="text-5xl font-black">{stats.totalUsers}</span>
                    <span className="text-xs text-green-400 flex items-center gap-1 font-bold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 11.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L10 10.586 13.586 7H12z" clipRule="evenodd" /></svg>
                      Nominal
                    </span>
                  </div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
                  <p className="text-xs font-black text-yellow-400 uppercase tracking-[0.2em] mb-4">Open Tickets</p>
                  <div className="flex items-end justify-between">
                    <span className="text-5xl font-black">{stats.pendingRequirements}</span>
                    <span className="text-xs text-yellow-400 font-bold">Action Required</span>
                  </div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl">
                  <p className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] mb-4">System Health</p>
                  <div className="flex items-end justify-between">
                    <span className="text-5xl font-black">98%</span>
                    <span className="text-xs text-purple-400 font-bold">Stable</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase">Recent Activity</h3>
                    <p className="text-sm text-gray-500 font-medium">Monitoring incoming platform requirements</p>
                  </div>
                  <button onClick={() => setActiveTab('requirements')} className="text-xs font-bold text-gray-400 hover:text-white transition-colors">View All</button>
                </div>

                <div className="space-y-4">
                  {filteredRequirements.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-2xl">
                      <p className="text-gray-600 font-bold italic">No active priority tickets available.</p>
                    </div>
                  ) : (
                    filteredRequirements.slice(0, 5).map((req) => (
                      <div key={req._id} onClick={() => setSelectedRequirement(req)} className="group flex items-center justify-between p-4 bg-black/40 border border-gray-800 rounded-2xl hover:border-purple-500/50 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-purple-600/20 transition-colors">
                            <span className="text-sm font-black text-gray-400 group-hover:text-purple-400 uppercase">{req.contactName?.charAt(0) || 'R'}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-200 group-hover:text-white">{req.title}</h4>
                            <p className="text-xs text-gray-500">{req.contactEmail}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${requirementStatusColors[req.status] || 'border-gray-700 text-gray-500'}`}>
                            {req.status}
                          </span>
                          <p className="text-[10px] text-gray-600 mt-2 font-bold">{req.date}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* System Info Col */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-3xl p-8">
                <h3 className="text-xl font-black uppercase italic mb-6">Security Node</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Uptime</span>
                    <span className="text-xs font-mono text-green-400">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Latency</span>
                    <span className="text-xs font-mono text-yellow-400">42ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Encryption</span>
                    <span className="text-xs font-mono text-blue-400">AES-256</span>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                      <span className="text-[10px] font-black uppercase text-green-500 tracking-widest">Live Monitor Active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
                <h3 className="text-xl font-black uppercase italic mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setActiveTab('users')} className="p-4 rounded-2xl bg-black border border-gray-800 hover:border-blue-500/50 transition-all text-left group">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-500 transition-colors">
                      <svg className="w-4 h-4 text-blue-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider">Add User</span>
                  </button>
                  <button onClick={() => setActiveTab('requirements')} className="p-4 rounded-2xl bg-black border border-gray-800 hover:border-purple-500/50 transition-all text-left group">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-500 transition-colors">
                      <svg className="w-4 h-4 text-purple-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider">Reports</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && !selectedUser && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-[32px] overflow-hidden backdrop-blur-xl">
            <div className="p-8 border-b border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="text-3xl font-black italic tracking-tighter uppercase">Registry Management</h3>
                  <p className="text-sm text-gray-500 font-medium">Control and monitor all verified platform operators</p>
                </div>
                <div className="relative w-full md:w-96">
                  <input
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-black border border-gray-800 rounded-2xl text-sm italic font-bold focus:outline-none focus:border-purple-500 transition-all"
                  />
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/40">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Identity</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Contact Vector</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Registry Date</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Current Loc</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center text-gray-600 font-black italic">No records found matching criteria.</td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user._id} className="group hover:bg-white/5 transition-all cursor-pointer" onClick={() => setSelectedUser(user)}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-lg font-black italic shadow-lg shadow-purple-900/40 group-hover:scale-110 transition-transform">
                              {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-gray-200 group-hover:text-white transition-colors">{user.name || 'ANONYMOUS'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div>
                            <p className="text-sm font-bold text-gray-300">{user.email}</p>
                            <p className="text-[10px] text-gray-500 font-black uppercase mt-1">{user.phoneNumber || 'STOCKED_NONE'}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-gray-400">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'LEGACY_USER'}
                        </td>
                        <td className="px-8 py-6 text-xs font-bold text-gray-500 uppercase truncate max-w-[200px]">
                          {user.address || 'UNDEFINED_VECTOR'}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="px-4 py-2 rounded-xl border border-gray-800 text-[10px] font-black uppercase hover:bg-gray-800 transition-colors">
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Requirements Tab */}
        {activeTab === 'requirements' && !selectedRequirement && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="text-3xl font-black italic tracking-tighter uppercase">Requirement Ledger</h3>
                <p className="text-sm text-gray-500 font-medium">Processing high-priority client infrastructure tickets</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 px-6 py-3 rounded-2xl flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-xs font-black uppercase text-gray-400">{filteredRequirements.length} Active</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequirements.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-800 rounded-[32px]">
                  <p className="text-gray-600 font-black italic text-xl">LEADGER_EMPTY: NO TICKETS FOUND</p>
                </div>
              ) : (
                filteredRequirements.map(req => (
                  <div
                    key={req._id}
                    className="group bg-gray-900/50 border-2 border-gray-800 rounded-[32px] p-8 hover:border-purple-500/50 transition-all cursor-pointer relative overflow-hidden"
                    onClick={() => setSelectedRequirement(req)}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-[60px] group-hover:bg-purple-600/10 transition-all" />

                    <div className="flex items-start justify-between mb-8 relative z-10">
                      <div className="w-14 h-14 bg-black border border-gray-800 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border ${requirementStatusColors[req.status] || 'border-gray-800 text-gray-500'}`}>
                        {req.status}
                      </span>
                    </div>

                    <h4 className="text-xl font-black italic uppercase mb-3 relative z-10 group-hover:text-purple-400 transition-colors">{req.title}</h4>
                    <p className="text-sm text-gray-500 font-medium mb-8 line-clamp-3 leading-relaxed">{req.description}</p>

                    <div className="space-y-3 mb-8 relative z-10">
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                        <svg className="w-4 h-4 text-purple-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        {req.contactName}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-500 truncate lowercase italic">
                        <svg className="w-4 h-4 text-purple-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {req.contactEmail}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-800 relative z-10">
                      <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">{req.date}</span>
                      <button className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest group-hover:bg-purple-600 group-hover:text-white transition-all shadow-xl shadow-white/5 group-hover:shadow-purple-600/30">
                        Process
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* User Details View */}
        {selectedUser && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-[40px] p-10 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4 flex flex-col items-center text-center">
                <div className="w-48 h-48 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-[48px] flex items-center justify-center text-6xl font-black italic shadow-2xl shadow-purple-500/40 mb-8 border-4 border-white/10">
                  {selectedUser.name?.charAt(0) || selectedUser.email?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">{selectedUser.name || 'ANONYMOUS'}</h2>
                <p className="text-xl text-purple-400 font-bold mb-8">{selectedUser.email}</p>
                <div className="w-full flex gap-4">
                  <button className="flex-1 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-purple-600 hover:text-white transition-all">Verify Node</button>
                  <button className="p-4 rounded-2xl bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full content-center">
                  {[
                    { label: 'Platform ID', value: selectedUser._id, mono: true, color: 'text-blue-400' },
                    { label: 'Register Date', value: new Date(selectedUser.createdAt).toLocaleString(), color: 'text-gray-300' },
                    { label: 'Mobile Vector', value: selectedUser.phoneNumber || 'NOT_LINKED', color: 'text-gray-300' },
                    { label: 'Verification Status', value: selectedUser.isVerified ? 'ENCRYPTED_SECURE' : 'UNVERIFIED_PENDING', color: selectedUser.isVerified ? 'text-green-400' : 'text-yellow-400' },
                    { label: 'Mailing Vector', value: selectedUser.address || 'VECTOR_UNDEFINED', full: true, color: 'text-gray-300' }
                  ].map((item, i) => (
                    <div key={i} className={`bg-black/40 border border-gray-800 p-8 rounded-[32px] ${item.full ? 'md:col-span-2' : ''}`}>
                      <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] mb-4">{item.label}</p>
                      <p className={`text-lg font-bold ${item.mono ? 'font-mono tracking-tighter' : ''} ${item.color}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requirement Details View */}
        {selectedRequirement && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-[40px] p-12 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                <div className="flex items-center gap-8">
                  <div className="w-24 h-24 bg-purple-600/10 border border-purple-500/30 rounded-[32px] flex items-center justify-center">
                    <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div>
                    <span className={`px-4 py-1.5 text-xs font-black rounded-full uppercase tracking-widest border mb-4 inline-block ${requirementStatusColors[selectedRequirement.status] || 'border-gray-800 text-gray-500'}`}>
                      {selectedRequirement.status}
                    </span>
                    <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">{selectedRequirement.title}</h2>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-black/40 border border-gray-800 p-10 rounded-[40px]">
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] mb-6">Subject Brief</p>
                    <p className="text-xl font-medium leading-relaxed text-gray-200 italic">"{selectedRequirement.description}"</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800/20 border border-gray-800 p-8 rounded-[32px]">
                      <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Registry Name</p>
                      <p className="text-xl font-black text-white">{selectedRequirement.contactName}</p>
                    </div>
                    <div className="bg-gray-800/20 border border-gray-800 p-8 rounded-[32px]">
                      <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Network Email</p>
                      <p className="text-xl font-bold text-purple-400 lowercase">{selectedRequirement.contactEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-purple-600/10 border border-purple-500/20 p-8 rounded-[40px]">
                    <p className="text-[10px] font-black uppercase text-gray-500 mb-4">Priority Node</p>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                      <span className="text-xl font-black uppercase italic">High Level</span>
                    </div>
                    <p className="text-xs font-bold text-gray-400 mb-8 leading-relaxed">This ticket requires immediate platform intervention or client contact across the network protocols.</p>
                    <button className="w-full py-4 rounded-2xl bg-purple-600 text-white font-black uppercase tracking-widest text-xs hover:bg-purple-500 transition-all shadow-xl shadow-purple-900/40 mb-3">Initiate Contact</button>
                    <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">Close Ticket</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
