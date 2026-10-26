'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { getMessages, Locale } from '@/lib/i18n';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function PatientLoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const messages = getMessages(locale);
  const t = messages.auth;
  const common = messages.common;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/patient/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t.invalidCredentials);
      }

      router.push(`/${locale}/portal/dashboard`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 font-serif">
            {t.patientSignIn}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {locale === 'ne' ? 'आफ्नो बुकिङ र ल्याब रिपोर्टहरू हेर्न लगइन गर्नुहोस्।' : 'Access your appointment requests and secure lab reports.'}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {t.emailLabel}
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {t.passwordLabel}
              </label>
              <Link
                href={`/${locale}/portal/forgot-password`}
                className="text-xs text-teal-800 hover:underline font-medium"
              >
                {t.forgotPassword}
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-800 py-3 px-4 text-sm font-semibold text-white shadow-xs hover:bg-teal-900 focus:outline-hidden disabled:opacity-50 transition-colors"
          >
            {loading ? common.loading : t.patientSignIn}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100">
          <Link
            href={`/${locale}/portal/register`}
            className="text-sm font-medium text-teal-800 hover:text-teal-950 hover:underline"
          >
            {t.dontHaveAccount}
          </Link>
        </div>
      </div>
    </div>
  );
}
