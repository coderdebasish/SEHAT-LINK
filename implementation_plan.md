# SEHAT-LINK — Master Execution Plan

## Architecture Analysis Summary

### Overall Architecture
SEHAT-LINK is a multi-role, multi-platform rural healthcare coordination platform. It follows a **hub-and-spoke data model** — one patient, one longitudinal record (SEHAT Health ID), accessed by multiple authorized stakeholders through role-filtered views.

```
PUBLIC WEBSITE ──────────────────────────────────────────────┐
MOBILE APP (React Native / Expo) ────────────────────────────┤
                                                              │
                    ┌─────────────────┐                       │
                    │  SUPABASE CLOUD  │ ◄────────────────────┘
                    │  - Auth (JWT)    │
                    │  - PostgreSQL    │
                    │  - Storage       │
                    │  - Realtime      │
                    │  - RLS Policies  │
                    └─────────────────┘
```

### User Roles (from diagram)
| Role | Scope | Key Action |
|------|-------|-----------|
| Patient | Own data only | View health timeline, appointments, prescriptions |
| Health Worker | Assigned patients | Register patients, record vitals, assessments, follow-ups |
| Doctor | Assigned/consulting patients | Consult, prescribe (digital + scanned), refer |
| Pharmacy | Assigned prescriptions only | Verify, dispense, update status |
| Facility Staff | Facility-scoped ops | Appointments, queue, lab, resources |
| Admin | System-wide | Users, roles, facilities, analytics, audit |

### Core Healthcare Data Flow
```
Patient Registration (SEHAT ID)
  → Health Worker Assessment (Vitals/Notes)
    → Doctor Consultation (Digital/Scanned Prescription)
      → Pharmacy Dispensing
        → Follow-Up Scheduling
          → Patient Timeline (Real-time updates across roles)
```

### Authentication Model
- Email + Password via Supabase Auth
- Post-auth: profile lookup → role detection → dashboard routing
- No manual role selection by user
- Same credentials across web and mobile

### Permission Matrix (from Role & Permission diagram)
| Resource | Patient | Health Worker | Doctor | Pharmacy | Facility Staff | Admin |
|----------|---------|--------------|--------|----------|----------------|-------|
| Patient Profile | Full (Own) | Create/Update | View | View | View | Full |
| Medical History | Full (Own) | View | View | ✗ | View (limited) | Full |
| Vitals & Assessments | View | Create/Update | View | ✗ | View | Full |
| Consultations & Notes | View | View | Create/Update | ✗ | ✗ | Full |
| Prescriptions | View | View | Create/Update | View | View | Full |
| Diagnostics | View | View | Create/Update | ✗ | View | Full |
| Referrals | View | View | Create/Update | ✗ | View | Full |
| Follow-ups | View | Create/Update | Create/Update | ✗ | View | Full |
| Appointments | Full (Own) | View | View | ✗ | Create/Update | Full |
| Documents | View | View | Create/Update | ✗ | View | Full |
| User/Role Mgmt | ✗ | ✗ | ✗ | ✗ | ✗ | Full |
| Analytics | ✗ | ✗ | ✗ | Limited | Limited | Full |

---

## Open Questions / Design Decisions

> [!NOTE]
> ✅ **SEHAT ID Format CONFIRMED**: `SL-MH-2026-XXXXXX` — e.g. `SL-MH-2026-000001`

> [!NOTE]
> ✅ **State Code CONFIRMED**: `MH` (Maharashtra) is the default for this MVP.

> [!NOTE]
> ✅ **Pharmacy Mobile Access Model CONFIRMED**: Pharmacy users have a single workflow — patient hands them their SEHAT Health ID → pharmacy enters/scans it → prescription list appears → dispense. No queue system. Prescription access is via Health ID lookup only.

