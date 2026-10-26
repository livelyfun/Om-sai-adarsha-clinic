import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { getMessages } from '@/lib/i18n';

export async function GET() {
  const results: { test: string; status: 'PASSED' | 'FAILED'; details?: string }[] = [];

  try {
    // 1. Doctor creation & Schedule setup
    const testDoc = db.upsertDoctor({
      slug: `test-doc-${Date.now()}`,
      nameEn: 'Dr. Stage Two Specialist',
      nameNe: '', // Intentionally missing Nepali for fallback testing
      specialtyEn: 'Orthopedics & Sports Medicine',
      specialtyNe: '',
      consultationFee: 700,
      slotDurationMinutes: 20,
      isActive: true,
      isFeatured: true,
    });

    db.setDoctorSchedules(testDoc.id, [
      { dayOfWeek: 0, startTimeMinutes: 540, endTimeMinutes: 1020 },
      { dayOfWeek: 1, startTimeMinutes: 540, endTimeMinutes: 1020 },
    ]);

    const retrievedSchedules = db.getDoctorSchedules(testDoc.id);
    if (testDoc.id && retrievedSchedules.length === 2) {
      results.push({ test: 'Doctor Profile & Weekly Schedule Creation', status: 'PASSED' });
    } else {
      results.push({ test: 'Doctor Profile & Weekly Schedule Creation', status: 'FAILED' });
    }

    // 2. Publish & Deactivation Toggle
    const allBefore = db.getDoctors(true).length;
    db.upsertDoctor({ ...testDoc, isActive: false });
    const activeAfterDeactivate = db.getDoctors(true).find(d => d.id === testDoc.id);
    db.upsertDoctor({ ...testDoc, isActive: true }); // restore
    const activeAfterReactivate = db.getDoctors(true).find(d => d.id === testDoc.id);

    if (!activeAfterDeactivate && activeAfterReactivate) {
      results.push({ test: 'Doctor Publish & Deactivation Visibility Filter', status: 'PASSED' });
    } else {
      results.push({ test: 'Doctor Publish & Deactivation Visibility Filter', status: 'FAILED' });
    }

    // 3. Missing Nepali Fallback String Check
    const neMessages = getMessages('ne');
    const fallbackNote = neMessages.common?.nepaliMissingNote;
    if (fallbackNote && fallbackNote.includes('नेपाली अनुवाद')) {
      results.push({ test: 'Bilingual Translation Fallback Notice Verification', status: 'PASSED', details: fallbackNote });
    } else {
      results.push({ test: 'Bilingual Translation Fallback Notice Verification', status: 'FAILED' });
    }

    // 4. Medical Service Creation & Booking Mode
    const testService = db.upsertMedicalService({
      slug: `test-service-${Date.now()}`,
      nameEn: 'Preventive Cardiac Health Check',
      nameNe: 'रोकथाम मुटु स्वास्थ्य परीक्षण',
      fee: 2500,
      bookingMode: 'request',
      isActive: true,
      isFeatured: true,
    });

    const activeServices = db.getMedicalServices(true);
    const foundService = activeServices.find(s => s.id === testService.id);
    if (foundService && foundService.bookingMode === 'request') {
      results.push({ test: 'Medical Service Catalogue & Request Mode Support', status: 'PASSED' });
    } else {
      results.push({ test: 'Medical Service Catalogue & Request Mode Support', status: 'FAILED' });
    }

    // 5. Lab Test Category and Test with Unconfirmed Price (null)
    const testCat = db.upsertLabCategory({
      slug: `cat-${Date.now()}`,
      nameEn: 'Biochemistry Panel',
      nameNe: 'बायोकेमिस्ट्री',
      displayOrder: 1,
    });

    const testLab = db.upsertLabTest({
      categoryId: testCat.id,
      slug: `test-lab-${Date.now()}`,
      nameEn: 'Lipid Profile Extended',
      nameNe: 'लिपिड प्रोफाइल',
      prepInstructionsEn: '12 hours overnight fasting required.',
      prepInstructionsNe: '१२ घण्टा खाली पेट बस्नुपर्ने।',
      sampleTypeEn: 'Serum Blood',
      price: null, // Null means "Price confirmed by the clinic"
      isHomeCollectionAvailable: true,
      isActive: true,
      isFeatured: false,
    });

    const activeTests = db.getLabTests(true);
    const foundLab = activeTests.find(t => t.id === testLab.id);
    if (foundLab && foundLab.price === null && foundLab.isHomeCollectionAvailable) {
      results.push({ test: 'Lab Catalogue with Unconfirmed Price & Home Collection Toggle', status: 'PASSED' });
    } else {
      results.push({ test: 'Lab Catalogue with Unconfirmed Price & Home Collection Toggle', status: 'FAILED' });
    }

    // 6. Clinic Settings & Closure Date Configuration
    db.updateSettings({
      min_lead_time_hours: 3,
      cancellation_cutoff_hours: 4,
    });
    const updatedLeadTime = db.getSetting('min_lead_time_hours');

    const testClosure = db.addClinicClosure({
      startDate: '2026-11-01',
      endDate: '2026-11-03',
      reasonEn: 'Tihar Festival Holiday',
      reasonNe: 'तिहार बिदा',
    });
    const closures = db.getClinicClosures();
    const foundClosure = closures.find(c => c.id === testClosure.id);

    if (updatedLeadTime === 3 && foundClosure) {
      results.push({ test: 'Clinic Settings & Closure Schedules', status: 'PASSED' });
    } else {
      results.push({ test: 'Clinic Settings & Closure Schedules', status: 'FAILED' });
    }

    // 7. Sitemap & Robots.txt Strict CMS Path Omission
    const sitemapEntries = sitemap();
    const sitemapUrls = sitemapEntries.map(e => e.url);
    const cmsInSitemap = sitemapUrls.some(u => u.includes('sai-clinic-management'));

    const robotsRules = robots();
    const robotsStr = JSON.stringify(robotsRules);
    const cmsInRobots = robotsStr.includes('sai-clinic-management');

    if (!cmsInSitemap && !cmsInRobots) {
      results.push({ test: 'Sitemap and Robots.txt Strict CMS Path Concealment', status: 'PASSED' });
    } else {
      results.push({ test: 'Sitemap and Robots.txt Strict CMS Path Concealment', status: 'FAILED' });
    }

    const allPassed = results.every(r => r.status === 'PASSED');

    return NextResponse.json({
      stage: 'Stage 2 — Catalogues and Public Site',
      allPassed,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({
      stage: 'Stage 2 — Catalogues and Public Site',
      allPassed: false,
      error: err.message,
      results,
    }, { status: 500 });
  }
}
