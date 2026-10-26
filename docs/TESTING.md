# Om Sai Aadarsha Clinic — Testing Plan & Verification Guide

This document records test suites, procedures, and test results for verifying core security, booking logic, authentication, localization, report delivery, and launch readiness acceptance criteria.

---

## Stage 1 Verification Suite (Foundation Acceptance)
- **Endpoint:** `/api/test/stage1-verification`
- **Criteria Covered:**
  - Patient self-registration, verification links, and email confirmation.
  - Cryptographic scrypt password hashing and generic enumeration prevention.
  - Sliding-window IP/identity rate limiting (HTTP 429 after 5 failed attempts).
  - Super admin bootstrap idempotency (refusal on subsequent runs).
  - Strict CMS route concealment & role-based server-side guards.
  - Immutable audit trail recording.

---

## Stage 2 Verification Suite (Catalogues & Public Site Acceptance)
- **Endpoint:** `/api/test/stage2-verification`
- **Criteria Covered:**
  - Doctors, medical services, and lab test catalogues persistence.
  - Translation status detection and bilingual fallback badge rendering (*"तल अंग्रेजी मूल विवरण प्रस्तुत गरिएको छ..."*).
  - Price display rule enforcement (unpriced tests display *"Price confirmed by the clinic"*).
  - Dynamic SEO sitemap and robots.txt generation strictly concealing `/sai-clinic-management`.

---

## Stage 3 Verification Suite (Bookings & Patient Dashboard Acceptance)
- **Endpoint:** `/api/test/stage3-verification`
- **Criteria Covered:**
  - Catalogue snapshot immutability on bookings (preserves fee, doctor name, and test names against catalog updates).
  - State machine transition validation and role permission checks (`pending` -> `confirmed`, `declined`, `reschedule_proposed`, `cancelled`).
  - Database-level overlapping appointment conflict constraint (`start < aEnd && end > aStart`).
  - Reschedule proposal and patient acceptance/decline flow.
  - Patient data isolation and profile boundary enforcement.
  - Terminal status lockout (no transitions permitted from `completed`, `cancelled`, `declined`, or `no_show`).

---

## Stage 4 Verification Suite (Laboratory Reports & Claim Codes Acceptance)
- **Endpoint:** `/api/test/stage4-verification`
- **Criteria Covered:**
  - PDF upload validation (magic bytes `%PDF-`, 10MB file limit, SHA-256 checksum).
  - Staff patient-matching confirmation checkbox (*"I have verified that this report belongs to this patient and booking"*).
  - Report lifecycle state transitions: `draft` -> `released` -> `superseded` / `revoked`.
  - Automatic version superseding when subsequent report versions are released.
  - Report revocation with mandatory reason, immediately withdrawing patient access.
  - Authenticated streaming download (`/api/reports/[id]/download`) enforcing profile ownership and audit logging.
  - Walk-in claim code generation (10-character code, SHA-256 hashed, 7-day expiration) and patient portal redemption.

---

## Stage 5 Verification Suite (Hardening, Content & Launch Gate Acceptance)
- **Endpoint:** `/api/test/stage5-verification`
- **Criteria Covered:**
  - Clinical health articles management with mandatory reviewer (doctor) attribution.
  - Public visibility isolation (draft articles concealed from public queries).
  - Strict security headers (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `X-Robots-Tag: noindex, nofollow` on CMS).
  - Append-only tamper resistance on audit logs (zero delete or update operations).
  - Production infrastructure boundaries (`reportStorage` and `sendAuthEmail` reporting clear status).
  - Sliding-window rate limit buckets.
  - Section 15 Launch Gate RBAC role hierarchy audit (Super Admin 13 permissions; Reception restricted from report release/revoke by default).

---

## Running Verification Suites
Execute in sequence against the local server:
```bash
curl -s http://localhost:3000/api/test/stage1-verification
curl -s http://localhost:3000/api/test/stage2-verification
curl -s http://localhost:3000/api/test/stage3-verification
curl -s http://localhost:3000/api/test/stage4-verification
curl -s http://localhost:3000/api/test/stage5-verification
```
