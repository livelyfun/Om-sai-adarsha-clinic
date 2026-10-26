'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getMessages, Locale } from '@/lib/i18n';
import { KeyRound, Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const messages = getMessages(locale);
  const t = messages.auth;
  const common = messages.common;

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/patient/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setSubmitted(true);
      if (data.resetUrlDevOnly) {
        setDevResetUrl(data.resetUrlDevOnly);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 font-serif">
            {t.forgotPassword}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {locale === 'ne'
              ? 'आफ्नो दर्ता गरिएको इमेल प्रविष्ट गर्नुहोस्। हामी पासवर्ड रिसेट लिङ्क पठाउनेछौं।'
              : 'Enter your registered email address to receive password reset instructions.'}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-teal-50 border border-teal-200 p-5 text-sm text-teal-900 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-teal-950">
                  {locale === 'ne' ? 'अनुरोध प्राप्त भयो' : 'Request Processed'}
                </p>
                <p className="mt-1 text-xs text-teal-800 leading-relaxed">
                  {locale === 'ne'
                    ? 'यदि यो इमेल दर्ता छ भने पासवर्ड रिसेट लिङ्क पठाइएको छ। कृपया आफ्नो इनबक्स जाँच गर्नुहोस्।'
                    : 'If an account exists for this email, password recovery instructions have been sent.'}
                </p>
              </div>
            </div>

            {devResetUrl && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                <span className="font-bold text-amber-900">[DEV SHORTCUT] Reset Link:</span>
                <Link href={devResetUrl} className="block text-teal-800 underline truncate">
                  {devResetUrl}
                </Link>
              </div>
            )}

            <div className="pt-2 text-center">
              <Link
                href={`/${locale}/portal/login`}
                className="text-sm font-semibold text-teal-800 hover:underline"
              >
                ← {locale === 'ne' ? 'लगइनमा फर्कनुहोस्' : 'Return to Login'}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-800 py-3 px-4 text-sm font-semibold text-white shadow-xs hover:bg-teal-900 disabled:opacity-50 transition-colors"
            >
              {loading ? common.loading : (locale === 'ne' ? 'रिसेट लिङ्क पठाउनुहोस्' : 'Send Reset Link')}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
