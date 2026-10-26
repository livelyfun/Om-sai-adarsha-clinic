import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { LOCALES } from '@/lib/i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.APP_URL || 'https://omsaiclinic.com';
  const lastModified = new Date();

  const staticRoutes = [
    '',
    '/doctors',
    '/services',
    '/lab-tests',
    '/explore/about',
    '/explore/faq',
    '/explore/health-info',
    '/privacy',
    '/terms',
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Localized static public pages
  for (const locale of LOCALES) {
    for (const route of staticRoutes) {
      entries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: route === '' ? 1.0 : 0.8,
      });
    }
  }

  // Published Doctors
  const doctors = db.getDoctors(true);
  for (const doc of doctors) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${baseUrl}/${locale}/doctors/${doc.slug}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  // Published Medical Services
  const services = db.getMedicalServices(true);
  for (const serv of services) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${baseUrl}/${locale}/services/${serv.slug}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  // Published Lab Tests
  const labTests = db.getLabTests(true);
  for (const test of labTests) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${baseUrl}/${locale}/lab-tests/${test.slug}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return entries;
}
