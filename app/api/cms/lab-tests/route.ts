import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { recordAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth.user || !auth.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const categoryId = req.nextUrl.searchParams.get('categoryId') || undefined;
  const tests = db.getLabTests(false, categoryId);
  return NextResponse.json({ tests });
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
      categoryId,
      slug,
      nameEn,
      nameNe,
      descriptionEn,
      descriptionNe,
      prepInstructionsEn,
      prepInstructionsNe,
      sampleTypeEn,
      sampleTypeNe,
      price,
      isHomeCollectionAvailable,
      isActive,
      isFeatured,
    } = body;

    if (!nameEn || !slug || !categoryId) {
      return NextResponse.json({ error: 'Category, Test Name (EN), and Slug are required.' }, { status: 400 });
    }

    const parsedPrice = price === '' || price === null || price === undefined ? null : Number(price);

    const saved = db.upsertLabTest({
      id,
      categoryId,
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      nameEn: nameEn.trim(),
      nameNe: (nameNe || '').trim(),
      descriptionEn: descriptionEn || '',
      descriptionNe: descriptionNe || '',
      prepInstructionsEn: prepInstructionsEn || '',
      prepInstructionsNe: prepInstructionsNe || '',
      sampleTypeEn: sampleTypeEn || '',
      sampleTypeNe: sampleTypeNe || '',
      price: parsedPrice,
      isHomeCollectionAvailable: Boolean(isHomeCollectionAvailable),
      isActive: Boolean(isActive),
      isFeatured: Boolean(isFeatured),
    });

    recordAudit({
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorType: 'staff',
      action: id ? 'update_lab_test' : 'create_lab_test',
      entityType: 'lab_test',
      entityId: saved.id,
      metadata: { nameEn: saved.nameEn, price: saved.price },
    });

    return NextResponse.json({ success: true, test: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save test' }, { status: 500 });
  }
}
