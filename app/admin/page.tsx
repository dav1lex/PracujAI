"use client";

import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      {/* Admin Header */}
      <div className="bg-white dark:bg-neutral-dark border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Panel Administratora
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                PracujMatcher Admin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboard />
      </div>
    </div>
  );
}