> [!NOTE]
> ✅ **Offline Sync Strategy CONFIRMED**:
> - **Mobile App**: Full offline-first architecture. All data accessed via local SQLite/MMKV cache. Writes queue in a `pending_sync` store. When network returns, auto-sync fires and pushes queued mutations. UI shows a persistent banner: *"Network unavailable — changes will sync automatically when connected."* Supabase Realtime drives instant sync when online.
> - **Website**: Requires active network. No offline mode. Shows network error states gracefully.
> - **Cross-platform**: Web ↔ App sync is instant via Supabase Realtime subscriptions — a change made on web immediately reflects on mobile and vice versa.

> [!NOTE]
> ✅ **Supabase Free Tier**: Confirmed no issue. File size limit of 5MB per prescription upload enforced at upload.

---

## Proposed Changes — Implementation Phases

---

### Phase 0 — Repository & Project Setup
**Status: `[ ]` Not Started**

#### [NEW] Web App: `d:\Programming Project\SIH2026\web\`
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Folder structure with src/app, src/components, src/lib, src/types

#### [NEW] Mobile App: `d:\Programming Project\SIH2026\mobile\`
- React Native + Expo + TypeScript
- Shared types package reference

#### [NEW] Shared Types: `d:\Programming Project\SIH2026\packages\types\`
- Database types, API interfaces shared between web and mobile

---

### Phase 1 — Database Architecture
**Status: `[ ]` Not Started**

Design and execute complete PostgreSQL schema on Supabase before writing any frontend code.

#### Core Schema (Supabase SQL migrations)

**Platform & Auth Tables**
```sql
profiles           -- links to auth.users (id, full_name, phone, avatar_url, role, created_at)
roles              -- role definitions (id, name, description)
user_roles         -- junction: user_id + role_id (can be simplified to role column on profiles)
facilities         -- hospitals, clinics, pharmacies, labs
providers          -- doctors, health workers linked to facilities
```

**Patient Identity**
```sql
patients           -- master record (id, sehat_id [UNIQUE], profile_id, dob, gender, blood_group, address)
patient_identifiers-- secondary IDs (aadhaar_hash, mobile_hash for lookup without PII)
family_members     -- optional family linkage
```

**Clinical Records**
```sql
vitals             -- (patient_id, recorded_by, bp, pulse, temp, weight, height, spo2, recorded_at)
assessments        -- (patient_id, worker_id, chief_complaint, symptoms[], notes, risk_flag, visited_at)
consultations      -- (patient_id, doctor_id, facility_id, notes, diagnosis, icd_code, consulted_at)
consultation_notes -- (consultation_id, note_type, content) -- SOAP notes
```

**Prescriptions**
```sql
prescriptions      -- (id, patient_id, doctor_id, consultation_id, type[digital/scanned], status, created_at)
prescription_items -- (prescription_id, medicine_name, dosage, frequency, duration, instructions)
prescription_documents -- (prescription_id, file_url, file_type, uploaded_at) -- for scanned
```

**Appointments**
```sql
appointments       -- (patient_id, provider_id, facility_id, scheduled_at, status, type, notes)
```

**Diagnostics**
```sql
diagnostic_orders  -- (patient_id, ordered_by, facility_id, test_name, priority, status, ordered_at)
diagnostic_reports -- (order_id, patient_id, file_url, findings, reported_at, reported_by)
```

**Referrals & Follow-ups**
```sql
referrals          -- (patient_id, referred_by, referred_to_provider, referred_to_facility, reason, status, created_at)
follow_ups         -- (patient_id, created_by, due_date, instructions, status, completed_at)
```

**Pharmacy**
```sql
pharmacy_dispensing      -- (prescription_id, pharmacy_id, dispensed_by, status, dispensed_at, notes)
pharmacy_dispensing_items-- (dispensing_id, prescription_item_id, medicine_name, qty_dispensed, available)
```

**Supporting Tables**
```sql
documents          -- (patient_id, uploaded_by, file_url, file_type, category, description, uploaded_at)
notifications      -- (user_id, type, title, body, read, related_id, created_at)
audit_logs         -- (user_id, action, resource_type, resource_id, metadata, ip, created_at)
```

