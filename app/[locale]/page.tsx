import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getMessages, Locale } from '@/lib/i18n';
import {
  Calendar,
  Stethoscope,
  FlaskConical,
  Clock,
  ShieldCheck,
  ArrowRight,
  Info,
  MapPin,
  Phone,
  User,
  HeartPulse,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  FileText,
} from 'lucide-react';
import { HomeFaqAccordion } from '@/components/public/HomeFaqAccordion';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const messages = getMessages(locale);
  const common = messages.common;
  const nav = messages.nav;
  const booking = messages.booking;

  // Query published records from DB
  const publishedDoctors = db.getDoctors(true);
  const featuredDoctors = publishedDoctors.filter((d) => d.isFeatured);
  const doctorsToShow = (featuredDoctors.length > 0 ? featuredDoctors : publishedDoctors).slice(0, 3);

  const publishedServices = db.getMedicalServices(true);
  const featuredServices = publishedServices.filter((s) => s.isFeatured);
  const servicesToShow = (featuredServices.length > 0 ? featuredServices : publishedServices).slice(0, 3);

  const publishedLabTests = db.getLabTests(true);
  const featuredLabTests = publishedLabTests.filter((t) => t.isFeatured);
  const labTestsToShow = (featuredLabTests.length > 0 ? featuredLabTests : publishedLabTests).slice(0, 4);

  const publishedArticles = db.getArticles(true).slice(0, 3);

  // Settings
  const clinicName =
    locale === 'ne'
      ? db.getSetting('clinic_name_ne') || 'ॐ साई आदर्श क्लिनिक'
      : db.getSetting('clinic_name') || 'Om Sai Aadarsha Clinic';

  const tagline =
    locale === 'ne'
      ? db.getSetting('tagline_ne') || 'सहृदयी स्वास्थ्य सेवा, भरपर्दो ल्याब परीक्षण र विशेषज्ञ परामर्श'
      : db.getSetting('tagline_en') || 'Compassionate Care, Reliable Lab Diagnostics & Expert Consultations';

  const address =
    locale === 'ne'
      ? db.getSetting('address_ne') || db.getSetting('address_en')
      : db.getSetting('address_en');

  const phone = db.getSetting('phone') || '+977 9800000000';
  const emergencyPhone = db.getSetting('emergency_phone') || phone;
  const facebookUrl =
    db.getSetting('facebook_url') || 'https://www.facebook.com/p/Om-Sai-Aadarsha-Clinic-100084050983392/';

  const openingHours =
    locale === 'ne'
      ? db.getSetting('opening_hours_ne') || 'आइतबार – शुक्रबार: बिहान ०७:०० – साँझ ०८:०० (शनिबार बन्द)'
      : db.getSetting('opening_hours_en') || 'Sunday – Friday: 07:00 AM – 08:00 PM (Saturday Closed)';

  // Curated FAQ preview items
  const homeFaqs = [
    {
      q: locale === 'ne' ? 'अनलाइन बुकिङ कसरी काम गर्छ?' : 'How does the online booking request work?',
      a:
        locale === 'ne'
          ? 'तपाईंले वेबसाइटबाट आफ्नो इच्छित चिकित्सक वा ल्याब परीक्षणको लागि समय अनुरोध पेश गर्नुहुन्छ। क्लिनिक रिसेप्सनले समयतालिका जाँच गरी बुकिङ स्वीकृत वा नयाँ समय प्रस्ताव गर्दछ।'
          : 'Submitting a form creates a booking request. Clinic reception reviews the slot availability against doctor schedules and confirms it or proposes an alternative time.',
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
  ];

  return (
    <div className="flex flex-col bg-white text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* 1. HERO SECTION: Refined, Light, Dignified Clinical Presence */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-teal-50/40 via-white to-slate-50/50 py-16 lg:py-24">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-teal-100/40 blur-3xl" />
        <div className="absolute bottom-0 left-10 -z-10 h-72 w-72 rounded-full bg-emerald-50/60 blur-2xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Clinical Mission & Patient Action */}
            <div className="lg:col-span-7 space-y-6">
              {/* Quiet brand kicker without pills */}
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-800">
                <span>{clinicName}</span>
                <span aria-hidden="true" className="text-teal-400">·</span>
                <span>{locale === 'ne' ? 'आउटडोर क्लिनिक तथा डायग्नोस्टिक्स' : 'Outpatient & Diagnostics'}</span>
              </div>

              {/* Editorial Display Headline */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-950 leading-[1.12] text-balance">
                {tagline}
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                {locale === 'ne'
                  ? 'हामी बिरामीहरूको सुविधाको लागि अनलाइन अनुरोधमा आधारित विशेषज्ञ परामर्श, गुणस्तरीय ल्याब परीक्षण र गोप्य रिपोर्ट पहुँच उपलब्ध गराउँछौं।'
                  : 'Providing compassionate outpatient medicine, qualified specialist consultations, and authenticated digital lab report access for patients and families.'}
              </p>

              {/* Informative Request-to-Confirmation Notice (Section 2 & 7) */}
              <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4 text-xs sm:text-sm text-teal-950 flex items-start gap-3 shadow-xs">
                <Info className="h-5 w-5 text-teal-800 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="font-semibold">{locale === 'ne' ? 'सूचना: ' : 'Booking Notice: '}</strong>
                  {booking.requestNotice}
                </p>
              </div>

              {/* Primary Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  href={`/${locale}/book`}
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-semibold px-6 py-3.5 shadow-sm transition-all active:scale-[0.98] focus-visible:outline-teal-900"
                >
                  <Calendar className="h-5 w-5" />
                  <span>{common.bookSession}</span>
                </Link>

                <Link
                  href={`/${locale}/doctors`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-5 py-3.5 transition-colors focus-visible:outline-slate-900"
                >
                  <Stethoscope className="h-5 w-5 text-teal-700" />
                  <span>{nav.doctors}</span>
                </Link>

                <Link
                  href={`/${locale}/portal/login`}
                  className="inline-flex items-center gap-1.5 px-3 py-3 text-xs font-semibold text-slate-600 hover:text-teal-900 transition-colors"
                >
                  <User className="h-4 w-4 text-teal-700" />
                  <span>{common.myAccount}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Proof Row: Clean unboxed metadata with separators */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-700" />
                  <span>{locale === 'ne' ? 'दर्ता भएका विशेषज्ञ चिकित्सकहरू' : 'NMC Registered Specialists'}</span>
                </div>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-700" />
                  <span>{locale === 'ne' ? 'कम्प्युटराइज्ड ल्याब डायग्नोस्टिक्स' : 'Automated Lab Pathology'}</span>
                </div>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-700" />
                  <span>{locale === 'ne' ? 'प्रमाणीकृत डिजिटल रिपोर्ट' : 'Authenticated Digital Reports'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Clinic Care & Triage Hub */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6">
                {/* Card Header: Operational Status & Opening Hours */}
                <div className="space-y-1.5 pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-teal-800">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-teal-700" />
                      {locale === 'ne' ? 'क्लिनिक खुल्ने समय' : 'Clinic Hours & Reception'}
                    </span>
                    <span className="text-slate-500 font-normal">
                      {locale === 'ne' ? 'काउन्टर खुल्ला' : 'Walk-in & OPD'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{openingHours}</p>
                </div>

                {/* 1-Click Triage Fast Track */}
                <div className="space-y-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                    {locale === 'ne' ? 'द्रुत सेवा छनोट' : 'Quick Service Selector'}
                  </span>

                  <Link
                    href={`/${locale}/doctors`}
                    className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 bg-slate-50/60 hover:bg-teal-50/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-teal-100/70 text-teal-800 flex items-center justify-center">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-teal-900">
                          {locale === 'ne' ? 'विशेषज्ञ चिकित्सक परामर्श' : 'Doctor Consultations'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {locale === 'ne' ? 'बालरोग, फिजिसियन, स्त्रीरोग तथा हाडजोर्नी' : 'Pediatrics, Physician, Gynecology & Orthopedics'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-teal-800 group-hover:translate-x-0.5 transition-all" />
                  </Link>

                  <Link
                    href={`/${locale}/lab-tests`}
                    className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 bg-slate-50/60 hover:bg-teal-50/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-teal-100/70 text-teal-800 flex items-center justify-center">
                        <FlaskConical className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-teal-900">
                          {locale === 'ne' ? 'प्रयोगशाला तथा रगत परीक्षण' : 'Pathology & Lab Diagnostics'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {locale === 'ne' ? 'बायोकेमिस्ट्री, हेमाटोलोजी, थाइराइड तथा लिपिड' : 'Biochemistry, CBC, Thyroid, Lipid & Profiles'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-teal-800 group-hover:translate-x-0.5 transition-all" />
                  </Link>

                  <Link
                    href={`/${locale}/services`}
                    className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 bg-slate-50/60 hover:bg-teal-50/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-teal-100/70 text-teal-800 flex items-center justify-center">
                        <HeartPulse className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-teal-900">
                          {locale === 'ne' ? 'आउटडोर तथा सामान्य उपचार सेवा' : 'Outpatient Clinical Procedures'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {locale === 'ne' ? 'इसिजी, घाउ ड्रेसिङ, नेबुलाइजेसन तथा नर्सिङ' : 'ECG, wound care, nebulization & nursing support'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-teal-800 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </div>

                {/* Patient Claim Code Help Strip */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-teal-700" />
                    <span>{locale === 'ne' ? 'काउन्टरमा परीक्षण गराउनुभएको छ?' : 'Visited our clinic counter?'}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {locale === 'ne'
                      ? 'रिसेप्सनबाट प्राप्त ७-दिने दाबी कोड प्रयोग गरी आफ्नो रिपोर्ट अनलाइन हेर्नुहोस्।'
                      : 'Use your 7-day walk-in claim code from reception to link and view your lab reports.'}
                  </p>
                  <Link
                    href={`/${locale}/portal/login`}
                    className="inline-block text-[11px] font-bold text-teal-800 hover:underline pt-0.5"
                  >
                    {locale === 'ne' ? 'दाबी कोड प्रविष्ट गर्नुहोस् →' : 'Enter Claim Code in Portal →'}
                  </Link>
                </div>

                {/* Telephone Inquiry */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{locale === 'ne' ? 'सिधा फोन सम्पर्क:' : 'Reception Desk:'}</span>
                  <a
                    href={`tel:${phone}`}
                    className="font-bold text-slate-900 hover:text-teal-800 flex items-center gap-1 font-mono"
                  >
                    <Phone className="h-3.5 w-3.5 text-teal-700" />
                    <span>{phone}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE PILLARS QUICK LINKS (Section 5 requirement) */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200/80 p-6 space-y-3 hover:border-teal-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  {locale === 'ne' ? '०१. विशेषज्ञ चिकित्सक परामर्श' : '01. Specialist Consultations'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {locale === 'ne'
                  ? 'नेपाल मेडिकल काउन्सिल (NMC) प्रमाणित विशेषज्ञ चिकित्सकहरूद्वारा विभिन्न रोगहरूको सघन स्वास्थ्य परीक्षण।'
                  : 'NMC registered doctors covering Internal Medicine, Pediatrics, Obstetrics & Gynecology, and Orthopedics.'}
              </p>
              <Link
                href={`/${locale}/doctors`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:underline pt-1"
              >
                <span>{locale === 'ne' ? 'चिकित्सक सूची हेर्नुहोस्' : 'Browse Medical Specialists'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200/80 p-6 space-y-3 hover:border-teal-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  {locale === 'ne' ? '०२. अत्याधुनिक ल्याब परीक्षण' : '02. Laboratory Diagnostics'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {locale === 'ne'
                  ? 'कम्प्युटराइज्ड उपकरणबाट रगत, पिसाब तथा बायोकेमिकल परीक्षण। आधिकारिक ल्याब प्राविधिकद्वारा प्रमाणीकरण।'
                  : 'Computerized clinical pathology, blood biochemistry, hormone panels, and routine wellness screenings.'}
              </p>
              <Link
                href={`/${locale}/lab-tests`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:underline pt-1"
              >
                <span>{locale === 'ne' ? 'ल्याब क्याटलग हेर्नुहोस्' : 'View Full Lab Catalogue'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200/80 p-6 space-y-3 hover:border-teal-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  {locale === 'ne' ? '०३. आउटडोर क्लिनिकल सेवा' : '03. Outpatient Care & OPD'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {locale === 'ne'
                  ? 'प्राथमिक स्वास्थ्य जाँच, ड्रेसिङ, नेबुलाइजेसन, नियमित रक्तचाप तथा सुगर निगरानी सेवा।'
                  : 'Outpatient general health consultations, wound dressings, ECG screenings, nebulization, and vitals monitoring.'}
              </p>
              <Link
                href={`/${locale}/services`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:underline pt-1"
              >
                <span>{locale === 'ne' ? 'सेवाहरू अवलोकन गर्नुहोस्' : 'Explore Clinical Services'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED DOCTORS SECTION */}
      {doctorsToShow.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                {locale === 'ne' ? 'हाम्रा विशेषज्ञहरू' : 'Medical Staff'}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950">
                {locale === 'ne' ? 'विशेषज्ञ चिकित्सक टोली' : 'Featured Clinical Specialists'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                {locale === 'ne'
                  ? 'नेपाल मेडिकल काउन्सिलमा दर्ता भएका अनुभवी चिकित्सकहरूबाट स्वास्थ्य परामर्श लिनुहोस्।'
                  : 'Consult verified, board-certified physicians dedicated to clinical excellence and personalized patient care.'}
              </p>
            </div>
            <Link
              href={`/${locale}/doctors`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:underline"
            >
              <span>{locale === 'ne' ? 'सबै चिकित्सकहरू हेर्नुहोस्' : 'View All Specialists'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctorsToShow.map((doc) => {
              const name = locale === 'ne' && doc.nameNe ? doc.nameNe : doc.nameEn;
              const specialty = locale === 'ne' && doc.specialtyNe ? doc.specialtyNe : doc.specialtyEn;
              const isMissingNepali = locale === 'ne' && (!doc.nameNe || !doc.specialtyNe);

              return (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-teal-300 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg shrink-0">
                        <Stethoscope className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-slate-900 truncate">{name}</h3>
                        <p className="text-xs text-teal-800 font-semibold">{specialty}</p>
                        {doc.qualificationsEn && (
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {locale === 'ne' && doc.qualificationsNe ? doc.qualificationsNe : doc.qualificationsEn}
                          </p>
                        )}
                      </div>
                    </div>

                    {isMissingNepali && (
                      <p className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        {common.nepaliMissingNote}
                      </p>
                    )}

                    {doc.bioEn && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {locale === 'ne' && doc.bioNe ? doc.bioNe : doc.bioEn}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">
                        {locale === 'ne' ? 'परामर्श शुल्क' : 'Consultation Fee'}
                      </span>
                      <span className="font-bold text-slate-900 font-mono">
                        NPR {doc.consultationFee}
                      </span>
                    </div>

                    <Link
                      href={`/${locale}/doctors/${doc.slug}`}
                      className="inline-flex items-center gap-1 font-bold text-teal-800 hover:underline"
                    >
                      <span>{locale === 'ne' ? 'समयतालिका' : 'Profile & Slots'}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. FEATURED MEDICAL SERVICES (Section 5 requirement) */}
      {servicesToShow.length > 0 && (
        <section className="py-16 bg-slate-50/70 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                  {locale === 'ne' ? 'क्लिनिकल सेवाहरू' : 'Outpatient Healthcare'}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950">
                  {locale === 'ne' ? 'हाम्रा प्रमुख स्वास्थ्य सेवाहरू' : 'Featured Medical Services'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                  {locale === 'ne'
                    ? 'दैनिक प्राथमिक उपचार, बालबालिकाको स्वास्थ्य जाँच, र नियमित स्वास्थ्य निगरानी।'
                    : 'From preventive family medicine to routine pediatric OPD and specialized clinical care.'}
                </p>
              </div>
              <Link
                href={`/${locale}/services`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:underline"
              >
                <span>{locale === 'ne' ? 'सबै सेवाहरू हेर्नुहोस्' : 'View All Medical Services'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {servicesToShow.map((svc) => {
                const title = locale === 'ne' && svc.nameNe ? svc.nameNe : svc.nameEn;
                const desc = locale === 'ne' && svc.descriptionNe ? svc.descriptionNe : svc.descriptionEn;
                const isMissingNe = locale === 'ne' && !svc.nameNe;

                return (
                  <div
                    key={svc.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
                          <HeartPulse className="h-5 w-5" />
                        </div>
                        <span className="text-xs text-slate-500 font-medium capitalize">
                          {svc.bookingMode === 'request'
                            ? (locale === 'ne' ? 'अनुरोधमा उपलब्ध' : 'Online Request')
                            : (locale === 'ne' ? 'काउन्टर परामर्श' : 'Counter Walk-in')}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900">{title}</h3>

                      {isMissingNe && (
                        <p className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          {common.nepaliMissingNote}
                        </p>
                      )}

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">
                          {locale === 'ne' ? 'सेवा शुल्क' : 'Service Fee'}
                        </span>
                        <span className="font-bold text-slate-900 font-mono">
                          {svc.fee !== null ? `NPR ${svc.fee}` : (locale === 'ne' ? 'काउन्टरमा पुष्टि हुने' : 'Confirmed at counter')}
                        </span>
                      </div>

                      <Link
                        href={`/${locale}/book?service=${svc.id}`}
                        className="inline-flex items-center gap-1 font-bold text-teal-800 hover:underline"
                      >
                        <span>{locale === 'ne' ? 'अनुरोध गर्नुहोस्' : 'Request Service'}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. FEATURED LAB DIAGNOSTIC TESTS (Section 5 requirement) */}
      {labTestsToShow.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                {locale === 'ne' ? 'डायग्नोस्टिक ल्याब' : 'Pathology Diagnostics'}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950">
                {locale === 'ne' ? 'प्रमुख प्रयोगशाला परीक्षणहरू' : 'Laboratory Diagnostic Tests'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                {locale === 'ne'
                  ? 'सटीक परिणाम, सुरक्षित नमुना संकलन र बिरामी पोर्टलमा तत्काल डिजिटल रिपोर्ट उपलब्धता।'
                  : 'Precise automated test results, prompt sample processing, and private online PDF report delivery.'}
              </p>
            </div>
            <Link
              href={`/${locale}/lab-tests`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:underline"
            >
              <span>{locale === 'ne' ? 'सबै परीक्षणहरू हेर्नुहोस्' : 'View Full Lab Catalogue'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {labTestsToShow.map((test) => {
              const testName = locale === 'ne' && test.nameNe ? test.nameNe : test.nameEn;
              const isMissingNe = locale === 'ne' && !test.nameNe;

              return (
                <div
                  key={test.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
                        <FlaskConical className="h-4 w-4" />
                      </div>
                      {test.isHomeCollectionAvailable && (
                        <span className="text-[11px] text-teal-800 font-semibold">
                          {locale === 'ne' ? 'घरमै संकलन' : 'Home Sample'}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-snug">{testName}</h4>

                    {isMissingNe && (
                      <p className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded">
                        {common.nepaliMissingNote}
                      </p>
                    )}

                    {(locale === 'ne' ? test.sampleTypeNe || test.sampleTypeEn : test.sampleTypeEn) && (
                      <p className="text-[11px] text-slate-500">
                        {locale === 'ne' ? 'नमुना: ' : 'Sample: '}
                        <span className="font-medium text-slate-700">
                          {locale === 'ne' ? test.sampleTypeNe || test.sampleTypeEn : test.sampleTypeEn}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">
                        {locale === 'ne' ? 'परीक्षण शुल्क' : 'Price'}
                      </span>
                      <span className="font-bold text-slate-900 font-mono">
                        {test.price !== null ? `NPR ${test.price}` : (locale === 'ne' ? 'पुष्टि हुने' : 'Confirmed')}
                      </span>
                    </div>

                    <Link
                      href={`/${locale}/lab-tests/${test.slug}`}
                      className="font-bold text-teal-800 hover:underline flex items-center gap-1"
                    >
                      <span>{locale === 'ne' ? 'विवरण' : 'Details'}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. PATIENT HEALTH GUIDANCE / LATEST ARTICLES (Section 5 requirement) */}
      {publishedArticles.length > 0 && (
        <section className="py-16 bg-slate-50/70 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                  {locale === 'ne' ? 'स्वास्थ्य सचेतना' : 'Clinical Health Guidance'}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950">
                  {locale === 'ne' ? 'नयाँ स्वास्थ्य लेख तथा सुझावहरू' : 'Verified Health Articles'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                  {locale === 'ne'
                    ? 'क्लिनिकका चिकित्सकहरूद्वारा प्रमाणित स्वास्थ्य सल्लाह र रोग रोकथामका व्यावहारिक उपायहरू।'
                    : 'Evidence-based insights, preventive wellness guidelines, and medical advice reviewed by our staff.'}
                </p>
              </div>
              <Link
                href={`/${locale}/explore/health-info`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:underline"
              >
                <span>{locale === 'ne' ? 'सबै लेखहरू हेर्नुहोस्' : 'Explore All Articles'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {publishedArticles.map((article) => {
                const title = locale === 'ne' && article.titleNe ? article.titleNe : article.titleEn;
                const excerpt = locale === 'ne' && article.excerptNe ? article.excerptNe : article.excerptEn;

                return (
                  <div
                    key={article.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <BookOpen className="h-4 w-4 text-teal-700" />
                        <span>{article.category || 'General Health'}</span>
                        <span aria-hidden="true">·</span>
                        <span>{article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'Recent'}</span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-2">
                        {title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {excerpt}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {locale === 'ne' ? 'चिकित्सकद्वारा प्रमाणित' : 'Clinically Reviewed'}
                      </span>
                      <Link
                        href={`/${locale}/explore/health-info/${article.slug}`}
                        className="font-bold text-teal-800 hover:underline flex items-center gap-1"
                      >
                        <span>{locale === 'ne' ? 'पूरा पढ्नुहोस्' : 'Read Article'}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. FREQUENTLY ASKED QUESTIONS PREVIEW (Section 5 requirement) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            {locale === 'ne' ? 'प्रायः सोधिने प्रश्नहरू' : 'Patient Inquiries & FAQ'}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950">
            {locale === 'ne' ? 'क्लिनिक सेवा सम्बन्धी जानकारी' : 'Everything You Need to Know'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            {locale === 'ne'
              ? 'अपोइन्टमेन्ट अनुरोध, ल्याब रिपोर्ट र क्लिनिक प्रक्रिया सम्बन्धी मुख्य प्रश्नहरूको स्पष्ट जवाफ।'
              : 'Clear answers on requesting consultations, receiving authenticated lab reports, and payment policies.'}
          </p>
        </div>

        <HomeFaqAccordion faqs={homeFaqs} />

        <div className="mt-8 text-center">
          <Link
            href={`/${locale}/explore/faq`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:underline"
          >
            <span>{locale === 'ne' ? 'थप प्रायः सोधिने प्रश्नहरू हेर्नुहोस्' : 'View Full Frequently Asked Questions'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* 8. PHYSICAL CLINIC LOCATION, HOURS & OFFICIAL FACEBOOK HUB */}
      <section className="py-16 bg-slate-50/80 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              {locale === 'ne' ? 'क्लिनिक उपस्थिति' : 'Physical Location & Connect'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950">
              {locale === 'ne' ? 'क्लिनिक सम्पर्क तथा सामाजिक उपस्थिति' : 'Visit Us or Connect Directly'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1: Location */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                {locale === 'ne' ? 'क्लिनिक स्थान' : 'Physical Address'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {address || (locale === 'ne' ? 'ठेगाना क्लिनिकद्वारा पुष्टि हुने' : 'Location confirmed by clinic')}
              </p>
            </div>

            {/* 2: Operating Hours */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                {locale === 'ne' ? 'खुल्ने समय' : 'Clinical Operating Hours'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {openingHours}
              </p>
            </div>

            {/* 3: Telephone Inquiries */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
                <Phone className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                {locale === 'ne' ? 'सम्पर्क तथा रिसेप्सन' : 'Telephone & Emergency'}
              </h4>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">{locale === 'ne' ? 'रिसेप्सन:' : 'Main Line:'}</p>
                <a
                  href={`tel:${phone}`}
                  className="block text-xs font-bold text-slate-900 hover:text-teal-800 font-mono"
                >
                  {phone}
                </a>
                {emergencyPhone && emergencyPhone !== phone && (
                  <>
                    <p className="text-xs text-slate-500 pt-1">{locale === 'ne' ? 'आपतकालीन:' : 'Emergency:'}</p>
                    <a
                      href={`tel:${emergencyPhone}`}
                      className="block text-xs font-bold text-rose-700 hover:underline font-mono"
                    >
                      {emergencyPhone}
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* 4: Official Facebook Community */}
            <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-6 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {locale === 'ne' ? 'आधिकारिक फेसबुक' : 'Official Facebook Page'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {locale === 'ne'
                      ? 'दैनिक स्वास्थ्य सूचना, ओपिडी तालिका तथा शिविरहरूको जानकारीको लागि हामीसँग जोडिनुहोस्।'
                      : 'Follow our official page for doctor rotation schedules, public health camps, and announcements.'}
                  </p>
                </div>
              </div>

              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline"
                >
                  <span>{locale === 'ne' ? 'फेसबुक पेज खोल्नुहोस्' : 'Visit Official Facebook'}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
