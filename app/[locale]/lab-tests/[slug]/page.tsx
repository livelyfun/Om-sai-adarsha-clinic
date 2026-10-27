import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getMessages, Locale } from '@/lib/i18n';
import {
  FlaskConical,
  Calendar,
  ArrowLeft,
  Home,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Clock,
  Phone,
} from 'lucide-react';

interface LabTestDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function LabTestDetailPage({ params }: LabTestDetailPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const slug = resolvedParams.slug;
  const messages = getMessages(locale);
  const common = messages.common;

  const test = db.getLabTestBySlug(slug);
  if (!test || !test.isActive) {
    notFound();
  }

  const cat = db.getLabCategories().find((c) => c.id === test.categoryId);
  const categoryName = cat
    ? locale === 'ne' && cat.nameNe
      ? cat.nameNe
      : cat.nameEn
    : locale === 'ne'
      ? 'डायग्नोस्टिक परीक्षण'
      : 'Diagnostic investigation';

  const name = locale === 'ne' && test.nameNe ? test.nameNe : test.nameEn;
  const description =
    locale === 'ne' && test.descriptionNe ? test.descriptionNe : test.descriptionEn;
  const prep =
    locale === 'ne' && test.prepInstructionsNe ? test.prepInstructionsNe : test.prepInstructionsEn;
  const sample = locale === 'ne' && test.sampleTypeNe ? test.sampleTypeNe : test.sampleTypeEn;
  const isMissingNepali = locale === 'ne' && !test.nameNe;
  const phone = db.getSetting('phone') || '+977 9800000000';

  return (
    <div className="bg-cream">
      <div className="border-b border-brand-950/8 bg-white">
        <div className="container-x py-4">
          <Link
            href={`/${locale}/lab-tests`}
            className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate-500 transition-colors hover:text-brand-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {locale === 'ne' ? 'ल्याब सूचीमा फर्कनुहोस्' : 'Back to lab catalogue'}
          </Link>
        </div>
      </div>

      <div className="container-x max-w-5xl py-10 sm:py-14">
        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
          <article className="card overflow-hidden">
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-800 to-brand-950 px-7 py-8 text-white sm:px-9">
              <div className="pointer-events-none absolute inset-0 bg-grid-light opacity-30" />
              <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-sand-400/15 blur-2xl" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-sand-300">
                    <FlaskConical className="h-6 w-6" />
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-brand-50">
                    {categoryName}
                  </span>
                  {test.isHomeCollectionAvailable && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sand-300 px-3 py-1 text-[0.5625rem] font-bold uppercase tracking-[0.08em] text-brand-950">
                      <Home className="h-3 w-3" />
                      {locale === 'ne' ? 'घरमै संकलन' : 'Home sample'}
                    </span>
                  )}
                </div>
                <h1 className="display-title mt-5 text-3xl text-white sm:text-4xl">{name}</h1>
                {sample && (
                  <p className="mt-3 text-xs text-brand-100/70">
                    {locale === 'ne' ? 'नमुना: ' : 'Sample: '}
                    <span className="font-semibold text-white">{sample}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6 p-7 sm:p-9">
              {isMissingNepali && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                  {common.nepaliMissingNote}
                </p>
              )}

              {prep && (
                <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-5">
                  <h2 className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.08em] text-amber-900">
                    <AlertCircle className="h-4 w-4" />
                    {locale === 'ne' ? 'परीक्षण पूर्वतयारी' : 'Preparation instructions'}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-amber-900/85">{prep}</p>
                </div>
              )}

              {description && (
                <div>
                  <h2 className="font-display text-sm font-semibold text-ink">
                    {locale === 'ne' ? 'परीक्षण सम्बन्धी जानकारी' : 'Clinical significance'}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: FileText,
                    title: locale === 'ne' ? 'डिजिटल रिपोर्ट' : 'Digital report',
                    sub:
                      locale === 'ne'
                        ? 'पोर्टलमा सुरक्षित डाउनलोड'
                        : 'Secure download in your portal',
                  },
                  {
                    icon: ShieldCheck,
                    title: locale === 'ne' ? 'प्रमाणित ल्याब' : 'Verified laboratory',
                    sub:
                      locale === 'ne'
                        ? 'योग्य प्राविधिकद्वारा जाँच'
                        : 'Reviewed by qualified technologists',
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-brand-950/8 bg-cream p-4">
                    <item.icon className="h-4 w-4 text-brand-600" />
                    <p className="mt-2 text-xs font-semibold text-ink">{item.title}</p>
                    <p className="mt-0.5 text-[0.625rem] text-slate-500">{item.sub}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-brand-950/8 pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-sm text-[0.6875rem] leading-relaxed text-slate-500">
                    {messages.booking.requestNotice}
                  </p>
                  <Link
                    href={`/${locale}/book?test=${test.id}`}
                    className="btn btn-primary shrink-0 text-xs"
                  >
                    <Calendar className="h-4 w-4" />
                    {locale === 'ne' ? 'परीक्षण अनुरोध गर्नुहोस्' : 'Request lab booking'}
                  </Link>
                </div>
              </div>
            </div>
          </article>

          <aside className="space-y-4">
            <div className="card p-6">
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                {locale === 'ne' ? 'परीक्षण शुल्क' : 'Test fee'}
              </span>
              <p className="display-title mt-3 text-3xl">
                {test.price !== null ? `NPR ${test.price}` : '—'}
              </p>
              <p className="mt-2 text-[0.6875rem] leading-relaxed text-slate-500">
                {test.price !== null
                  ? locale === 'ne'
                    ? 'अनुमानित शुल्क; अन्तिम बिल काउन्टरमा।'
                    : 'Estimated fee. Final billing is settled at the clinic counter.'
                  : locale === 'ne'
                    ? 'शुल्क क्लिनिकद्वारा पुष्टि हुनेछ।'
                    : 'Fee confirmed by the clinic.'}
              </p>
              <div className="mt-5 space-y-2 border-t border-brand-950/8 pt-4 text-[0.6875rem] text-slate-600">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />
                  {locale === 'ne' ? 'अनलाइन भुक्तानी आवश्यक छैन' : 'No online payment required'}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-brand-600" />
                  {locale === 'ne' ? 'अधिकांश नतिजा दिनभित्रै' : 'Most routine results same day'}
                </p>
                {test.isHomeCollectionAvailable && (
                  <p className="flex items-center gap-2">
                    <Home className="h-3.5 w-3.5 text-brand-600" />
                    {locale === 'ne' ? 'घरमै नमुना संकलन' : 'Home sample collection'}
                  </p>
                )}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-brand-950 p-6 text-white">
              <div className="pointer-events-none absolute inset-0 bg-grid-light opacity-25" />
              <div className="relative">
                <Phone className="h-5 w-5 text-sand-300" />
                <p className="mt-3 font-display text-sm font-semibold">
                  {locale === 'ne' ? 'पूर्वतयारी बुझ्नुहोस्' : 'Questions about prep?'}
                </p>
                <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-brand-100/70">
                  {locale === 'ne'
                    ? 'खाली पेट वा नमुना संकलनबारे रिसेप्सनलाई सोध्नुहोस्।'
                    : 'Call reception if you are unsure about fasting or sample collection.'}
                </p>
                <a
                  href={`tel:${phone}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-sand-300 hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {phone}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