**RLS Policy Design**
- patients: SELECT where profile_id = auth.uid() OR provider has assignment
- vitals/assessments: accessible by patient (own), health worker (assigned), doctor (assigned/consulting), admin
- prescriptions: patient (own), doctor (creator), pharmacy (assigned pharmacy_id), admin
- pharmacy_dispensing: pharmacy (own facility), admin

---

### Phase 2 — Supabase Configuration
**Status: `[ ]` Not Started**

- Create Supabase project
- Execute schema migrations
- Configure Storage buckets:
  - `prescriptions` (private, role-controlled)
  - `diagnostic-reports` (private)
  - `documents` (private)
  - `avatars` (public)
- Configure RLS policies
- Seed demo data (6 role accounts + 1 demo patient)

---

### Phase 3 — Authentication & Role Routing
**Status: `[ ]` Not Started**

**Web (Next.js)**
- Supabase Auth client setup
- Login page (email + password)
- Registration page (new users → profile creation)
- Middleware: protect authenticated routes, redirect unauthenticated
- Post-login role detection → redirect to correct dashboard
- Session persistence

**Mobile (Expo)**
- Supabase client for React Native
- Login screen
- Splash/intro screen
- Same auth flow → role-based navigation stack

---

### Phase 4 — Shared UI Design System
**Status: `[ ]` Not Started**

**Web**
- Design tokens (colors, typography, spacing)
- Healthcare-appropriate color palette (calm blues, teals, clean whites)
- Reusable components: Button, Card, Badge, Table, Modal, Input, Select, Avatar, StatusPill, Timeline
- Layout components: Sidebar, Topbar, PageHeader
- Role-colored theming (each role has an accent color)

**Mobile**
- React Native component library matching web design language
- Bottom tab navigation base
- Card, Button, Input, Avatar components

---

### Phase 5 — Public Website
**Status: `[ ]` Not Started**

Pages (no login required):
1. `/` — Landing page (hero, features, how it works, stats)
2. `/about` — About SEHAT-LINK
3. `/services` — Healthcare services info
4. `/find-facilities` — Search facilities (read-only from DB)
5. `/find-doctors` — Search doctors (read-only)
6. `/health-info` — Health information articles
7. `/schemes` — Government health schemes
8. `/login` — Authentication gateway

---

### Phase 6 — Patient Module (Web + Mobile)
**Status: `[ ]` Not Started**

**6.1 — Patient Dashboard & Health Timeline**
- Overview with upcoming appointments, recent consultations, follow-ups due
- Longitudinal health timeline (chronological view of all events)
- SEHAT Health ID display (prominent, copyable)

**6.2 — Appointments**
- View upcoming/past appointments
- Book appointment (select facility + doctor + time)

**6.3 — Prescriptions**
- View all prescriptions (digital + scanned)
- View prescription items
- View/download scanned prescription documents

**6.4 — Diagnostics & Reports**
- View diagnostic orders
- View/download diagnostic reports

**6.5 — Follow-ups & Referrals**
- View follow-up schedule
- View referral history and status

**6.6 — Documents & Health Records**
- View uploaded health documents
- Upload personal health documents

**6.7 — Profile & Settings**
- Edit profile, photo
- View SEHAT ID

---

### Phase 7 — Health Worker Module (Web + Mobile)
**Status: `[ ]` Not Started**

**7.1 — Patient Search & Registration**
- Search by SEHAT ID, name, phone
- Register new patient → auto-generate SEHAT ID
- Family member linkage

**7.2 — Vitals Recording**
- Record BP, pulse, temperature, weight, height, SpO2
- Associate with patient visit

**7.3 — Assessment & Notes**
- Record symptoms, chief complaint, assessment notes
- Flag high-risk patients

**7.4 — Follow-up Management**
- Create follow-up tasks for patients
- Track follow-up status (pending/completed)
- View high-risk / overdue list

