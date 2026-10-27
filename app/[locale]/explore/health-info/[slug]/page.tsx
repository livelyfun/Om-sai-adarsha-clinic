import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMessages, Locale } from '@/lib/i18n';
import { db } from '@/lib/db';
import {
  Stethoscope,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function HealthArticleDetailPage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const slug = resolvedParams.slug;
  const messages = getMessages(locale);

  const article = db.getArticleBySlug(slug);
  if (!article || article.status !== 'published') {
    notFound();
  }

  const hasNe = Boolean(article.titleNe && article.titleNe.trim());
  const displayTitle = locale === 'ne' && hasNe ? article.titleNe : article.titleEn;
  const displayContent =
    locale === 'ne' && article.contentNe && article.contentNe.trim()
      ? article.contentNe
      : article.contentEn;
  const isFallback = locale === 'ne' && (!hasNe || !article.contentNe);

  return (
    <div className="bg-cream">
      <div className="border-b border-brand-950/8 bg-white">
        <div className="container-x py-4">
          <Link
            href={`/${locale}/explore/health-info`}
            className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate-500 transition-colors hover:text-brand-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {locale === 'ne' ? 'स्वास्थ्य लेखहरू' : 'Health articles'}
          </Link>
        </div>
      </div>

      <div className="container-x max-w-4xl py-10 sm:py-14">
        <article>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="chip">
              <BookOpen className="h-3 w-3" />
              {article.category || (locale === 'ne' ? 'स्वास्थ्य' : 'Health')}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[0.6875rem] text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(article.createdAt).toLocaleDateString(
                locale === 'ne' ? 'ne-NP' : 'en-GB',
                { day: 'numeric', month: 'long', year: 'numeric' }
              )}
            </span>
          </div>

          <h1 className="display-title mt-4 text-3xl sm:text-[2.75rem]">{displayTitle}</h1>

          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-brand-950/8 bg-white p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <Stethoscope className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-brand-700">
                {locale === 'ne' ? 'चिकित्सकीय समीक्षा' : 'Clinically reviewed'}
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                {article.reviewedByDoctorName
                  ? locale === 'ne'
                    ? `समीक्षक: ${article.reviewedByDoctorName}`
                    : `Reviewed by ${article.reviewedByDoctorName}`
                  : locale === 'ne'
                    ? 'क्लिनिक टोली'
                    : 'Clinic team'}
                {article.reviewedAt &&
                  ` · ${new Date(article.reviewedAt).toLocaleDateString(
                    locale === 'ne' ? 'ne-NP' : 'en-GB',
                    { day: 'numeric', month: 'short', year: 'numeric' }
                  )}`}
              </p>
            </div>
          </div>

          {isFallback && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="leading-relaxed">
                {locale === 'ne'
                  ? 'तल अंग्रेजी मूल विवरण प्रस्तुत गरिएको छ। क्लिनिक कर्मचारीद्वारा समीक्षा भएपछि नेपाली अनुवाद अद्यावधिक गरिनेछ।'
                  : 'The source version is shown below. A translated version will be published after clinical review.'}
              </p>
            </div>
          )}

          <div className="card mt-6 p-7 sm:p-10">
            <div className="space-y-4 whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-slate-700">
              {displayContent || (
                <p className="italic text-slate-500">
                  {locale === 'ne'
                    ? 'सामग्री अद्यावधिक हुँदैछ।'
                    : 'Content currently being updated by clinic staff.'}
                </p>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-brand-950/8 bg-cream p-5 text-xs text-slate-600">
              <p className="flex items-center gap-1.5 font-semibold text-ink">
                <ShieldCheck className="h-4 w-4 text-brand-700" />
                {locale === 'ne' ? 'चिकित्सकीय सूचना' : 'Medical advisory'}
              </p>
              <p className="mt-2 leading-relaxed">
                {locale === 'ne'
                  ? 'यो लेख सामान्य स्वास्थ्य साक्षरता र सचेतनाको लागि मात्र हो। कुनै पनि औषधी सुरु वा परिवर्तन गर्नु अघि, वा नयाँ लक्षणहरू देखिएमा क्लिनिकका चिकित्सकसँग प्रत्यक्ष परामर्श लिनुहोस्।'
                  : 'This educational article is published for general preventive and health literacy awareness only. It is not an individual medical diagnosis or prescription. Always consult a qualified physician for your personal healthcare needs.'}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-brand-950 px-6 py-5 text-white">
            <div>
              <p className="font-display text-sm font-semibold">
                {locale === 'ne' ? 'चिकित्सकसँग कुरा गर्नुहोस्' : 'Have questions about this topic?'}
              </p>
              <p className="mt-0.5 text-[0.6875rem] text-brand-100/70">
                {locale === 'ne'
                  ? 'क्लिनिकमा परामर्शको लागि समय अनुरोध गर्नुहोस्।'
                  : 'Request a consultation at the clinic.'}
              </p>
            </div>
            <Link href={`/${locale}/book`} className="btn btn-accent !px-4 !py-2.5 text-xs">
              {messages.common.bookSession}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
