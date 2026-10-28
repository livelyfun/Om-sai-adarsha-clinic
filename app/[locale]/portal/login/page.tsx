'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { getMessages, Locale } from '@/lib/i18n';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import AuthShell from '@/components/public/AuthShell';
import { signIn } from '@/lib/auth/auth-client';

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
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setError('');
    setGoogleLoading(true);
    try {
      const res = await signIn.social({
        provider: 'google',
        callbackURL: `/${locale}/portal/dashboard`,
      });
      if (res?.error) {
        throw new Error(res.error.message || 'Google sign-in unavailable');
      }
    } catch (err: any) {
      setError(
        locale === 'ne'
          ? 'गुगल साइन-इन हाल उपलब्ध छैन वा सेटअप भएको छैन। कृपया इमेल र पासवर्ड प्रयोग गर्नुहोस्।'
          : 'Google sign-in is currently unavailable. Please sign in with your email and password.'
      );
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn.email({
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
        callbackURL: `/${locale}/portal/dashboard`,
      });

      if (result.error) {
        throw new Error(result.error.message || t.invalidCredentials);
      }

      router.push(`/${locale}/portal/dashboard`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || t.invalidCredentials);
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
              {locale === 'ne' ? 'इमेल ठेगाना' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={locale === 'ne' ? 'tapai@example.com' : 'your.email@example.com'}
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
                className="inline-flex items-center py-1 text-[0.6875rem] font-semibold text-brand-700 hover:underline"
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
                className="absolute right-1.5 top-1.5 grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
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

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400">
              {locale === 'ne' ? 'वा गुगलबाट लगइन गर्नुहोस्' : 'or continue with'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="btn btn-outline w-full flex items-center justify-center gap-2.5 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium py-2.5 text-sm rounded-xl transition-colors disabled:opacity-60"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{googleLoading ? common.loading : (locale === 'ne' ? 'गुगलबाट साइन-इन गर्नुहोस्' : 'Sign in with Google')}</span>
        </button>

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
            className="inline-flex items-center py-1.5 text-xs font-semibold text-brand-700 hover:underline"
          >
            {t.dontHaveAccount}
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
