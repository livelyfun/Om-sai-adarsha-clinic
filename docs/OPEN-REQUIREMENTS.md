# Om Sai Aadarsha Clinic — Open Requirements & Clinic Facts Checklist
**Tracking Open Items per Section 13**

The clinic has not yet supplied several physical and operational facts. In accordance with Section 13, **no clinic facts are invented**. Every item below has a configurable fallback or empty state.

| Open Requirement | Current Status | Behavior Until Supplied by Clinic |
| :--- | :--- | :--- |
| **Official Logo & Brand Assets** | Missing | Neutral typographic wordmark ("Om Sai Aadarsha Clinic") with clinical teal/slate palette. Replaceable in CMS Settings. |
| **Official Address & Map GPS** | Missing | Address block empty; map iframe hidden. Contact section shows empty placeholder ("Address details to be confirmed by clinic"). |
| **Verified Contact Phone & Email** | Missing | Empty; fake phone numbers are strictly prohibited. "Contact reception in-person" default. |
| **Confirmed Doctor Roster & Schedules** | Missing | Searchable directory shows empty state ("Doctor schedules currently being updated"). Direct doctor booking disabled until published. |
| **Approved Medical Services & Fees** | Missing | Services directory shows empty state ("Service catalogue coming soon"). |
| **Approved Lab Test Catalogue & Prep Instructions** | Missing | Lab catalogue displays empty state. When test has no price entered, shows "Price confirmed by the clinic". |
| **Reviewed Nepali Clinical Content** | Missing | Shows English content with explicit visible badge: *"English original shown below. Nepali translation will be updated once reviewed by clinic staff."* Item flagged in CMS as *Incomplete Translation*. |
| **Reception Booking Parameters** | Default applied | Minimum lead time: 2 hours. Maximum advance booking: 30 days. Cancellation cutoff: 4 hours. Doctor slot length: 20 mins. Patient open-requests cap: 5. Marked in settings as *Confirm with clinic*. |
| **Report Access & Release Delegation** | Default applied | Reception can upload & save draft. Only Super Admin can release and revoke until clinic delegates permissions. |
| **Patient Verification Channel** | Default applied | Email verification active (verification links). SMS OTP boundary reserved for future integration. |
| **Production Cloud Infrastructure** | `NOT CONFIGURED` | Managed PostgreSQL, private Cloud Storage bucket (GCS/S3), production SMTP email provider are isolated via clean boundaries. |
| **Legal Privacy Policy & Booking Terms** | `DRAFT TEMPLATE` | Clearly marked "DRAFT — Requires Clinic & Legal Counsel Review Before Launch". Version timestamps recorded on user registration. |
| **Calendar System** | Gregorian AD | Gregorian calendar formatted via unified helper configured for `Asia/Kathmandu`. Ready for Bikram Sambat (BS) conversion helper. |
| **Clinic Weekly Holiday** | Saturday | Saturday configured as default clinic closure; Sunday–Friday active (configurable in CMS settings). |

---
*Updated at Stage 2 — Catalogues and Public Site.*
