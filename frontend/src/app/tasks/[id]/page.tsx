'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

interface UserOption {
  _id: string;
  name: string;
  role: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function TaskDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [task, setTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editable Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [assignedTo, setAssignedTo] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !id) return;

    const fetchTaskDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tasks/${id}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          const t: Task = data.task;
          setTask(t);
          setTitle(t.title);
          setDescription(t.description || '');
          setStatus(t.status);
          setPriority(t.priority);
          setAssignedTo(t.assignedTo?._id || '');
        } else {
          setError(data.error || 'Failed to load task details');
        }
      } catch (err) {
        setError('Connection error loading task details');
      } finally {
        setFetching(false);
      }
    };

    const fetchUsers = async () => {
      if (user.role !== 'ADMIN' && user.role !== 'MANAGER') return;
      try {
        const res = await fetch(`${API_URL}/api/users`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (err) {
        console.error('Failed to load user options:', err);
      }
    };

    fetchTaskDetails();
    fetchUsers();
  }, [user, id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload: any = {};
      if (user!.role === 'EMPLOYEE') {
        // Employees can only update status
        payload.status = status;
      } else {
        // Admins & Managers can update everything
        payload.title = title;
        payload.description = description;
        payload.status = status;
        payload.priority = priority;
        payload.assignedTo = assignedTo || null;
      }

      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update task');
      }

      setSuccess('Task updated successfully');
      setTask(data.task);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isEmployee = user.role === 'EMPLOYEE';

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.push('/tasks')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-semibold mb-6 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tasks
          </button>

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

          {fetching ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-slate-500 text-sm mt-3">Loading task details...</p>
            </div>
          ) : !task ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
              Task not found or you do not have permission to view it.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Task Details</h2>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Created by {task.createdBy?.name} on {new Date(task.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {isEmployee && (
                  <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold border border-emerald-200">
                    My Assigned Task
                  </span>
                )}
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isEmployee}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    disabled={isEmployee}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Priority
                    </label>
                    <select
                      disabled={isEmployee}
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-slate-50 disabled:text-slate-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                </div>

                {!isEmployee && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Assignee
                    </label>
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.role.toLowerCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    Last updated: {new Date(task.updatedAt).toLocaleString()}
                  </span>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
