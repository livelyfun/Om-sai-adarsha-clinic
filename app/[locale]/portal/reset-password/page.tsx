'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { getMessages, Locale } from '@/lib/i18n';
import { Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
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
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-900">
            {locale === 'ne' ? 'अमान्य वा म्याद सकिएको लिङ्क' : 'Missing Reset Token'}
          </h2>
          <p className="text-sm text-slate-600">
            {locale === 'ne' ? 'कृपया नयाँ पासवर्ड रिसेट लिङ्क अनुरोध गर्नुहोस्।' : 'Please request a new password recovery link.'}
          </p>
          <Link
            href={`/${locale}/portal/forgot-password`}
            className="inline-block text-sm font-semibold text-teal-800 hover:underline"
          >
            {t.forgotPassword} →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 font-serif">
            {t.resetPassword}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {locale === 'ne' ? 'आफ्नो खाताको लागि नयाँ सुरक्षित पासवर्ड प्रविष्ट गर्नुहोस्।' : 'Enter a new secure password for your patient account.'}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {locale === 'ne' ? 'पासवर्ड सफलतापूर्वक परिवर्तन भयो' : 'Password Successfully Reset'}
            </h3>
            <p className="text-sm text-slate-600">
              {locale === 'ne'
                ? 'तपाईंका पुराना सबै सक्रिय सत्रहरू समाप्त गरिएका छन्। नयाँ पासवर्ड प्रयोग गरी लगइन गर्नुहोस्।'
                : 'All other active sessions have been terminated. Please log in with your new credentials.'}
            </p>
            <div className="pt-2">
              <Link
                href={`/${locale}/portal/login`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
              >
                <span>{t.patientSignIn}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {locale === 'ne' ? 'नयाँ पासवर्ड' : 'New Password'} *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm text-slate-900 focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {locale === 'ne' ? 'नयाँ पासवर्ड पुनः पुष्टि गर्नुहोस्' : 'Confirm New Password'} *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm text-slate-900 focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-800 py-3 px-4 text-sm font-semibold text-white shadow-xs hover:bg-teal-900 disabled:opacity-50 transition-colors"
            >
              {loading ? common.loading : t.resetPassword}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
