import React from 'react';
import Link from 'next/link';
import { getMessages, Locale } from '@/lib/i18n';
import { db } from '@/lib/db';
import { uniqueBy } from '@/lib/utils';
import { BookOpen, Stethoscope, ArrowRight, ArrowUpRight } from 'lucide-react';
import PageHeader from '@/components/public/PageHeader';

interface HealthInfoPageProps {
  params: Promise<{ locale: string }>;
}

export default async function HealthInfoPage({ params }: HealthInfoPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const messages = getMessages(locale);
  const nav = messages.nav;

  // Query published articles from database (de-duplicated)
  const articles = uniqueBy(db.getArticles(true), (article) => article.titleEn);

  return (
    <div className="bg-cream">
      <PageHeader
        eyebrow={locale === 'ne' ? 'स्वास्थ्य साक्षरता' : 'Health literacy'}
        title={nav.healthInfo}
        description={
          locale === 'ne'
            ? 'क्लिनिकका चिकित्सकहरूद्वारा प्रमाणित स्वास्थ्य सल्लाह र रोग रोकथामका उपायहरू।'
            : 'Evidence-based healthcare insights and preventive guidance reviewed by our clinical team.'
        }
      />

      <div className="container-x py-12 sm:py-14">
        {articles.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-brand-950/15 bg-white px-8 py-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <BookOpen className="h-7 w-7" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-ink">
              {locale === 'ne' ? 'स्वास्थ्य लेखहरू समीक्षा चरणमा छन्' : 'Articles under clinical review'}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-slate-500">
              {locale === 'ne'
                ? 'बिरामी सुरक्षाको लागि चिकित्सकद्वारा प्रमाणीकरण भएका लेखहरू मात्र यहाँ प्रकाशित गरिन्छ। नयाँ लेखहरू चाँडै आउँदैछन्।'
                : 'Per clinic protocol, only articles reviewed and approved by verified clinical staff are published here. New articles are in editorial review.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => {
              const hasNe = Boolean(article.titleNe && article.titleNe.trim());
              const displayTitle = locale === 'ne' && hasNe ? article.titleNe : article.titleEn;
              const displayExcerpt =
                locale === 'ne' && article.excerptNe ? article.excerptNe : article.excerptEn;
              const isFallback = locale === 'ne' && !hasNe;

              return (
                <article key={article.id} className="group card card-hover flex flex-col p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="chip">
                      <BookOpen className="h-3 w-3" />
                      {article.category || (locale === 'ne' ? 'स्वास्थ्य' : 'Health')}
                    </span>
                    <span className="text-[0.625rem] text-slate-400">
                      {new Date(article.createdAt).toLocaleDateString(
                        locale === 'ne' ? 'ne-NP' : 'en-GB',
                        { day: 'numeric', month: 'short', year: 'numeric' }
                      )}
                    </span>
                  </div>

                  <h3 className="mt-5 line-clamp-2 font-display text-lg font-semibold leading-snug tracking-tight text-ink">
                    <Link
                      href={`/${locale}/explore/health-info/${article.slug}`}
                      className="transition-colors group-hover:text-brand-800"
                    >
                      {displayTitle}
                    </Link>
                  </h3>

                  {isFallback && (
                    <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[0.625rem] text-amber-800">
                      {locale === 'ne'
                        ? 'अंग्रेजी मूल • अनुवाद समीक्षाधीन'
                        : 'English source • translation in review'}
                    </p>
                  )}

                  <p className="mt-2.5 line-clamp-3 flex-1 text-[0.8125rem] leading-relaxed text-slate-600">
                    {displayExcerpt ||
                      (locale === 'ne'
                        ? 'क्लिनिकका प्रमाणित स्वास्थ्य सामग्रीहरू पढ्नुहोस्।'
                        : 'Read verified clinical guidance from Om Sai Aadarsha Clinic.')}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-brand-950/8 pt-4">
                    <div className="flex min-w-0 items-center gap-1.5 text-[0.6875rem] text-slate-500">
                      <Stethoscope className="h-3.5 w-3.5 shrink-0 text-brand-600" />
                      <span className="truncate">
                        {article.reviewedByDoctorName
                          ? locale === 'ne'
                            ? `समीक्षा: ${article.reviewedByDoctorName}`
                            : `Reviewed by ${article.reviewedByDoctorName}`
                          : locale === 'ne'
                            ? 'क्लिनिक टोली'
                            : 'Clinic team'}
                      </span>
                    </div>

                    <Link
                      href={`/${locale}/explore/health-info/${article.slug}`}
                      className="inline-flex shrink-0 items-center gap-1 text-[0.6875rem] font-bold text-brand-700"
                    >
                      {locale === 'ne' ? 'पढ्नुहोस्' : 'Read'}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.6875rem] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Stethoscope className="h-3.5 w-3.5 text-brand-600" />
            {locale === 'ne' ? 'चिकित्सकद्वारा समीक्षित' : 'Reviewed by clinicians'}
          </span>
          <Link href={`/${locale}/explore/faq`} className="link-arrow">
            {locale === 'ne' ? 'प्रश्नहरू हेर्नुहोस्' : 'Browse FAQs'}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
