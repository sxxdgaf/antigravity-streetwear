'use client';

import { useState } from 'react';
import { signOut } from '@/app/actions/auth';
import { Menu, Bell, LogOut, User } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';

export function AdminHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-brand-grey-200">
        <div className="flex items-center justify-between h-16 px-4 lg:px-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-brand-grey-600 hover:text-brand-black rounded-lg hover:bg-brand-grey-100"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Page title placeholder - will be set by pages */}
          <div className="hidden lg:block" />

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative p-2 text-brand-grey-600 hover:text-brand-black rounded-lg hover:bg-brand-grey-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Profile dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 text-brand-grey-600 hover:text-brand-black rounded-lg hover:bg-brand-grey-100">
                <div className="w-8 h-8 bg-brand-grey-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              </button>

              {/* Dropdown menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-brand-grey-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="p-2">
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
