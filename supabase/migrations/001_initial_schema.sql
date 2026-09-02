-- ============================================================
-- SEHAT-LINK — Complete Database Schema
-- Run this in your Supabase SQL Editor (in order)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy name search

-- ─────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────

CREATE TYPE user_role AS ENUM (
  'patient', 'health_worker', 'doctor', 'pharmacy', 'facility_staff', 'admin'
);

CREATE TYPE gender_type AS ENUM (
  'male', 'female', 'other', 'prefer_not_to_say'
);

CREATE TYPE blood_group_type AS ENUM (
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'
);

CREATE TYPE facility_type AS ENUM (
  'primary_health_centre', 'community_health_centre', 'district_hospital',
  'clinic', 'pharmacy', 'diagnostic_lab', 'sub_centre'
);

CREATE TYPE appointment_status AS ENUM (
  'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
);

CREATE TYPE appointment_type AS ENUM (
  'in_person', 'teleconsultation', 'home_visit', 'follow_up'
);

CREATE TYPE prescription_type AS ENUM ('digital', 'scanned');

CREATE TYPE prescription_status AS ENUM (
  'active', 'dispensed', 'partially_dispensed', 'expired', 'cancelled'
);

CREATE TYPE dispensing_item_status AS ENUM (
  'available', 'partially_dispensed', 'dispensed', 'not_available'
);

CREATE TYPE referral_status AS ENUM (
  'pending', 'accepted', 'rejected', 'completed', 'cancelled'
);

CREATE TYPE followup_status AS ENUM (
  'scheduled', 'completed', 'missed', 'rescheduled'
);

CREATE TYPE diagnostic_order_status AS ENUM (
  'ordered', 'sample_collected', 'processing', 'reported', 'cancelled'
);

CREATE TYPE risk_flag AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE priority_level AS ENUM ('routine', 'urgent', 'emergency');

CREATE TYPE note_type AS ENUM (
  'subjective', 'objective', 'assessment', 'plan', 'general'
);

CREATE TYPE document_category AS ENUM (
  'prescription', 'lab_report', 'discharge_summary', 'vaccination', 'other'
);

CREATE TYPE notification_type AS ENUM (
  'appointment_reminder', 'prescription_ready', 'follow_up_due',
  'referral_update', 'report_available', 'dispensing_update', 'system'
);

-- ─────────────────────────────────────────
-- SEQUENCE: SEHAT ID generation
-- Format: SL-MH-2026-000001
-- ─────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS sehat_id_seq START 1 INCREMENT 1;

CREATE OR REPLACE FUNCTION generate_sehat_id()
RETURNS TEXT AS $$
DECLARE
  seq_val BIGINT;
  year_val TEXT;
BEGIN
  seq_val := nextval('sehat_id_seq');
  year_val := TO_CHAR(NOW(), 'YYYY');
  RETURN 'SL-MH-' || year_val || '-' || LPAD(seq_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────
-- FACILITIES
-- ─────────────────────────────────────────

CREATE TABLE facilities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  type        facility_type NOT NULL,
  address     TEXT,
  village     TEXT,
  taluka      TEXT,
  district    TEXT NOT NULL DEFAULT 'Pune',
  state       TEXT NOT NULL DEFAULT 'Maharashtra',
  pincode     TEXT,
  phone       TEXT,
  email       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  phone         TEXT,
  avatar_url    TEXT,
  role          user_role NOT NULL DEFAULT 'patient',
  facility_id   UUID REFERENCES facilities(id) ON DELETE SET NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- PROVIDERS (doctors, health workers linked to facilities)
-- ─────────────────────────────────────────

CREATE TABLE providers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  facility_id         UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  specialization      TEXT,
  registration_number TEXT, -- medical council
  qualification       TEXT,
  is_available        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, facility_id)
);

-- ─────────────────────────────────────────
-- PATIENTS
-- ─────────────────────────────────────────

