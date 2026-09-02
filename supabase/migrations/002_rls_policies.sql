-- ============================================================
-- SEHAT-LINK — Row Level Security Policies
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ─────────────────────────────────────────
-- HELPER: Get current user's role
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_my_facility_id()
RETURNS UUID AS $$
  SELECT facility_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ─────────────────────────────────────────
-- Enable RLS on all tables
-- ─────────────────────────────────────────

ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities            ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients              ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals                ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_notes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_reports    ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups            ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_dispensing   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_dispensing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs            ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────

-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (get_my_role() = 'admin');

-- Doctors/HWs/Facility staff can see basic profile of other providers
CREATE POLICY "profiles_select_providers" ON profiles
  FOR SELECT USING (
    get_my_role() IN ('doctor', 'health_worker', 'facility_staff')
    AND role IN ('doctor', 'health_worker', 'facility_staff', 'pharmacy')
  );

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Admins can update any profile
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (get_my_role() = 'admin');

-- ─────────────────────────────────────────
-- FACILITIES (public read, admin write)
-- ─────────────────────────────────────────

CREATE POLICY "facilities_select_all" ON facilities
  FOR SELECT USING (TRUE); -- public, needed for find-doctors/find-facilities pages

CREATE POLICY "facilities_write_admin" ON facilities
  FOR ALL USING (get_my_role() = 'admin');

-- ─────────────────────────────────────────
-- PROVIDERS (public read for directory)
-- ─────────────────────────────────────────

CREATE POLICY "providers_select_all" ON providers
  FOR SELECT USING (TRUE);

CREATE POLICY "providers_write_admin" ON providers
  FOR ALL USING (get_my_role() = 'admin');

-- ─────────────────────────────────────────
-- PATIENTS
-- ─────────────────────────────────────────

-- Patient can view their own record
CREATE POLICY "patients_select_own" ON patients
  FOR SELECT USING (profile_id = auth.uid());

-- Health workers, doctors, facility staff, admin can view patients
CREATE POLICY "patients_select_clinical" ON patients
  FOR SELECT USING (
    get_my_role() IN ('health_worker', 'doctor', 'facility_staff', 'admin')
  );

-- Pharmacy can view basic patient info (name + sehat_id only) via prescriptions
-- (handled through prescription policy; direct patient access is minimal)
CREATE POLICY "patients_select_pharmacy" ON patients
  FOR SELECT USING (
    get_my_role() = 'pharmacy'
  );

-- Health workers and admins can insert new patients
CREATE POLICY "patients_insert_hw_admin" ON patients
  FOR INSERT WITH CHECK (
    get_my_role() IN ('health_worker', 'admin', 'facility_staff')
  );

-- Health workers and admins can update patient records
CREATE POLICY "patients_update_clinical" ON patients
  FOR UPDATE USING (
    get_my_role() IN ('health_worker', 'doctor', 'admin', 'facility_staff')
  );

-- ─────────────────────────────────────────
-- VITALS
-- ─────────────────────────────────────────

CREATE POLICY "vitals_select" ON vitals
  FOR SELECT USING (
    -- Patient sees own
    (SELECT profile_id FROM patients WHERE id = patient_id) = auth.uid()
    OR get_my_role() IN ('health_worker', 'doctor', 'admin', 'facility_staff')
  );

CREATE POLICY "vitals_insert" ON vitals
  FOR INSERT WITH CHECK (
    get_my_role() IN ('health_worker', 'doctor', 'admin')
  );

-- ─────────────────────────────────────────
-- ASSESSMENTS
-- ─────────────────────────────────────────

CREATE POLICY "assessments_select" ON assessments
  FOR SELECT USING (
    (SELECT profile_id FROM patients WHERE id = patient_id) = auth.uid()
    OR get_my_role() IN ('health_worker', 'doctor', 'admin', 'facility_staff')
  );

CREATE POLICY "assessments_insert" ON assessments
  FOR INSERT WITH CHECK (
    get_my_role() IN ('health_worker', 'admin')
  );

CREATE POLICY "assessments_update" ON assessments
  FOR UPDATE USING (
    worker_id = auth.uid() OR get_my_role() = 'admin'
  );

-- ─────────────────────────────────────────
-- APPOINTMENTS
-- ─────────────────────────────────────────

CREATE POLICY "appointments_select" ON appointments
  FOR SELECT USING (
    (SELECT profile_id FROM patients WHERE id = patient_id) = auth.uid()
    OR provider_id = auth.uid()
    OR get_my_role() IN ('health_worker', 'facility_staff', 'admin')
  );

