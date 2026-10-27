import React from 'react';
import Link from 'next/link';
import { getMessages, Locale } from '@/lib/i18n';
import { AlertTriangle, Clock, ShieldCheck, CreditCard, ArrowLeft, FileText } from 'lucide-react';
import PageHeader from '@/components/public/PageHeader';

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function BookingTermsPage({ params }: TermsPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const messages = getMessages(locale);

  const highlights = [
    {
      icon: Clock,
      title: locale === 'ne' ? '४ घण्टा अगाडि रद्द' : '4-hour cancellation',
      text:
        locale === 'ne'
          ? 'निर्धारित समयभन्दा कम्तीमा ४ घण्टा अघि रद्द गर्न सकिन्छ।'
          : 'Cancel up to 4 hours before the scheduled start time.',
    },
    {
      icon: CreditCard,
      title: locale === 'ne' ? 'काउन्टरमा भुक्तानी' : 'Pay at the counter',
      text:
        locale === 'ne'
          ? 'वेबसाइटमा अनलाइन भुक्तानी लिइँदैन।'
          : 'No online payments; billing is settled in person.',
    },
    {
      icon: ShieldCheck,
      title: locale === 'ne' ? 'रिसेप्सनद्वारा पुष्टि' : 'Reception confirmed',
      text:
        locale === 'ne'
          ? 'अनुरोध स्वीकृत भएपछि मात्र अपोइन्टमेन्ट निश्चित हुन्छ।'
          : 'A request becomes an appointment only after confirmation.',
    },
  ];

  return (
    <div className="bg-cream">
      <PageHeader
        eyebrow={locale === 'ne' ? 'कानुनी तथा बुकिङ' : 'Legal & booking'}
        title={
          locale === 'ne'
            ? 'अनुरोधमा आधारित बुकिङ सर्तहरू'
            : 'Request-Based Booking Terms & Conditions'
        }
        description={
          locale === 'ne'
            ? 'अनलाइन अनुरोध, पुनःतालिका, रद्द र शुल्क सम्बन्धी सर्तहरू।'
            : 'Terms covering online requests, rescheduling, cancellation and clinic billing.'
        }
      />

      <div className="container-x max-w-5xl py-10 sm:py-14">
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <div>
            <p className="font-bold uppercase tracking-[0.08em]">Draft · v2026-10-v1</p>
            <p className="mt-1 leading-relaxed text-amber-900">
              {locale === 'ne'
                ? 'यी सर्तहरू विकास पूर्वावलोकनका लागि तयार गरिएको ढाँचा हुन्। सार्वजनिक प्रयोग अघि कानुनी तथा क्लिनिकल समीक्षा आवश्यक छ।'
                : 'These terms are a development template. Legal counsel and clinical management review are required prior to live deployment.'}
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.62fr_1.38fr] lg:items-start">
          <aside className="order-2 space-y-4 lg:order-1 lg:sticky lg:top-28">
            <div className="card p-5">
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                {locale === 'ne' ? 'मुख्य बुँदा' : 'At a glance'}
              </span>
              <div className="mt-4 space-y-3">
                {highlights.map((item) => (
                  <div key={item.title} className="flex gap-2.5">
                    <item.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                    <div>
                      <p className="text-[0.6875rem] font-semibold text-ink">{item.title}</p>
                      <p className="mt-0.5 text-[0.625rem] leading-relaxed text-slate-500">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-brand-950/8 pt-4">
                <Link href={`/${locale}/privacy`} className="link-arrow text-[0.6875rem]">
                  <FileText className="h-3 w-3" />
                  {locale === 'ne' ? 'गोपनीयता नीति' : 'Privacy policy'}
                </Link>
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
                    {locale === 'ne'
                      ? 'अनलाइन सबमिशनको अनुरोध प्रकृति'
                      : 'Request nature of online submissions'}
                  </h2>
                  <p>
                    Every submission made via this portal is registered as a{' '}
                    <strong className="font-semibold text-ink">request</strong>, never as a
                    guaranteed or finalized appointment. Your appointment becomes binding only when
                    clinic reception performs a conflict check and updates the status to{' '}
                    <strong className="font-semibold text-ink">Confirmed</strong>.
                  </p>
                </section>

                <section className="space-y-2 border-t border-brand-950/8 pt-7">
                  <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand-50 text-[0.625rem] font-bold text-brand-700">
                      2
                    </span>
                    {locale === 'ne'
                      ? 'पुनःतालिका प्रस्ताव तथा बिरामीको कार्य'
                      : 'Reschedule proposals & patient action'}
                  </h2>
                  <p>
                    If a requested doctor is unavailable or a schedule emergency arises, reception
                    may propose an alternative date and time. An action banner will appear in your
                    Patient Dashboard where you may accept or decline the proposal. A proposed time
                    does not hold the slot until accepted.
                  </p>
                </section>

                <section className="space-y-2 border-t border-brand-950/8 pt-7">
                  <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand-50 text-[0.625rem] font-bold text-brand-700">
                      3
                    </span>
                    {locale === 'ne' ? 'रद्द गर्ने नियम' : 'Cancellation & cutoff rules'}
                  </h2>
                  <p>
                    Patients may cancel pending or confirmed bookings online up to{' '}
                    <strong className="font-semibold text-ink">4 hours</strong> prior to the
                    scheduled appointment start time. Late cancellations or unattended appointments
                    may be recorded as a <em>No Show</em>.
                  </p>
                </section>

                <section className="space-y-2 border-t border-brand-950/8 pt-7">
                  <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand-50 text-[0.625rem] font-bold text-brand-700">
                      4
                    </span>
                    {locale === 'ne'
                      ? 'जानकारीमूलक शुल्क तथा काउन्टर भुक्तानी'
                      : 'Informational pricing & counter payment'}
                  </h2>
                  <p>
                    All fees and lab investigation prices displayed on the website are informational
                    estimates. Om Sai Aadarsha Clinic does not collect online payments or process
                    credit card transactions. Final charges and billing settlements are completed at
                    the clinic reception counter.
                  </p>
                </section>
              </div>
            </div>

            <Link
              href={`/${locale}/book`}
              className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-slate-500 transition-colors hover:text-brand-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {locale === 'ne' ? 'बुकिङमा फर्कनुहोस्' : 'Back to booking'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
