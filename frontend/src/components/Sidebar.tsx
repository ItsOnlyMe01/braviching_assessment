'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, CheckSquare, Users, LogOut, Shield, Menu, X } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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

  const navLinks = (
    <nav className="p-4 space-y-1">
      <Link
        href="/dashboard"
        onClick={() => setIsOpen(false)}
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
        onClick={() => setIsOpen(false)}
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
          onClick={() => setIsOpen(false)}
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
  );

  const footerSection = (
    <div className="p-4 border-t border-slate-800 bg-slate-950/40">
      <div className="mb-4 px-2">
        <div className="font-semibold text-white truncate text-sm">{user.name}</div>
        <div className="text-slate-500 truncate text-xs mb-2">{user.email}</div>
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${getRoleBadge(user.role)}`}>
          {user.role}
        </span>
      </div>

      <button
        onClick={() => {
          setIsOpen(false);
          logout();
        }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg text-sm font-medium transition-all text-left"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 text-white w-full">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-400" />
          <span className="font-bold text-sm tracking-wide">Team Task Manager</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-1 text-slate-400 hover:text-white transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Mobile Drawer menu */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-400" />
              <span className="font-bold text-white text-sm">Task Manager</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {navLinks}
        </div>
        {footerSection}
      </aside>

      {/* Desktop Sidebar (normal view) */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col justify-between border-r border-slate-800 min-h-screen shrink-0">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <Shield className="h-6 w-6 text-indigo-400" />
            <span className="font-bold text-white tracking-wide text-sm">Team Task Manager</span>
          </div>
          {navLinks}
        </div>
        {footerSection}
      </aside>
    </>
  );
}