**7.5 — Referral Creation**
- Create referral to doctor/facility
- Track referral status

**7.6 — Offline-First Architecture (Full Implementation)**
- Local SQLite (via Expo SQLite) + MMKV for fast key-value cache
- All patient data, vitals, assessments cached locally on first load
- New records (vitals, assessments, follow-ups) written to local `pending_sync` queue first
- Background sync service: fires on network restoration, pushes all queued mutations to Supabase
- Conflict resolution: last-write-wins with timestamp; server record always authoritative
- UI: persistent top banner shown when offline — *"You're offline. Data will sync when connected."*
- Sync status indicator per record (✓ Synced / ⏳ Pending / ✗ Failed)
- Failed sync retried with exponential backoff
- All read operations (patient lookup, history) served from local cache when offline

---

### Phase 8 — Doctor Module (Web + Mobile)
**Status: `[ ]` Not Started**

**8.1 — Patient Search**
- Search by SEHAT ID or name
- View patient basic info

**8.2 — Patient Health Timeline**
- Full longitudinal view of patient history
- Previous vitals, assessments, prescriptions, diagnostics

**8.3 — Consultation**
- Create new consultation
- Add SOAP notes (Subjective, Objective, Assessment, Plan)
- Add diagnosis with ICD codes

**8.4 — Digital Prescription**
- Add prescription items (medicine, dosage, frequency, duration)
- Save as digital prescription
- Generate Prescription ID

**8.5 — Scanned Prescription Upload** ⭐ KEY FEATURE
- Open patient → prescription section
- Upload JPG/PNG/PDF (camera or file picker)
- Upload to Supabase Storage
- Create prescription record (type = 'scanned')
- Auto-generate Prescription ID
- Immediately visible in patient timeline
- Available to authorized pharmacy

**8.6 — Referrals & Diagnostic Orders**
- Create referral to specialist/facility
- Request diagnostic test

**8.7 — Follow-up Instructions**
- Schedule follow-up with instructions

---

### Phase 9 — Pharmacy Module (Web)
**Status: `[ ]` Not Started**

**9.1 — Prescription Lookup via SEHAT Health ID** ⭐ PRIMARY FLOW
- Patient presents their SEHAT Health ID to pharmacist
- Pharmacist enters SEHAT Health ID (or types Prescription ID if known)
- System retrieves active prescriptions for that patient assigned to this pharmacy
- View prescription details: medicine list, dosage, doctor name, date
- **Cannot see full patient medical record** — only prescription data

**9.2 — Dispensing Management**
- Mark individual items: Available / Partially Dispensed / Dispensed / Not Available
- Record dispensing notes
- Update dispensing status (updates patient timeline in real-time)

**9.3 — Dispensing History**
- View past dispensing records for this pharmacy branch
- Filter by date, status

**Mobile Note**: Pharmacy mobile is a simplified single-screen flow — enter Health ID → view prescription → update dispensing. No queue system.

---

### Phase 10 — Facility Staff Module (Web)
**Status: `[ ]` Not Started**

- Appointment management (create, manage, view queue)
- Patient search (basic access)
- Lab order coordination (view pending orders)
- Lab report upload
- Resource/bed status view
- Referral coordination (accept/reject incoming)

---

### Phase 11 — Admin Module (Web)
**Status: `[ ]` Not Started**

- System overview dashboard (user counts, active patients, appointments today)
- User management (create, edit, deactivate users)
- Role assignment
- Facility management (add/edit facilities)
- Provider management
- Analytics & reports (patient count by region, consultations, prescriptions)
- Audit logs viewer
- System settings

---

### Phase 12 — Notifications System
**Status: `[ ]` Not Started**

- In-app notifications table
- Notification triggers (new prescription, follow-up due, appointment reminder)
- Supabase Realtime subscription for live updates
- Notification center UI (web + mobile)

---

