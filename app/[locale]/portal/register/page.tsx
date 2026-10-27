'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getMessages, Locale } from '@/lib/i18n';
import { UserPlus, Mail, Phone, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import AuthShell from '@/components/public/AuthShell';

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

            {devVerificationUrl && (
              <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                <span className="font-bold">[DEVELOPMENT HELPER] Verification link generated:</span>
                <div className="overflow-x-auto rounded border border-amber-300 bg-white p-2 font-mono text-[0.6875rem]">
                  {devVerificationUrl}
                </div>
                <Link
                  href={devVerificationUrl}
                  className="mt-2 inline-block font-bold text-brand-800 underline hover:text-brand-950"
                >
                  Verify email now (development shortcut) →
                </Link>
              </div>
            )}

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
              <label className={fieldLabel}>{t.phoneLabel} *</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className="field !pl-10"
                />
              </div>
            </div>

            <div>
              <label className={fieldLabel}>{t.passwordLabel} *</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="field !pl-10"
                />
              </div>
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

        <div className="mt-6 border-t border-brand-950/8 pt-5 text-center">
          <Link href={`/${locale}/portal/login`} className="text-xs font-semibold text-brand-700 hover:underline">
            {t.alreadyHaveAccount}
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
