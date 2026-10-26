import React from 'react';
import { getMessages, Locale } from '@/lib/i18n';
import { ShieldCheck, HeartHandshake, Award, Users, Phone, MapPin, Clock, ExternalLink } from 'lucide-react';
import { db } from '@/lib/db';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const messages = getMessages(locale);
  const nav = messages.nav;

  const addressEn = db.getSetting('address_en') || '';
  const addressNe = db.getSetting('address_ne') || '';
  const phone = db.getSetting('phone') || '';
  const emergencyPhone = db.getSetting('emergency_phone') || '';
  const facebookUrl = db.getSetting('facebook_url') || 'https://www.facebook.com/p/Om-Sai-Aadarsha-Clinic-100084050983392/';
  const openingHours = locale === 'ne'
    ? (db.getSetting('opening_hours_ne') || 'आइतबार – शुक्रबार: बिहान ०७:०० – साँझ ०८:०० (शनिबार बन्द)')
    : (db.getSetting('opening_hours_en') || 'Sunday – Friday: 07:00 AM – 08:00 PM (Saturday Closed)');

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
          {locale === 'ne' ? 'हाम्रो परिचय' : 'Clinic Overview'}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
          {nav.about}
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {messages.footer.aboutClinic}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900 font-serif">
          {locale === 'ne' ? 'हाम्रो प्रतिबद्धता' : 'Our Commitment to Patient Care'}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {locale === 'ne'
            ? 'ॐ साई आदर्श क्लिनिकले समुदायलाई सुलभ, भरपर्दो र गुणस्तरीय स्वास्थ्य सेवा प्रदान गर्न निरन्तर कार्य गर्दै आएको छ। हामी प्रत्येक बिरामीको गोपनीयता र स्वास्थ्य सुरक्षालाई उच्च प्राथमिकता दिन्छौं।'
            : 'Om Sai Aadarsha Clinic is dedicated to providing compassionate, accessible, and high-standard outpatient clinical care and laboratory diagnostic investigations. We prioritize patient dignity, data privacy, and clinical transparency.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="flex items-start gap-3">
            <HeartHandshake className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {locale === 'ne' ? 'बिरामी-केन्द्रित सेवा' : 'Patient-Centered Compassion'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ne' ? 'प्रत्येक बिरामीको व्यक्तिगत आवश्यकता र सुरक्षालाई ध्यानमा राखी सेवा प्रदान गर्दछौं।' : 'Individualized clinical attention designed to respect patient time, autonomy, and comfort.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {locale === 'ne' ? 'सुरक्षित तथा गोप्य डेटा' : 'Strict Data Privacy'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {locale === 'ne' ? 'डिजिटल ल्याब रिपोर्ट र स्वास्थ्य विवरणहरू उच्च स्तरको प्रमाणीकरणद्वारा सुरक्षित राखिन्छ।' : 'Encrypted report delivery, server-side access control, and strict compliance with health privacy norms.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Clinic Facts & Verified Facebook Integration Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900 font-serif">
          {locale === 'ne' ? 'सम्पर्क तथा क्लिनिक विवरण' : 'Verified Contact & Clinical Operations'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-slate-700">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block text-sm">
              {locale === 'ne' ? 'क्लिनिक ठेगाना' : 'Physical Location'}
            </span>
            <p className="text-slate-600">
              {locale === 'ne' ? (addressNe || addressEn || 'ठेगाना क्लिनिकद्वारा पुष्टि हुने') : (addressEn || 'Address confirmed by clinic')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block text-sm">
              {locale === 'ne' ? 'परामर्श तथा ल्याब समय' : 'Consultation & Lab Hours'}
            </span>
            <p className="text-slate-600">{openingHours}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block text-sm">
              {locale === 'ne' ? 'टेलिफोन तथा सम्पर्क' : 'Telephone Inquiries'}
            </span>
            <p className="text-slate-600 font-mono text-xs">{phone || 'Contact reception directly in person'}</p>
            {emergencyPhone && (
              <p className="text-red-700 font-semibold mt-1">
                {locale === 'ne' ? 'आपतकालीन: ' : 'Emergency: '} {emergencyPhone}
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2 flex flex-col justify-between">
            <div>
              <span className="font-bold text-blue-950 block text-sm">
                {locale === 'ne' ? 'आधिकारिक फेसबुक पेज' : 'Official Facebook Presence'}
              </span>
              <p className="text-blue-900 mt-0.5">
                {locale === 'ne'
                  ? 'क्लिनिकको आधिकारिक फेसबुक पेजबाट नियमित सूचना, क्याम्प र स्वास्थ्य सन्देशहरू हेर्नुहोस्।'
                  : 'Follow Om Sai Aadarsha Clinic on Facebook for health camp schedules and operational announcements.'}
              </p>
            </div>
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-900 underline"
              >
                <span>{locale === 'ne' ? 'फेसबुक पेज खोल्नुहोस्' : 'Visit Official Facebook Page'} →</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
