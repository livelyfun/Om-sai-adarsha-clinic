import React from 'react';
import { getMessages, Locale } from '@/lib/i18n';
import { HelpCircle, ChevronRight } from 'lucide-react';

interface FaqPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FaqPage({ params }: FaqPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const messages = getMessages(locale);
  const nav = messages.nav;

  const faqs = [
    {
      q: locale === 'ne' ? 'अनलाइन बुकिङ कसरी काम गर्छ?' : 'How does the online booking request work?',
      a: locale === 'ne'
        ? 'तपाईंले वेबसाइटबाट आफ्नो इच्छित चिकित्सक वा ल्याब परीक्षणको लागि समय अनुरोध पेश गर्नुहुन्छ। क्लिनिक रिसेप्सनले समयतालिका जाँच गरी बुकिङ स्वीकृत वा नयाँ समय प्रस्ताव गर्दछ।'
        : 'Submitting a form creates a booking request. Clinic reception reviews the slot availability against doctor schedules and confirms it or proposes an alternative time.',
    },
    {
      q: locale === 'ne' ? 'म मेरो ल्याब रिपोर्ट कसरी प्राप्त गर्न सक्छु?' : 'How do I access my laboratory reports?',
      a: locale === 'ne'
        ? 'ल्याब रिपोर्ट तयार भएपछि क्लिनिकले अन्तिम प्रमाणीकरण गरी जारी गर्दछ। त्यसपछि तपाईंले आफ्नो बिरामी पोर्टलमा लगइन गरी रिपोर्ट सुरक्षित रूपमा पीडीएफ डाउनलोड गर्न सक्नुहुन्छ।'
        : 'Once laboratory tests are finalized and released by authorized staff, they become instantly available as authenticated PDF downloads inside your secure Patient Dashboard.',
    },
    {
      q: locale === 'ne' ? 'के अनलाइन भुक्तानी आवश्यक छ?' : 'Is online payment required?',
      a: locale === 'ne'
        ? 'छैन। वेबसाइटमा देखाइएका शुल्कहरू केवल जानकारीका लागि हुन्। वास्तविक भुक्तानी क्लिनिक काउन्टरमा नगद वा कार्डमार्फत हुन्छ।'
        : 'No. The clinic does not collect online payments. Displayed consultation fees and lab test prices are informational. Final payment is handled in person at the clinic counter.',
    },
    {
      q: locale === 'ne' ? 'के म परिवारका सदस्यको लागि बुकिङ गर्न सक्छु?' : 'Can I request bookings for family members?',
      a: locale === 'ne'
        ? 'हो। एउटा बिरामी खाताबाट तपाईंले आफ्ना बालबालिका, आमाबुवा वा अन्य आश्रित सदस्यहरूको प्रोफाइल थपी उनीहरूको लागि बुकिङ र रिपोर्ट व्यवस्थापन गर्न सक्नुहुन्छ।'
        : 'Yes. A single patient account can manage up to 6 family profiles (e.g. child, parent, spouse) to submit requests and access their individual reports.',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
          {locale === 'ne' ? 'सहयोग तथा जानकारी' : 'Help & Answers'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
          {nav.faq}
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          {locale === 'ne'
            ? 'अपोइन्टमेन्ट अनुरोध, ल्याब रिपोर्ट र बिरामी खाता सम्बन्धी प्रायः सोधिने प्रश्नहरूको उत्तर।'
            : 'Frequently asked questions regarding requests, clinic procedures, and secure report access.'}
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
            <h3 className="font-bold text-base text-slate-900 flex items-start gap-2.5">
              <HelpCircle className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
              <span>{faq.q}</span>
            </h3>
            <p className="text-sm text-slate-600 pl-7 leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
