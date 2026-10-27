'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { signOut } from '@/lib/auth/auth-client';

interface PatientSignOutButtonProps {
  locale: Locale;
  label: string;
}

export default function PatientSignOutButton({ locale, label }: PatientSignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOut();
      router.push(`/${locale}/portal/login`);
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      // Even on error, redirect to login
      router.push(`/${locale}/portal/login`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : <LogOut className="h-4 w-4 text-slate-500" />}
      <span>{label}</span>
    </button>
  );
}
