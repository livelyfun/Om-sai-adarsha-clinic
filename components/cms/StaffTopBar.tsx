'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, LogOut, Menu, X } from 'lucide-react';
import { User } from '@/lib/db/types';

interface StaffTopBarProps {
  user: User;
  isSuperAdmin: boolean;
}

const navLinks = (isSuperAdmin: boolean) => [
  { href: '/sai-clinic-management', label: 'Dashboard' },
  { href: '/sai-clinic-management/bookings', label: 'Bookings' },
  { href: '/sai-clinic-management/patients', label: 'Patients' },
  { href: '/sai-clinic-management/doctors', label: 'Doctors' },
  { href: '/sai-clinic-management/services', label: 'Services' },
  { href: '/sai-clinic-management/lab-catalogue', label: 'Lab Catalogue' },
  { href: '/sai-clinic-management/reports', label: 'Reports' },
  { href: '/sai-clinic-management/articles', label: 'Articles' },
  ...(isSuperAdmin
    ? [
        { href: '/sai-clinic-management/settings', label: 'Settings' },
        { href: '/sai-clinic-management/users', label: 'Staff Users' },
        { href: '/sai-clinic-management/audit', label: 'Audit Log' },
      ]
    : []),
];

export default function StaffTopBar({ user, isSuperAdmin }: StaffTopBarProps) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  async function handleSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/sai-clinic-management/login');
    router.refresh();
  }

  const links = navLinks(isSuperAdmin);

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6">
          {/* Brand + hamburger (mobile) */}
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-700 text-slate-300 transition-colors hover:bg-slate-800 xl:hidden"
              aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs sm:h-9 sm:w-9">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-sm tracking-tight text-white block">
                  Om Sai Aadarsha Clinic
                </span>
                <span className="text-[10px] text-teal-400 uppercase font-semibold tracking-wider">
                  Management CMS
                </span>
              </div>
              {/* Compact brand label on xs */}
              <span className="font-bold text-xs tracking-tight text-white sm:hidden">
                Clinic CMS
              </span>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden min-w-0 items-center gap-0.5 overflow-x-auto text-xs font-medium text-slate-300 xl:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-2.5 py-1.5 transition-colors hover:bg-slate-800 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <div className="hidden text-right xl:block">
              <p className="text-xs font-medium text-white">{user.email}</p>
              <p className="text-[10px] text-teal-400 capitalize">
                {isSuperAdmin ? 'Super Administrator' : 'Reception Staff'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 sm:px-3"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {mobileNavOpen && (
        <div className="xl:hidden">
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <nav className="fixed inset-x-0 top-14 z-40 max-h-[80dvh] overflow-y-auto border-b border-slate-800 bg-slate-900 py-3 shadow-2xl sm:top-16">
            {/* User info */}
            <div className="border-b border-slate-800 px-4 pb-3 mb-2">
              <p className="text-xs font-medium text-white">{user.email}</p>
              <p className="text-[10px] text-teal-400 capitalize mt-0.5">
                {isSuperAdmin ? 'Super Administrator' : 'Reception Staff'}
              </p>
            </div>
            <div className="space-y-0.5 px-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
