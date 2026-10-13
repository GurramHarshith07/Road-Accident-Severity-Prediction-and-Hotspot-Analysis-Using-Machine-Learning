import React, { useState } from 'react';
import { Lock, User, AlertCircle, ShieldCheck } from 'lucide-react';
import { DEMO_USERS } from '../mockData';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = DEMO_USERS.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (found) {
      localStorage.setItem('road_accident_user', JSON.stringify(found));
      onLogin(found);
    } else {
      setError('Invalid credentials. Please click one of the quick demo accounts below.');
    }
  };

  const handleQuickLogin = (user) => {
    setUsername(user.username);
    setPassword(user.password);
    localStorage.setItem('road_accident_user', JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-[#152233] p-8 text-white text-center">
          <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Road Safety Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Severity Prediction & Hotspot Decision System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Username
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            Sign In to Analytics Portal
          </button>

          {/* Quick Demo Logins */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 text-center">
              Quick One-Click Demo Logins
            </p>
            <div className="grid grid-cols-1 gap-2">
              {DEMO_USERS.map((user) => (
                <button
                  type="button"
                  key={user.username}
                  onClick={() => handleQuickLogin(user)}
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-lg text-left transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-700">{user.name}</div>
                    <div className="text-[11px] text-slate-500">{user.role}</div>
                  </div>
                  <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-600">
                    {user.username} / {user.password}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
