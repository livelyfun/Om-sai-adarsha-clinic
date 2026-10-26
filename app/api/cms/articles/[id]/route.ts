import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireStaffSession } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const staff = await requireStaffSession(req);
  if (!staff || !staff.permissions.includes('content.manage')) {
    return NextResponse.json({ error: 'Forbidden: Missing content.manage permission' }, { status: 403 });
  }

  const articleId = params.id;
  const existing = db.getArticleById(articleId);
  if (!existing) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    let reviewedByDoctorName = existing.reviewedByDoctorName;
    let reviewedAt = existing.reviewedAt;

    if (body.reviewedByDoctorId !== undefined) {
      if (body.reviewedByDoctorId) {
        const doc = db.getDoctorById(body.reviewedByDoctorId);
        reviewedByDoctorName = doc ? doc.nameEn : null;
        reviewedAt = new Date().toISOString();
      } else {
        reviewedByDoctorName = null;
        reviewedAt = null;
      }
    }

    const updated = db.upsertArticle({
      id: existing.id,
      titleEn: body.titleEn ?? existing.titleEn,
      titleNe: body.titleNe ?? existing.titleNe,
      slug: body.slug ? body.slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-') : existing.slug,
      excerptEn: body.excerptEn ?? existing.excerptEn,
      excerptNe: body.excerptNe ?? existing.excerptNe,
      contentEn: body.contentEn ?? existing.contentEn,
      contentNe: body.contentNe ?? existing.contentNe,
      category: body.category ?? existing.category,
      reviewedByDoctorId: body.reviewedByDoctorId !== undefined ? body.reviewedByDoctorId : existing.reviewedByDoctorId,
      reviewedByDoctorName,
      reviewedAt,
      status: body.status ?? existing.status,
    });

    db.addAuditLog({
      actorUserId: staff.user.id,
      actorEmail: staff.user.email,
      actorType: 'staff',
      action: 'article.updated',
      entityType: 'health_article',
      entityId: existing.id,
      metadataJson: { updates: Object.keys(body) },
    });

    return NextResponse.json({ success: true, article: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const staff = await requireStaffSession(req);
  if (!staff || !staff.permissions.includes('content.manage')) {
    return NextResponse.json({ error: 'Forbidden: Missing content.manage permission' }, { status: 403 });
  }

  const articleId = params.id;
  const existing = db.getArticleById(articleId);
  if (!existing) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  db.deleteArticle(articleId);

  db.addAuditLog({
    actorUserId: staff.user.id,
    actorEmail: staff.user.email,
    actorType: 'staff',
    action: 'article.deleted',
    entityType: 'health_article',
    entityId: articleId,
    metadataJson: { titleEn: existing.titleEn, slug: existing.slug },
  });

  return NextResponse.json({ success: true });
}
