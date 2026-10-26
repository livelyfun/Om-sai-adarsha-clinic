import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { recordAudit } from '@/lib/audit';

export async function GET() {
  const auth = await getAuthContext();
  if (!auth.user || !auth.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const categories = db.getLabCategories();
  return NextResponse.json({ categories });
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
    const { id, slug, nameEn, nameNe, displayOrder } = await req.json();
    if (!nameEn || !slug) {
      return NextResponse.json({ error: 'Category Name (EN) and Slug are required' }, { status: 400 });
    }

    const saved = db.upsertLabCategory({
      id,
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      nameEn: nameEn.trim(),
      nameNe: (nameNe || '').trim(),
      displayOrder: typeof displayOrder === 'number' ? displayOrder : parseInt(displayOrder || '0', 10),
    });

    recordAudit({
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorType: 'staff',
      action: id ? 'update_lab_category' : 'create_lab_category',
      entityType: 'lab_category',
      entityId: saved.id,
    });

    return NextResponse.json({ success: true, category: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save category' }, { status: 500 });
  }
}
