'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getMessages, Locale } from '@/lib/i18n';
import { UserPlus, Mail, Phone, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function PatientRegisterPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const messages = getMessages(locale);
  const t = messages.auth;
  const common = messages.common;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [termsConsent, setTermsConsent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devVerificationUrl, setDevVerificationUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setDevVerificationUrl('');

    if (!termsConsent) {
      setError(locale === 'ne' ? 'कृपया सर्तहरू स्वीकार गर्नुहोस्।' : 'You must agree to the privacy policy and terms.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/patient/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          termsConsent,
          preferredLocale: locale,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(t.verificationSent);
      if (data.verificationUrlDevOnly) {
        setDevVerificationUrl(data.verificationUrlDevOnly);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 font-serif">
            {t.patientRegister}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {locale === 'ne' ? 'अनलाइन बुकिङ तथा डिजिटल ल्याब रिपोर्टको लागि खाता खोल्नुहोस्।' : 'Create an account to submit requests and access your laboratory reports.'}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 flex items-start gap-3 text-sm text-emerald-900">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-950">{locale === 'ne' ? 'दर्ता सफल भयो' : 'Registration Submitted'}</p>
                <p className="mt-1 text-xs leading-relaxed">{success}</p>
              </div>
            </div>

            {/* Development quick link for convenience */}
            {devVerificationUrl && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <span className="font-bold">[DEVELOPMENT HELPER] Verification link generated:</span>
                <div className="overflow-x-auto font-mono text-[11px] p-2 bg-white rounded border border-amber-300">
                  {devVerificationUrl}
                </div>
                <Link
                  href={devVerificationUrl}
                  className="inline-block mt-2 font-bold text-teal-800 underline hover:text-teal-950"
                >
                  Verify Email Now (Development Shortcut) →
                </Link>
              </div>
            )}

            <div className="pt-2 text-center">
              <Link
                href={`/${locale}/portal/login`}
                className="inline-flex items-center justify-center rounded-xl bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
              >
                {t.patientSignIn}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.fullNameLabel} *
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.fullNamePlaceholder}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.emailLabel} *
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.phoneLabel} *
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {t.passwordLabel} *
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-teal-700 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={termsConsent}
                  onChange={(e) => setTermsConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-800 focus:ring-teal-700"
                />
                <span className="text-xs text-slate-600 leading-normal">
                  {t.termsConsent}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center rounded-xl bg-teal-800 py-3 px-4 text-sm font-semibold text-white shadow-xs hover:bg-teal-900 focus:outline-hidden disabled:opacity-50 transition-colors"
            >
              {loading ? common.loading : t.patientRegister}
            </button>
          </form>
        )}

        <div className="text-center pt-4 border-t border-slate-100">
          <Link
            href={`/${locale}/portal/login`}
            className="text-sm font-medium text-teal-800 hover:text-teal-950 hover:underline"
          >
            {t.alreadyHaveAccount}
          </Link>
        </div>
      </div>
    </div>
  );
}
