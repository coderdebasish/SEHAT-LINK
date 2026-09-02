-- ============================================================
-- SEHAT-LINK — Complete Demo Seed Data (Run after auth users are created)
-- ============================================================
-- STEP 1: Create these 6 auth users in Supabase Dashboard → Authentication → Users
-- Email / Password / Full Name (put in user_metadata)
--
-- patient@sehat.in       / Sehat123 / full_name: Priya Ramesh Patil, role: patient
-- doctor@sehat.in        / Sehat123 / full_name: Dr. Rajesh Sharma, role: doctor
-- healthworker@sehat.in  / Sehat123 / full_name: Meena Suresh Patil, role: health_worker
-- pharmacy@sehat.in      / Sehat123 / full_name: Rohit Anil Kulkarni, role: pharmacy
-- facility@sehat.in      / Sehat123 / full_name: Kavita Ramesh Deshmukh, role: facility_staff
-- admin@sehat.in         / Sehat123 / full_name: Suresh Nana Bhosale, role: admin
--
-- STEP 2: After creating users, run the SELECT below to get their UUIDs:
--   SELECT id, email FROM auth.users ORDER BY created_at;
--
-- STEP 3: Replace the UUIDs below with the real ones, then run this file.
-- ============================================================

-- ─────────────────────────────────────────
-- FACILITIES (safe to re-run with ON CONFLICT)
-- ─────────────────────────────────────────

INSERT INTO facilities (id, name, type, address, village, taluka, district, state, pincode, phone) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'Khed Primary Health Centre', 'primary_health_centre',
   'Khed Village Road, Khed', 'Khed', 'Khed', 'Pune', 'Maharashtra', '410505', '020-23456789'),
  ('f1000000-0000-0000-0000-000000000002', 'Rajgurunagar Community Health Centre', 'community_health_centre',
   'Rajgurunagar Main Road', 'Rajgurunagar', 'Khed', 'Pune', 'Maharashtra', '410513', '020-23456790'),
  ('f1000000-0000-0000-0000-000000000003', 'LifeCare Pharmacy', 'pharmacy',
   'Market Road, Khed', 'Khed', 'Khed', 'Pune', 'Maharashtra', '410505', '9876543210'),
  ('f1000000-0000-0000-0000-000000000004', 'Sunrise Diagnostics Lab', 'diagnostic_lab',
   'Civil Lines, Khed', 'Khed', 'Khed', 'Pune', 'Maharashtra', '410505', '9876543211'),
  ('f1000000-0000-0000-0000-000000000005', 'Manchar Community Health Centre', 'community_health_centre',
   'Manchar Main Road', 'Manchar', 'Ambegaon', 'Pune', 'Maharashtra', '410503', '020-23456792'),
  ('f1000000-0000-0000-0000-000000000006', 'Shirur Sub-District Hospital', 'district_hospital',
   'Hospital Road, Shirur', 'Shirur', 'Shirur', 'Pune', 'Maharashtra', '412210', '020-23456793')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- UPDATE PROFILES — set role + facility_id
-- Run this after auth users are created.
-- The handle_new_user() trigger auto-creates profiles on signup.
-- We just need to UPDATE them with the correct role and facility.
-- ─────────────────────────────────────────

-- Get UUIDs first:
-- SELECT id, email FROM auth.users WHERE email IN (
--   'patient@sehat.in','doctor@sehat.in','healthworker@sehat.in',
--   'pharmacy@sehat.in','facility@sehat.in','admin@sehat.in'
-- );

-- Then run these UPDATEs with real UUIDs:
-- UPDATE profiles SET role = 'patient',         full_name = 'Priya Ramesh Patil',        facility_id = NULL                                         WHERE id = '<PATIENT_UUID>';
-- UPDATE profiles SET role = 'doctor',          full_name = 'Dr. Rajesh Sharma',          facility_id = 'f1000000-0000-0000-0000-000000000001'       WHERE id = '<DOCTOR_UUID>';
-- UPDATE profiles SET role = 'health_worker',   full_name = 'Meena Suresh Patil',         facility_id = 'f1000000-0000-0000-0000-000000000001'       WHERE id = '<HEALTH_WORKER_UUID>';
-- UPDATE profiles SET role = 'pharmacy',        full_name = 'Rohit Anil Kulkarni',        facility_id = 'f1000000-0000-0000-0000-000000000003'       WHERE id = '<PHARMACY_UUID>';
-- UPDATE profiles SET role = 'facility_staff',  full_name = 'Kavita Ramesh Deshmukh',     facility_id = 'f1000000-0000-0000-0000-000000000001'       WHERE id = '<FACILITY_UUID>';
-- UPDATE profiles SET role = 'admin',           full_name = 'Suresh Nana Bhosale',        facility_id = NULL                                         WHERE id = '<ADMIN_UUID>';

-- ─────────────────────────────────────────
-- PROVIDERS (doctor and health worker)
-- Run after profile UUIDs are set
-- ─────────────────────────────────────────

-- INSERT INTO providers (id, profile_id, facility_id, specialization, registration_number, qualification) VALUES
--   ('p1000000-0000-0000-0000-000000000001', '<DOCTOR_UUID>',       'f1000000-0000-0000-0000-000000000001', 'General Medicine / Physician', 'MCI-2015-88412', 'MBBS, MD (Internal Medicine)'),
--   ('p1000000-0000-0000-0000-000000000002', '<HEALTH_WORKER_UUID>','f1000000-0000-0000-0000-000000000001', 'Community Health', 'ASHA-MH-2018-4421', 'ANM, ASHA Certified')
-- ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────
-- DEMO PATIENT — link profile_id to patient record
-- Run after patient profile UUID is known
-- ─────────────────────────────────────────

