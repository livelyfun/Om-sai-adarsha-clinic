'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import { getMessages, Locale } from '@/lib/i18n';
import { Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import AuthShell from '@/components/public/AuthShell';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const messages = getMessages(locale);
  const t = messages.auth;
  const common = messages.common;

  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError(locale === 'ne' ? 'पासवर्ड कम्तीमा ८ अक्षरको हुनुपर्छ।' : 'Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(locale === 'ne' ? 'पासवर्डहरू मिलेनन्।' : 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/patient/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Password reset failed');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <AuthShell locale={locale}>
        <div className="rounded-[1.75rem] border border-brand-950/8 bg-white p-8 text-center shadow-soft">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="mt-4 font-display text-xl font-semibold text-ink">
            {locale === 'ne' ? 'अमान्य वा म्याद सकिएको लिङ्क' : 'Missing reset token'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {locale === 'ne'
              ? 'कृपया नयाँ पासवर्ड रिसेट लिङ्क अनुरोध गर्नुहोस्।'
              : 'Please request a new password recovery link.'}
          </p>
          <Link href={`/${locale}/portal/forgot-password`} className="btn btn-primary mt-5 w-full">
            {t.forgotPassword}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell locale={locale}>
      <div className="rounded-[1.75rem] border border-brand-950/8 bg-white p-7 shadow-soft sm:p-9">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-800">
          <Lock className="h-5 w-5" />
        </span>

        <h1 className="display-title mt-6 text-3xl">{t.resetPassword}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {locale === 'ne'
            ? 'आफ्नो खाताको लागि नयाँ सुरक्षित पासवर्ड प्रविष्ट गर्नुहोस्।'
            : 'Enter a new secure password for your patient account.'}
        </p>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="mt-6 space-y-4 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="font-display text-lg font-semibold text-ink">
              {locale === 'ne' ? 'पासवर्ड सफलतापूर्वक परिवर्तन भयो' : 'Password successfully reset'}
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              {locale === 'ne'
                ? 'तपाईंका पुराना सबै सक्रिय सत्रहरू समाप्त गरिएका छन्। नयाँ पासवर्ड प्रयोग गरी लगइन गर्नुहोस्।'
                : 'All other active sessions have been terminated. Please log in with your new credentials.'}
            </p>
            <Link href={`/${locale}/portal/login`} className="btn btn-primary w-full">
              {t.patientSignIn}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate-500">
                {locale === 'ne' ? 'नयाँ पासवर्ड' : 'New password'} *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="field"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate-500">
                {locale === 'ne' ? 'नयाँ पासवर्ड पुनः पुष्टि गर्नुहोस्' : 'Confirm new password'} *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="field"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
              {loading ? common.loading : t.resetPassword}
            </button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
