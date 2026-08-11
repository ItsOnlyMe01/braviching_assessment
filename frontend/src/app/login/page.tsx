'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Brand Side */}
      <div className="md:w-1/2 bg-indigo-950 text-white flex flex-col justify-between p-8 md:p-16">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Team Task Manager</h1>
          <p className="mt-2 text-indigo-200">Role-Based Access Control Task Management</p>
        </div>
        
        <div className="my-8 md:my-0">
          <div className="border border-indigo-800 rounded-xl p-6 bg-indigo-900/50 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-3">
              Test Credentials (password: password123)
            </h3>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@taskmanager.local')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-950 border border-indigo-800 text-left transition-all text-xs"
              >
                <span><strong>Admin:</strong> admin@taskmanager.local</span>
                <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('manager@taskmanager.local')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-950 border border-indigo-800 text-left transition-all text-xs"
              >
                <span><strong>Manager:</strong> manager@taskmanager.local</span>
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">Manager</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('employee@taskmanager.local')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-950 border border-indigo-800 text-left transition-all text-xs"
              >
                <span><strong>Employee:</strong> employee@taskmanager.local</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">Employee</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-xs text-indigo-400">
          &copy; 2026 Team Task Manager. All rights reserved.
        </div>
      </div>

      {/* Form Side */}
      <div className="md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="max-w-md w-full">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
            <p className="text-slate-500 text-sm mt-1">Please sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-55 text-sm"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
