import { db } from '@/lib/db';
import { AuditLog } from '@/lib/db/types';

export interface RecordAuditOptions {
  actorUserId?: string | null;
  actorEmail?: string | null;
  actorType: 'patient' | 'staff' | 'system' | 'anonymous';
  action: string;
  entityType: string;
  entityId?: string | null;
  requestId?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, any>;
}

export function recordAudit(options: RecordAuditOptions): AuditLog {
  return db.addAuditLog({
    actorUserId: options.actorUserId || null,
    actorEmail: options.actorEmail || null,
    actorType: options.actorType,
    action: options.action,
    entityType: options.entityType,
    entityId: options.entityId || null,
    requestId: options.requestId || null,
    ipAddress: options.ipAddress || null,
    metadataJson: options.metadata || {},
  });
}
