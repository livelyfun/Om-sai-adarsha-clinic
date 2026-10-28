import React from 'react';
import { getMessages, Locale } from '@/lib/i18n';
import {
  ShieldCheck,
  HeartHandshake,
  MapPin,
  Phone,
  Clock,
  Facebook,
  ArrowUpRight,
  Stethoscope,
  FlaskConical,
  Sparkles,
} from 'lucide-react';
import { db } from '@/lib/db';
import PageHeader from '@/components/public/PageHeader';

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
  const phone = db.getSetting('phone') || '+977 9800000000';
  const emergencyPhone = db.getSetting('emergency_phone') || '';
  const facebookUrl =
    db.getSetting('facebook_url') || 'https://www.facebook.com/p/Om-Sai-Aadarsha-Clinic-100084050983392/';
  const openingHours =
    locale === 'ne'
      ? db.getSetting('opening_hours_ne') || 'आइतबार – शुक्रबार: बिहान ०७:०० – साँझ ०८:०० (शनिबार बन्द)'
      : db.getSetting('opening_hours_en') || 'Sunday – Friday: 07:00 AM – 08:00 PM (Saturday Closed)';

  return (
    <div className="bg-cream">
      <PageHeader
        eyebrow={locale === 'ne' ? 'हाम्रो परिचय' : 'Clinic overview'}
        title={nav.about}
        description={messages.footer.aboutClinic}
      />

      <div className="container-x max-w-5xl space-y-5 py-12 sm:py-14">
        <section className="card overflow-hidden">
          <div className="grid md:grid-cols-[1.35fr_1fr]">
            <div className="p-7 sm:p-9">
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                {locale === 'ne' ? 'हाम्रो प्रतिबद्धता' : 'Our commitment'}
              </span>
              <h2 className="display-title mt-3 text-2xl sm:text-3xl">
                {locale === 'ne' ? 'हरेक बिरामीलाई सम्मानका साथ' : 'Care with dignity, every time'}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {locale === 'ne'
                  ? 'ॐ साई आदर्श क्लिनिकले समुदायलाई सुलभ, भरपर्दो र गुणस्तरीय स्वास्थ्य सेवा प्रदान गर्न निरन्तर कार्य गर्दै आएको छ। हामी प्रत्येक बिरामीको गोपनीयता र स्वास्थ्य सुरक्षालाई उच्च प्राथमिकता दिन्छौं।'
                  : 'Om Sai Aadarsha Clinic is dedicated to compassionate, accessible and high-standard outpatient care and laboratory diagnostics. We prioritise patient dignity, data privacy and clinical transparency.'}
              </p>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <HeartHandshake className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">
                      {locale === 'ne' ? 'बिरामी-केन्द्रित सेवा' : 'Patient-centred care'}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {locale === 'ne'
                        ? 'प्रत्येक बिरामीको व्यक्तिगत आवश्यकता र सुरक्षालाई ध्यानमा राखी सेवा प्रदान गर्दछौं।'
                        : 'Individualised attention that respects patient time, autonomy and comfort.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">
                      {locale === 'ne' ? 'सुरक्षित तथा गोप्य डेटा' : 'Strict data privacy'}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {locale === 'ne'
                        ? 'डिजिटल ल्याब रिपोर्ट र स्वास्थ्य विवरणहरू उच्च स्तरको प्रमाणीकरणद्वारा सुरक्षित राखिन्छ।'
                        : 'Authenticated report delivery, server-side access control and strict privacy norms.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-brand-950 p-7 text-white sm:p-9">
              <div className="pointer-events-none absolute inset-0 bg-grid-light opacity-25" />
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-600/30 blur-3xl" />
              <div className="relative">
                <Sparkles className="h-5 w-5 text-sand-300" />
                <p className="mt-5 font-display text-xl font-semibold tracking-tight">
                  {locale === 'ne' ? 'एकै छानामुनि' : 'Under one roof'}
                </p>
                <ul className="mt-5 space-y-4 text-xs text-brand-100/80">
                  <li className="flex items-start gap-2.5">
                    <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-sand-300" />
                    {locale === 'ne'
                      ? 'विशेषज्ञ ओपीडी परामर्श'
                      : 'Specialist outpatient consultations'}
                  </li>
                  <li className="flex items-start gap-2.5">
                    <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-sand-300" />
                    {locale === 'ne'
                      ? 'कम्प्युटराइज्ड ल्याब डायग्नोस्टिक्स'
                      : 'Computerised laboratory diagnostics'}
                  </li>
                  <li className="flex items-start gap-2.5">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sand-300" />
                    {locale === 'ne'
                      ? 'सुरक्षित डिजिटल रिपोर्ट पहुँच'
                      : 'Secure digital report access'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="card p-7 sm:p-9">
          <span className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            {locale === 'ne' ? 'क्लिनिक विवरण' : 'Clinic details'}
          </span>
          <h2 className="display-title mt-3 text-2xl">
            {locale === 'ne' ? 'सम्पर्क तथा सञ्चालन' : 'Contact & operations'}
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-brand-950/8 bg-cream p-5">
              <MapPin className="h-4 w-4 text-brand-600" />
              <h3 className="mt-3 text-sm font-semibold text-ink">
                {locale === 'ne' ? 'क्लिनिक ठेगाना' : 'Physical location'}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {locale === 'ne'
                  ? addressNe || addressEn || 'ठेगाना क्लिनिकद्वारा पुष्टि हुने'
                  : addressEn || 'Address confirmed by clinic'}
              </p>
            </div>

            <div className="rounded-2xl border border-brand-950/8 bg-cream p-5">
              <Clock className="h-4 w-4 text-brand-600" />
              <h3 className="mt-3 text-sm font-semibold text-ink">
                {locale === 'ne' ? 'परामर्श तथा ल्याब समय' : 'Consultation & lab hours'}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{openingHours}</p>
            </div>

            <div className="rounded-2xl border border-brand-950/8 bg-cream p-5">
              <Phone className="h-4 w-4 text-brand-600" />
              <h3 className="mt-3 text-sm font-semibold text-ink">
                {locale === 'ne' ? 'टेलिफोन सम्पर्क' : 'Telephone'}
              </h3>
              <p className="mt-1 font-mono text-xs text-slate-600">
                {phone || (locale === 'ne' ? 'रिसेप्सनमा सम्पर्क गर्नुहोस्' : 'Contact reception in person')}
              </p>
              {emergencyPhone && (
                <p className="mt-1 text-xs font-semibold text-rose-700">
                  {locale === 'ne' ? 'आपतकालीन: ' : 'Emergency: '}
                  {emergencyPhone}
                </p>
              )}
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-brand-950 p-5 text-white">
              <div className="pointer-events-none absolute inset-0 bg-grid-light opacity-20" />
              <div className="relative">
                <Facebook className="h-4 w-4 text-[#8ab4f8]" />
                <h3 className="mt-3 text-sm font-semibold">
                  {locale === 'ne' ? 'आधिकारिक फेसबुक' : 'Official Facebook'}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-brand-100/70">
                  {locale === 'ne'
                    ? 'क्लिनिकको नियमित सूचना, क्याम्प र स्वास्थ्य सन्देशहरू।'
                    : 'Health camps, schedules and clinic announcements.'}
                </p>
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-sand-300 hover:underline"
                  >
                    {locale === 'ne' ? 'पेज खोल्नुहोस्' : 'Visit the page'}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Official Clinic Notice / Flyer */}
        <section className="card overflow-hidden">
          <div className="grid items-center md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4 p-7 sm:p-9">
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                {locale === 'ne' ? 'आधिकारिक सूचना तथा विशेषज्ञ टोली' : 'Official Clinic Board & Notice'}
              </span>
              <h2 className="display-title text-2xl sm:text-3xl">
                {locale === 'ne' ? 'प्रमाणित विशेषज्ञ चिकित्सकहरूको समूह' : 'Specialist Physicians & Services'}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                {locale === 'ne'
                  ? 'ॐ साई आदर्श क्लिनिक, शहिद मार्ग, विरेन्द्र सभागृह अगाडि विराटनगरमा नेपाल मेडिकल काउन्सिल (एनएमसी) प्रमाणित वरिष्ठ प्राध्यापक, कन्सल्टेन्ट कार्डियोलोजिष्ट, बालरोग, स्त्रीरोग तथा हाडजोर्नी विशेषज्ञहरूद्वारा नियमित ओपीडी तथा आकस्मिक परामर्श सेवा प्रदान गरिन्छ।'
                  : 'Located at Shahid Marg, in front of Birendra Sabhagriha, Biratnagar, Om Sai Aadarsha Clinic features eminent NMC-registered professors, cardiologists, pediatricians, gynecologists, and surgeons dedicated to reliable outpatient care.'}
              </p>

              <div className="space-y-2.5 border-t border-brand-950/8 pt-4">
                <h4 className="text-[0.6875rem] font-semibold uppercase tracking-wider text-slate-500">
                  {locale === 'ne' ? 'प्रत्यक्ष सम्पर्क व्यक्तिहरू (विराटनगर):' : 'Direct Contact Personnel (Biratnagar):'}
                </h4>
                <div className="grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-brand-700" />
                    <span>
                      {locale === 'ne' ? 'भोला प्रसाद दास: ' : 'Bhola Prasad Das: '}
                      <span className="font-mono text-ink">9807358874</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-brand-700" />
                    <span>
                      {locale === 'ne' ? 'दिलशाद अन्सारी: ' : 'Dilshad Ansari: '}
                      <span className="font-mono text-ink">9810581421</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium sm:col-span-2">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-brand-700" />
                    <span>
                      {locale === 'ne' ? 'धर्मलाल चन्द्रवंशी: ' : 'Dharamlal Chandravanshi: '}
                      <span className="font-mono text-ink">9807073278</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center border-t border-brand-950/8 bg-brand-50 p-6 sm:p-8 md:border-l md:border-t-0">
              <div className="group relative max-w-xs overflow-hidden rounded-2xl border-2 border-white shadow-md">
                <img
                  src="/images/fb_profile.jpg"
                  alt={locale === 'ne' ? 'ॐ साई आदर्श क्लिनिक आधिकारिक सूचना' : 'Om Sai Aadarsha Clinic Official Flyer'}
                  className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
