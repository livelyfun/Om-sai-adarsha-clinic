import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  User,
  UserSession,
  Role,
  StaffProfile,
  PatientProfile,
  ClaimCode,
  Doctor,
  DoctorSchedule,
  DoctorUnavailability,
  MedicalService,
  ServiceQuestion,
  LabTestCategory,
  LabTest,
  Appointment,
  LabBooking,
  LabBookingItem,
  LabReport,
  BookingStatusEvent,
  AuditLog,
  ClinicSetting,
  ClinicClosure,
  RateLimitBucket,
  PermissionKey,
  HealthArticle,
} from './types';

interface DatabaseSchema {
  users: User[];
  sessions: UserSession[];
  roles: Role[];
  staffProfiles: StaffProfile[];
  patientProfiles: PatientProfile[];
  claimCodes: ClaimCode[];
  doctors: Doctor[];
  doctorSchedules: DoctorSchedule[];
  doctorUnavailabilities: DoctorUnavailability[];
  medicalServices: MedicalService[];
  serviceQuestions: ServiceQuestion[];
  labCategories: LabTestCategory[];
  labTests: LabTest[];
  appointments: Appointment[];
  labBookings: LabBooking[];
  labBookingItems: LabBookingItem[];
  labReports: LabReport[];
  bookingStatusEvents: BookingStatusEvent[];
  auditLogs: AuditLog[];
  clinicSettings: Record<string, any>;
  clinicClosures: ClinicClosure[];
  rateLimits: Record<string, RateLimitBucket>;
  articles: HealthArticle[];
}

const DEFAULT_ROLES: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full administrative access across clinical, operational, user management and system settings.',
    defaultPermissions: [
      'bookings.view',
      'bookings.manage',
      'patients.view',
      'patients.manage',
      'reports.view',
      'reports.upload',
      'reports.release',
      'reports.revoke',
      'catalogue.manage',
      'content.manage',
      'settings.manage',
      'users.manage',
      'audit.view',
    ],
  },
  {
    id: 'reception',
    name: 'Reception',
    description: 'Front desk operations: review and confirm bookings, manage walk-in profiles, upload draft reports.',
    defaultPermissions: [
      'bookings.view',
      'bookings.manage',
      'patients.view',
      'patients.manage',
      'reports.view',
      'reports.upload',
    ],
  },
];

const DEFAULT_SETTINGS: Record<string, any> = {
  clinic_name: 'Om Sai Aadarsha Clinic',
  clinic_name_ne: 'ॐ साई आदर्श क्लिनिक',
  tagline_en: 'Compassionate Care, Reliable Diagnostics & Expert Consultations',
  tagline_ne: 'सहृदयी स्वास्थ्य सेवा, गुणस्तरीय ल्याब तथा विशेषज्ञ परामर्श',
  min_lead_time_hours: 2,
  max_advance_booking_days: 30,
  cancellation_cutoff_hours: 4,
  max_open_requests_per_patient: 5,
  default_slot_duration_minutes: 20,
  week_start_day: 0, // Sunday
  weekly_holiday_day: 6, // Saturday
  address_en: 'Shahid Marg, In Front of Birendra Sabhagriha, Biratnagar, Nepal',
  address_ne: 'शहिद मार्ग, विरेन्द्र सभागृह अगाडि, विराटनगर, नेपाल',
  phone: '+977-9807358874',
  email: 'omsaiaadarshaclinic@gmail.com',
  emergency_phone: '+977-9810581421',
  whatsapp_number: '+977-9807358874',
  map_url: 'https://maps.google.com/?q=Birendra+Sabhagriha+Biratnagar',
  facebook_url: 'https://www.facebook.com/p/Om-Sai-Aadarsha-Clinic-100084050983392/',
  opening_hours_en: 'Sunday – Friday: 07:00 AM – 07:00 PM (Saturday Closed)',
  opening_hours_ne: 'आइतबार – शुक्रबार: बिहान ०७:०० – साँझ ०७:०० (शनिबार बन्द)',
};

