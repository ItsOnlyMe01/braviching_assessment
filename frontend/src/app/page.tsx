'use client';

import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { loading } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-slate-600 font-medium">Loading Team Task Manager...</p>
      </div>
    </div>
  );
}