CREATE TABLE patients (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sehat_id            TEXT NOT NULL UNIQUE DEFAULT generate_sehat_id(),
  profile_id          UUID REFERENCES profiles(id) ON DELETE SET NULL, -- if patient has an account
  full_name           TEXT NOT NULL,
  dob                 DATE,
  gender              gender_type,
  blood_group         blood_group_type DEFAULT 'unknown',
  phone               TEXT,
  email               TEXT,
  -- Address (flattened for query ease)
  address_line1       TEXT,
  address_line2       TEXT,
  village             TEXT,
  taluka              TEXT,
  district            TEXT NOT NULL DEFAULT 'Pune',
  state               TEXT NOT NULL DEFAULT 'Maharashtra',
  pincode             TEXT,
  -- Emergency contact
  emergency_name      TEXT,
  emergency_relation  TEXT,
  emergency_phone     TEXT,
  -- Meta
  registered_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  primary_facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search index on patient name and SEHAT ID
CREATE INDEX idx_patients_sehat_id ON patients(sehat_id);
CREATE INDEX idx_patients_name_trgm ON patients USING GIN (full_name gin_trgm_ops);
CREATE INDEX idx_patients_phone ON patients(phone);

-- ─────────────────────────────────────────
-- VITALS
-- ─────────────────────────────────────────

CREATE TABLE vitals (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id                  UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  recorded_by                 UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  blood_pressure_systolic     INTEGER,
  blood_pressure_diastolic    INTEGER,
  pulse_rate                  INTEGER,
  temperature                 NUMERIC(4,1),
  weight                      NUMERIC(5,2),
  height                      NUMERIC(5,2),
  spo2                        INTEGER,
  blood_sugar                 INTEGER,
  notes                       TEXT,
  recorded_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vitals_patient ON vitals(patient_id);

-- ─────────────────────────────────────────
-- ASSESSMENTS
-- ─────────────────────────────────────────

CREATE TABLE assessments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  worker_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  chief_complaint TEXT NOT NULL,
  symptoms        TEXT[] DEFAULT '{}',
  notes           TEXT,
  risk_flag       risk_flag NOT NULL DEFAULT 'low',
  visited_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assessments_patient ON assessments(patient_id);

-- ─────────────────────────────────────────
-- APPOINTMENTS
-- ─────────────────────────────────────────

CREATE TABLE appointments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  facility_id   UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  status        appointment_status NOT NULL DEFAULT 'scheduled',
  type          appointment_type NOT NULL DEFAULT 'in_person',
  reason        TEXT,
  notes         TEXT,
  token_number  INTEGER,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_provider ON appointments(provider_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);

-- ─────────────────────────────────────────
-- CONSULTATIONS
-- ─────────────────────────────────────────

CREATE TABLE consultations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  facility_id     UUID REFERENCES facilities(id) ON DELETE SET NULL,
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  chief_complaint TEXT NOT NULL,
  diagnosis       TEXT,
  icd_code        TEXT,
  notes           TEXT,
  consulted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE consultation_notes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id   UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  note_type         note_type NOT NULL DEFAULT 'general',
  content           TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor ON consultations(doctor_id);

-- ─────────────────────────────────────────
-- PRESCRIPTIONS
-- ─────────────────────────────────────────

CREATE TABLE prescriptions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id        UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  consultation_id   UUID REFERENCES consultations(id) ON DELETE SET NULL,
  type              prescription_type NOT NULL DEFAULT 'digital',
  status            prescription_status NOT NULL DEFAULT 'active',
  notes             TEXT,
  valid_until       DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE prescription_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id   UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_name     TEXT NOT NULL,
  dosage            TEXT,
  frequency         TEXT,
  duration          TEXT,
  instructions      TEXT,
  quantity          INTEGER,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE prescription_documents (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id   UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  file_url          TEXT NOT NULL,
  file_name         TEXT NOT NULL,
  file_type         TEXT NOT NULL, -- 'image/jpeg', 'image/png', 'application/pdf'
  file_size_bytes   BIGINT,
  uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

-- ─────────────────────────────────────────
-- DIAGNOSTICS
-- ─────────────────────────────────────────

CREATE TABLE diagnostic_orders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  ordered_by    UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  facility_id   UUID REFERENCES facilities(id) ON DELETE SET NULL,
  test_name     TEXT NOT NULL,
  test_type     TEXT,
  priority      priority_level NOT NULL DEFAULT 'routine',
  status        diagnostic_order_status NOT NULL DEFAULT 'ordered',
  notes         TEXT,
  ordered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE diagnostic_reports (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES diagnostic_orders(id) ON DELETE CASCADE,
  patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  file_url      TEXT,
  findings      TEXT,
  reported_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reported_by   UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_diagnostic_orders_patient ON diagnostic_orders(patient_id);

-- ─────────────────────────────────────────
-- REFERRALS
-- ─────────────────────────────────────────

CREATE TABLE referrals (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id              UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  referred_by             UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  referred_to_provider    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referred_to_facility    UUID REFERENCES facilities(id) ON DELETE SET NULL,
  reason                  TEXT NOT NULL,
  clinical_summary        TEXT,
  status                  referral_status NOT NULL DEFAULT 'pending',
  priority                priority_level NOT NULL DEFAULT 'routine',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referrals_patient ON referrals(patient_id);

-- ─────────────────────────────────────────
-- FOLLOW-UPS
-- ─────────────────────────────────────────

CREATE TABLE follow_ups (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id        UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_by        UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  consultation_id   UUID REFERENCES consultations(id) ON DELETE SET NULL,
  due_date          DATE NOT NULL,
  instructions      TEXT NOT NULL,
  status            followup_status NOT NULL DEFAULT 'scheduled',
  completed_at      TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_followups_patient ON follow_ups(patient_id);
CREATE INDEX idx_followups_due ON follow_ups(due_date);

-- ─────────────────────────────────────────
-- PHARMACY DISPENSING
-- ─────────────────────────────────────────

CREATE TABLE pharmacy_dispensing (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id   UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  pharmacy_id       UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  dispensed_by      UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  status            dispensing_item_status NOT NULL DEFAULT 'available',
  notes             TEXT,
  dispensed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pharmacy_dispensing_items (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispensing_id         UUID NOT NULL REFERENCES pharmacy_dispensing(id) ON DELETE CASCADE,
  prescription_item_id  UUID NOT NULL REFERENCES prescription_items(id) ON DELETE CASCADE,
  medicine_name         TEXT NOT NULL,
  quantity_dispensed    INTEGER,
  status                dispensing_item_status NOT NULL DEFAULT 'available',
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dispensing_prescription ON pharmacy_dispensing(prescription_id);
CREATE INDEX idx_dispensing_pharmacy ON pharmacy_dispensing(pharmacy_id);

-- ─────────────────────────────────────────
-- DOCUMENTS
-- ─────────────────────────────────────────

CREATE TABLE documents (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  uploaded_by   UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  file_url      TEXT NOT NULL,
  file_name     TEXT NOT NULL,
  file_type     TEXT NOT NULL,
  category      document_category NOT NULL DEFAULT 'other',
  description   TEXT,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_patient ON documents(patient_id);

-- ─────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────

CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type          notification_type NOT NULL DEFAULT 'system',
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  related_id    UUID,
  related_type  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ─────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────

CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,
  resource_type   TEXT NOT NULL,
  resource_id     UUID,
  metadata        JSONB,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ─────────────────────────────────────────
-- UPDATED_AT TRIGGER (auto-update timestamps)
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_facilities_updated_at BEFORE UPDATE ON facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_prescriptions_updated_at BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_referrals_updated_at BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_followups_updated_at BEFORE UPDATE ON follow_ups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_dispensing_updated_at BEFORE UPDATE ON pharmacy_dispensing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────
-- AUTO-CREATE PROFILE ON SIGNUP
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
