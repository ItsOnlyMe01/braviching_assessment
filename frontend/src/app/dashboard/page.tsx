'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { ClipboardList, Play, CheckCircle2, ListTodo } from 'lucide-react';

interface Task {
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0 });
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tasks`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          const tasks: Task[] = data.tasks || [];
          const total = tasks.length;
          const todo = tasks.filter((t) => t.status === 'TODO').length;
          const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
          const done = tasks.filter((t) => t.status === 'DONE').length;

          setStats({ total, todo, inProgress, done });
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Hello, {user.name}!</h1>
            <p className="text-slate-500 text-sm mt-1">
              Here is your {user.role.toLowerCase()} dashboard overview.
            </p>
          </div>

          {/* Stats Grid */}
          {fetching ? (
            <div className="text-slate-500 text-sm py-4">Loading overview statistics...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  <ClipboardList className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">To Do</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stats.todo}</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <ListTodo className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stats.inProgress}</p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                  <Play className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Done</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stats.done}</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
            </div>
          )}

          {/* Quick Info / Permissions Guide */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">RBAC Permissions Guide</h2>
            <div className="space-y-4">
              <div className="flex gap-4 items-start p-3 bg-slate-50 rounded-lg">
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs uppercase font-bold mt-0.5">Admin</span>
                <div>
                  <p className="font-semibold text-sm text-slate-700">System Administrator</p>
                  <p className="text-xs text-slate-500 mt-0.5">Can create, update, delete, view, and assign any task. Can view and add users.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-3 bg-slate-50 rounded-lg">
                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs uppercase font-bold mt-0.5">Manager</span>
                <div>
                  <p className="font-semibold text-sm text-slate-700">Team Operator</p>
                  <p className="text-xs text-slate-500 mt-0.5">Can create, update, view, and assign any task. Cannot delete tasks or manage users.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-3 bg-slate-50 rounded-lg">
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs uppercase font-bold mt-0.5">Employee</span>
                <div>
                  <p className="font-semibold text-sm text-slate-700">Individual Contributor</p>
                  <p className="text-xs text-slate-500 mt-0.5">Can view only assigned tasks. Can only update status of assigned tasks. Cannot delete/create tasks or view user management.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
