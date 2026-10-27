import React from 'react';
import Link from 'next/link';
import { getMessages, Locale } from '@/lib/i18n';
import { Phone, ArrowRight, HelpCircle } from 'lucide-react';
import PageHeader from '@/components/public/PageHeader';
import { HomeFaqAccordion } from '@/components/public/HomeFaqAccordion';
import { db } from '@/lib/db';

interface FaqPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FaqPage({ params }: FaqPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const messages = getMessages(locale);
  const nav = messages.nav;
  const phone = db.getSetting('phone') || '+977 9800000000';

  const faqs = [
    {
      q: locale === 'ne' ? 'अनलाइन बुकिङ कसरी काम गर्छ?' : 'How does the online booking request work?',
      a:
        locale === 'ne'
          ? 'तपाईंले वेबसाइटबाट आफ्नो इच्छित चिकित्सक वा ल्याब परीक्षणको लागि समय अनुरोध पेश गर्नुहुन्छ। क्लिनिक रिसेप्सनले समयतालिका जाँच गरी बुकिङ स्वीकृत वा नयाँ समय प्रस्ताव गर्दछ।'
          : 'Submitting a form creates a booking request. Clinic reception reviews slot availability against doctor schedules and confirms it or proposes an alternative time.',
    },
    {
      q: locale === 'ne' ? 'म मेरो ल्याब रिपोर्ट कसरी प्राप्त गर्न सक्छु?' : 'How do I access my laboratory reports?',
      a:
        locale === 'ne'
          ? 'ल्याब रिपोर्ट तयार भएपछि क्लिनिकले अन्तिम प्रमाणीकरण गरी जारी गर्दछ। त्यसपछि तपाईंले आफ्नो बिरामी पोर्टलमा लगइन गरी रिपोर्ट सुरक्षित रूपमा पीडीएफ डाउनलोड गर्न सक्नुहुन्छ।'
          : 'Once laboratory tests are finalized and released by authorized staff, they become instantly available as authenticated PDF downloads inside your secure Patient Dashboard.',
    },
    {
      q: locale === 'ne' ? 'के अनलाइन भुक्तानी आवश्यक छ?' : 'Is online payment required?',
      a:
        locale === 'ne'
          ? 'छैन। वेबसाइटमा देखाइएका शुल्कहरू केवल जानकारीका लागि हुन्। वास्तविक भुक्तानी क्लिनिक काउन्टरमा नगद वा कार्डमार्फत हुन्छ।'
          : 'No. The clinic does not collect online payments. Displayed consultation fees and lab test prices are informational. Final payment is handled in person at the clinic counter.',
    },
    {
      q: locale === 'ne' ? 'के म परिवारका सदस्यको लागि बुकिङ गर्न सक्छु?' : 'Can I request bookings for family members?',
      a:
        locale === 'ne'
          ? 'हो। एउटा बिरामी खाताबाट तपाईंले आफ्ना बालबालिका, आमाबुवा वा अन्य आश्रित सदस्यहरूको प्रोफाइल थपी उनीहरूको लागि बुकिङ र रिपोर्ट व्यवस्थापन गर्न सक्नुहुन्छ।'
          : 'Yes. A single patient account can manage up to 6 family profiles (e.g. child, parent, spouse) to submit requests and access their individual reports.',
    },
    {
      q: locale === 'ne' ? 'बुकिङ रद्द वा पुनःतालिका कसरी गर्ने?' : 'Can I cancel or reschedule a request?',
      a:
        locale === 'ne'
          ? 'पोर्टलमा देखिने आफ्नो अनुरोध खोल्नुहोस्। निर्धारित समयभन्दा केही घण्टा अगाडि रद्द गर्न सकिन्छ; अन्यथा रिसेप्सनलाई सम्पर्क गर्नुहोस्।'
          : 'Open the request in your patient portal. Cancellation is available up to the cut-off shown on the request; otherwise contact reception for help.',
    },
    {
      q: locale === 'ne' ? 'के वॉक-इन बिरामी स्वीकार गरिन्छ?' : 'Do you accept walk-in patients?',
      a:
        locale === 'ne'
          ? 'हो, क्लिनिक खुल्ने समयभित्र वॉक-इन सेवा उपलब्ध छ। तर पहिले अनलाइन अनुरोध गर्नुभयो भने कम प्रतीक्षा हुन सक्छ।'
          : 'Yes, walk-ins are accepted during clinic hours. Submitting a request in advance helps reduce waiting time.',
    },
  ];

  return (
    <div className="bg-cream">
      <PageHeader
        eyebrow={locale === 'ne' ? 'सहयोग तथा जानकारी' : 'Help & answers'}
        title={nav.faq}
        description={
          locale === 'ne'
            ? 'अपोइन्टमेन्ट अनुरोध, ल्याब रिपोर्ट र बिरामी खाता सम्बन्धी प्रायः सोधिने प्रश्नहरूको उत्तर।'
            : 'Frequently asked questions about requests, clinic procedures and secure report access.'
        }
      />

      <div className="container-x grid gap-10 py-12 sm:py-14 lg:grid-cols-[1.35fr_0.65fr] lg:gap-14">
        <HomeFaqAccordion faqs={faqs} />

        <aside className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl bg-brand-950 p-6 text-white">
            <div className="pointer-events-none absolute inset-0 bg-grid-light opacity-25" />
            <div className="relative">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-sand-300">
                <HelpCircle className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold tracking-tight">
                {locale === 'ne' ? 'अझै जवाफ भेटिएन?' : 'Still not sure?'}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-brand-100/75">
                {locale === 'ne'
                  ? 'रिसेप्सन टोलीले क्लिनिक समयभित्र तपाईंको प्रश्नको जवाफ दिनेछ।'
                  : 'Reception can answer questions about bookings, reports and visiting the clinic.'}
              </p>
              <a href={`tel:${phone}`} className="btn btn-accent mt-5 w-full !py-2.5 text-xs">
                <Phone className="h-3.5 w-3.5" />
                {phone}
              </a>
            </div>
          </div>

          <div className="card p-6">
            <p className="text-xs font-semibold text-ink">
              {locale === 'ne' ? 'बुकिङ अनुरोध गर्नुहोस्' : 'Ready to book?'}
            </p>
            <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-slate-500">
              {locale === 'ne'
                ? 'चिकित्सक वा ल्याब परीक्षणको लागि मनपर्ने समय पठाउनुहोस्।'
                : 'Send a preferred time for a consultation or lab test.'}
            </p>
            <Link href={`/${locale}/book`} className="link-arrow mt-4">
              {messages.common.bookSession}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
