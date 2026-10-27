'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import { getMessages, Locale } from '@/lib/i18n';
import { CheckCircle2, AlertCircle, Mail, ArrowRight, Loader2 } from 'lucide-react';
import AuthShell from '@/components/public/AuthShell';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const messages = getMessages(locale);
  const t = messages.auth;

  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'idle'>(
    token ? 'verifying' : 'idle'
  );
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
    <AuthShell locale={locale}>
      <div className="rounded-[1.75rem] border border-brand-950/8 bg-white p-8 text-center shadow-soft">
        {status === 'verifying' && (
          <div className="space-y-4 py-10">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-700" />
            <h1 className="font-display text-xl font-semibold text-ink">
              {locale === 'ne' ? 'इमेल प्रमाणीकरण हुँदैछ...' : 'Verifying your email...'}
            </h1>
            <p className="text-sm text-slate-500">
              {locale === 'ne' ? 'कृपया केही क्षण प्रतीक्षा गर्नुहोस्।' : 'Please wait while we confirm your account.'}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="display-title text-2xl">
              {locale === 'ne' ? 'इमेल प्रमाणीकरण सम्पन्न भयो' : 'Email verified successfully'}
            </h1>
            <p className="text-sm leading-relaxed text-slate-600">
              {locale === 'ne'
                ? 'तपाईंको खाता प्रमाणीकरण भइसकेको छ। अब तपाईं अपोइन्टमेन्ट र ल्याब परीक्षण अनुरोध पेश गर्न सक्नुहुन्छ।'
                : 'Your email address is now verified. You can now request doctor appointments and lab investigations.'}
            </p>
            <Link href={`/${locale}/portal/login`} className="btn btn-primary mt-2 w-full">
              {t.patientSignIn}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 py-4">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h1 className="font-display text-xl font-semibold text-ink">
              {locale === 'ne' ? 'प्रमाणीकरण असफल भयो' : 'Verification link invalid'}
            </h1>
            <p className="text-sm text-rose-600">{errorMessage}</p>
            <Link href={`/${locale}/portal/login`} className="btn btn-primary mt-2 w-full">
              {t.patientSignIn}
            </Link>
          </div>
        )}

        {status === 'idle' && (
          <div className="space-y-4 py-4">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <Mail className="h-7 w-7" />
            </div>
            <h1 className="font-display text-xl font-semibold text-ink">
              {locale === 'ne' ? 'इमेल प्रमाणीकरण आवश्यक' : 'Email verification required'}
            </h1>
            <p className="text-sm leading-relaxed text-slate-600">{t.emailNotVerified}</p>
            <Link href={`/${locale}/portal/login`} className="btn btn-primary mt-2 w-full">
              {t.patientSignIn}
            </Link>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
