'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, ShieldCheck, LogOut, Settings, Users, FileSpreadsheet, Calendar, FlaskConical } from 'lucide-react';
import { User } from '@/lib/db/types';

interface StaffTopBarProps {
  user: User;
  isSuperAdmin: boolean;
}

export default function StaffTopBar({ user, isSuperAdmin }: StaffTopBarProps) {
  const router = useRouter();

  async function handleSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/sai-clinic-management/login');
    router.refresh();
  }

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">
              Om Sai Aadarsha Clinic
            </span>
            <span className="text-[10px] text-teal-400 uppercase font-semibold tracking-wider">
              Management CMS
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-300">
          <Link
            href="/sai-clinic-management"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/sai-clinic-management/bookings"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            Bookings
          </Link>
          <Link
            href="/sai-clinic-management/patients"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            Patients
          </Link>
          <Link
            href="/sai-clinic-management/doctors"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            Doctors
          </Link>
          <Link
            href="/sai-clinic-management/services"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            Services
          </Link>
          <Link
            href="/sai-clinic-management/lab-catalogue"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            Lab Catalogue
          </Link>
          <Link
            href="/sai-clinic-management/reports"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            Reports
          </Link>
          <Link
            href="/sai-clinic-management/articles"
            className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            Articles
          </Link>
          {isSuperAdmin && (
            <>
              <Link
                href="/sai-clinic-management/settings"
                className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
              >
                Settings
              </Link>
              <Link
                href="/sai-clinic-management/users"
                className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
              >
                Staff Users
              </Link>
              <Link
                href="/sai-clinic-management/audit"
                className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
              >
                Audit Log
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block text-right">
          <p className="text-xs font-medium text-white">{user.email}</p>
          <p className="text-[10px] text-teal-400 capitalize">
            {isSuperAdmin ? 'Super Administrator' : 'Reception Staff'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
