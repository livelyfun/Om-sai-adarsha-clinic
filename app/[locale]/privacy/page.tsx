import React from 'react';
import Link from 'next/link';
import { getMessages, Locale } from '@/lib/i18n';
import { ShieldCheck, AlertTriangle, ArrowLeft, Lock, FileText } from 'lucide-react';
import PageHeader from '@/components/public/PageHeader';

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPolicyPage({ params }: PrivacyPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const messages = getMessages(locale);

  return (
    <div className="bg-cream">
      <PageHeader
        eyebrow={locale === 'ne' ? 'कानुनी तथा गोपनीयता' : 'Legal & privacy'}
        title={locale === 'ne' ? 'गोपनीयता नीति' : 'Privacy Policy & Patient Data Protection'}
        description={
          locale === 'ne'
            ? 'बिरामीको व्यक्तिगत तथा क्लिनिकल जानकारी कसरी संकलन, सुरक्षित भण्डारण र प्रयोग गरिन्छ।'
            : 'How Om Sai Aadarsha Clinic collects, protects and uses patient identity and clinical information.'
        }
      />

      <div className="container-x max-w-5xl py-10 sm:py-14">
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <div>
            <p className="font-bold uppercase tracking-[0.08em]">Draft · v2026-10-v1</p>
            <p className="mt-1 leading-relaxed text-amber-900">
              {locale === 'ne'
                ? 'यो नीति विकास पूर्वावलोकनको लागि तयार गरिएको मस्यौदा हो। सार्वजनिक प्रयोग अघि क्लिनिक व्यवस्थापन तथा कानुनी परामर्शद्वारा अन्तिम समीक्षा आवश्यक छ।'
                : 'This policy is a development draft prepared for architecture testing. Official clinic and legal review are required before production launch.'}
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.62fr_1.38fr] lg:items-start">
          <aside className="order-2 space-y-4 lg:order-1 lg:sticky lg:top-28">
            <div className="card p-5">
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                {locale === 'ne' ? 'दस्तावेज विवरण' : 'Document'}
              </span>
              <dl className="mt-4 space-y-3 text-[0.6875rem]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">{locale === 'ne' ? 'प्रभावी मिति' : 'Effective'}</dt>
                  <dd className="font-semibold text-ink">26 Oct 2026</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">{locale === 'ne' ? 'संस्करण' : 'Version'}</dt>
                  <dd className="font-semibold text-ink">2026-10-v1</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">{locale === 'ne' ? 'स्थिति' : 'Status'}</dt>
                  <dd className="font-semibold text-amber-700">{locale === 'ne' ? 'मस्यौदा' : 'Draft'}</dd>
                </div>
              </dl>
              <div className="mt-4 border-t border-brand-950/8 pt-4">
                <Link href={`/${locale}/terms`} className="link-arrow text-[0.6875rem]">
                  <FileText className="h-3 w-3" />
                  {locale === 'ne' ? 'बुकिङ सर्तहरू' : 'Booking terms'}
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-brand-950 p-5 text-white">
              <div className="pointer-events-none absolute inset-0 bg-grid-light opacity-25" />
              <div className="relative">
                <Lock className="h-5 w-5 text-sand-300" />
                <p className="mt-3 font-display text-sm font-semibold">
                  {locale === 'ne' ? 'तपाईंको डाटा सुरक्षित छ' : 'Your records stay private'}
                </p>
                <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-brand-100/70">
                  {locale === 'ne'
                    ? 'ल्याब रिपोर्ट सार्वजनिक लिङ्कमा राखिँदैन; लगइन गरेपछि मात्र हेर्न सकिन्छ।'
                    : 'Lab reports are never exposed on public links — only inside your authenticated portal.'}
                </p>
              </div>
            </div>
          </aside>

          <div className="order-1 space-y-4 lg:order-2">
            <div className="card p-7 sm:p-9">
              <div className="space-y-7 text-sm leading-relaxed text-slate-700">
                <section className="space-y-2">
                  <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand-50 text-[0.625rem] font-bold text-brand-700">
                      1
                    </span>
                    {locale === 'ne' ? 'दायरा तथा प्रतिबद्धता' : 'Scope and commitment'}
                  </h2>
                  <p>
                    Om Sai Aadarsha Clinic recognizes the fundamental privacy rights of patients
                    under applicable healthcare guidelines and the Individual Privacy Act (2018) of
                    Nepal. This policy governs how we collect, store, and transmit your personal
                    identification and clinical diagnostic information.
                  </p>
                </section>

                <section className="space-y-2 border-t border-brand-950/8 pt-7">
                  <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand-50 text-[0.625rem] font-bold text-brand-700">
                      2
                    </span>
                    {locale === 'ne' ? 'संकलन गरिने जानकारी' : 'Information we collect'}
                  </h2>
                  <p>
                    We collect only the information necessary to deliver clinical care and verify
                    appointments:
                  </p>
                  <ul className="space-y-2 text-xs">
                    {[
                      {
                        label: locale === 'ne' ? 'खाता पहिचान' : 'Account identity',
                        text: 'Full legal name, email address, mobile phone number, and hashed authentication credentials.',
                      },
                      {
                        label: locale === 'ne' ? 'बिरामी प्रोफाइल' : 'Patient profiles',
                        text: 'Date of birth, sex, phone number, and relationship label for registered family members.',
                      },
                      {
                        label: locale === 'ne' ? 'बुकिङ डाटा' : 'Booking data',
                        text: 'Preferred consultation dates, slot selections, symptom notes, and line-item lab requests.',
                      },
                      {
                        label: locale === 'ne' ? 'अडिट लग' : 'Audit logs',
                        text: 'Timestamps, IP addresses, and user identifiers for sensitive actions such as sign-ins, report downloads and password resets.',
                      },
                    ].map((item) => (
                      <li
                        key={item.label}
                        className="flex gap-2 rounded-xl border border-brand-950/8 bg-cream p-3"
                      >
                        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                        <span>
                          <strong className="font-semibold text-ink">{item.label}:</strong>{' '}
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-2 border-t border-brand-950/8 pt-7">
                  <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand-50 text-[0.625rem] font-bold text-brand-700">
                      3
                    </span>
                    {locale === 'ne'
                      ? 'ल्याब रिपोर्ट सुरक्षा तथा पहुँच नियन्त्रण'
                      : 'Laboratory report security & access control'}
                  </h2>
                  <p>Laboratory reports delivered through this platform are strictly confidential:</p>
                  <ul className="space-y-2 text-xs">
                    {[
                      'Reports are stored behind authenticated server barriers and never published under public URLs.',
                      'Only released reports belonging to a profile managed by your verified account can be viewed or downloaded.',
                      'Staff access is governed by strict role-based authorization keys and logged in an immutable audit ledger.',
                    ].map((line) => (
                      <li key={line} className="flex gap-2">
                        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-2 border-t border-brand-950/8 pt-7">
                  <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand-50 text-[0.625rem] font-bold text-brand-700">
                      4
                    </span>
                    {locale === 'ne'
                      ? 'डाटा संरक्षण अवधि तथा जिज्ञासा'
                      : 'Data retention & policy queries'}
                  </h2>
                  <p>
                    In accordance with clinic retention rules, clinical and audit records are
                    retained for patient history and clinical continuity. For inquiries regarding
                    your records, please contact clinic reception in person.
                  </p>
                </section>
              </div>
            </div>

            <Link
              href={`/${locale}/explore/about`}
              className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-slate-500 transition-colors hover:text-brand-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {locale === 'ne' ? 'क्लिनिकबारे जान्नुहोस्' : 'About the clinic'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
