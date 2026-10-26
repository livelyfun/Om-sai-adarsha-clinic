-- Om Sai Aadarsha Clinic - PostgreSQL Production DDL Schema
-- Enforces referential integrity, status state rules, and exclusion constraints

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Users (Identity for both patients and staff)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'staff')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  email_verified_at TIMESTAMPTZ,
  verification_token_hash TEXT,
  reset_token_hash TEXT,
  reset_token_expires_at TIMESTAMPTZ,
  preferred_locale TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Roles and Staff Profiles
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  default_permissions JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS staff_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles(id),
  full_name TEXT NOT NULL,
  custom_granted_permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  custom_revoked_permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Patient Profiles (Self and Family Members)
CREATE TABLE IF NOT EXISTS patient_profiles (
  id TEXT PRIMARY KEY,
  managing_user_id TEXT REFERENCES users(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL,
  dob DATE,
  sex TEXT,
  phone TEXT,
  relationship_label TEXT NOT NULL DEFAULT 'myself',
  identity_verified_at TIMESTAMPTZ,
  verified_by_staff_id TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Claim Codes for Walk-in Patient Profiles
CREATE TABLE IF NOT EXISTS claim_codes (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  code_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_by_staff_id TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Doctors, Schedules, and Unavailability
CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ne TEXT NOT NULL,
  photo_url TEXT,
  qualifications_en TEXT,
  qualifications_ne TEXT,
  specialty_en TEXT NOT NULL,
  specialty_ne TEXT NOT NULL,
  bio_en TEXT,
  bio_ne TEXT,
  consultation_fee INTEGER NOT NULL DEFAULT 0,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 20,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctor_schedules (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time_minutes INTEGER NOT NULL, -- e.g. 9:00 = 540
  end_time_minutes INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS doctor_unavailabilities (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT
);

-- Medical Services
CREATE TABLE IF NOT EXISTS medical_services (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ne TEXT NOT NULL,
  description_en TEXT,
  description_ne TEXT,
  fee INTEGER NOT NULL DEFAULT 0,
  booking_mode TEXT NOT NULL CHECK (booking_mode IN ('request', 'informational')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_questions (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL REFERENCES medical_services(id) ON DELETE CASCADE,
  question_en TEXT NOT NULL,
  question_ne TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text',
  is_required BOOLEAN NOT NULL DEFAULT false,
  options_json JSONB
);

-- Lab Test Categories and Tests
CREATE TABLE IF NOT EXISTS lab_test_categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ne TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lab_tests (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES lab_test_categories(id),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ne TEXT NOT NULL,
  description_en TEXT,
  description_ne TEXT,
  prep_instructions_en TEXT,
  prep_instructions_ne TEXT,
  sample_type_en TEXT,
  sample_type_ne TEXT,
  price INTEGER, -- Null means "Price confirmed by the clinic"
  is_home_collection_available BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Doctor / Service Appointments (Request-based)
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  reference_no TEXT UNIQUE NOT NULL,
  profile_id TEXT NOT NULL REFERENCES patient_profiles(id) ON DELETE RESTRICT,
  doctor_id TEXT REFERENCES doctors(id) ON DELETE RESTRICT,
  service_id TEXT REFERENCES medical_services(id) ON DELETE RESTRICT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'reschedule_proposed', 'declined', 'cancelled', 'completed', 'no_show')),
  doctor_name_snapshot TEXT,
  fee_snapshot INTEGER NOT NULL DEFAULT 0,
  patient_notes TEXT,
  patient_message TEXT,
  internal_note TEXT,
  service_answers_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exclusion constraint to guarantee no overlapping confirmed appointments for the same doctor
ALTER TABLE appointments ADD CONSTRAINT no_overlapping_confirmed_appointments
EXCLUDE USING gist (
  doctor_id WITH =,
  tstzrange(start_time, end_time) WITH &&
) WHERE (status = 'confirmed');

-- Lab Bookings (Multi-test requests)
CREATE TABLE IF NOT EXISTS lab_bookings (
  id TEXT PRIMARY KEY,
  reference_no TEXT UNIQUE NOT NULL,
  profile_id TEXT NOT NULL REFERENCES patient_profiles(id) ON DELETE RESTRICT,
  preferred_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'reschedule_proposed', 'declined', 'cancelled', 'completed', 'no_show')),
  estimated_total INTEGER NOT NULL DEFAULT 0,
  patient_notes TEXT,
  patient_message TEXT,
  internal_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id, profile_id) -- Enables composite foreign key from lab_reports
);

CREATE TABLE IF NOT EXISTS lab_booking_items (
  id TEXT PRIMARY KEY,
  lab_booking_id TEXT NOT NULL REFERENCES lab_bookings(id) ON DELETE CASCADE,
  lab_test_id TEXT NOT NULL REFERENCES lab_tests(id),
  name_en_snapshot TEXT NOT NULL,
  name_ne_snapshot TEXT NOT NULL,
  price_snapshot INTEGER,
  prep_instructions_snapshot TEXT
);

-- Laboratory Reports (Delivered finished PDF files)
CREATE TABLE IF NOT EXISTS lab_reports (
  id TEXT PRIMARY KEY,
  lab_booking_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('draft', 'released', 'revoked', 'superseded')),
  storage_key TEXT UNIQUE NOT NULL,
  original_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  checksum_sha256 TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  uploaded_by_staff_id TEXT NOT NULL REFERENCES users(id),
  confirmed_at TIMESTAMPTZ NOT NULL,
  confirmed_by_staff_id TEXT NOT NULL REFERENCES users(id),
  released_at TIMESTAMPTZ,
  released_by_staff_id TEXT REFERENCES users(id),
  revoked_at TIMESTAMPTZ,
  revoked_by_staff_id TEXT REFERENCES users(id),
  revoke_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_report_booking_profile FOREIGN KEY (lab_booking_id, profile_id) REFERENCES lab_bookings(id, profile_id)
);

-- Booking Status Events (Auditable state transitions)
CREATE TABLE IF NOT EXISTS booking_status_events (
  id TEXT PRIMARY KEY,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('appointment', 'lab')),
  booking_id TEXT NOT NULL,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('patient', 'staff', 'system')),
  actor_user_id TEXT,
  patient_message TEXT,
  internal_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Website Content & Settings
CREATE TABLE IF NOT EXISTS clinic_settings (
  key TEXT PRIMARY KEY,
  value_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by_staff_id TEXT REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS clinic_closures (
  id TEXT PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason_en TEXT,
  reason_ne TEXT
);

CREATE TABLE IF NOT EXISTS website_articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_ne TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_ne TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'in_review', 'published')),
  reviewed_by_name TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS website_faqs (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'general',
  question_en TEXT NOT NULL,
  question_ne TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  answer_ne TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true
);

-- Append-Only Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  actor_email TEXT,
  actor_type TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  request_id TEXT,
  ip_address TEXT,
  metadata_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rate Limiting
CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  key TEXT PRIMARY KEY,
  hits INTEGER NOT NULL DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL
);

-- Indexes for performance & security
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_profiles_managing_user ON patient_profiles(managing_user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_profile ON appointments(profile_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_ref ON appointments(reference_no);
CREATE INDEX IF NOT EXISTS idx_lab_bookings_profile ON lab_bookings(profile_id);
CREATE INDEX IF NOT EXISTS idx_lab_bookings_ref ON lab_bookings(reference_no);
CREATE INDEX IF NOT EXISTS idx_lab_reports_profile ON lab_reports(profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
