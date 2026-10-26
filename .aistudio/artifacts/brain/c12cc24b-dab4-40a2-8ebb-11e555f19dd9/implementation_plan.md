# CMS-First Clinic Information & Navbar Patient Portal Integration

## Title & Summary
Implement dynamic, CMS-configurable clinic information management across the application (address, verified phone, opening hours, Facebook page URL, emergency contact) with zero hardcoding, while repositioning the Patient Login / My Account link with a user icon in the rightmost corner of the top navigation bar.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Patient Account Positioning**: Confirmed by user as a clean text link with user icon positioned in the top-right corner of the navbar alongside the primary "Book a Session" action and language switcher.
> - **CMS-First Data Architecture (Zero Hardcoding)**: In accordance with the user's instruction (*"don't hardcode the content. content should be cms first crud should be possible"*), all clinic contact details, the official Facebook link (`https://www.facebook.com/p/Om-Sai-Aadarsha-Clinic-100084050983392/`), operating hours, emergency lines, and location addresses will be managed dynamically via CMS Settings (`/sai-clinic-management/settings`) and saved to persistent database storage.

---

## 1. Overview & Core Concept

- **What It Delivers**:
  1. **Top-Right Patient Access**: Places a clean, prominent text link with a user icon for "Patient Login / My Account" directly in the rightmost section of the public navigation bar across all screen sizes.
  2. **CMS-Managed Clinic Contact & Social Information**: Expands clinic settings to include the official Facebook page URL, opening hours (bilingual), emergency contact number, and WhatsApp link, with full CRUD editing in the admin panel.
  3. **Dynamic Public Display**: Updates the Footer, Homepage, Contact/About, and booking notices to read contact data, social links, and schedules dynamically from the CMS store rather than static placeholders.

---

## 2. User Experience & Visual Design

### Top Navigation Bar (Desktop)
```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Om Sai Aadarsha Clinic   Home  Doctors  Services  Lab Tests  Explore ▾               │
│                                           [नेपाली/EN]  👤 Patient Login  [Book a Session]  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```
- **Desktop Header**:
  - The right section contains: Language Switcher (`EN / नेपाली`), clean text link with a `User` icon (`👤 Patient Login` / `👤 बिरामी लगइन`), and the primary solid CTA button (`Book a Session` / `सेवा अनुरोध गर्नुहोस्`).
  - Active hover states with subtle teal transitions (`text-slate-700 hover:text-teal-800`).
- **Mobile Drawer**:
  - Direct account access card placed in the upper section of the mobile slide-out menu, accompanied by the primary booking CTA.

### Footer & Contact Surfaces
- **Official Social & Verified Contact Section**:
  - Clickable Facebook card linking to `https://www.facebook.com/p/Om-Sai-Aadarsha-Clinic-100084050983392/` with an official clinic badge.
  - Dynamically rendered operating hours (`settings.opening_hours_en` / `settings.opening_hours_ne`).
  - Verified phone, email, and location pin.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: CMS Settings Storage vs Static Code**
  - *Chosen Approach*: Store all clinic identity attributes (Facebook URL, phone, address, operating hours, emergency number) in the database `clinicSettings` key-value store, initialized with the official Facebook URL and defaults.
  - *Why*: Allows clinic reception and administrators to update timings, telephone numbers, or social links on demand through `/sai-clinic-management/settings` without touching code or redeploying.
- **Decision 2: Navbar Layout Hierarchy**
  - *Chosen Approach*: `[Language Switch] -> [Patient Login (with User icon)] -> [Book a Session (Primary CTA)]`.
  - *Why*: Balances primary conversion (booking requests) with fast re-engagement (returning patients checking lab reports or appointment approvals).

---

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                    Staff CMS Settings                        │
│             /sai-clinic-management/settings                  │
│       (Edit Name, Facebook URL, Hours, Phone, Address)       │
└──────────────────────────────┬───────────────────────────────┘
                               │ POST /api/cms/settings
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                   Persistent Relational DB                   │
│                     clinicSettings Store                     │
│  - facebook_url: "https://www.facebook.com/p/..."            │
│  - opening_hours_en / opening_hours_ne                       │
│  - phone, email, emergency_phone, map_url                    │
│  - address_en / address_ne                                   │
└──────────────────────────────┬───────────────────────────────┘
                               │ db.getSetting() / db.getAllSettings()
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    Public Web Surfaces                       │
│  • Navbar: Top-right Patient Login + User icon               │
│  • Footer: Verified phone, hours, and Facebook link          │
│  • Home & About: Dynamic clinic facts & social integration   │
└──────────────────────────────────────────────────────────────┘
```

### Components to Update:
1. `lib/db/index.ts`: Seed `DEFAULT_SETTINGS` with `facebook_url: 'https://www.facebook.com/p/Om-Sai-Aadarsha-Clinic-100084050983392/'`, bilingual opening hours, and emergency contact.
2. `app/sai-clinic-management/settings/page.tsx`: Add input controls for Facebook page URL, operating hours, emergency contact, and social links.
3. `components/public/Navbar.tsx`: Add the Patient Login link with `User` icon in the rightmost corner beside "Book a Session".
4. `components/public/Footer.tsx`: Connect Facebook page link, dynamic opening hours, and contact details from CMS settings.
5. `app/[locale]/explore/about/page.tsx` & `app/[locale]/page.tsx`: Ensure clinic contact details and Facebook link are dynamically queried.
