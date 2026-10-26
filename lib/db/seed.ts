import { db } from './index';
import { hashPassword } from '@/lib/auth/password';
import { bootstrapSuperAdmin } from '@/lib/admin/bootstrap';

export function runDevelopmentSeed(): { success: boolean; message: string } {
  if (process.env.APP_ENV === 'production') {
    throw new Error('FATAL: Seed script refused to run in production environment (APP_ENV=production).');
  }

  // 1. Ensure Super Admin is bootstrapped
  bootstrapSuperAdmin();

  // 2. Seed a default Reception Staff account for front-desk testing
  const receptionEmail = 'reception@omsaiclinic.local';
  let receptionUser = db.getUserByEmail(receptionEmail);
  if (!receptionUser) {
    receptionUser = db.createUser({
      email: receptionEmail,
      passwordHash: hashPassword('ReceptionPass123!'),
      userType: 'staff',
      isActive: true,
      mustChangePassword: false,
      preferredLocale: 'en',
    });
    db.createStaffProfile({
      userId: receptionUser.id,
      roleId: 'reception',
      fullName: 'Dev Front Desk Staff',
      customGrantedPermissions: [],
      customRevokedPermissions: [],
      createdAt: new Date().toISOString(),
    });
  }

  // 3. Seed a verified Sample Patient account for testing
  const patientEmail = 'patient.test@example.local';
  let patientUser = db.getUserByEmail(patientEmail);
  if (!patientUser) {
    patientUser = db.createUser({
      email: patientEmail,
      phone: '9800000000',
      passwordHash: hashPassword('PatientPass123!'),
      userType: 'patient',
      isActive: true,
      emailVerifiedAt: new Date().toISOString(), // Pre-verified for dev convenience
      preferredLocale: 'en',
    });

    // Create primary patient profile ("myself")
    db.createPatientProfile({
      managingUserId: patientUser.id,
      fullName: 'Sample Test Patient',
      dob: '1990-01-01',
      sex: 'female',
      phone: '9800000000',
      relationshipLabel: 'myself',
      identityVerifiedAt: new Date().toISOString(),
      verifiedByStaffId: receptionUser.id,
    });

    // Create a family member profile ("child")
    db.createPatientProfile({
      managingUserId: patientUser.id,
      fullName: 'Sample Child Patient',
      dob: '2020-05-15',
      sex: 'male',
      relationshipLabel: 'child',
    });
  }

  console.log('[SEED] Development seed executed successfully.');
  return {
    success: true,
    message: 'Development database seeded with reception and test patient profiles.',
  };
}

export function clearSampleData(): void {
  if (process.env.APP_ENV === 'production') {
    throw new Error('FATAL: Cannot clear sample data in production.');
  }
  // Remove known test accounts
  const devEmails = ['reception@omsaiclinic.local', 'patient.test@example.local'];
  (db as any).data.users = (db as any).data.users.filter((u: any) => !devEmails.includes(u.email));
  (db as any).save();
  console.log('[SEED] Sample development data cleared.');
}
