# Om Sai Aadarsha Clinic (ॐ साई आदर्श क्लिनिक)

**Bilingual Healthcare Portal · Request-Based Booking · Lab Diagnostics · Patient Portal · Staff CMS**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![License: Private](https://img.shields.io/badge/License-Private-red)](#)

---

## Overview

Om Sai Aadarsha Clinic is a production-ready, full-stack healthcare web application built for a real outpatient clinic in Nepal. It supports bilingual (English + Nepali) navigation, request-based appointment bookings, searchable lab test and services catalogues, secure digital lab report delivery, and a private staff content management system.

### Three unified surfaces

| Surface | URL pattern | Who uses it |
|---------|------------|-------------|
| **Public Website** | `/en/*` and `/ne/*` | Patients, visitors |
| **Patient Portal** | `/[locale]/portal/*` | Registered patients |
| **Staff CMS** | `/sai-clinic-management/*` | Reception, Super Admin |

---

## Features

### Public Website
- **Bilingual**: Full English / नेपाली toggle on every page
- **Auto-hide Navbar**: Slides out on scroll-down, returns on scroll-up; sticky at page top
- **Hero Section**: Editorial headline, live clinic status card, quick-access dock
- **Doctor Directory**: Searchable / filterable by specialty with schedule + booking links
- **Medical Services**: Categorised cards with pricing and booking mode
- **Lab Test Catalogue**: Full test list with categories, pricing, preparation instructions
- **Health Articles**: Doctor-authored patient education content
- **Contact & FAQ**: Clinic hours, address, Facebook link, bilingual FAQ accordion

### Patient Portal
- Self-registration with email verification
- Secure login with password reset
- Multi-profile family management (up to 6 profiles per account)
- Booking request tracking with status updates
- Authenticated PDF lab report downloads
- Walk-in claim code to link counter tests to account

### Staff CMS (`/sai-clinic-management`)
- Reception and Super Admin roles
- Booking queue management with schedule conflict resolution
- Doctor schedule management
- Lab report upload → verify → release workflow
- Walk-in profile claiming
- Append-only audit log
- Full content management: doctors, services, lab tests, articles, clinic settings

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Server Components) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (custom design system) |
| Database | PostgreSQL via Neon (dev: local JSON store) |
| Auth | Custom session-based (bcrypt + iron-session) |
| Storage | Local (dev) · GCS / S3 (prod) |
| Email | Console (dev) · SMTP / Resend (prod) |
| i18n | Custom message bundles (EN + NE) |
| Deployment | Vercel |

---

## Quick Start

### Prerequisites
- Node.js v20+ or v22+
- npm or bun

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd om-sai-aadarsha-clinic

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Run the development server
npm run dev
```

### URLs in development
| Page | URL |
|------|-----|
| Public site (English) | http://localhost:3000/en |
| Public site (Nepali) | http://localhost:3000/ne |
| Patient Portal | http://localhost:3000/en/portal/login |
| Staff CMS | http://localhost:3000/sai-clinic-management/login |

---

## Environment Variables

Copy `.env.example` → `.env` and configure:

```env
APP_ENV="development"
APP_URL="http://localhost:3000"

# Generate with: openssl rand -base64 32
SESSION_SECRET="<32-char-random-secret>"

# Leave blank in development (uses local JSON store)
DATABASE_URL=""

# Bootstrap credentials
BOOTSTRAP_ADMIN_EMAIL="admin@omsaiclinic.local"
BOOTSTRAP_ADMIN_PASSWORD="ChangeMeImmediately123!"

# Storage: local | gcs | s3
STORAGE_PROVIDER="local"

# Email: console | smtp | resend
EMAIL_PROVIDER="console"
```

See `credentials.md` (gitignored) for full secrets reference.

---

## Database Bootstrap & Seed

### Bootstrap Super Admin (one-time)
```bash
curl -X POST http://localhost:3000/api/admin/bootstrap
```
This creates the first Super Admin from `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD`. Fails safely if an admin already exists.

### Seed Dev Data
```bash
npm run seed:dev
```
Seeds sample doctors, services, lab tests, articles, and test accounts:
- Reception: `reception@omsaiclinic.local` / `ReceptionPass123!`
- Patient: `patient.test@example.local` / `PatientPass123!`

---

## Deployment

### Vercel + Neon (Recommended)

#### 1. Create Neon Database
```bash
# Authenticate
neon auth

# Create project (Mumbai region for Nepal latency)
neon projects create --name om-sai-clinic-db --region-id aws-ap-south-1

# Get connection string
neon connection-string
```

Apply schema:
```bash
psql "$DATABASE_URL" -f lib/db/schema.sql
```

#### 2. Deploy to Vercel
```bash
# Authenticate
vercel login

# Link and deploy (first time — follow prompts)
vercel