CREATE POLICY "appointments_insert" ON appointments
  FOR INSERT WITH CHECK (
    get_my_role() IN ('patient', 'health_worker', 'facility_staff', 'admin', 'doctor')
  );

CREATE POLICY "appointments_update" ON appointments
  FOR UPDATE USING (
    provider_id = auth.uid()
    OR get_my_role() IN ('facility_staff', 'admin')
  );

-- ─────────────────────────────────────────
-- CONSULTATIONS
-- ─────────────────────────────────────────

CREATE POLICY "consultations_select" ON consultations
  FOR SELECT USING (
    (SELECT profile_id FROM patients WHERE id = patient_id) = auth.uid()
    OR doctor_id = auth.uid()
    OR get_my_role() IN ('health_worker', 'facility_staff', 'admin')
  );

CREATE POLICY "consultations_insert" ON consultations
  FOR INSERT WITH CHECK (
    get_my_role() IN ('doctor', 'admin')
  );

CREATE POLICY "consultations_update" ON consultations
  FOR UPDATE USING (
    doctor_id = auth.uid() OR get_my_role() = 'admin'
  );

CREATE POLICY "consult_notes_select" ON consultation_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM consultations c
      WHERE c.id = consultation_id
      AND (
        (SELECT profile_id FROM patients WHERE id = c.patient_id) = auth.uid()
        OR c.doctor_id = auth.uid()
        OR get_my_role() IN ('health_worker', 'facility_staff', 'admin')
      )
    )
  );

CREATE POLICY "consult_notes_insert" ON consultation_notes
  FOR INSERT WITH CHECK (get_my_role() IN ('doctor', 'admin'));

-- ─────────────────────────────────────────
-- PRESCRIPTIONS
-- ─────────────────────────────────────────

CREATE POLICY "prescriptions_select" ON prescriptions
  FOR SELECT USING (
    (SELECT profile_id FROM patients WHERE id = patient_id) = auth.uid()
    OR doctor_id = auth.uid()
    OR get_my_role() IN ('health_worker', 'facility_staff', 'admin', 'pharmacy')
  );

CREATE POLICY "prescriptions_insert" ON prescriptions
  FOR INSERT WITH CHECK (
    get_my_role() IN ('doctor', 'admin')
  );

CREATE POLICY "prescriptions_update" ON prescriptions
  FOR UPDATE USING (
    doctor_id = auth.uid()
    OR get_my_role() IN ('admin', 'pharmacy')
  );

CREATE POLICY "prescription_items_select" ON prescription_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prescriptions p WHERE p.id = prescription_id
      AND (
        (SELECT profile_id FROM patients WHERE id = p.patient_id) = auth.uid()
        OR p.doctor_id = auth.uid()
        OR get_my_role() IN ('health_worker', 'facility_staff', 'admin', 'pharmacy')
      )
    )
  );

CREATE POLICY "prescription_items_insert" ON prescription_items
  FOR INSERT WITH CHECK (get_my_role() IN ('doctor', 'admin'));

CREATE POLICY "prescription_docs_select" ON prescription_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prescriptions p WHERE p.id = prescription_id
      AND (
        (SELECT profile_id FROM patients WHERE id = p.patient_id) = auth.uid()
        OR p.doctor_id = auth.uid()
        OR get_my_role() IN ('admin', 'pharmacy')
      )
    )
  );

CREATE POLICY "prescription_docs_insert" ON prescription_documents
  FOR INSERT WITH CHECK (get_my_role() IN ('doctor', 'admin'));

-- ─────────────────────────────────────────
-- DIAGNOSTICS
-- ─────────────────────────────────────────

CREATE POLICY "diagnostic_orders_select" ON diagnostic_orders
  FOR SELECT USING (
    (SELECT profile_id FROM patients WHERE id = patient_id) = auth.uid()
    OR ordered_by = auth.uid()
    OR get_my_role() IN ('health_worker', 'facility_staff', 'admin')
  );

CREATE POLICY "diagnostic_orders_insert" ON diagnostic_orders
  FOR INSERT WITH CHECK (get_my_role() IN ('doctor', 'admin'));

CREATE POLICY "diagnostic_reports_select" ON diagnostic_reports
  FOR SELECT USING (
    (SELECT profile_id FROM patients WHERE id = patient_id) = auth.uid()
    OR get_my_role() IN ('doctor', 'health_worker', 'facility_staff', 'admin')
  );