INSERT INTO patients (
  id, sehat_id, profile_id, full_name, dob, gender, blood_group,
  phone, address_line1, village, taluka, district, state, pincode,
  emergency_name, emergency_relation, emergency_phone,
  primary_facility_id
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'SL-MH-2026-000001',
  NULL, -- UPDATE this: SET profile_id = '<PATIENT_UUID>' after user creation
  'Priya Ramesh Patil',
  '1998-06-15',
  'female',
  'B+',
  '9823456789',
  'House No 45, Tambat Ali',
  'Khed',
  'Khed',
  'Pune',
  'Maharashtra',
  '410505',
  'Ramesh Patil',
  'Father',
  '9823456788',
  'f1000000-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

-- UPDATE patients SET profile_id = '<PATIENT_UUID>' WHERE id = 'a0000000-0000-0000-0000-000000000001';

-- ─────────────────────────────────────────
-- DEMO VITALS (baseline for demo patient)
-- ─────────────────────────────────────────

-- INSERT INTO vitals (patient_id, recorded_by, blood_pressure_systolic, blood_pressure_diastolic, pulse_rate, temperature, weight, height, spo2, blood_sugar, recorded_at) VALUES
--   ('a0000000-0000-0000-0000-000000000001', '<HEALTH_WORKER_UUID>', 118, 76, 82, 98.6, 54.0, 158.0, 98, 95, NOW() - INTERVAL '4 days'),
--   ('a0000000-0000-0000-0000-000000000001', '<HEALTH_WORKER_UUID>', 122, 80, 88, 99.1, 54.2, 158.0, 97, 98, NOW() - INTERVAL '2 days');

-- ─────────────────────────────────────────
-- DEMO ASSESSMENT
-- ─────────────────────────────────────────

-- INSERT INTO assessments (patient_id, worker_id, chief_complaint, symptoms, notes, risk_flag, visited_at) VALUES
--   ('a0000000-0000-0000-0000-000000000001', '<HEALTH_WORKER_UUID>', 'Mild fever and body ache', ARRAY['fever', 'body_ache', 'fatigue'], 'Patient reports 2-day history of low-grade fever. No respiratory symptoms. ANC check due.', 'low', NOW() - INTERVAL '5 days');

-- ─────────────────────────────────────────
-- DEMO CONSULTATION + PRESCRIPTION
-- ─────────────────────────────────────────

-- INSERT INTO consultations (id, patient_id, doctor_id, facility_id, chief_complaint, diagnosis, icd_code, consulted_at) VALUES
--   ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '<DOCTOR_UUID>', 'f1000000-0000-0000-0000-000000000001', 'Fever and body ache for 2 days', 'Viral fever (NOS)', 'A09', NOW() - INTERVAL '2 days');

-- INSERT INTO prescriptions (id, patient_id, doctor_id, consultation_id, type, status, valid_until) VALUES
--   ('rx000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '<DOCTOR_UUID>', 'c0000000-0000-0000-0000-000000000001', 'digital', 'active', CURRENT_DATE + INTERVAL '30 days');

-- INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, instructions, quantity) VALUES
--   ('rx000000-0000-0000-0000-000000000001', 'Amoxicillin 500mg Capsule', '500mg', 'Twice daily (morning + evening)', '5 days', 'Take after meals with water', 10),
--   ('rx000000-0000-0000-0000-000000000001', 'Paracetamol 650mg Tablet', '650mg', 'As needed (max 3x daily)', '3 days', 'Take only when temperature > 100°F', 9),
--   ('rx000000-0000-0000-0000-000000000001', 'ORS Sachets', '1 sachet', 'After each loose stool', 'As needed', 'Dissolve in 200ml water', 5);

-- ─────────────────────────────────────────
-- DEMO APPOINTMENTS (before UUID is known, use placeholders)
-- ─────────────────────────────────────────

-- INSERT INTO appointments (patient_id, provider_id, facility_id, scheduled_at, status, type, reason, token_number) VALUES
--   ('a0000000-0000-0000-0000-000000000001', '<DOCTOR_UUID>', 'f1000000-0000-0000-0000-000000000001', NOW() + INTERVAL '1 day' + INTERVAL '10 hours 30 minutes', 'scheduled', 'in_person', 'Routine follow-up & prescription review', 1);

-- ─────────────────────────────────────────
-- DEMO FOLLOW-UP
-- ─────────────────────────────────────────

-- INSERT INTO follow_ups (patient_id, created_by, due_date, instructions, status) VALUES
--   ('a0000000-0000-0000-0000-000000000001', '<DOCTOR_UUID>', CURRENT_DATE + INTERVAL '7 days', 'Return for BP check and fever review. Continue medications for full course.', 'scheduled');

-- ─────────────────────────────────────────
-- DEMO DIAGNOSTIC ORDER
-- ─────────────────────────────────────────

-- INSERT INTO diagnostic_orders (patient_id, ordered_by, facility_id, test_name, test_type, priority, status) VALUES
--   ('a0000000-0000-0000-0000-000000000001', '<DOCTOR_UUID>', 'f1000000-0000-0000-0000-000000000004', 'Complete Blood Count (CBC)', 'Haematology', 'routine', 'ordered');

-- ─────────────────────────────────────────
-- DEMO NOTIFICATION
-- ─────────────────────────────────────────

-- INSERT INTO notifications (user_id, type, title, body) VALUES
--   ('<PATIENT_UUID>', 'prescription_ready', 'New Prescription Available', 'Dr. Rajesh Sharma has issued a new prescription for your recent consultation.');
