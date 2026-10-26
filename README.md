# Om Sai Aadarsha Clinic (ॐ साई आदर्श क्लिनिक)
**Bilingual Healthcare Portal, Request-Based Booking System & Clinic Management CMS**

---

## 1. Overview
Om Sai Aadarsha Clinic is a full-stack healthcare web application built for outpatient care, request-based doctor appointment bookings, diagnostic lab tests, and secure, authenticated laboratory report delivery.

The system features three unified surfaces backed by a single relational database and server-side authorization layer:
1. **Public Bilingual Website** (`/en/*` and `/ne/*`): Server-rendered pages with English and Nepali (नेपाली), request-based booking hub, searchable doctors, medical services, and categorized lab test catalogue.
2. **Patient Portal** (`/[locale]/portal/*`): Self-registration, email verification, password reset, multi-profile family management (up to 6 profiles per account), booking request tracking, and authenticated PDF lab report downloads.
3. **Private Staff CMS** (`/sai-clinic-management`): Server-protected clinical operations for Reception and Super Admin: schedule conflict resolution, booking state management, unlinked walk-in profile claiming, lab report upload/verification/release, and audit log inspection.

---

## 2. Quick Start & Setup

### Prerequisites
- Node.js v20+ or v22+
- npm or bun

### Installation
```bash
# Clone the repository and enter directory
git clone <repo-url>
cd om-sai-aadarsha-clinic

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Run the development server
npm run dev
```

Visit:
- **Public Site (English):** [http://localhost:3000/en](http://localhost:3000/en)
- **Public Site (Nepali):** [http://localhost:3000/ne](http://localhost:3000/ne)
- **Patient Portal:** [http://localhost:3000/en/portal/login](http://localhost:3000/en/portal/login)
- **Staff CMS:** [http://localhost:3000/sai-clinic-management/login](http://localhost:3000/sai-clinic-management/login)

---

## 3. Super Admin Bootstrap & Seed Data

### Initial Super Admin Creation
Run the one-time bootstrap to create the first Super Admin:
```bash
# In development, trigger the bootstrap via API or visit:
curl -X POST http://localhost:3000/api/admin/bootstrap
```
Default credentials from `.env.example`:
- **Email:** `admin@omsaiclinic.local`
- **Password:** `ChangeMeImmediately123!`
*(The system automatically flags this account with `mustChangePassword: true` on first login and refuses to run if a Super Admin already exists).*

### Seeding Development Sample Records
```bash
# Programmatic seed (never runs in production)
npm run seed:dev
```
Seeded test accounts:
- **Reception Staff:** `reception@omsaiclinic.local` / `ReceptionPass123!`
- **Sample Verified Patient:** `patient.test@example.local` / `PatientPass123!`

---

## 4. Integration Boundaries & Status

In accordance with Section 4, external cloud infrastructure is cleanly separated via interfaces and labeled with exact operational status:

| Capability | Current Status | Development Fallback | Production Configuration Required |
| :--- | :--- | :--- | :--- |
| **Relational Database** | `CONFIGURED` / Dev Persistent | Local persistent JSON store (`/data/clinic_dev.json`) | Provide `DATABASE_URL` connecting to Cloud SQL (PostgreSQL). Schema defined in `/lib/db/schema.sql`. |
| **Report Storage** | `DEVELOPMENT_LOCAL_NOT_FOR_PRODUCTION` | Local non-public directory `/storage/secure-reports/` | **NOT CONFIGURED** for production. Supply GCS bucket or S3 credentials in `.env`. Container hosts run on ephemeral disks! |
| **Authentication Email** | `DEVELOPMENT_CONSOLE` | Action links printed directly to server console | **NOT CONFIGURED** for production. Provide `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` or transactional API provider. |
| **Malware Scanning** | `NOT CONFIGURED` | File magic-byte (`%PDF-`) and size limit (10MB) checks | External ClamAV or Cloud Function virus scanner required. |

---

## 5. Security & Architecture Controls
- **Zero Client-Side Authorization:** Every server read and write strictly checks user session and role permissions.
- **Patient Isolation:** Every patient query filters by `managing_user_id`. Attempting to access another patient's booking or report returns `HTTP 404 Not Found`.
- **Anti-Enumeration:** Authentication endpoints (login, register, forgot-password) return uniform messages regardless of whether an email exists.
- **Rate Limiting:** Shared database rate-limiting counters prevent brute-force attacks across clustered instances.
- **CMS Privacy:** `/sai-clinic-management` is excluded from navigation, sitemaps, and robots.txt, and sends `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: no-store`.

---

## 6. Testing & Stage 1 Acceptance Verification
Run the automated test suite verifying all Foundation criteria:
```bash
# Execute Stage 1 test verification endpoint
curl http://localhost:3000/api/test/stage1-verification
```
Tested properties include:
- Password hashing & constant-time validation.
- One-time Super Admin bootstrap and re-run refusal.
- Patient account self-registration and primary profile generation.
- Email verification lifecycle.
- Password reset and session invalidation.
- Staff vs patient role separation on `/sai-clinic-management`.
- Append-only audit logging.
- English and Nepali message bundle completeness.

---

## 7. Documentation Index
- `docs/OPEN-REQUIREMENTS.md` — Clinic facts checklist and placeholder behavior register.
- `docs/TRANSLATION-REVIEW.md` — Complete register of drafted Nepali strings for native speaker review.
- `docs/TESTING.md` — Testing scripts, security assertions, and manual verification procedures.

---
*Built for Om Sai Aadarsha Clinic.*