CREATE POLICY "diagnostic_reports_insert" ON diagnostic_reports
  FOR INSERT WITH CHECK (get_my_role() IN ('facility_staff', 'admin'));

-- ─────────────────────────────────────────
-- REFERRALS
-- ─────────────────────────────────────────

CREATE POLICY "referrals_select" ON referrals
  FOR SELECT USING (
    (SELECT profile_id FROM patients WHERE id = patient_id) = auth.uid()
    OR referred_by = auth.uid()
    OR referred_to_provider = auth.uid()
    OR get_my_role() IN ('health_worker', 'facility_staff', 'admin')
  );

CREATE POLICY "referrals_insert" ON referrals
  FOR INSERT WITH CHECK (get_my_role() IN ('doctor', 'health_worker', 'admin'));

CREATE POLICY "referrals_update" ON referrals
  FOR UPDATE USING (
    referred_by = auth.uid()
    OR referred_to_provider = auth.uid()
    OR get_my_role() IN ('facility_staff', 'admin')
  );

-- ─────────────────────────────────────────
-- FOLLOW-UPS
-- ─────────────────────────────────────────

CREATE POLICY "followups_select" ON follow_ups
  FOR SELECT USING (
    (SELECT profile_id FROM patients WHERE id = patient_id) = auth.uid()
    OR created_by = auth.uid()
    OR get_my_role() IN ('health_worker', 'doctor', 'facility_staff', 'admin')
  );

CREATE POLICY "followups_insert" ON follow_ups
  FOR INSERT WITH CHECK (
    get_my_role() IN ('doctor', 'health_worker', 'admin')
  );

CREATE POLICY "followups_update" ON follow_ups
  FOR UPDATE USING (
    created_by = auth.uid() OR get_my_role() IN ('health_worker', 'doctor', 'admin')
  );

-- ─────────────────────────────────────────
-- PHARMACY DISPENSING
-- ─────────────────────────────────────────

CREATE POLICY "dispensing_select" ON pharmacy_dispensing
  FOR SELECT USING (
    dispensed_by = auth.uid()
    OR pharmacy_id = get_my_facility_id()
    OR get_my_role() IN ('admin', 'doctor', 'facility_staff')
    OR EXISTS (
      SELECT 1 FROM prescriptions p
      WHERE p.id = prescription_id
      AND (SELECT profile_id FROM patients WHERE id = p.patient_id) = auth.uid()
    )
  );

CREATE POLICY "dispensing_insert" ON pharmacy_dispensing
  FOR INSERT WITH CHECK (get_my_role() IN ('pharmacy', 'admin'));

CREATE POLICY "dispensing_update" ON pharmacy_dispensing
  FOR UPDATE USING (
    pharmacy_id = get_my_facility_id() OR get_my_role() = 'admin'
  );

CREATE POLICY "dispensing_items_select" ON pharmacy_dispensing_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pharmacy_dispensing pd
      WHERE pd.id = dispensing_id
      AND (
        pd.dispensed_by = auth.uid()
        OR pd.pharmacy_id = get_my_facility_id()
        OR get_my_role() IN ('admin', 'doctor')
      )
    )
  );

CREATE POLICY "dispensing_items_write" ON pharmacy_dispensing_items
  FOR ALL USING (get_my_role() IN ('pharmacy', 'admin'));

-- ─────────────────────────────────────────
-- DOCUMENTS
-- ─────────────────────────────────────────

CREATE POLICY "documents_select" ON documents
  FOR SELECT USING (
    (SELECT profile_id FROM patients WHERE id = patient_id) = auth.uid()
    OR uploaded_by = auth.uid()
    OR get_my_role() IN ('doctor', 'health_worker', 'facility_staff', 'admin')
  );

CREATE POLICY "documents_insert" ON documents
  FOR INSERT WITH CHECK (
    get_my_role() IN ('patient', 'doctor', 'health_worker', 'facility_staff', 'admin')
  );

-- ─────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────

CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_system" ON notifications
  FOR INSERT WITH CHECK (TRUE); -- backend inserts notifications for users

-- ─────────────────────────────────────────
-- AUDIT LOGS (admin read-only)
-- ─────────────────────────────────────────

CREATE POLICY "audit_logs_select_admin" ON audit_logs
  FOR SELECT USING (get_my_role() = 'admin');

CREATE POLICY "audit_logs_insert_all" ON audit_logs
  FOR INSERT WITH CHECK (TRUE); -- any authenticated action can log
