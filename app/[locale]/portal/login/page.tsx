'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { getMessages, Locale } from '@/lib/i18n';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import AuthShell from '@/components/public/AuthShell';

export default function PatientLoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const messages = getMessages(locale);
  const t = messages.auth;
  const common = messages.common;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
        body: JSON.stringify({ email: email.trim(), password, rememberMe }),
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
    <AuthShell locale={locale}>
      <div className="rounded-[1.75rem] border border-brand-950/8 bg-white p-7 shadow-soft sm:p-9">
        <div className="flex items-start justify-between">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-800">
            <Lock className="h-5 w-5" />
          </span>
          <span className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            {locale === 'ne' ? 'सुरक्षित पोर्टल' : 'Secure portal'}
          </span>
        </div>

        <h1 className="display-title mt-6 text-3xl">{t.patientSignIn}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {locale === 'ne'
            ? 'आफ्नो बुकिङ र ल्याब रिपोर्टहरू हेर्न लगइन गर्नुहोस्।'
            : 'Access your appointment requests and secure lab reports.'}
        </p>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate-500">
              {locale === 'ne' ? 'इमेल वा मोबाइल नम्बर' : 'Email Address or Mobile'}
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={locale === 'ne' ? 'इमेल वा मोबाइल नम्बर' : 'your.email@example.com or 9800000000'}
                className="field !pl-10"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate-500">
                {t.passwordLabel}
              </label>
              <Link
                href={`/${locale}/portal/forgot-password`}
                className="text-[0.6875rem] font-semibold text-brand-700 hover:underline"
              >
                {t.forgotPassword}
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="field !pl-10 !pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 transition-colors hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
              />
              <span>{locale === 'ne' ? 'मलाई याद राख्नुहोस्' : 'Remember this device'}</span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-60 shadow-md">
            {loading ? common.loading : t.patientSignIn}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-5 rounded-2xl border border-sand-200/80 bg-sand-50/70 p-3.5 flex items-start gap-2.5 text-xs text-brand-950">
          <Sparkles className="h-4 w-4 text-sand-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {locale === 'ne'
              ? 'क्लिनिक काउन्टरबाट प्राप्त दाबी कोड छ? लगइन गरेपछि तुरुन्त आफ्नो रिपोर्ट लिङ्क गर्नुहोस्।'
              : 'Have a claim code from reception? Sign in and link your walk-in reports directly to your profile.'}
          </p>
        </div>

        <div className="mt-6 border-t border-brand-950/8 pt-5 text-center">
          <Link
            href={`/${locale}/portal/register`}
            className="text-xs font-semibold text-brand-700 hover:underline"
          >
            {t.dontHaveAccount}
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
