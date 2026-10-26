import React from 'react';
import { getMessages, Locale } from '@/lib/i18n';
import { AlertTriangle, Clock, ShieldCheck, CreditCard } from 'lucide-react';

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function BookingTermsPage({ params }: TermsPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const messages = getMessages(locale);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      {/* Draft Warning Banner (Section 13) */}
      <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 flex items-start gap-3 text-xs text-amber-950">
        <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">DRAFT DOCUMENT — VERSION 2026-10-v1</p>
          <p className="mt-0.5 text-amber-900">
            These booking terms constitute a development template for Om Sai Aadarsha Clinic. Legal counsel and clinical management review are required prior to live deployment.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="font-serif text-3xl font-bold text-slate-900">
          {locale === 'ne' ? 'अनुरोधमा आधारित बुकिङ सर्तहरू (Booking Terms)' : 'Request-Based Booking Terms & Conditions'}
        </h1>
        <p className="text-xs text-slate-500">Effective Date: October 26, 2026 · Version: 2026-10-v1</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-bold text-slate-900 text-base">1. Request Nature of Online Submissions</h2>
          <p>
            Every submission made via this portal is registered as a <strong>request</strong>, never as a guaranteed or finalized appointment. Your appointment becomes binding only when clinic reception performs a conflict check and updates the status to <strong>Confirmed</strong>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-slate-900 text-base">2. Reschedule Proposals & Patient Action</h2>
          <p>
            If a requested doctor is unavailable or a schedule emergency arises, reception may propose an alternative date and time. An action banner will appear in your Patient Dashboard where you may accept or decline the proposal. A proposed time does not hold the slot until accepted.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-slate-900 text-base">3. Cancellation & Cutoff Rules</h2>
          <p>
            Patients may cancel pending or confirmed bookings online up to <strong>4 hours</strong> prior to the scheduled appointment start time. Late cancellations or unattended appointments may be recorded as a *No Show*.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-slate-900 text-base">4. Informational Pricing & Counter Payment</h2>
          <p>
            All fees and lab investigation prices displayed on the website are informational estimates. Om Sai Aadarsha Clinic does not collect online payments or process credit card transactions. Final charges and billing settlements are completed at the clinic reception counter.
          </p>
        </section>
      </div>
    </div>
  );
}
