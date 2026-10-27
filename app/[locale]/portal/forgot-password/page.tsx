'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getMessages, Locale } from '@/lib/i18n';
import { KeyRound, Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import AuthShell from '@/components/public/AuthShell';
import { forgetPassword } from '@/lib/auth/auth-client';

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const messages = getMessages(locale);
  const t = messages.auth;
  const common = messages.common;

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/${locale}/portal/reset-password`;
      const result = await forgetPassword({
        email: email.trim().toLowerCase(),
        redirectTo,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to submit request');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell locale={locale}>
      <div className="rounded-[1.75rem] border border-brand-950/8 bg-white p-7 shadow-soft sm:p-9">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-800">
          <KeyRound className="h-5 w-5" />
        </span>

        <h1 className="display-title mt-6 text-3xl">{t.forgotPassword}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {locale === 'ne'
            ? 'आफ्नो दर्ता गरिएको इमेल प्रविष्ट गर्नुहोस्। हामी पासवर्ड रिसेट लिङ्क पठाउनेछौं।'
            : 'Enter your registered email address to receive password reset instructions.'}
        </p>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-5 text-sm text-brand-900">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <p className="font-display font-semibold text-brand-950">
                  {locale === 'ne' ? 'अनुरोध प्राप्त भयो' : 'Request processed'}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-brand-800">
                  {locale === 'ne'
                    ? 'यदि यो इमेल दर्ता छ भने पासवर्ड रिसेट लिङ्क पठाइएको छ। कृपया आफ्नो इनबक्स जाँच गर्नुहोस्।'
                    : 'If an account exists for this email, password recovery instructions have been sent. Check your inbox.'}
                </p>
              </div>
            </div>

            <Link href={`/${locale}/portal/login`} className="btn btn-ghost w-full">
              ← {locale === 'ne' ? 'लगइनमा फर्कनुहोस्' : 'Return to login'}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate-500">
                {t.emailLabel}
              </label>
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

            <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
              {loading ? common.loading : locale === 'ne' ? 'रिसेट लिङ्क पठाउनुहोस्' : 'Send reset link'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
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
