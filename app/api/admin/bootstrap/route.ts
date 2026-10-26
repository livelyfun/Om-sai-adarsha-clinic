import { NextResponse } from 'next/server';
import { bootstrapSuperAdmin } from '@/lib/admin/bootstrap';

export async function POST() {
  try {
    const result = await bootstrapSuperAdmin();
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 409 });
    }
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Bootstrap error:', err);
    return NextResponse.json({ error: err.message || 'Bootstrap failed' }, { status: 500 });
  }
}
