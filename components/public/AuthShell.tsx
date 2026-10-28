import React from 'react';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';
import { ArrowLeft, FileText, ShieldCheck, CalendarCheck } from 'lucide-react';

interface AuthShellProps {
  locale: Locale;
  children: React.ReactNode;
}

/**
 * Split-screen shell shared by the patient portal auth screens. The branded
 * panel keeps sign-in visually connected to the public site.
 */
export default function AuthShell({ locale, children }: AuthShellProps) {
  return (
    <div className="relative overflow-hidden bg-cream">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 mask-fade-b" />

      {/* Mobile-only compact branded header */}
      <div className="relative border-b border-brand-950/8 bg-white/80 backdrop-blur-sm lg:hidden">
        <div className="container-x flex items-center justify-between py-3.5">
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-900 text-sm font-bold text-sand-200">
              ॐ
            </span>
            <span className="text-sm font-bold tracking-tight text-ink">
              {locale === 'ne' ? 'ॐ साई आदर्श क्लिनिक' : 'Om Sai Clinic'}
            </span>
          </Link>
          <Link
            href={`/${locale}`}
            className="inline-flex min-h-9 items-center gap-1.5 text-[0.6875rem] font-semibold text-brand-700 hover:text-brand-900"
          >
            <ArrowLeft className="h-3 w-3" />
            {locale === 'ne' ? 'फिर्ता' : 'Back'}
          </Link>
        </div>
      </div>

      <div className="container-x relative grid min-h-[calc(100dvh-4rem)] items-start gap-8 py-8 sm:min-h-[78vh] sm:py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16 lg:py-16">
        {/* Brand panel — desktop only */}
        <aside className="relative hidden overflow-hidden rounded-[2rem] bg-brand-950 p-10 text-white lg:block">
          <div className="pointer-events-none absolute inset-0 bg-grid-light opacity-25" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-brand-600/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-sand-500/10 blur-3xl" />

          <div className="relative flex h-full flex-col">
            <Link
              href={`/${locale}`}
              className="inline-flex min-h-9 items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-200/80 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {locale === 'ne' ? 'गृहपृष्ठ' : 'Back to clinic'}
            </Link>

            <div className="mt-12">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-[1.9rem] leading-none text-sand-200 ring-1 ring-white/15">
                ॐ
              </span>
              <h2 className="display-title mt-6 text-[2.4rem] text-white">
                {locale === 'ne' ? (
                  <>
                    तपाईंको स्वास्थ्य,
                    <br />
                    <span className="text-sand-300">तपाईंको हातमा।</span>
                  </>
                ) : (
                  <>
                    Your health,
                    <br />
                    <span className="text-sand-300">in your hands.</span>
                  </>
                )}
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-100/75">
                {locale === 'ne'
                  ? 'बुकिङ अनुरोध, पारिवारिक प्रोफाइल र प्रमाणीकृत ल्याब रिपोर्ट — एउटै सुरक्षित ठाउँबाट।'
                  : 'Manage booking requests, family profiles and authenticated lab reports from one secure place.'}
              </p>
            </div>

            <div className="mt-10 space-y-4">
              {[
                {
                  icon: CalendarCheck,
                  title: locale === 'ne' ? 'अनुरोध ट्र्याक गर्नुहोस्' : 'Track your requests',
                  sub:
                    locale === 'ne'
                      ? 'रिसेप्सनको पुष्टि र समय हेर्नुहोस्'
                      : 'See reception confirmations and times',
                },
                {
                  icon: FileText,
                  title: locale === 'ne' ? 'ल्याब रिपोर्ट' : 'Lab reports',
                  sub:
                    locale === 'ne'
                      ? 'सुरक्षित पीडीएफ डाउनलोड'
                      : 'Download authenticated PDFs',
                },
                {
                  icon: ShieldCheck,
                  title: locale === 'ne' ? 'निजी र सुरक्षित' : 'Private by design',
                  sub:
                    locale === 'ne'
                      ? 'तपाईंको डेटा तपाईंको नियन्त्रणमा'
                      : 'Your records stay under your control',
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-sand-300">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-white">{item.title}</p>
                    <p className="mt-0.5 text-[0.6875rem] text-brand-100/65">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-auto pt-10 text-[0.625rem] text-brand-100/40">
              {locale === 'ne'
                ? 'ॐ साई आदर्श क्लिनिक · ओपीडी तथा डायग्नोस्टिक्स'
                : 'Om Sai Aadarsha Clinic · Outpatient & Diagnostics'}
            </p>
          </div>
        </aside>

        {/* Form column */}
        <div className="mx-auto w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