# Set required environment variables
vercel env add APP_ENV production
vercel env add APP_URL production
vercel env add SESSION_SECRET production
vercel env add DATABASE_URL production

# Deploy to production
vercel --prod
```

#### 3. Post-Deploy
```bash
# Bootstrap super admin on production
curl -X POST https://<your-domain>/api/admin/bootstrap
```

### Vercel Configuration (`vercel.json`)
```json
{
  "framework": "nextjs",
  "regions": ["sin1"],
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

---

## Project Structure

```
om-sai-aadarsha-clinic/
├── app/
│   ├── [locale]/            # Public bilingual pages (en/ne)
│   │   ├── page.tsx         # Homepage
│   │   ├── doctors/         # Doctor directory + profiles
│   │   ├── services/        # Medical services catalogue
│   │   ├── lab-tests/       # Lab test catalogue
│   │   ├── book/            # Booking request form
│   │   ├── explore/         # About, FAQ, Health articles
│   │   ├── portal/          # Patient portal (login, register, dashboard)
│   │   └── layout.tsx       # Navbar + Footer shell
│   ├── sai-clinic-management/ # Private Staff CMS
│   ├── api/                 # API routes
│   └── globals.css          # Design system (Tailwind v4)
├── components/
│   ├── public/              # Navbar, Footer, SectionHeading, etc.
│   ├── portal/              # Patient portal UI components
│   └── cms/                 # Staff CMS UI components
├── lib/
│   ├── auth/                # Authentication helpers
│   ├── db/                  # Database layer (JSON dev / Postgres prod)
│   │   ├── index.ts         # DB interface
│   │   ├── schema.sql       # PostgreSQL schema
│   │   ├── seed.ts          # Dev seed data
│   │   └── types.ts         # TypeScript types
│   ├── i18n/                # EN + NE message bundles
│   ├── bookings/            # Booking logic
│   ├── storage/             # File storage abstraction
│   └── email/               # Email provider abstraction
├── data/
│   └── clinic_dev.json      # Development persistent store
├── docs/
│   ├── OPEN-REQUIREMENTS.md # Clinic facts & placeholder register
│   ├── TESTING.md           # Test procedures
│   └── TRANSLATION-REVIEW.md # Nepali strings for review
├── .env.example             # Environment variable template
├── credentials.md           # ⚠️ Gitignored — local secrets only
└── vercel.json              # Vercel deployment config
```

---

## Security Architecture

- **Zero Client-Side Authorization**: Every read/write is server-authorized
- **Patient Isolation**: All queries filter by `managing_user_id` — cross-access returns 404
- **Anti-Enumeration**: Auth endpoints return identical messages regardless of email existence
- **Rate Limiting**: Database-backed counters prevent brute-force
- **CMS Privacy**: `/sai-clinic-management` excluded from sitemaps, robots.txt, and navigation; sends `X-Robots-Tag: noindex, nofollow, noarchive`
- **Session Security**: HTTPOnly cookies, SameSite=Strict, server-side invalidation on password change

---

## Integration Status

| Capability | Dev Status | Production |
|:-----------|:-----------|:-----------|
| Database | Local JSON store | Neon / Cloud SQL PostgreSQL |
| Lab Report Storage | Local `/storage/secure-reports/` | GCS / S3 bucket |
| Authentication Email | Console (links printed to terminal) | SMTP / Resend |
| Malware Scanning | Magic-byte + size check (10 MB) | ClamAV / Cloud Function |

---

## Documentation

| Doc | Description |
|-----|-------------|
| [`docs/OPEN-REQUIREMENTS.md`](docs/OPEN-REQUIREMENTS.md) | Clinic facts checklist and placeholder register |
| [`docs/TRANSLATION-REVIEW.md`](docs/TRANSLATION-REVIEW.md) | Nepali strings for native speaker review |
| [`docs/TESTING.md`](docs/TESTING.md) | Test scripts and security assertions |
| [`credentials.md`](credentials.md) | ⚠️ Gitignored — dev credentials and deployment secrets |

---

## Testing

### Stage 1 Verification
```bash
curl http://localhost:3000/api/test/stage1-verification
```

Tests: password hashing, bootstrap idempotency, registration & email verification, password reset, staff/patient role separation, audit logging, i18n bundle completeness.

---

## Development Notes

### Email Verification (Dev)
In development (`EMAIL_PROVIDER=console`), verification and password reset links are printed directly to the **Next.js server terminal** — check the terminal running `npm run dev`.

### Lab Reports (Dev)
Lab reports are stored in `storage/secure-reports/` (gitignored). In production, configure `STORAGE_PROVIDER` to use GCS or S3.

### Adding Translations
All bilingual strings live in `lib/i18n/`. Edit `en.ts` first, then mirror to `ne.ts`. Incomplete Nepali strings fall back gracefully to English in the UI.

---

*Built for Om Sai Aadarsha Clinic · Pokhara, Nepal*
