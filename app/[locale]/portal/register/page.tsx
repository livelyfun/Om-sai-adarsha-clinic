'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getMessages, Locale } from '@/lib/i18n';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import AuthShell from '@/components/public/AuthShell';
import { signUp, signIn } from '@/lib/auth/auth-client';

export default function PatientRegisterPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const messages = getMessages(locale);
  const t = messages.auth;
  const common = messages.common;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignUp() {
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
          ? 'गुगल साइन-अप हाल उपलब्ध छैन वा सेटअप भएको छैन। कृपया इमेल र पासवर्ड प्रयोग गर्नुहोस्।'
          : 'Google sign-up is currently unavailable. Please sign up with your email and password.'
      );
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!termsConsent) {
      setError(
        locale === 'ne'
          ? 'कृपया सर्तहरू स्वीकार गर्नुहोस्।'
          : 'You must agree to the privacy policy and terms.'
      );
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.email({
        name: fullName,
        email: email.trim().toLowerCase(),
        password,
        callbackURL: `/${locale}/portal/dashboard`,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Registration failed');
      }

      setSuccess(t.verificationSent);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const fieldLabel = 'mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate-500';

  return (
    <AuthShell locale={locale}>
      <div className="rounded-[1.75rem] border border-brand-950/8 bg-white p-7 shadow-soft sm:p-9">
        <div className="flex items-start justify-between">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-800">
            <UserPlus className="h-5 w-5" />
          </span>
          <span className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            {locale === 'ne' ? 'नयाँ खाता' : 'New account'}
          </span>
        </div>

        <h1 className="display-title mt-6 text-3xl">{t.patientRegister}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {locale === 'ne'
            ? 'अनलाइन बुकिङ तथा डिजिटल ल्याब रिपोर्टको लागि खाता खोल्नुहोस्।'
            : 'Create an account to submit requests and access your laboratory reports.'}
        </p>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-5 text-sm text-brand-900">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <p className="font-display font-semibold text-brand-950">
                  {locale === 'ne' ? 'दर्ता सफल भयो' : 'Registration submitted'}
                </p>
                <p className="mt-1 text-xs leading-relaxed">{success}</p>
              </div>
            </div>

            <Link href={`/${locale}/portal/login`} className="btn btn-primary w-full">
              {t.patientSignIn}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className={fieldLabel}>{t.fullNameLabel} *</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.fullNamePlaceholder}
                  className="field !pl-10"
                />
              </div>
            </div>

            <div>
              <label className={fieldLabel}>{t.emailLabel} *</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="field !pl-10"
                />
              </div>
            </div>

            <div>
              <label className={fieldLabel}>{t.passwordLabel} *</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
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
              <p className="mt-1 text-[0.6875rem] text-slate-400">
                {locale === 'ne' ? 'कम्तीमा ८ अक्षर' : 'Minimum 8 characters'}
              </p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 pt-1">
              <input
                type="checkbox"
                required
                checked={termsConsent}
                onChange={(e) => setTermsConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-brand-800"
              />
              <span className="text-[0.6875rem] leading-relaxed text-slate-600">{t.termsConsent}</span>
            </label>

            <button type="submit" disabled={loading} className="btn btn-primary mt-2 w-full disabled:opacity-60">
              {loading ? common.loading : t.patientRegister}
            </button>
          </form>
        )}

        {!success && (
          <>
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400">
                  {locale === 'ne' ? 'वा गुगलबाट दर्ता गर्नुहोस्' : 'or continue with'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={googleLoading || loading}
              className="btn btn-outline w-full flex items-center justify-center gap-2.5 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium py-2.5 text-sm rounded-xl transition-colors disabled:opacity-60"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{googleLoading ? common.loading : (locale === 'ne' ? 'गुगलबाट दर्ता गर्नुहोस्' : 'Sign up with Google')}</span>
            </button>
          </>
        )}

        <div className="mt-6 border-t border-brand-950/8 pt-5 text-center">
          <Link href={`/${locale}/portal/login`} className="text-xs font-semibold text-brand-700 hover:underline">
            {t.alreadyHaveAccount}
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