### Phase 13 — Mobile App Integration
**Status: `[ ]` Not Started**

- Complete Patient mobile experience
- Complete Health Worker mobile experience  
- Complete Doctor mobile experience (including prescription upload with camera)
- Simplified Pharmacy mobile interface
- Push notifications (Expo Notifications)
- Deep linking for prescription IDs

---

### Phase 14 — End-to-End Demo Preparation
**Status: `[ ]` Not Started**

- Seed complete demo scenario (all 6 roles with realistic data)
- Run full demonstration workflow:
  1. Health Worker → Register patient → Record vitals
  2. Doctor → Find patient → Upload scanned prescription
  3. Patient → View prescription in timeline
  4. Pharmacy → Verify and dispense
  5. Admin → View analytics
- Verify all cross-role data visibility
- Fix any data flow gaps

---

### Phase 15 — Deployment
**Status: `[ ]` Not Started**

- Web: Deploy to Vercel (connect GitHub repo)
- Mobile: Expo build + EAS (or Expo Go for demo)
- Environment variables configuration
- Production Supabase project (or use same with production flag)
- README with demo credentials and workflow guide

---

## Verification Plan

### Automated
- TypeScript type checking (`tsc --noEmit`)
- Supabase RLS policy testing via SQL
- API route unit tests (Next.js API routes)

### Integration Testing
- Full demo workflow run (all 6 roles)
- Cross-role data visibility verification
- Prescription upload end-to-end (doctor → patient → pharmacy)
- Mobile ↔ Web data consistency

### Manual
- Test on mobile browser (responsive)
- Test on Expo Go (mobile app)
- Test all 6 role dashboards
- Verify RLS blocks unauthorized access

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Web Framework | Next.js 14 (App Router) |
| Web Language | TypeScript |
| Web Styling | Tailwind CSS |
| Mobile Framework | React Native + Expo |
| Mobile Language | TypeScript |
| Backend/Auth | Supabase |
| Database | PostgreSQL (via Supabase) |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| Web Deployment | Vercel |
| Mobile Deployment | Expo Go / EAS |

---

## Dependency Order (Critical Path)

```
Phase 0 (Setup)
  → Phase 1 (Database Schema)
    → Phase 2 (Supabase Config)
      → Phase 3 (Auth + Role Routing)
        → Phase 4 (UI Design System)
          → Phase 5 (Public Website)
          → Phase 6 (Patient Module)
            → Phase 7 (Health Worker Module)
              → Phase 8 (Doctor Module)
                → Phase 8.5 (Scanned Prescription — KEY FEATURE)
                  → Phase 9 (Pharmacy Module)
                  → Phase 10 (Facility Staff)
                  → Phase 11 (Admin)
          → Phase 12 (Notifications)
          → Phase 13 (Mobile Integration)
            → Phase 14 (Demo Prep)
              → Phase 15 (Deployment)
```

---

## SEHAT ID Generation Format

**Proposed**: `SL-{STATE}-{YEAR}-{SEQUENCE}`

Example: `SL-MH-2026-000001`

- `SL` = SEHAT-LINK prefix
- `MH` = Maharashtra (configurable state code)
- `2026` = Registration year
- `000001` = Auto-incrementing 6-digit sequence (per year, per state)

Generated via PostgreSQL sequence + trigger, ensuring uniqueness at the database level.

---

> [!IMPORTANT]
> **All clarifications received. Ready to begin implementation.**
> 
> **Confirmed decisions:**
> - ✅ SEHAT ID: `SL-MH-2026-XXXXXX`
> - ✅ State: MH (Maharashtra)
> - ✅ Pharmacy: Health ID lookup only, no queue
> - ✅ Mobile: Offline-first with pending-sync queue + Supabase Realtime for instant online sync
> - ✅ Website: Network required, graceful error states
> - ✅ Supabase free tier: acceptable
>
> **Awaiting final go-ahead to begin Phase 0 → Phase 1.**
