'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { Plus, Trash2, Eye, AlertCircle, Filter } from 'lucide-react';

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
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function TasksPage() {
  const { user, loading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [status, setStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [assignedTo, setAssignedTo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError('Connection error fetching tasks');
    } finally {
      setFetching(false);
    }
  };

  const fetchUsers = async () => {
    if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER') return;
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch user list:', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchTasks();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          status,
          assignedTo: assignedTo || undefined,
        }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create task');
      }

      setSuccess('Task created successfully!');
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setStatus('TODO');
      setAssignedTo('');
      setShowCreateModal(false);
      fetchTasks();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete task');
      }

      setSuccess('Task deleted successfully');
      fetchTasks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredTasks = tasks.filter((t) => {
    const statusMatch = statusFilter === 'ALL' || t.status === statusFilter;
    const priorityMatch = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'HIGH':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'LOW':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'DONE':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'IN_PROGRESS':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'TODO':
        return 'bg-slate-100 text-slate-700 border border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Tasks</h1>
              <p className="text-slate-500 text-sm mt-1">Manage and track your team tasks.</p>
            </div>

            {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
              >
                <Plus className="h-4 w-4" />
                New Task
              </button>
            )}
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
              {success}
            </div>
          )}

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Filter className="h-4 w-4" />
              <span className="font-semibold text-slate-700">Filters:</span>
            </div>

            <div className="flex gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          {fetching ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-slate-500 text-sm mt-3">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
              <p className="text-slate-500 text-sm font-medium">No tasks found matching current filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${getStatusBadge(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-800 mb-2 truncate">{task.title}</h3>
                    <p className="text-slate-500 text-xs mb-4 line-clamp-2">
                      {task.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-2 flex flex-col gap-2">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>
                        <strong>Creator:</strong> {task.createdBy?.name || 'Unknown'}
                      </span>
                      <span>
                        <strong>Assignee:</strong> {task.assignedTo?.name || 'Unassigned'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50/50">
                      <span className="text-[10px] text-slate-400">
                        {new Date(task.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>

                      <div className="flex gap-2">
                        <Link
                          href={`/tasks/${task._id}`}
                          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 hover:bg-indigo-50 rounded transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View/Edit
                        </Link>

                        {user.role === 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 hover:bg-red-50 rounded transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-800">Create New Task</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-slate-400 hover:text-slate-600 font-semibold text-sm"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Task Title
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Design Landing Page"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what needs to be done..."
                      rows={3}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                        Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                        Initial Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Assign To
                    </label>
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.role.toLowerCase()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  >
                    {submitting ? 'Creating...' : 'Create Task'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
