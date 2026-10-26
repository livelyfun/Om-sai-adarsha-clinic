import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { recordAudit } from '@/lib/audit';

export interface BootstrapResult {
  success: boolean;
  message: string;
  adminEmail?: string;
}

/**
 * Super Admin One-Time Bootstrap
 * Reads credentials from environment variables.
 * Enforces:
 * 1. Must change password at first login.
 * 2. Refuses to run if any Super Admin account already exists.
 */
export async function bootstrapSuperAdmin(): Promise<BootstrapResult> {
  const adminEmail = (process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@omsaiclinic.local').toLowerCase();
  const initialPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'ChangeMeImmediately123!';

  // Check if any Super Admin already exists
  const existingProfiles = db.getRoles().find(r => r.id === 'super_admin');
  const allUsers = (db as any).data.users as any[];
  const staffProfiles = (db as any).data.staffProfiles as any[];

  const hasSuperAdmin = staffProfiles.some(sp => sp.roleId === 'super_admin');
  if (hasSuperAdmin) {
    return {
      success: false,
      message: 'Bootstrap refused: Super Admin account already exists in database.',
    };
  }

  // Create or update admin user
  const passwordHash = hashPassword(initialPassword);
  let user = db.getUserByEmail(adminEmail);

  if (!user) {
    user = db.createUser({
      email: adminEmail,
      passwordHash,
      userType: 'staff',
      isActive: true,
      mustChangePassword: true, // Forces password change on first login
      preferredLocale: 'en',
    });
  } else {
    user = db.updateUser(user.id, {
      passwordHash,
      userType: 'staff',
      isActive: true,
      mustChangePassword: true,
    });
  }

  // Assign Super Admin Staff Profile
  db.createStaffProfile({
    userId: user.id,
    roleId: 'super_admin',
    fullName: 'System Super Administrator',
    customGrantedPermissions: [],
    customRevokedPermissions: [],
    createdAt: new Date().toISOString(),
  });

  // Record audit entry
  recordAudit({
    actorUserId: user.id,
    actorEmail: user.email,
    actorType: 'system',
    action: 'bootstrap_super_admin',
    entityType: 'staff_profile',
    entityId: user.id,
    metadata: { initialEmail: adminEmail },
  });

  console.log(`[BOOTSTRAP] Initial Super Admin successfully bootstrapped: ${adminEmail}`);

  return {
    success: true,
    message: 'Super Admin successfully initialized with required first-login password change.',
    adminEmail,
  };
}
