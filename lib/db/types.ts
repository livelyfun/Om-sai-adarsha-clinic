export type UserType = 'patient' | 'staff';

export interface User {
  id: string;
  email: string;
  phone?: string;
  passwordHash: string;
  userType: UserType;
  isActive: boolean;
  mustChangePassword?: boolean;
  emailVerifiedAt?: string | null;
  verificationTokenHash?: string | null;
  resetTokenHash?: string | null;
  resetTokenExpiresAt?: string | null;
  preferredLocale: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export type PermissionKey =
  | 'bookings.view'
  | 'bookings.manage'
  | 'patients.view'
  | 'patients.manage'
  | 'reports.view'
  | 'reports.upload'
  | 'reports.release'
  | 'reports.revoke'
  | 'catalogue.manage'
  | 'content.manage'
  | 'settings.manage'
  | 'users.manage'
  | 'audit.view';

export interface Role {
  id: string;
  name: string;
  description?: string;
  defaultPermissions: PermissionKey[];
}

export interface StaffProfile {
  userId: string;
  roleId: string;
  fullName: string;
  customGrantedPermissions: PermissionKey[];
  customRevokedPermissions: PermissionKey[];
  createdAt: string;
}

export interface PatientProfile {
  id: string;
  managingUserId?: string | null;
  fullName: string;
  dob?: string;
  sex?: string;
  phone?: string;
  relationshipLabel: string;
  identityVerifiedAt?: string | null;
  verifiedByStaffId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimCode {
  id: string;
  profileId: string;
  codeHash: string;
  expiresAt: string;
  usedAt?: string | null;
  createdByStaffId: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  slug: string;
  nameEn: string;
  nameNe: string;
  photoUrl?: string;
  qualificationsEn?: string;
  qualificationsNe?: string;
  specialtyEn: string;
  specialtyNe: string;
  bioEn?: string;
  bioNe?: string;
  consultationFee: number;
  slotDurationMinutes: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0 = Sunday, ..., 6 = Saturday
  startTimeMinutes: number; // e.g. 9:00 = 540
  endTimeMinutes: number; // e.g. 17:00 = 1020
}

export interface DoctorUnavailability {
  id: string;
  doctorId: string;
  startDatetime: string;
  endDatetime: string;
  reason?: string;
}

export interface MedicalService {
  id: string;
  slug: string;
  nameEn: string;
  nameNe: string;
  descriptionEn?: string;
  descriptionNe?: string;
  fee: number;
  bookingMode: 'request' | 'informational';
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface ServiceQuestion {
  id: string;
  serviceId: string;
  questionEn: string;
  questionNe: string;
  fieldType: 'text' | 'choice' | 'boolean';
  isRequired: boolean;
  optionsJson?: string[];
}

export interface LabTestCategory {
  id: string;
  slug: string;
  nameEn: string;
  nameNe: string;
  displayOrder: number;
}

export interface LabTest {
  id: string;
  categoryId: string;
  slug: string;
  nameEn: string;
  nameNe: string;
  descriptionEn?: string;
  descriptionNe?: string;
  prepInstructionsEn?: string;
  prepInstructionsNe?: string;
  sampleTypeEn?: string;
  sampleTypeNe?: string;
  price?: number | null; // null => "Price confirmed by the clinic"
  isHomeCollectionAvailable: boolean;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'reschedule_proposed'
  | 'declined'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export interface Appointment {
  id: string;
  referenceNo: string;
  profileId: string;
  doctorId?: string;
  serviceId?: string;
  startTime: string; // ISO UTC
  endTime: string; // ISO UTC
  status: BookingStatus;
  doctorNameSnapshot?: string;
  feeSnapshot: number;
  patientNotes?: string;
  patientMessage?: string;
  internalNote?: string;
  serviceAnswersJson?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface LabBooking {
  id: string;
  referenceNo: string;
  profileId: string;
  preferredTime: string; // ISO UTC
  status: BookingStatus;
  estimatedTotal: number;
  patientNotes?: string;
  patientMessage?: string;
  internalNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LabBookingItem {
  id: string;
  labBookingId: string;
  labTestId: string;
  nameEnSnapshot: string;
  nameNeSnapshot: string;
  priceSnapshot?: number | null;
  prepInstructionsSnapshot?: string;
}

export type ReportStatus = 'draft' | 'released' | 'revoked' | 'superseded';

export interface LabReport {
  id: string;
  labBookingId: string;
  profileId: string;
  version: number;
  status: ReportStatus;
  storageKey: string;
  originalFilename: string;
  fileSize: number;
  checksumSha256: string;
  mimeType: string;
  uploadedByStaffId: string;
  confirmedAt: string;
  confirmedByStaffId: string;
  releasedAt?: string | null;
  releasedByStaffId?: string | null;
  revokedAt?: string | null;
  revokedByStaffId?: string | null;
  revokeReason?: string | null;
  createdAt: string;
}

export interface BookingStatusEvent {
  id: string;
  bookingType: 'appointment' | 'lab';
  bookingId: string;
  fromStatus: string;
  toStatus: string;
  actorType: 'patient' | 'staff' | 'system';
  actorUserId?: string | null;
  patientMessage?: string;
  internalNote?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId?: string | null;
  actorEmail?: string | null;
  actorType: 'patient' | 'staff' | 'system' | 'anonymous';
  action: string;
  entityType: string;
  entityId?: string | null;
  requestId?: string | null;
  ipAddress?: string | null;
  metadataJson?: Record<string, any>;
  createdAt: string;
}

export interface ClinicSetting {
  key: string;
  valueJson: any;
  updatedAt: string;
  updatedByStaffId?: string;
}

export interface ClinicClosure {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reasonEn?: string;
  reasonNe?: string;
}

export interface RateLimitBucket {
  key: string;
  hits: number;
  resetAt: string;
}

export interface HealthArticle {
  id: string;
  slug: string;
  titleEn: string;
  titleNe: string;
  excerptEn: string;
  excerptNe: string;
  contentEn: string;
  contentNe: string;
  category: string;
  reviewedByDoctorId?: string | null;
  reviewedByDoctorName?: string | null;
  reviewedAt?: string | null;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}
