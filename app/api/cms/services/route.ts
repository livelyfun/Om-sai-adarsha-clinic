import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { recordAudit } from '@/lib/audit';

export async function GET() {
  const auth = await getAuthContext();
  if (!auth.user || !auth.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const services = db.getMedicalServices(false);
  return NextResponse.json({ services });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth.user || !auth.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!auth.staffPermissions.includes('catalogue.manage')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      id,
      slug,
      nameEn,
      nameNe,
      descriptionEn,
      descriptionNe,
      fee,
      bookingMode,
      isActive,
      isFeatured,
    } = body;

    if (!nameEn || !slug) {
      return NextResponse.json({ error: 'Name (EN) and Slug are required' }, { status: 400 });
    }

    const saved = db.upsertMedicalService({
      id,
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      nameEn: nameEn.trim(),
      nameNe: (nameNe || '').trim(),
      descriptionEn: descriptionEn || '',
      descriptionNe: descriptionNe || '',
      fee: typeof fee === 'number' ? fee : parseInt(fee || '0', 10),
      bookingMode: bookingMode === 'informational' ? 'informational' : 'request',
      isActive: Boolean(isActive),
      isFeatured: Boolean(isFeatured),
    });

    recordAudit({
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorType: 'staff',
      action: id ? 'update_medical_service' : 'create_medical_service',
      entityType: 'medical_service',
      entityId: saved.id,
      metadata: { nameEn: saved.nameEn, bookingMode: saved.bookingMode },
    });

    return NextResponse.json({ success: true, service: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save service' }, { status: 500 });
  }
}
