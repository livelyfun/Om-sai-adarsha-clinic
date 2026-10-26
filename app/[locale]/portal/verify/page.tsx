'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import { getMessages, Locale } from '@/lib/i18n';
import { CheckCircle2, AlertCircle, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const messages = getMessages(locale);
  const t = messages.auth;

  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'idle'>(token ? 'verifying' : 'idle');
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    if (!token) return;
    let active = true;

    async function doVerify(tokenToVerify: string) {
      try {
        const res = await fetch('/api/auth/patient/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenToVerify }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Verification failed');
        }
        if (active) {
          setStatus('success');
        }
      } catch (err: any) {
        if (active) {
          setStatus('error');
          setErrorMessage(err.message || 'Invalid or expired token.');
        }
      }
    }

    doVerify(token);

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
        {status === 'verifying' && (
          <div className="space-y-4 py-8">
            <Loader2 className="mx-auto h-10 w-10 text-teal-700 animate-spin" />
            <h2 className="text-xl font-bold text-slate-900">
              {locale === 'ne' ? 'इमेल प्रमाणीकरण हुँदैछ...' : 'Verifying your email...'}
            </h2>
            <p className="text-sm text-slate-500">
              {locale === 'ne' ? 'कृपया केही क्षण प्रतीक्षा गर्नुहोस्।' : 'Please wait while we confirm your account.'}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">
              {locale === 'ne' ? 'इमेल प्रमाणीकरण सम्पन्न भयो' : 'Email Verified Successfully'}
            </h2>
            <p className="text-sm text-slate-600">
              {locale === 'ne'
                ? 'तपाईंको खाता प्रमाणीकरण भइसकेको छ। अब तपाईं अपोइन्टमेन्ट र ल्याब परीक्षण अनुरोध पेश गर्न सक्नुहुन्छ।'
                : 'Your email address is now verified. You can now request doctor appointments and lab investigations.'}
            </p>
            <div className="pt-4">
              <Link
                href={`/${locale}/portal/login`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-teal-900"
              >
                <span>{t.patientSignIn}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-700">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {locale === 'ne' ? 'प्रमाणीकरण असफल भयो' : 'Verification Link Invalid'}
            </h2>
            <p className="text-sm text-red-600">{errorMessage}</p>
            <div className="pt-4 flex flex-col gap-2">
              <Link
                href={`/${locale}/portal/login`}
                className="inline-flex items-center justify-center rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white"
              >
                {t.patientSignIn}
              </Link>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <div className="space-y-4 py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
              <Mail className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {locale === 'ne' ? 'इमेल प्रमाणीकरण आवश्यक' : 'Email Verification Required'}
            </h2>
            <p className="text-sm text-slate-600">
              {t.emailNotVerified}
            </p>
            <div className="pt-4">
              <Link
                href={`/${locale}/portal/login`}
                className="inline-flex items-center justify-center rounded-xl bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
              >
                {t.patientSignIn}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