class PersistentDatabase {
  private filePath: string;
  private data: DatabaseSchema;

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.filePath = path.join(dataDir, 'clinic_dev.json');
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || [],
          sessions: parsed.sessions || [],
          roles: parsed.roles || DEFAULT_ROLES,
          staffProfiles: parsed.staffProfiles || [],
          patientProfiles: parsed.patientProfiles || [],
          claimCodes: parsed.claimCodes || [],
          doctors: parsed.doctors || [],
          doctorSchedules: parsed.doctorSchedules || [],
          doctorUnavailabilities: parsed.doctorUnavailabilities || [],
          medicalServices: parsed.medicalServices || [],
          serviceQuestions: parsed.serviceQuestions || [],
          labCategories: parsed.labCategories || [],
          labTests: parsed.labTests || [],
          appointments: parsed.appointments || [],
          labBookings: parsed.labBookings || [],
          labBookingItems: parsed.labBookingItems || [],
          labReports: parsed.labReports || [],
          bookingStatusEvents: parsed.bookingStatusEvents || [],
          auditLogs: parsed.auditLogs || [],
          clinicSettings: { ...DEFAULT_SETTINGS, ...(parsed.clinicSettings || {}) },
          clinicClosures: parsed.clinicClosures || [],
          rateLimits: parsed.rateLimits || {},
          articles: parsed.articles || [],
        };
      } catch (err) {
        console.error('Failed to parse database file, initializing default:', err);
      }
    }
    const initial: DatabaseSchema = {
      users: [],
      sessions: [],
      roles: DEFAULT_ROLES,
      staffProfiles: [],
      patientProfiles: [],
      claimCodes: [],
      doctors: [],
      doctorSchedules: [],
      doctorUnavailabilities: [],
      medicalServices: [],
      serviceQuestions: [],
      labCategories: [],
      labTests: [],
      appointments: [],
      labBookings: [],
      labBookingItems: [],
      labReports: [],
      bookingStatusEvents: [],
      auditLogs: [],
      clinicSettings: DEFAULT_SETTINGS,
      clinicClosures: [],
      rateLimits: {},
      articles: [],
    };
    this.save(initial);
    return initial;
  }

  private save(data?: DatabaseSchema) {
    if (data) this.data = data;
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  // ----------------------------------------------------
  // USERS
  // ----------------------------------------------------
  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserByPhone(phone: string): User | undefined {
    const clean = phone.replace(/\D/g, '');
    if (!clean) return undefined;
    return this.data.users.find(u => u.phone && u.phone.replace(/\D/g, '') === clean);
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      email: user.email.toLowerCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.users[idx];
  }

  // ----------------------------------------------------
  // SESSIONS
  // ----------------------------------------------------
  createSession(userId: string, tokenHash: string, expiresAt: string, ip?: string, ua?: string): UserSession {
    const session: UserSession = {
      id: crypto.randomUUID(),
      userId,
      tokenHash,
      expiresAt,
      ipAddress: ip,
      userAgent: ua,
      createdAt: new Date().toISOString(),
    };
    this.data.sessions.push(session);
    this.save();
    return session;
  }

  getSessionByTokenHash(tokenHash: string): UserSession | undefined {
    const now = new Date().toISOString();
    const session = this.data.sessions.find(s => s.tokenHash === tokenHash && s.expiresAt > now);
    return session;
  }

  deleteSession(tokenHash: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.tokenHash !== tokenHash);
    this.save();
  }

  deleteAllUserSessions(userId: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.userId !== userId);
    this.save();
  }

  // ----------------------------------------------------
  // ROLES & STAFF
  // ----------------------------------------------------
  getRoles(): Role[] {
    return this.data.roles;
  }

  getRoleById(id: string): Role | undefined {
    return this.data.roles.find(r => r.id === id);
  }

  getStaffProfile(userId: string): StaffProfile | undefined {
    return this.data.staffProfiles.find(s => s.userId === userId);
  }

  createStaffProfile(profile: StaffProfile): void {
    this.data.staffProfiles = this.data.staffProfiles.filter(s => s.userId !== profile.userId);
    this.data.staffProfiles.push(profile);
    this.save();
  }

  getStaffEffectivePermissions(userId: string): PermissionKey[] {
    const profile = this.getStaffProfile(userId);
    if (!profile) return [];
    const role = this.getRoleById(profile.roleId);
    if (!role) return [];

    const perms = new Set<PermissionKey>(role.defaultPermissions);
    profile.customGrantedPermissions.forEach(p => perms.add(p));
    profile.customRevokedPermissions.forEach(p => perms.delete(p));
    return Array.from(perms);
  }

  hasStaffPermission(userId: string, permission: PermissionKey): boolean {
    const perms = this.getStaffEffectivePermissions(userId);
    return perms.includes(permission);
  }

  // ----------------------------------------------------
  // PATIENT PROFILES
  // ----------------------------------------------------
  getAllPatientProfiles(): PatientProfile[] {
    return [...this.data.patientProfiles];
  }

  getPatientProfilesByUser(userId: string): PatientProfile[] {
    return this.data.patientProfiles.filter(p => p.managingUserId === userId);
  }

  getPatientProfileById(id: string): PatientProfile | undefined {
    return this.data.patientProfiles.find(p => p.id === id);
  }

  createPatientProfile(profile: Omit<PatientProfile, 'id' | 'createdAt' | 'updatedAt'>): PatientProfile {
    const newProfile: PatientProfile = {
      ...profile,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.patientProfiles.push(newProfile);
    this.save();
    return newProfile;
  }

  updatePatientProfile(id: string, updates: Partial<PatientProfile>): PatientProfile {
    const idx = this.data.patientProfiles.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Patient profile not found');
    this.data.patientProfiles[idx] = {
      ...this.data.patientProfiles[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.patientProfiles[idx];
  }

  // ----------------------------------------------------
  // CLAIM CODES
  // ----------------------------------------------------
  createClaimCode(profileId: string, codeHash: string, expiresAt: string, staffId: string): ClaimCode {
    const claim: ClaimCode = {
      id: crypto.randomUUID(),
      profileId,
      codeHash,
      expiresAt,
      createdByStaffId: staffId,
      createdAt: new Date().toISOString(),
    };
    this.data.claimCodes.push(claim);
    this.save();
    return claim;
  }

  findValidClaimCode(codeHash: string): ClaimCode | undefined {
    const now = new Date().toISOString();
    return this.data.claimCodes.find(c => c.codeHash === codeHash && !c.usedAt && c.expiresAt > now);
  }

  markClaimCodeUsed(id: string): void {
    const claim = this.data.claimCodes.find(c => c.id === id);
    if (claim) {
      claim.usedAt = new Date().toISOString();
      this.save();
    }
  }

  // ----------------------------------------------------
  // AUDIT LOG (APPEND ONLY)
  // ----------------------------------------------------
  addAuditLog(entry: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
    const log: AuditLog = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(log); // newest first
    // Limit log size in dev storage if needed
    if (this.data.auditLogs.length > 5000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 5000);
    }
    this.save();
    return log;
  }

  getAuditLogs(limit: number = 100): AuditLog[] {
    return this.data.auditLogs.slice(0, limit);
  }

  // ----------------------------------------------------
  // SETTINGS & RATE LIMITS
  // ----------------------------------------------------
  getSetting<T = any>(key: string): T {
    const val = this.data.clinicSettings[key];
    if (val !== undefined && val !== null && val !== '') {
      return val as T;
    }
    return (DEFAULT_SETTINGS[key] !== undefined ? DEFAULT_SETTINGS[key] : val) as T;
  }

  getAllSettings(): Record<string, any> {
    return { ...DEFAULT_SETTINGS, ...this.data.clinicSettings };
  }

  updateSettings(updates: Record<string, any>): void {
    this.data.clinicSettings = {
      ...this.data.clinicSettings,
      ...updates,
    };
    this.save();
  }

  // ----------------------------------------------------
  // DOCTORS & SCHEDULES
  // ----------------------------------------------------
  getDoctors(onlyActive: boolean = false): Doctor[] {
    if (onlyActive) {
      return this.data.doctors.filter(d => d.isActive);
    }
    return [...this.data.doctors];
  }

  getDoctorById(id: string): Doctor | undefined {
    return this.data.doctors.find(d => d.id === id);
  }

  getDoctorBySlug(slug: string): Doctor | undefined {
    return this.data.doctors.find(d => d.slug.toLowerCase() === slug.toLowerCase());
  }

  upsertDoctor(doctor: Omit<Doctor, 'id' | 'createdAt'> & { id?: string }): Doctor {
    if (doctor.id) {
      const idx = this.data.doctors.findIndex(d => d.id === doctor.id);
      if (idx !== -1) {
        this.data.doctors[idx] = {
          ...this.data.doctors[idx],
          ...doctor,
        };
        this.save();
        return this.data.doctors[idx];
      }
    }
    const newDoc: Doctor = {
      ...doctor,
      id: doctor.id || crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.data.doctors.push(newDoc);
    this.save();
    return newDoc;
  }

  getDoctorSchedules(doctorId: string): DoctorSchedule[] {
    return this.data.doctorSchedules.filter(s => s.doctorId === doctorId);
  }

  setDoctorSchedules(doctorId: string, schedules: Omit<DoctorSchedule, 'id' | 'doctorId'>[]): void {
    this.data.doctorSchedules = this.data.doctorSchedules.filter(s => s.doctorId !== doctorId);
    schedules.forEach(s => {
      this.data.doctorSchedules.push({
        id: crypto.randomUUID(),
        doctorId,
        ...s,
      });
    });
    this.save();
  }

  getDoctorUnavailabilities(doctorId: string): DoctorUnavailability[] {
    return this.data.doctorUnavailabilities.filter(u => u.doctorId === doctorId);
  }

  addDoctorUnavailability(entry: Omit<DoctorUnavailability, 'id'>): DoctorUnavailability {
    const newEntry: DoctorUnavailability = {
      id: crypto.randomUUID(),
      ...entry,
    };
    this.data.doctorUnavailabilities.push(newEntry);
    this.save();
    return newEntry;
  }

  deleteDoctorUnavailability(id: string): void {
    this.data.doctorUnavailabilities = this.data.doctorUnavailabilities.filter(u => u.id !== id);
    this.save();
  }

  // ----------------------------------------------------
  // MEDICAL SERVICES
  // ----------------------------------------------------
  getMedicalServices(onlyActive: boolean = false): MedicalService[] {
    if (onlyActive) {
      return this.data.medicalServices.filter(s => s.isActive);
    }
    return [...this.data.medicalServices];
  }

  getMedicalServiceById(id: string): MedicalService | undefined {
    return this.data.medicalServices.find(s => s.id === id);
  }

  getMedicalServiceBySlug(slug: string): MedicalService | undefined {
    return this.data.medicalServices.find(s => s.slug.toLowerCase() === slug.toLowerCase());
  }

  upsertMedicalService(service: Omit<MedicalService, 'id' | 'createdAt'> & { id?: string }): MedicalService {
    if (service.id) {
      const idx = this.data.medicalServices.findIndex(s => s.id === service.id);
      if (idx !== -1) {
        this.data.medicalServices[idx] = {
          ...this.data.medicalServices[idx],
          ...service,
        };
        this.save();
        return this.data.medicalServices[idx];
      }
    }
    const newServ: MedicalService = {
      ...service,
      id: service.id || crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.data.medicalServices.push(newServ);
    this.save();
    return newServ;
  }

  // ----------------------------------------------------
  // LAB CATEGORIES & LAB TESTS
  // ----------------------------------------------------
  getLabCategories(): LabTestCategory[] {
    return [...this.data.labCategories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  upsertLabCategory(category: Omit<LabTestCategory, 'id'> & { id?: string }): LabTestCategory {
    if (category.id) {
      const idx = this.data.labCategories.findIndex(c => c.id === category.id);
      if (idx !== -1) {
        this.data.labCategories[idx] = { ...this.data.labCategories[idx], ...category };
        this.save();
        return this.data.labCategories[idx];
      }
    }
    const newCat: LabTestCategory = {
      ...category,
      id: category.id || crypto.randomUUID(),
    };
    this.data.labCategories.push(newCat);
    this.save();
    return newCat;
  }

  getLabTests(onlyActive: boolean = false, categoryId?: string): LabTest[] {
    let tests = [...this.data.labTests];
    if (onlyActive) {
      tests = tests.filter(t => t.isActive);
    }
    if (categoryId) {
      tests = tests.filter(t => t.categoryId === categoryId);
    }
    return tests;
  }

  getLabTestById(id: string): LabTest | undefined {
    return this.data.labTests.find(t => t.id === id);
  }

  getLabTestBySlug(slug: string): LabTest | undefined {
    return this.data.labTests.find(t => t.slug.toLowerCase() === slug.toLowerCase());
  }

  upsertLabTest(test: Omit<LabTest, 'id' | 'createdAt'> & { id?: string }): LabTest {
    if (test.id) {
      const idx = this.data.labTests.findIndex(t => t.id === test.id);
      if (idx !== -1) {
        this.data.labTests[idx] = { ...this.data.labTests[idx], ...test };
        this.save();
        return this.data.labTests[idx];
      }
    }
    const newTest: LabTest = {
      ...test,
      id: test.id || crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.data.labTests.push(newTest);
    this.save();
    return newTest;
  }

  // ----------------------------------------------------
  // BOOKINGS (APPOINTMENTS & LAB BOOKINGS)
  // ----------------------------------------------------
  generateReferenceNo(prefix: string = 'OSA'): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude 0, 1, I, O for readability
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const ref = `${prefix}-${code}`;
    // Check collision
    const aptExists = this.data.appointments.some(a => a.referenceNo === ref);
    const labExists = this.data.labBookings.some(l => l.referenceNo === ref);
    if (aptExists || labExists) {
      return this.generateReferenceNo(prefix);
    }
    return ref;
  }

  // Check database-level non-overlapping conflict for doctor appointments (Section 7)
  checkDoctorAppointmentConflict(
    doctorId: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): { hasConflict: boolean; conflictingAppointment?: Appointment } {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    // Check confirmed appointments for the same doctor
    const conflict = this.data.appointments.find(a => {
      if (a.id === excludeAppointmentId) return false;
      if (a.doctorId !== doctorId) return false;
      if (a.status !== 'confirmed') return false;

      const aStart = new Date(a.startTime).getTime();
      const aEnd = new Date(a.endTime).getTime();
      // Overlap condition: start < aEnd AND end > aStart
      return start < aEnd && end > aStart;
    });

    if (conflict) {
      return { hasConflict: true, conflictingAppointment: conflict };
    }

    // Check doctor unavailability dates
    const unavail = this.data.doctorUnavailabilities.find(u => {
      if (u.doctorId !== doctorId) return false;
      const uStart = new Date(u.startDatetime).getTime();
      const uEnd = new Date(u.endDatetime).getTime();
      return start < uEnd && end > uStart;
    });

    if (unavail) {
      return { hasConflict: true };
    }

    return { hasConflict: false };
  }

  createAppointment(apt: Omit<Appointment, 'id' | 'referenceNo' | 'createdAt' | 'updatedAt'>): Appointment {
    const newApt: Appointment = {
      ...apt,
      id: crypto.randomUUID(),
      referenceNo: this.generateReferenceNo('OSA'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.appointments.push(newApt);
    this.save();
    return newApt;
  }

  getAppointmentById(id: string): Appointment | undefined {
    return this.data.appointments.find(a => a.id === id);
  }

  getAppointmentByReference(ref: string): Appointment | undefined {
    return this.data.appointments.find(a => a.referenceNo.toUpperCase() === ref.toUpperCase());
  }

  getAppointmentsByProfileIds(profileIds: string[]): Appointment[] {
    return this.data.appointments
      .filter(a => profileIds.includes(a.profileId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllAppointments(): Appointment[] {
    return [...this.data.appointments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment {
    const idx = this.data.appointments.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Appointment not found');
    this.data.appointments[idx] = {
      ...this.data.appointments[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.appointments[idx];
  }

  createLabBooking(
    booking: Omit<LabBooking, 'id' | 'referenceNo' | 'createdAt' | 'updatedAt'>,
    items: Omit<LabBookingItem, 'id' | 'labBookingId'>[]
  ): { booking: LabBooking; items: LabBookingItem[] } {
    const bookingId = crypto.randomUUID();
    const referenceNo = this.generateReferenceNo('OSL');

    const newBooking: LabBooking = {
      ...booking,
      id: bookingId,
      referenceNo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newItems: LabBookingItem[] = items.map(item => ({
      ...item,
      id: crypto.randomUUID(),
      labBookingId: bookingId,
    }));

    this.data.labBookings.push(newBooking);
    this.data.labBookingItems.push(...newItems);
    this.save();
    return { booking: newBooking, items: newItems };
  }

  getLabBookingById(id: string): LabBooking | undefined {
    return this.data.labBookings.find(l => l.id === id);
  }

  getLabBookingByReference(ref: string): LabBooking | undefined {
    return this.data.labBookings.find(l => l.referenceNo.toUpperCase() === ref.toUpperCase());
  }

  getLabBookingItems(bookingId: string): LabBookingItem[] {
    return this.data.labBookingItems.filter(i => i.labBookingId === bookingId);
  }

  getLabBookingsByProfileIds(profileIds: string[]): LabBooking[] {
    return this.data.labBookings
      .filter(l => profileIds.includes(l.profileId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllLabBookings(): LabBooking[] {
    return [...this.data.labBookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  updateLabBooking(id: string, updates: Partial<LabBooking>): LabBooking {
    const idx = this.data.labBookings.findIndex(l => l.id === id);
    if (idx === -1) throw new Error('Lab booking not found');
    this.data.labBookings[idx] = {
      ...this.data.labBookings[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.labBookings[idx];
  }

  // ----------------------------------------------------
  // BOOKING STATUS HISTORY (EVENTS)
  // ----------------------------------------------------
  addBookingStatusEvent(event: Omit<BookingStatusEvent, 'id' | 'createdAt'>): BookingStatusEvent {
    const newEvent: BookingStatusEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.data.bookingStatusEvents.push(newEvent);
    this.save();
    return newEvent;
  }

  getBookingStatusEvents(bookingId: string): BookingStatusEvent[] {
    return this.data.bookingStatusEvents
      .filter(e => e.bookingId === bookingId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  countPatientOpenRequests(userId: string): number {
    const profiles = this.getPatientProfilesByUser(userId);
    const profileIds = profiles.map(p => p.id);

    const openAppointments = this.data.appointments.filter(
      a => profileIds.includes(a.profileId) && (a.status === 'pending' || a.status === 'reschedule_proposed')
    ).length;

    const openLabs = this.data.labBookings.filter(
      l => profileIds.includes(l.profileId) && (l.status === 'pending' || l.status === 'reschedule_proposed')
    ).length;

    return openAppointments + openLabs;
  }

  // ----------------------------------------------------
  // CLINIC CLOSURES
  // ----------------------------------------------------
  getClinicClosures(): ClinicClosure[] {
    return [...this.data.clinicClosures];
  }

  addClinicClosure(closure: Omit<ClinicClosure, 'id'>): ClinicClosure {
    const newClosure: ClinicClosure = {
      id: crypto.randomUUID(),
      ...closure,
    };
    this.data.clinicClosures.push(newClosure);
    this.save();
    return newClosure;
  }

  deleteClinicClosure(id: string): void {
    this.data.clinicClosures = this.data.clinicClosures.filter(c => c.id !== id);
    this.save();
  }

  checkRateLimit(key: string, maxHits: number, windowSeconds: number): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const existing = this.data.rateLimits[key];

    if (!existing || new Date(existing.resetAt).getTime() < now) {
      this.data.rateLimits[key] = {
        key,
        hits: 1,
        resetAt: new Date(now + windowSeconds * 1000).toISOString(),
      };
      this.save();
      return { allowed: true, remaining: maxHits - 1 };
    }

    if (existing.hits >= maxHits) {
      return { allowed: false, remaining: 0 };
    }

    existing.hits += 1;
    this.save();
    return { allowed: true, remaining: maxHits - existing.hits };
  }

  // ----------------------------------------------------
  // LAB REPORTS (STAGE 4)
  // ----------------------------------------------------
  createLabReport(report: Omit<LabReport, 'id' | 'createdAt'>): LabReport {
    const newReport: LabReport = {
      ...report,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.data.labReports.push(newReport);
    this.save();
    return newReport;
  }

  getLabReportById(id: string): LabReport | undefined {
    return this.data.labReports.find(r => r.id === id);
  }

  getLabReportsByBookingId(bookingId: string): LabReport[] {
    return this.data.labReports
      .filter(r => r.labBookingId === bookingId)
      .sort((a, b) => b.version - a.version);
  }

  getLabReportsByProfileIds(profileIds: string[]): LabReport[] {
    return this.data.labReports
      .filter(r => profileIds.includes(r.profileId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllLabReports(): LabReport[] {
    return [...this.data.labReports].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  updateLabReport(id: string, updates: Partial<LabReport>): LabReport {
    const idx = this.data.labReports.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Lab report not found');
    this.data.labReports[idx] = {
      ...this.data.labReports[idx],
      ...updates,
    };
    this.save();
    return this.data.labReports[idx];
  }

  supersedePreviousReports(bookingId: string, currentReportId: string): void {
    let changed = false;
    for (const r of this.data.labReports) {
      if (r.labBookingId === bookingId && r.id !== currentReportId && r.status === 'released') {
        r.status = 'superseded';
        changed = true;
      }
    }
    if (changed) this.save();
  }

  // ----------------------------------------------------
  // ADDITIONAL CLAIM CODE LOOKUPS
  // ----------------------------------------------------
  getClaimCodesByProfileId(profileId: string): ClaimCode[] {
    return this.data.claimCodes
      .filter(c => c.profileId === profileId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllClaimCodes(): ClaimCode[] {
    return [...this.data.claimCodes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // ----------------------------------------------------
  // HEALTH ARTICLES (STAGE 5)
  // ----------------------------------------------------
  getArticles(onlyPublished: boolean = false): HealthArticle[] {
    if (onlyPublished) {
      return this.data.articles.filter(a => a.status === 'published');
    }
    return [...this.data.articles].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getArticleBySlug(slug: string): HealthArticle | undefined {
    return this.data.articles.find(a => a.slug.toLowerCase() === slug.toLowerCase());
  }

  getArticleById(id: string): HealthArticle | undefined {
    return this.data.articles.find(a => a.id === id);
  }

  upsertArticle(article: Omit<HealthArticle, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): HealthArticle {
    if (article.id) {
      const idx = this.data.articles.findIndex(a => a.id === article.id);
      if (idx !== -1) {
        this.data.articles[idx] = {
          ...this.data.articles[idx],
          ...article,
          id: article.id,
          updatedAt: new Date().toISOString(),
        };
        this.save();
        return this.data.articles[idx];
      }
    }

    const newArticle: HealthArticle = {
      ...article,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.articles.unshift(newArticle);
    this.save();
    return newArticle;
  }

  deleteArticle(id: string): void {
    this.data.articles = this.data.articles.filter(a => a.id !== id);
    this.save();
  }

  // ----------------------------------------------------
  // TOKEN LOOKUPS (public methods to avoid private .data access)
  // ----------------------------------------------------
  getUserByVerificationTokenHash(tokenHash: string): User | undefined {
    return this.data.users.find(u => u.verificationTokenHash === tokenHash);
  }

  getUserByPasswordResetTokenHash(tokenHash: string): User | undefined {
    const now = new Date().toISOString();
    return this.data.users.find(
      u => u.resetTokenHash === tokenHash && u.resetTokenExpiresAt && u.resetTokenExpiresAt > now
    );
  }

  /** DEV ONLY — reset a user's password directly (never call in production) */
  devResetUserPassword(email: string, newPasswordHash: string): boolean {
    if (process.env.APP_ENV === 'production') return false;
    const user = this.getUserByEmail(email);
    if (!user) return false;
    this.updateUser(user.id, { passwordHash: newPasswordHash });
    return true;
  }

  /** DEV ONLY — mark a user's email as verified (never call in production) */
  devVerifyUserEmail(email: string): boolean {
    if (process.env.APP_ENV === 'production') return false;
    const user = this.getUserByEmail(email);
    if (!user) return false;
    this.updateUser(user.id, { emailVerifiedAt: new Date().toISOString(), verificationTokenHash: null });
    return true;
  }
}

// Global singleton instance
const globalForDb = global as unknown as { dbInstance?: PersistentDatabase };
export const db = globalForDb.dbInstance || new PersistentDatabase();
if (process.env.NODE_ENV !== 'production') {
  globalForDb.dbInstance = db;
}
