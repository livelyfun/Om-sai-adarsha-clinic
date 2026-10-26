import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { recordAudit } from '@/lib/audit';

export async function GET() {
  const auth = await getAuthContext();
  if (!auth.user || !auth.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const doctors = db.getDoctors(false);
  return NextResponse.json({ doctors });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth.user || !auth.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Permission check
  if (!auth.staffPermissions.includes('catalogue.manage')) {
    return NextResponse.json({ error: 'Forbidden: Missing catalogue.manage permission' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      id,
      slug,
      nameEn,
      nameNe,
      photoUrl,
      qualificationsEn,
      qualificationsNe,
      specialtyEn,
      specialtyNe,
      bioEn,
      bioNe,
      consultationFee,
      slotDurationMinutes,
      isActive,
      isFeatured,
    } = body;

    if (!nameEn || !specialtyEn || !slug) {
      return NextResponse.json({ error: 'Name (EN), Specialty (EN), and Slug are required.' }, { status: 400 });
    }

    const saved = db.upsertDoctor({
      id,
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      nameEn: nameEn.trim(),
      nameNe: (nameNe || '').trim(),
      photoUrl: photoUrl || '',
      qualificationsEn: qualificationsEn || '',
      qualificationsNe: qualificationsNe || '',
      specialtyEn: specialtyEn.trim(),
      specialtyNe: (specialtyNe || '').trim(),
      bioEn: bioEn || '',
      bioNe: bioNe || '',
      consultationFee: typeof consultationFee === 'number' ? consultationFee : parseInt(consultationFee || '0', 10),
      slotDurationMinutes: typeof slotDurationMinutes === 'number' ? slotDurationMinutes : parseInt(slotDurationMinutes || '20', 10),
      isActive: Boolean(isActive),
      isFeatured: Boolean(isFeatured),
    });

    recordAudit({
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorType: 'staff',
      action: id ? 'update_doctor' : 'create_doctor',
      entityType: 'doctor',
      entityId: saved.id,
      metadata: { nameEn: saved.nameEn, slug: saved.slug, isActive: saved.isActive },
    });

    return NextResponse.json({ success: true, doctor: saved });
  } catch (err: any) {
    console.error('Doctor upsert error:', err);
    return NextResponse.json({ error: err.message || 'Failed to save doctor' }, { status: 500 });
  }
}
