import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uniqueBy, isDemoPlaceholderName } from '@/lib/utils';

/**
 * Public, read-only catalogue used by the booking hub.
 *
 * The CMS endpoints require staff authentication, so they cannot be used by
 * patients on the public site. This route exposes only active, publishable
 * records and removes duplicate rows created by automated seed runs.
 */
export async function GET() {
  const doctors = uniqueBy(db.getDoctors(true), (doctor) => doctor.nameEn).filter(
    (doctor) => !isDemoPlaceholderName(doctor.nameEn)
  );

  const services = uniqueBy(
    db.getMedicalServices(true).filter((service) => service.bookingMode === 'request'),
    (service) => service.nameEn
  );

  const labTests = uniqueBy(db.getLabTests(true), (test) => test.nameEn);

  return NextResponse.json(
    { doctors, services, labTests },
    {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    }
  );
}
