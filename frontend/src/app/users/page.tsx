'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function UsersPage() {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'EMPLOYEE'>('EMPLOYEE');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Connection error fetching users');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.role === 'ADMIN') {
      fetchUsers();
    } else {
      setFetching(false);
    }
  }, [user]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess('User created successfully!');
      setName('');
      setEmail('');
      setPassword('');
      setRole('EMPLOYEE');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Double check authorization
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl border border-red-200 text-center max-w-md shadow-sm">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-800 mb-2">Access Denied</h2>
            <p className="text-slate-500 text-sm">
              You do not have permission to view user management. This area is restricted to system administrators only.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const getRoleBadge = (userRole: string) => {
    switch (userRole) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'MANAGER':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'EMPLOYEE':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
            <p className="text-slate-500 text-sm mt-1">Register new team members and review access roles.</p>
          </div>

          {/* Feedback */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create User Form */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
              <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-500" />
                Add New User
              </h2>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@company.com"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                >
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </form>
            </div>

            {/* Users List */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-800">Team Members</h2>
              </div>

              {fetching ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-slate-500 text-sm mt-3">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No users registered yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase">
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-semibold text-slate-800">{item.name}</td>
                          <td className="px-6 py-4 text-slate-600">{item.email}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${getRoleBadge(item.role)}`}>
                              {item.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-xs">
                            {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
