import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getMessages, Locale } from '@/lib/i18n';
import { uniqueBy, isDemoPlaceholderName } from '@/lib/utils';
import {
  Calendar,
  Stethoscope,
  FlaskConical,
  Clock,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Info,
  MapPin,
  Phone,
  HeartPulse,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  Facebook,
  Microscope,
  Users,
  Sparkles,
  ClipboardCheck,
} from 'lucide-react';
import { HomeFaqAccordion } from '@/components/public/HomeFaqAccordion';
import SectionHeading from '@/components/public/SectionHeading';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

function initialsOf(name: string) {
  return name
    .replace(/^(dr\.?|prof\.?)\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default async function HomePage({ params }: HomePageProps) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || 'en') as Locale;
  const messages = getMessages(locale);
  const common = messages.common;
  const nav = messages.nav;
  const booking = messages.booking;

  // Published catalogue (de-duplicated: automated seed runs can leave copies behind)
  const publishedDoctors = uniqueBy(db.getDoctors(true), (d) => d.nameEn).filter(
    (d) => !isDemoPlaceholderName(d.nameEn)
  );
  const featuredDoctors = publishedDoctors.filter((d) => d.isFeatured);
  const doctorsToShow = (featuredDoctors.length > 0 ? featuredDoctors : publishedDoctors).slice(0, 3);

  const publishedServices = uniqueBy(db.getMedicalServices(true), (s) => s.nameEn);
  const featuredServices = publishedServices.filter((s) => s.isFeatured);
  const servicesToShow = (featuredServices.length > 0 ? featuredServices : publishedServices).slice(0, 3);

  const publishedLabTests = uniqueBy(db.getLabTests(true), (t) => t.nameEn);
  const featuredLabTests = publishedLabTests.filter((t) => t.isFeatured);
  const labTestsToShow = (featuredLabTests.length > 0 ? featuredLabTests : publishedLabTests).slice(0, 4);

  const publishedArticles = uniqueBy(db.getArticles(true), (a) => a.titleEn).slice(0, 3);

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

  const trustStats = [
    { value: locale === 'ne' ? 'एनएमसी' : 'NMC', label: locale === 'ne' ? 'दर्ता चिकित्सक' : 'Registered doctors', icon: ShieldCheck },
    { value: locale === 'ne' ? '६ दिन' : '6 days', label: locale === 'ne' ? 'साप्ताहिक खुला' : 'Open every week', icon: Clock },
    { value: locale === 'ne' ? 'डिजिटल' : 'Digital', label: locale === 'ne' ? 'सुरक्षित रिपोर्ट' : 'Secure lab reports', icon: FileText },
    { value: locale === 'ne' ? 'परिवार' : 'Family', label: locale === 'ne' ? '६ सम्म प्रोफाइल' : 'Up to 6 profiles', icon: Users },
  ];

  return (
    <div className="flex flex-col bg-cream text-ink">
      {/* 1. HERO — deep evergreen, editorial headline, live clinic card */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid-light opacity-25" />
        <div className="pointer-events-none absolute -right-24 -top-40 h-[34rem] w-[34rem] rounded-full bg-brand-600/25 blur-[110px]" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-sand-500/10 blur-[100px]" />

        <div className="container-x relative grid gap-10 py-10 sm:gap-12 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:py-20">
          {/* Copy */}
          <div className="animate-fade-up">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[0.6875rem] font-medium text-brand-100/90 backdrop-blur-xs">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sand-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sand-400" />
                </span>
                {locale === 'ne' ? 'ओपीडी तथा डायग्नोस्टिक्स' : 'Outpatient & Diagnostics'}
                <span className="text-white/20">·</span>
                <span className="text-sand-300 font-semibold">{clinicName}</span>
              </span>

              {emergencyPhone && (
                <a
                  href={`tel:${emergencyPhone}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-950/40 px-3 py-1.5 text-[0.6875rem] font-semibold text-rose-200 transition-colors hover:bg-rose-900/60"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-400" />
                  </span>
                  <span>{locale === 'ne' ? 'आपतकालीन: ' : 'Emergency: '}</span>
                  <span className="font-mono font-bold text-white">{emergencyPhone}</span>
                </a>
              )}
            </div>

            <h1 className="display-title mt-5 text-[2.1rem] leading-[1.1] text-white sm:text-5xl sm:mt-6 lg:text-[4rem] lg:leading-[1.12]">
              {locale === 'ne' ? (
                <>
                  सहृदयी सेवा,
                  <br />
                  <span className="text-sand-300">भरपर्दो उत्तर।</span>
                </>
              ) : (
                <>
                  Compassionate care,
                  <br />
                  <span className="text-sand-300">reliable answers.</span>
                </>
              )}
            </h1>

            <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-brand-100/80 sm:text-base">
              {locale === 'ne'
                ? 'विशेषज्ञ चिकित्सक परामर्श, सटीक ल्याब परीक्षण र सुरक्षित डिजिटल रिपोर्ट — तपाईं र तपाईंको परिवारको लागि एकै ठाउँमा।'
                : 'Expert doctor consultations, precise laboratory diagnostics and secure digital reports — all under one roof, for you and your family.'}
            </p>

            {/* Main Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={`/${locale}/book`} className="btn btn-accent group !py-3.5 !px-6 shadow-lg">
                <Calendar className="h-4 w-4" />
                <span>{common.bookSession}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href={`/${locale}/doctors`} className="btn btn-outline-light !py-3.5 !px-5">
                <Stethoscope className="h-4 w-4" />
                <span>{locale === 'ne' ? 'चिकित्सक हेर्नुहोस्' : 'Meet our doctors'}</span>
              </Link>
            </div>

            {/* Quick Navigation Dock */}
            <div className="mt-8 pt-2">
              <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-sand-400/80 mb-2.5">
                {locale === 'ne' ? 'द्रुत सेवाहरू' : 'Quick access'}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { href: `/${locale}/book`, icon: Calendar, label: locale === 'ne' ? 'अपोइन्टमेन्ट अनुरोध' : 'Book Appointment' },
                  { href: `/${locale}/lab-tests`, icon: FlaskConical, label: locale === 'ne' ? 'ल्याब परीक्षण सूची' : 'Lab Test Catalog' },
                  { href: `/${locale}/portal/login`, icon: FileText, label: locale === 'ne' ? 'डिजिटल रिपोर्ट' : 'Patient Reports' },
                  { href: `/${locale}/explore/faq`, icon: Info, label: locale === 'ne' ? 'बारम्बार सोधिने प्रश्न' : 'Clinic FAQ' },
                ].map((shortcut) => (
                  <Link
                    key={shortcut.href}
                    href={shortcut.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-brand-100/90 backdrop-blur-xs transition-all hover:border-sand-400/50 hover:bg-white/[0.1] hover:text-white"
                  >
                    <shortcut.icon className="h-3.5 w-3.5 text-sand-400" />
                    <span>{shortcut.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trust Highlights */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[0.75rem] font-medium text-brand-100/70 border-t border-white/10 pt-5">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-sand-300" />
                {locale === 'ne' ? 'एनएमसी दर्ता विशेषज्ञ' : 'NMC registered specialists'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-sand-300" />
                {locale === 'ne' ? 'कम्प्युटराइज्ड ल्याब' : 'Automated pathology'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-sand-300" />
                {locale === 'ne' ? 'प्रमाणीकृत रिपोर्ट' : 'Authenticated reports'}
              </span>
            </div>
          </div>

          {/* Visit card */}
          <div className="relative animate-fade-up delay-200 min-w-0 lg:pl-4">
            <div className="relative overflow-hidden rounded-[1.75rem] bg-white text-ink shadow-[0_35px_80px_-25px_rgba(0,0,0,0.5)] border border-brand-950/10 max-w-full">
              <div className="flex items-center justify-between border-b border-brand-950/8 bg-sand-50/80 px-6 py-4">
                <div>
                  <p className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-brand-700">
                    {locale === 'ne' ? 'आजको क्लिनिक' : 'Today at the clinic'}
                  </p>
                  <p className="mt-0.5 font-display text-lg font-semibold tracking-tight text-ink">
                    {locale === 'ne' ? 'तपाईंको भ्रमण योजना' : 'Plan your visit'}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[0.6875rem] font-bold text-brand-800 border border-brand-200/50">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                  </span>
                  {locale === 'ne' ? 'खुला छ' : 'Open Today'}
                </span>
              </div>

              <div className="px-6 py-5">
                <div className="flex items-start gap-2.5 rounded-xl bg-brand-50/60 p-3 text-xs text-slate-700">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                  <span className="font-medium leading-relaxed">{openingHours}</span>
                </div>

                <div className="mt-4 space-y-1">
                  {[
                    {
                      href: `/${locale}/doctors`,
                      icon: Stethoscope,
                      title: locale === 'ne' ? 'चिकित्सक परामर्श' : 'Doctor consultation',
                      sub:
                        locale === 'ne'
                          ? 'बालरोग, फिजिसियन, स्त्रीरोग, हाडजोर्नी'
                          : 'Pediatrics · Physician · Gynecology · Orthopedics',
                    },
                    {
                      href: `/${locale}/lab-tests`,
                      icon: FlaskConical,
                      title: locale === 'ne' ? 'ल्याब तथा रगत परीक्षण' : 'Lab & blood tests',
                      sub:
                        locale === 'ne'
                          ? 'बायोकेमिस्ट्री, हेमाटोलोजी, थाइराइड'
                          : 'Biochemistry · Hematology · Thyroid',
                    },
                    {
                      href: `/${locale}/portal/login`,
                      icon: FileText,
                      title: locale === 'ne' ? 'ल्याब रिपोर्ट हेर्नुहोस्' : 'View lab reports',
                      sub:
                        locale === 'ne'
                          ? 'सुरक्षित पोर्टलबाट डाउनलोड'
                          : 'Secure PDF downloads in your portal',
                    },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-brand-50/70"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-100">
                        <item.icon className="h-4.5 w-4.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.8125rem] font-semibold text-ink group-hover:text-brand-900">
                          {item.title}
                        </span>
                        <span className="block truncate text-[0.6875rem] text-slate-500">
                          {item.sub}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-700" />
                    </Link>
                  ))}
                </div>

                {/* Claim report callout */}
                <Link
                  href={`/${locale}/portal/login`}
                  className="mt-3 flex items-center justify-between rounded-xl border border-sand-200 bg-sand-50/70 px-3.5 py-2.5 transition-colors hover:bg-sand-100"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-sand-500 shrink-0" />
                    <span className="text-xs font-semibold text-brand-950">
                      {locale === 'ne' ? 'काउन्टर दाबी कोडले रिपोर्ट हेर्नुहोस्' : 'Have a walk-in claim code?'}
                    </span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>

                {/* Direct Reception dial */}
                <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-950 px-4 py-3 text-white">
                  <div>
                    <p className="text-[0.625rem] uppercase tracking-[0.14em] text-brand-200/70">
                      {locale === 'ne' ? 'रिसेप्सन सम्पर्क' : 'Direct Reception'}
                    </p>
                    <a href={`tel:${phone}`} className="mt-0.5 block font-mono text-sm font-semibold hover:text-sand-300 transition-colors">
                      {phone}
                    </a>
                  </div>
                  <a
                    href={`tel:${phone}`}
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-sand-300 transition-colors hover:bg-white/20"
                    aria-label={locale === 'ne' ? 'फोन गर्नुहोस्' : 'Call reception'}
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative border-t border-white/10">
          <div className="container-x grid grid-cols-2 divide-x divide-white/10 md:grid-cols-4">
            {trustStats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2.5 px-3 py-4 first:pl-0 sm:gap-3 sm:px-6 sm:py-5">
                <stat.icon className="h-4 w-4 shrink-0 text-sand-300 sm:h-5 sm:w-5" />
                <div>
                  <p className="font-display text-base font-semibold leading-none text-white sm:text-lg">{stat.value}</p>
                  <p className="mt-1 text-[0.5625rem] uppercase tracking-[0.1em] text-brand-100/60 sm:text-[0.625rem]">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. CARE PILLARS */}
      <section className="relative bg-cream py-16 sm:py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow={locale === 'ne' ? 'हामी कसरी सहयोग गर्छौं' : 'How we care'}
            title={locale === 'ne' ? 'एकै छानामुनि पूर्ण स्वास्थ्य सेवा' : 'One clinic, every step of care'}
            description={
              locale === 'ne'
                ? 'परामर्शदेखि ल्याब परीक्षण र रिपोर्टसम्म — सबै प्रक्रिया सरल, पारदर्शी र बिरामी-केन्द्रित।'
                : 'From your first consultation to the final lab report, every step is designed to be simple, transparent and centred on you.'
            }
            action={
              <Link href={`/${locale}/explore/about`} className="link-arrow">
                {locale === 'ne' ? 'क्लिनिकबारे जान्नुहोस्' : 'About the clinic'}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                n: '01',
                icon: Stethoscope,
                title: locale === 'ne' ? 'विशेषज्ञ परामर्श' : 'Specialist consultations',
                body:
                  locale === 'ne'
                    ? 'नेपाल मेडिकल काउन्सिलमा दर्ता भएका चिकित्सकहरूद्वारा आन्तरिक चिकित्सा, बालरोग, स्त्रीरोग तथा हाडजोर्नी परामर्श।'
                    : 'NMC-registered doctors covering internal medicine, pediatrics, gynecology and orthopedics.',
                href: `/${locale}/doctors`,
                cta: locale === 'ne' ? 'चिकित्सक सूची' : 'Browse specialists',
                featured: true,
              },
              {
                n: '02',
                icon: FlaskConical,
                title: locale === 'ne' ? 'ल्याब डायग्नोस्टिक्स' : 'Laboratory diagnostics',
                body:
                  locale === 'ne'
                    ? 'कम्प्युटराइज्ड उपकरणबाट रगत, पिसाब तथा बायोकेमिकल परीक्षण, प्रमाणित प्राविधिकद्वारा जाँच।'
                    : 'Computerized pathology and biochemistry, reviewed and verified by qualified lab technologists.',
                href: `/${locale}/lab-tests`,
                cta: locale === 'ne' ? 'परीक्षण सूची' : 'View lab catalogue',
              },
              {
                n: '03',
                icon: HeartPulse,
                title: locale === 'ne' ? 'ओपीडी तथा नर्सिङ' : 'Outpatient & nursing',
                body:
                  locale === 'ne'
                    ? 'प्राथमिक उपचार, घाउ ड्रेसिङ, इसिजी, नेबुलाइजेसन तथा नियमित रक्तचाप र सुगर निगरानी।'
                    : 'Primary care, wound dressing, ECG, nebulization and routine blood pressure and sugar monitoring.',
                href: `/${locale}/services`,
                cta: locale === 'ne' ? 'सेवाहरू हेर्नुहोस्' : 'Explore services',
              },
            ].map((pillar) => (
              <Link
                key={pillar.n}
                href={pillar.href}
                className={
                  pillar.featured
                    ? 'group relative overflow-hidden rounded-3xl bg-brand-900 p-7 text-white shadow-soft transition-transform duration-300 hover:-translate-y-1'
                    : 'group relative overflow-hidden rounded-3xl border border-brand-950/8 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft'
                }
              >
                {pillar.featured && <div className="absolute inset-0 bg-grid-light opacity-30" />}
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span
                      className={
                        pillar.featured
                          ? 'grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-sand-300'
                          : 'grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700'
                      }
                    >
                      <pillar.icon className="h-5 w-5" />
                    </span>
                    <span
                      className={
                        pillar.featured
                          ? 'font-display text-3xl font-semibold text-white/20'
                          : 'font-display text-3xl font-semibold text-brand-950/10'
                      }
                    >
                      {pillar.n}
                    </span>
                  </div>
                  <h3
                    className={
                      pillar.featured
                        ? 'mt-6 font-display text-xl font-semibold tracking-tight'
                        : 'mt-6 font-display text-xl font-semibold tracking-tight text-ink'
                    }
                  >
                    {pillar.title}
                  </h3>
                  <p
                    className={
                      pillar.featured
                        ? 'mt-2.5 text-[0.8125rem] leading-relaxed text-brand-100/75'
                        : 'mt-2.5 text-[0.8125rem] leading-relaxed text-slate-600'
                    }
                  >
                    {pillar.body}
                  </p>
                  <span
                    className={
                      pillar.featured
                        ? 'mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-sand-300'
                        : 'mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700'
                    }
                  >
                    {pillar.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. DOCTORS */}
      {doctorsToShow.length > 0 && (
        <section className="border-y border-brand-950/8 bg-white py-16 sm:py-20">
          <div className="container-x">
            <SectionHeading
              eyebrow={locale === 'ne' ? 'चिकित्सक टोली' : 'Our clinicians'}
              title={locale === 'ne' ? 'तपाईंलाई चिन्ने चिकित्सक' : 'Doctors who listen'}
              description={
                locale === 'ne'
                  ? 'प्रमाणित र अनुभवी विशेषज्ञहरूसँग परामर्श लिनुहोस्, र आफ्नो समयतालिका अनुसार अनुरोध गर्नुहोस्।'
                  : 'Consult verified, board-certified physicians and request a slot that fits your week.'
              }
              action={
                <Link href={`/${locale}/doctors`} className="link-arrow">
                  {locale === 'ne' ? 'सबै चिकित्सक' : 'All specialists'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {doctorsToShow.map((doc) => {
                const name = locale === 'ne' && doc.nameNe ? doc.nameNe : doc.nameEn;
                const specialty = locale === 'ne' && doc.specialtyNe ? doc.specialtyNe : doc.specialtyEn;
                const quals = locale === 'ne' && doc.qualificationsNe ? doc.qualificationsNe : doc.qualificationsEn;
                const isMissingNepali = locale === 'ne' && (!doc.nameNe || !doc.specialtyNe);
                const bio = locale === 'ne' && doc.bioNe ? doc.bioNe : doc.bioEn;

                return (
                  <article key={doc.id} className="group card card-hover overflow-hidden">
                    <div className="relative h-24 overflow-hidden bg-gradient-to-br from-brand-800 to-brand-950">
                      <div className="absolute inset-0 bg-grid-light opacity-40" />
                      <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-sand-400/15 blur-xl" />
                      <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[0.625rem] font-semibold text-brand-50 backdrop-blur">
                        {locale === 'ne' ? 'उपलब्ध' : 'Consultation'}
                      </span>
                    </div>

                    <div className="relative px-5 pb-5">
                      <div className="-mt-8 flex items-end gap-3">
                        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-4 border-white bg-brand-50 font-display text-xl font-semibold text-brand-800 shadow-sm overflow-hidden">
                          {doc.photoUrl ? (
                            <img
                              src={doc.photoUrl}
                              alt={name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            initialsOf(name)
                          )}
                        </span>
                        <span className="pb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-brand-600">
                          {specialty}
                        </span>
                      </div>

                      <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-ink">
                        {name}
                      </h3>
                      {quals && <p className="mt-0.5 text-[0.6875rem] text-slate-500">{quals}</p>}

                      {isMissingNepali && (
                        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[0.625rem] text-amber-800">
                          {common.nepaliMissingNote}
                        </p>
                      )}

                      <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-slate-600">
                        {bio ||
                          (locale === 'ne'
                            ? 'क्लिनिकमा नियमित परामर्श उपलब्ध।'
                            : 'Available for outpatient consultations at the clinic.')}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-brand-950/8 pt-4">
                        <div>
                          <p className="text-[0.625rem] uppercase tracking-[0.1em] text-slate-400">
                            {locale === 'ne' ? 'परामर्श शुल्क' : 'Consultation'}
                          </p>
                          <p className="font-display text-sm font-semibold text-ink">
                            NPR {doc.consultationFee}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/${locale}/doctors/${doc.slug}`}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[0.6875rem] font-semibold text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-900"
                          >
                            {locale === 'ne' ? 'तालिका' : 'Schedule'}
                          </Link>
                          <Link
                            href={`/${locale}/book?doctor=${doc.id}`}
                            className="inline-flex items-center gap-1 rounded-full bg-brand-800 px-3.5 py-1.5 text-[0.6875rem] font-bold text-white shadow-xs transition-all hover:bg-brand-900 hover:shadow-sm"
                          >
                            <Calendar className="h-3 w-3" />
                            {locale === 'ne' ? 'बुकिङ' : 'Book'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              {doctorsToShow.length < 3 && (
                <article
                  className={`relative flex flex-col justify-between overflow-hidden rounded-3xl bg-brand-950 p-6 text-white ${
                    doctorsToShow.length === 1 ? 'md:col-span-1 lg:col-span-2' : ''
                  }`}
                >
                  <div className="pointer-events-none absolute inset-0 bg-grid-light opacity-25" />
                  <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-brand-600/30 blur-2xl" />
                  <div className="relative">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-sand-300">
                      <Phone className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">
                      {locale === 'ne'
                        ? 'अर्को विशेषज्ञ चाहिन्छ?'
                        : 'Looking for a different specialty?'}
                    </h3>
                    <p className="mt-2 max-w-sm text-[0.8125rem] leading-relaxed text-brand-100/75">
                      {locale === 'ne'
                        ? 'क्लिनिकमा थप विशेषज्ञ परामर्श उपलब्ध हुन सक्छ। रिसेप्सनलाई फोन गर्नुहोस् वा अनुरोध पठाउनुहोस्।'
                        : 'Additional specialists may be available on request. Call reception or send a request and we will guide you.'}
                    </p>
                  </div>
                  <div className="relative mt-6 flex flex-wrap items-center gap-2.5">
                    <a href={`tel:${phone}`} className="btn btn-accent !px-4 !py-2.5 text-xs">
                      <Phone className="h-3.5 w-3.5" />
                      {phone}
                    </a>
                    <Link href={`/${locale}/book`} className="btn btn-outline-light !px-4 !py-2.5 text-xs">
                      <Calendar className="h-3.5 w-3.5" />
                      {common.bookSession}
                    </Link>
                  </div>
                </article>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4. SERVICES */}
      {servicesToShow.length > 0 && (
        <section className="bg-cream py-16 sm:py-20">
          <div className="container-x">
            <SectionHeading
              eyebrow={locale === 'ne' ? 'क्लिनिकल सेवा' : 'Clinical services'}
              title={locale === 'ne' ? 'दैनिक उपचार, नियमित हेरचाह' : 'Everyday care, thoughtfully delivered'}
              description={
                locale === 'ne'
                  ? 'प्रतिरोधात्मक परिवार चिकित्सादेखि नियमित बाल ओपीडीसम्म, तपाईंको दिनचर्यामा मिल्ने सेवाहरू।'
                  : 'From preventive family medicine to routine pediatric OPD — services built around your daily life.'
              }
              action={
                <Link href={`/${locale}/services`} className="link-arrow">
                  {locale === 'ne' ? 'सबै सेवा' : 'All services'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {servicesToShow.map((svc) => {
                const title = locale === 'ne' && svc.nameNe ? svc.nameNe : svc.nameEn;
                const desc = locale === 'ne' && svc.descriptionNe ? svc.descriptionNe : svc.descriptionEn;
                return (
                  <article key={svc.id} className="group card card-hover flex flex-col p-6">
                    <div className="flex items-start justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                        <HeartPulse className="h-5 w-5" />
                      </span>
                      <span className="chip">
                        {svc.bookingMode === 'request'
                          ? locale === 'ne'
                            ? 'अनलाइन अनुरोध'
                            : 'Online request'
                          : locale === 'ne'
                            ? 'काउन्टर'
                            : 'Walk-in'}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-ink">{title}</h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-[0.8125rem] leading-relaxed text-slate-600">
                      {desc || (locale === 'ne' ? 'विवरण क्लिनिकमा उपलब्ध।' : 'Details available at reception.')}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-brand-950/8 pt-4">
                      <span className="font-display text-sm font-semibold text-ink">
                        {svc.fee !== null && svc.fee > 0
                          ? `NPR ${svc.fee}`
                          : locale === 'ne'
                            ? 'काउन्टरमा पुष्टि'
                            : 'Confirmed at counter'}
                      </span>
                      <Link href={`/${locale}/book?service=${svc.id}`} className="link-arrow">
                        {locale === 'ne' ? 'अनुरोध' : 'Request'}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. LAB DIAGNOSTICS + DIGITAL REPORTS */}
      <section className="border-y border-brand-950/8 bg-white py-16 sm:py-20">
        <div className="container-x grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div>
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {locale === 'ne' ? 'ल्याब डायग्नोस्टिक्स' : 'Lab diagnostics'}
            </span>
            <h2 className="display-title mt-3 text-3xl sm:text-[2.5rem]">
              {locale === 'ne' ? 'सटीक नतिजा, सुरक्षित पहुँच' : 'Precise results. Private by default.'}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {locale === 'ne'
                ? 'तपाईंको नमुना क्लिनिकमै प्रशोधन गरिन्छ र प्रमाणित प्राविधिकद्वारा जाँच गरी रिपोर्ट पोर्टलमा जारी गरिन्छ।'
                : 'Samples are processed in-clinic and verified by qualified technologists before your report is released to your secure portal.'}
            </p>

            <div className="mt-6 space-y-2.5">
              {[
                locale === 'ne' ? 'प्रमाणित ल्याब प्राविधिकद्वारा जाँच' : 'Reviewed by qualified lab technologists',
                locale === 'ne' ? 'पोर्टलमा सुरक्षित पीडीएफ रिपोर्ट' : 'Authenticated PDF reports in your portal',
                locale === 'ne' ? 'घरमै नमुना संकलन उपलब्ध' : 'Home sample collection where available',
              ].map((item) => (
                <p key={item} className="flex items-start gap-2 text-[0.8125rem] text-slate-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {item}
                </p>
              ))}
            </div>

            <div className="mt-7 overflow-hidden rounded-3xl bg-brand-900 p-6 text-white">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-sand-300">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-base font-semibold">Your reports, online</p>
                  <p className="text-[0.6875rem] text-brand-100/70">
                    {locale === 'ne' ? 'पोर्टलमा लगइन गर्नुहोस्' : 'Sign in to the patient portal'}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-brand-100/75">
                {locale === 'ne'
                  ? 'काउन्टरमा परीक्षण गराउनुभएको छ? रिसेप्सनबाट प्राप्त ७-दिने दाबी कोड प्रयोग गरी रिपोर्ट अनलाइन हेर्नुहोस्।'
                  : 'Visited the clinic counter? Use the 7-day claim code from reception to link and view your reports online.'}
              </p>
              <Link
                href={`/${locale}/portal/login`}
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-[0.6875rem] font-bold text-brand-900 transition-colors hover:bg-sand-100"
              >
                {locale === 'ne' ? 'रिपोर्ट हेर्नुहोस्' : 'Access my reports'}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div>
            <div className="mb-5 flex items-end justify-between">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {locale === 'ne' ? 'लोकप्रिय परीक्षणहरू' : 'Popular investigations'}
              </p>
              <Link href={`/${locale}/lab-tests`} className="link-arrow">
                {locale === 'ne' ? 'सबै हेर्नुहोस्' : 'View all'}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {labTestsToShow.length > 0 ? (
              <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2">
                {labTestsToShow.map((test) => {
                  const testName = locale === 'ne' && test.nameNe ? test.nameNe : test.nameEn;
                  const sample =
                    locale === 'ne' ? test.sampleTypeNe || test.sampleTypeEn : test.sampleTypeEn;
                  return (
                    <Link
                      key={test.id}
                      href={`/${locale}/lab-tests/${test.slug}`}
                      className="group card card-hover flex flex-col p-5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
                          <FlaskConical className="h-4 w-4" />
                        </span>
                        {test.isHomeCollectionAvailable && (
                          <span className="rounded-full bg-sand-100 px-2 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wide text-sand-500">
                            {locale === 'ne' ? 'घरमै' : 'Home'}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-4 font-display text-[0.9375rem] font-semibold leading-snug text-ink group-hover:text-brand-800">
                        {testName}
                      </h3>
                      {sample && (
                        <p className="mt-1 text-[0.6875rem] text-slate-500">
                          {locale === 'ne' ? 'नमुना: ' : 'Sample: '}
                          <span className="font-medium text-slate-700">{sample}</span>
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between border-t border-brand-950/8 pt-3.5 text-[0.6875rem]">
                        <span className="font-semibold text-ink">
                          {test.price !== null
                            ? `NPR ${test.price}`
                            : locale === 'ne'
                              ? 'शुल्क पुष्टि हुने'
                              : 'Price on confirmation'}
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-brand-700" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-brand-950/15 p-8 text-center text-sm text-slate-500">
                {locale === 'ne' ? 'परीक्षण सूची अद्यावधिक हुँदैछ।' : 'Lab catalogue is being updated.'}
              </div>
            )}

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-brand-950/8 bg-cream p-4">
              <Microscope className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <p className="text-[0.6875rem] leading-relaxed text-slate-600">
                {locale === 'ne'
                  ? 'अधिकांश परीक्षणको नतिजा क्लिनिकको समयभित्रै प्राप्त हुन्छ। आवश्यक पूर्वतयारीको जानकारी परीक्षण विवरणमा उल्लेख छ।'
                  : 'Most routine results are available within the clinic day. Preparation instructions are listed on each test page.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ARTICLES */}
      {publishedArticles.length > 0 && (
        <section className="bg-cream py-16 sm:py-20">
          <div className="container-x">
            <SectionHeading
              eyebrow={locale === 'ne' ? 'स्वास्थ्य जानकारी' : 'Health guidance'}
              title={locale === 'ne' ? 'पढ्न लायक, भरपर्दो सल्लाह' : 'Advice worth reading'}
              description={
                locale === 'ne'
                  ? 'क्लिनिकका चिकित्सकहरूद्वारा समीक्षा गरिएका रोग रोकथाम तथा स्वस्थ जीवनशैलीका लेखहरू।'
                  : 'Prevention and everyday wellness articles, reviewed by our clinical team.'
              }
              action={
                <Link href={`/${locale}/explore/health-info`} className="link-arrow">
                  {locale === 'ne' ? 'सबै लेख' : 'All articles'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {publishedArticles.map((article) => {
                const title = locale === 'ne' && article.titleNe ? article.titleNe : article.titleEn;
                const excerpt = locale === 'ne' && article.excerptNe ? article.excerptNe : article.excerptEn;
                return (
                  <Link
                    key={article.id}
                    href={`/${locale}/explore/health-info/${article.slug}`}
                    className="group card card-hover flex flex-col p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="chip">
                        <BookOpen className="h-3 w-3" />
                        {article.category || 'General health'}
                      </span>
                      <span className="text-[0.625rem] text-slate-400">
                        {article.createdAt
                          ? new Date(article.createdAt).toLocaleDateString(locale === 'ne' ? 'ne-NP' : 'en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : ''}
                      </span>
                    </div>
                    <h3 className="mt-5 line-clamp-2 font-display text-lg font-semibold leading-snug tracking-tight text-ink group-hover:text-brand-800">
                      {title}
                    </h3>
                    <p className="mt-2.5 line-clamp-3 flex-1 text-[0.8125rem] leading-relaxed text-slate-600">
                      {excerpt}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1.5 border-t border-brand-950/8 pt-4 text-[0.6875rem] font-bold text-brand-700">
                      {locale === 'ne' ? 'लेख पढ्नुहोस्' : 'Read article'}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. FAQ */}
      <section className="border-y border-brand-950/8 bg-white py-16 sm:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {locale === 'ne' ? 'प्रश्नहरू' : 'Questions'}
            </span>
            <h2 className="display-title mt-3 text-3xl sm:text-[2.5rem]">
              {locale === 'ne' ? 'जान्नैपर्ने कुराहरू' : 'Good to know'}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {locale === 'ne'
                ? 'अपोइन्टमेन्ट अनुरोध, ल्याब रिपोर्ट र भुक्तानी सम्बन्धी स्पष्ट उत्तरहरू।'
                : 'Clear answers about appointment requests, lab reports and payments.'}
            </p>

            <div className="mt-7 rounded-2xl border border-brand-950/8 bg-cream p-5">
              <p className="font-display text-sm font-semibold text-ink">
                {locale === 'ne' ? 'अझै प्रश्न छ?' : 'Still have a question?'}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {locale === 'ne'
                  ? 'रिसेप्सन टोलीले क्लिनिक समयभित्र सहयोग गर्नेछ।'
                  : 'Our reception team is happy to help during clinic hours.'}
              </p>
              <a
                href={`tel:${phone}`}
                className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-brand-800 hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                {phone}
              </a>
            </div>

            <Link href={`/${locale}/explore/faq`} className="link-arrow mt-6">
              {locale === 'ne' ? 'सबै प्रश्नहरू' : 'All frequently asked questions'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <HomeFaqAccordion faqs={homeFaqs} />
        </div>
      </section>

      {/* 8. LOCATION & CONTACT */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="container-x">
          <SectionHeading
            eyebrow={locale === 'ne' ? 'भेट्नुहोस्' : 'Visit us'}
            title={locale === 'ne' ? 'क्लिनिकमा आउनुहोस्' : 'Find us, or reach out'}
            description={
              locale === 'ne'
                ? 'ठेगाना, खुल्ने समय र सम्पर्क विवरण।'
                : 'Address, opening hours and the fastest way to reach the clinic.'
            }
            action={
              facebookUrl ? (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-brand-950/10 bg-white px-4 py-2.5 text-xs font-semibold text-brand-900 transition-colors hover:border-brand-300"
                >
                  <Facebook className="h-4 w-4 text-[#1877F2]" />
                  {locale === 'ne' ? 'फेसबुक पेज' : 'Facebook page'}
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                </a>
              ) : undefined
            }
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <MapPin className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-sm font-semibold text-ink">
                {locale === 'ne' ? 'क्लिनिक स्थान' : 'Clinic address'}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {address || (locale === 'ne' ? 'ठेगाना क्लिनिकद्वारा पुष्टि हुने' : 'Location confirmed by clinic')}
              </p>
            </div>

            <div className="card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Clock className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-sm font-semibold text-ink">
                {locale === 'ne' ? 'खुल्ने समय' : 'Opening hours'}
              </h3>
              <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">{openingHours}</p>
            </div>

            <div className="card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Phone className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-sm font-semibold text-ink">
                {locale === 'ne' ? 'फोन सम्पर्क' : 'Call the clinic'}
              </h3>
              <a
                href={`tel:${phone}`}
                className="mt-2 block font-mono text-xs font-bold text-slate-800 hover:text-brand-800"
              >
                {phone}
              </a>
              {emergencyPhone && emergencyPhone !== phone && (
                <a
                  href={`tel:${emergencyPhone}`}
                  className="mt-1 block font-mono text-xs font-bold text-rose-700 hover:underline"
                >
                  {locale === 'ne' ? 'आपतकालीन: ' : 'Emergency: '}
                  {emergencyPhone}
                </a>
              )}
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-brand-900 p-6 text-white">
              <div className="absolute inset-0 bg-grid-light opacity-30" />
              <div className="relative">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-sand-300">
                  <ClipboardCheck className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-sm font-semibold">
                  {locale === 'ne' ? 'अनलाइन अनुरोध' : 'Request a visit'}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-brand-100/75">
                  {locale === 'ne'
                    ? 'तपाईंको समय अनुरोध पठाउनुहोस् — रिसेप्सनले पुष्टि गर्नेछ।'
                    : 'Send a preferred time — reception will confirm your slot.'}
                </p>
                <Link
                  href={`/${locale}/book`}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[0.6875rem] font-bold text-brand-900"
                >
                  {common.bookSession}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="relative overflow-hidden bg-brand-950 py-14 text-white sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-grid-light opacity-25" />
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-brand-600/25 blur-3xl" />
        <div className="container-x relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
          <div className="max-w-xl">
            <span className="eyebrow text-sand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-sand-400" />
              {locale === 'ne' ? 'सुरु गर्नुहोस्' : 'Get started'}
            </span>
            <h2 className="display-title mt-3 text-3xl text-white sm:text-[2.5rem]">
              {locale === 'ne' ? 'आजै आफ्नो स्वास्थ्यको ख्याल गर्नुहोस्' : 'Your health deserves a head start'}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-100/75">
              {locale === 'ne'
                ? 'अनलाइन अनुरोध गर्नुहोस् वा रिसेप्सनलाई फोन गर्नुहोस्। हामी तपाईंको समय पुष्टि गर्नेछौं।'
                : 'Send a request online or call reception. We will confirm a time that works for you.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}/book`} className="btn btn-accent">
              <Calendar className="h-4 w-4" />
              {common.bookSession}
            </Link>
            <a href={`tel:${phone}`} className="btn btn-outline-light">
              <Phone className="h-4 w-4" />
              {phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
