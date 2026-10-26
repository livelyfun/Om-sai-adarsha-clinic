import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireStaffSession } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const staff = await requireStaffSession(req);
  if (!staff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const articles = db.getArticles(false);
  const doctors = db.getDoctors(false);

  return NextResponse.json({
    articles,
    doctors,
    canManage: staff.permissions.includes('content.manage'),
  });
}

export async function POST(req: NextRequest) {
  const staff = await requireStaffSession(req);
  if (!staff || !staff.permissions.includes('content.manage')) {
    return NextResponse.json({ error: 'Forbidden: Missing content.manage permission' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      titleEn,
      titleNe,
      slug,
      excerptEn,
      excerptNe,
      contentEn,
      contentNe,
      category,
      reviewedByDoctorId,
      status = 'draft',
    } = body;

    if (!titleEn || !slug) {
      return NextResponse.json({ error: 'English title and slug are required.' }, { status: 400 });
    }

    // Lookup reviewing doctor if specified
    let reviewedByDoctorName: string | null = null;
    let reviewedAt: string | null = null;

    if (reviewedByDoctorId) {
      const doc = db.getDoctorById(reviewedByDoctorId);
      if (doc) {
        reviewedByDoctorName = doc.nameEn;
        reviewedAt = new Date().toISOString();
      }
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');

    const article = db.upsertArticle({
      titleEn,
      titleNe: titleNe || '',
      slug: cleanSlug,
      excerptEn: excerptEn || '',
      excerptNe: excerptNe || '',
      contentEn: contentEn || '',
      contentNe: contentNe || '',
      category: category || 'General Health',
      reviewedByDoctorId: reviewedByDoctorId || null,
      reviewedByDoctorName,
      reviewedAt,
      status: status as any,
    });

    db.addAuditLog({
      actorUserId: staff.user.id,
      actorEmail: staff.user.email,
      actorType: 'staff',
      action: 'article.created',
      entityType: 'health_article',
      entityId: article.id,
      metadataJson: { slug: cleanSlug, status },
    });

    return NextResponse.json({ success: true, article });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
