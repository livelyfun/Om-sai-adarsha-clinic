import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMessages, Locale } from '@/lib/i18n';
import { db } from '@/lib/db';
import { Stethoscope, ArrowLeft, Calendar, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function HealthArticleDetailPage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const slug = resolvedParams.slug;

  const article = db.getArticleBySlug(slug);
  if (!article || article.status !== 'published') {
    notFound();
  }

  const hasNe = Boolean(article.titleNe && article.titleNe.trim());
  const displayTitle = locale === 'ne' && hasNe ? article.titleNe : article.titleEn;
  const displayContent = locale === 'ne' && article.contentNe && article.contentNe.trim() ? article.contentNe : article.contentEn;
  const isFallback = locale === 'ne' && (!hasNe || !article.contentNe);

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      {/* Back link */}
      <div>
        <Link
          href={`/${locale}/explore/health-info`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:text-teal-900 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>{locale === 'ne' ? 'सबै स्वास्थ्य लेखहरू' : 'Back to Health Articles'}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-4 pb-6 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full">
            {article.category}
          </span>
          <span className="text-slate-400 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
          {displayTitle}
        </h1>

        {/* Clinical Reviewer Banner */}
        {article.reviewedByDoctorName && (
          <div className="rounded-xl bg-teal-50 border border-teal-200 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-teal-950 font-bold">
                {locale === 'ne' ? 'चिकित्सकीय समीक्षा प्रमाणित' : 'Clinically Reviewed Article'}
              </p>
              <p className="text-xs text-teal-900">
                {locale === 'ne' ? 'समीक्षक: ' : 'Reviewed by '}
                <strong>{article.reviewedByDoctorName}</strong>
                {article.reviewedAt && ` • ${new Date(article.reviewedAt).toLocaleDateString()}`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fallback translation warning banner */}
      {isFallback && (
        <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            तल अंग्रेजी मूल विवरण प्रस्तुत गरिएको छ। क्लिनिक कर्मचारीद्वारा समीक्षा भएपछि नेपाली अनुवाद अद्यावधिक गरिनेछ।
          </p>
        </div>
      )}

      {/* Content Body */}
      <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed space-y-4 whitespace-pre-wrap font-sans text-sm sm:text-base">
        {displayContent || (
          <p className="text-slate-500 italic">Content currently being updated by clinic staff.</p>
        )}
      </div>

      {/* Clinical Disclaimer */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 mt-10 text-xs text-slate-600 space-y-1">
        <p className="font-bold text-slate-900 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-teal-800" />
          <span>{locale === 'ne' ? 'चिकित्सकीय सूचना तथा सल्लाह' : 'Medical Advisory Notice'}</span>
        </p>
        <p className="leading-relaxed">
          {locale === 'ne'
            ? 'यो लेख सामान्य स्वास्थ्य साक्षरता र सचेतनाको लागि मात्र हो। कुनै पनि औषधी सुरु वा परिवर्तन गर्नु अघि, वा नयाँ लक्षणहरू देखिएमा क्लिनिकका चिकित्सकसँग प्रत्यक्ष परामर्श लिनुहोस्।'
            : 'This educational article is published for general preventive and health literacy awareness only. It is not an individual medical diagnosis or prescription. Always consult a qualified physician for your personal healthcare needs.'}
        </p>
      </div>
    </article>
  );
}
