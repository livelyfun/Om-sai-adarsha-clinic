import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getMessages, Locale } from '@/lib/i18n';
import { uniqueBy } from '@/lib/utils';
import {
  FlaskConical,
  ArrowRight,
  Search,
  Home,
  Clock3,
  FileText,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import PageHeader from '@/components/public/PageHeader';

interface LabTestsPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ category?: string; q?: string }>;
}

export default async function LabTestsCataloguePage({ params, searchParams }: LabTestsPageProps) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const messages = getMessages(locale);
  const common = messages.common;
  const nav = messages.nav;

  const selectedCategory = resolvedSearch?.category || 'all';
  const query = (resolvedSearch?.q || '').toLowerCase();

  const categories = uniqueBy(db.getLabCategories(), (cat) => cat.nameEn);
  const allActiveTests = uniqueBy(
    db.getLabTests(true, selectedCategory === 'all' ? undefined : selectedCategory),
    (test) => test.nameEn
  );

  const tests = allActiveTests.filter((t) => {
    if (!query) return true;
    const matchName = t.nameEn.toLowerCase().includes(query) || (t.nameNe && t.nameNe.includes(query));
    return matchName;
  });

  return (
    <div className="bg-cream">
      <PageHeader
        eyebrow={locale === 'ne' ? 'डायग्नोस्टिक ल्याब' : 'Diagnostic investigations'}
        title={nav.labTests}
        description={
          locale === 'ne'
            ? 'प्रमाणित प्रयोगशाला परीक्षणहरूको सूची, आवश्यक पूर्वतयारी तथा सुरक्षित डिजिटल रिपोर्ट।'
            : 'Certified laboratory tests, preparation instructions and secure digital reports.'
        }
      >
        {categories.length > 0 && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex w-full flex-wrap items-center justify-center gap-2">
              <Link
                href={`/${locale}/lab-tests`}
                className={
                  selectedCategory === 'all'
                    ? 'rounded-full bg-brand-800 px-4 py-2 text-[0.6875rem] font-bold text-white shadow-sm'
                    : 'rounded-full border border-brand-950/10 bg-white px-4 py-2 text-[0.6875rem] font-semibold text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-800'
                }
              >
                {locale === 'ne' ? 'सबै परीक्षण' : 'All tests'}
              </Link>
              {categories.map((cat) => {
                const catName = locale === 'ne' && cat.nameNe ? cat.nameNe : cat.nameEn;
                const isSelected = selectedCategory === cat.id;
                return (
                  <Link
                    key={cat.id}
                    href={`/${locale}/lab-tests?category=${cat.id}`}
                    className={
                      isSelected
                        ? 'rounded-full bg-brand-800 px-4 py-2 text-[0.6875rem] font-bold text-white shadow-sm'
                        : 'rounded-full border border-brand-950/10 bg-white px-4 py-2 text-[0.6875rem] font-semibold text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-800'
                    }
                  >
                    {catName}
                  </Link>
                );
              })}
            </div>

            <form
              method="GET"
              className="flex w-full max-w-md items-center gap-2 rounded-full border border-brand-950/10 bg-white p-1.5 shadow-soft"
            >
              {selectedCategory !== 'all' && (
                <input type="hidden" name="category" value={selectedCategory} />
              )}
              <span className="pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder={
                  locale === 'ne' ? 'परीक्षणको नाम खोज्नुहोस्...' : 'Search lab investigations...'
                }
                className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none"
              />
              <button type="submit" className="btn btn-primary !px-4 !py-2.5 text-xs">
                {locale === 'ne' ? 'खोज्नुहोस्' : 'Search'}
              </button>
            </form>
          </div>
        )}
      </PageHeader>

      <div className="container-x py-12 sm:py-14">
        {allActiveTests.length === 0 && categories.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-brand-950/15 bg-white px-8 py-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <FlaskConical className="h-7 w-7" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-ink">
              {locale === 'ne' ? 'ल्याब परीक्षण सूची अद्यावधिक हुँदैछ' : 'Lab test directory updating'}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
              {locale === 'ne'
                ? 'क्लिनिकको प्रयोगशालाद्वारा गरिने परीक्षणहरूको सूची र नमुना संकलन विधि चाँडै उपलब्ध हुनेछ।'
                : 'Certified lab test categories, pricing and preparation guidelines are being configured in the CMS.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {tests.length} {locale === 'ne' ? 'परीक्षण' : tests.length === 1 ? 'test' : 'tests'}
              </p>
              {query && (
                <Link
                  href={`/${locale}/lab-tests${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`}
                  className="link-arrow"
                >
                  {locale === 'ne' ? 'खोज हटाउनुहोस्' : 'Clear search'}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            {tests.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-brand-950/15 bg-white px-8 py-14 text-center">
                <p className="font-display text-base font-semibold text-ink">
                  {locale === 'ne' ? 'कुनै परीक्षण भेटिएन' : 'No matching tests'}
                </p>
                <p className="mt-1.5 text-xs text-slate-500">
                  {locale === 'ne'
                    ? 'अर्को नाम प्रयास गर्नुहोस् वा सबै श्रेणी हेर्नुहोस्।'
                    : 'Try another name or browse all categories.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tests.map((test) => {
                  const name = locale === 'ne' && test.nameNe ? test.nameNe : test.nameEn;
                  const prep =
                    locale === 'ne' && test.prepInstructionsNe
                      ? test.prepInstructionsNe
                      : test.prepInstructionsEn;
                  const sample =
                    locale === 'ne' ? test.sampleTypeNe || test.sampleTypeEn : test.sampleTypeEn;
                  const isMissingNepali = locale === 'ne' && !test.nameNe;

                  return (
                    <article key={test.id} className="group card card-hover flex flex-col p-5">
                      <div className="flex items-center justify-between">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                          <FlaskConical className="h-5 w-5" />
                        </span>
                        {test.isHomeCollectionAvailable && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2.5 py-1 text-[0.5625rem] font-bold uppercase tracking-wide text-sand-500">
                            <Home className="h-3 w-3" />
                            {locale === 'ne' ? 'घरमै संकलन' : 'Home sample'}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-4 font-display text-[1.0625rem] font-semibold leading-snug tracking-tight text-ink group-hover:text-brand-800">
                        {name}
                      </h3>

                      {isMissingNepali && (
                        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[0.625rem] text-amber-800">
                          {common.nepaliMissingNote}
                        </p>
                      )}

                      <dl className="mt-3 space-y-1.5 text-[0.6875rem]">
                        {sample && (
                          <div className="flex gap-2">
                            <dt className="w-16 shrink-0 text-slate-400">
                              {locale === 'ne' ? 'नमुना' : 'Sample'}
                            </dt>
                            <dd className="font-medium text-slate-700">{sample}</dd>
                          </div>
                        )}
                        {prep && (
                          <div className="flex gap-2">
                            <dt className="w-16 shrink-0 text-slate-400">
                              {locale === 'ne' ? 'तयारी' : 'Prep'}
                            </dt>
                            <dd className="line-clamp-2 leading-relaxed text-slate-600">{prep}</dd>
                          </div>
                        )}
                      </dl>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-brand-950/8 pt-4">
                        <div>
                          <p className="text-[0.5625rem] uppercase tracking-[0.12em] text-slate-400">
                            {locale === 'ne' ? 'शुल्क' : 'Price'}
                          </p>
                          <p className="font-display text-sm font-semibold text-ink">
                            {test.price !== null
                              ? `NPR ${test.price}`
                              : locale === 'ne'
                                ? 'पुष्टि हुने'
                                : 'Confirmed by clinic'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/${locale}/lab-tests/${test.slug}`}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[0.6875rem] font-semibold text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-900"
                          >
                            {locale === 'ne' ? 'तयारी' : 'Prep'}
                          </Link>
                          <Link
                            href={`/${locale}/book?test=${test.id}`}
                            className="inline-flex items-center gap-1 rounded-full bg-brand-800 px-3.5 py-1.5 text-[0.6875rem] font-bold text-white shadow-xs transition-all hover:bg-brand-900 hover:shadow-sm"
                          >
                            <Calendar className="h-3 w-3" />
                            {locale === 'ne' ? 'अनुरोध' : 'Book'}
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div className="mt-8 grid gap-4 rounded-3xl border border-brand-950/8 bg-white p-6 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: locale === 'ne' ? 'प्रमाणित प्रयोगशाला' : 'Verified laboratory',
              sub:
                locale === 'ne'
                  ? 'योग्य प्राविधिकद्वारा जाँच'
                  : 'Reviewed by qualified technologists',
            },
            {
              icon: FileText,
              title: locale === 'ne' ? 'डिजिटल रिपोर्ट' : 'Digital reports',
              sub:
                locale === 'ne'
                  ? 'सुरक्षित पोर्टल डाउनलोड'
                  : 'Secure portal download',
            },
            {
              icon: Clock3,
              title: locale === 'ne' ? 'छिटो प्रक्रिया' : 'Same-day routine',
              sub:
                locale === 'ne'
                  ? 'अधिकांश नतिजा क्लिनिकको दिनभित्रै'
                  : 'Most routine results within the clinic day',
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <item.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-ink">{item.title}</p>
                <p className="mt-0.5 text-[0.625rem] leading-relaxed text-slate-500">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
