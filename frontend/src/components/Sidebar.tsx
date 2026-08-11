'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, CheckSquare, Users, LogOut, Shield } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isActive = (path: string) => pathname.startsWith(path);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'MANAGER':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'EMPLOYEE':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 min-h-screen">
      {/* Upper Navigation section */}
      <div>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <Shield className="h-6 w-6 text-indigo-400" />
          <span className="font-bold text-white tracking-wide text-sm">Team Task Manager</span>
        </div>

        <nav className="p-4 space-y-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              isActive('/dashboard')
                ? 'bg-indigo-600 text-white font-semibold'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>

          <Link
            href="/tasks"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              isActive('/tasks')
                ? 'bg-indigo-600 text-white font-semibold'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CheckSquare className="h-5 w-5" />
            Tasks
          </Link>

          {user.role === 'ADMIN' && (
            <Link
              href="/users"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive('/users')
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="h-5 w-5" />
              Users
            </Link>
          )}
        </nav>
      </div>

      {/* Footer Profile & Logout section */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="mb-4 px-2">
          <div className="font-semibold text-white truncate text-sm">{user.name}</div>
          <div className="text-slate-500 truncate text-xs mb-2">{user.email}</div>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${getRoleBadge(user.role)}`}>
            {user.role}
          </span>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg text-sm font-medium transition-all text-left"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
