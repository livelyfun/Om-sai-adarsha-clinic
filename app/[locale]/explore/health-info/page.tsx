import React from 'react';
import Link from 'next/link';
import { getMessages, Locale } from '@/lib/i18n';
import { db } from '@/lib/db';
import { BookOpen, Stethoscope, ArrowRight, Calendar, AlertCircle } from 'lucide-react';

interface HealthInfoPageProps {
  params: Promise<{ locale: string }>;
}

export default async function HealthInfoPage({ params }: HealthInfoPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const messages = getMessages(locale);
  const nav = messages.nav;

  // Query published articles from database
  const articles = db.getArticles(true);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
          {locale === 'ne' ? 'स्वास्थ्य साक्षरता तथा सचेतना' : 'Clinical Health Literacy'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
          {nav.healthInfo}
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          {locale === 'ne'
            ? 'क्लिनिकका चिकित्सकहरूद्वारा प्रमाणित स्वास्थ्य सल्लाह र रोग रोकथामका उपायहरू।'
            : 'Evidence-based healthcare insights and verified preventive guidance reviewed by our clinical staff.'}
        </p>
      </div>

      {articles.length === 0 ? (
        /* Empty State per Section 5 & 13 */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-2xl mx-auto space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
            <BookOpen className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {locale === 'ne' ? 'स्वास्थ्य लेखहरू समीक्षा चरणमा छन्' : 'Articles Under Clinical Review'}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            {locale === 'ne'
              ? 'बिरामी सुरक्षाको लागि, चिकित्सकद्वारा प्रमाणीकरण भएका लेखहरू मात्र यहाँ प्रकाशित गरिन्छ। नयाँ लेखहरू चाँडै आउँदैछन्।'
              : 'Per clinic protocol, only articles reviewed and approved by verified clinical staff are published here. Publications are currently in editorial review.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => {
            const hasNe = Boolean(article.titleNe && article.titleNe.trim());
            const displayTitle = locale === 'ne' && hasNe ? article.titleNe : article.titleEn;
            const displayExcerpt = locale === 'ne' && article.excerptNe ? article.excerptNe : article.excerptEn;
            const isFallback = locale === 'ne' && !hasNe;

            return (
              <div
                key={article.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-teal-700/40 hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full">
                      {article.category}
                    </span>
                    <span className="text-slate-400">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg leading-snug">
                    <Link
                      href={`/${locale}/explore/health-info/${article.slug}`}
                      className="hover:text-teal-800 transition-colors"
                    >
                      {displayTitle}
                    </Link>
                  </h3>

                  {isFallback && (
                    <div className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded-md border border-amber-200">
                      अंग्रेजी मूल • अनुवाद समीक्षाधीन
                    </div>
                  )}

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {displayExcerpt || 'Read verified clinical health guidance from Om Sai Aadarsha Clinic.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  {article.reviewedByDoctorName ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Stethoscope className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                      <span className="truncate max-w-[150px]">
                        {locale === 'ne' ? 'समीक्षा: ' : 'Reviewed by '}
                        <strong>{article.reviewedByDoctorName}</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400">
                      {locale === 'ne' ? 'क्लिनिक शिक्षा' : 'Clinic Staff'}
                    </div>
                  )}

                  <Link
                    href={`/${locale}/explore/health-info/${article.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-900 group"
                  >
                    <span>{locale === 'ne' ? 'थप पढ्नुहोस्' : 'Read'}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
