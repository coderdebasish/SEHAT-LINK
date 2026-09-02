// ============================================================
// SEHAT-LINK — Shared Type Definitions
// Used by both web (Next.js) and mobile (React Native / Expo)
// ============================================================

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

export type UserRole =
  | 'patient'
  | 'health_worker'
  | 'doctor'
  | 'pharmacy'
  | 'facility_staff'
  | 'admin';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export type AppointmentType = 'in_person' | 'teleconsultation' | 'home_visit' | 'follow_up';

export type PrescriptionType = 'digital' | 'scanned';

export type PrescriptionStatus = 'active' | 'dispensed' | 'partially_dispensed' | 'expired' | 'cancelled';

export type DispensingItemStatus = 'available' | 'partially_dispensed' | 'dispensed' | 'not_available';

export type ReferralStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export type FollowUpStatus = 'scheduled' | 'completed' | 'missed' | 'rescheduled';

export type DiagnosticOrderStatus = 'ordered' | 'sample_collected' | 'processing' | 'reported' | 'cancelled';

export type RiskFlag = 'low' | 'medium' | 'high' | 'critical';

export type FacilityType =
  | 'primary_health_centre'
  | 'community_health_centre'
  | 'district_hospital'
  | 'clinic'
  | 'pharmacy'
  | 'diagnostic_lab'
  | 'sub_centre';

export type NotificationType =
  | 'appointment_reminder'
  | 'prescription_ready'
  | 'follow_up_due'
  | 'referral_update'
  | 'report_available'
  | 'dispensing_update'
  | 'system';

export type SyncStatus = 'synced' | 'pending' | 'failed';

// ─────────────────────────────────────────
// AUTH & PROFILES
// ─────────────────────────────────────────

export interface Profile {
  id: string; // matches auth.users.id
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  facility_id?: string; // for doctors, pharmacists, facility staff
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────
// PATIENT
// ─────────────────────────────────────────

export interface Patient {
  id: string;
  sehat_id: string; // e.g. SL-MH-2026-000001
  profile_id?: string; // if patient has an account
  full_name: string;
  dob: string; // ISO date
  gender: Gender;
  blood_group: BloodGroup;
  phone?: string;
  email?: string;
  address: PatientAddress;
  emergency_contact?: EmergencyContact;
  is_active: boolean;
  registered_by?: string; // profile_id of health worker who registered
  facility_id?: string; // primary facility
  created_at: string;
  updated_at: string;
}

export interface PatientAddress {
  line1: string;
  line2?: string;
  village?: string;
  taluka?: string;
  district: string;
  state: string;
  pincode: string;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

// ─────────────────────────────────────────
// FACILITIES & PROVIDERS
// ─────────────────────────────────────────

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  address: string;
  district: string;
  state: string;
  pincode: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
}

export interface Provider {
  id: string;
  profile_id: string;
  facility_id: string;
  specialization?: string;
  registration_number?: string; // medical council reg no
  qualification?: string;
  is_available: boolean;
  created_at: string;
}

// ─────────────────────────────────────────
// VITALS & ASSESSMENTS
// ─────────────────────────────────────────

export interface Vitals {
  id: string;
  patient_id: string;
  recorded_by: string; // profile_id
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  pulse_rate?: number; // bpm
  temperature?: number; // Celsius
  weight?: number; // kg
  height?: number; // cm
  spo2?: number; // %
  blood_sugar?: number; // mg/dL
  notes?: string;
  recorded_at: string;
  sync_status?: SyncStatus; // for offline-first mobile
}

export interface Assessment {
  id: string;
  patient_id: string;
  worker_id: string; // profile_id of health worker
  chief_complaint: string;
  symptoms: string[];
  notes?: string;
  risk_flag: RiskFlag;
  visited_at: string;
  sync_status?: SyncStatus;
}

// ─────────────────────────────────────────
// APPOINTMENTS
// ─────────────────────────────────────────

export interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  facility_id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  type: AppointmentType;
  reason?: string;
  notes?: string;
  token_number?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────
// CONSULTATIONS
// ─────────────────────────────────────────

export interface Consultation {
  id: string;
  patient_id: string;
  doctor_id: string; // profile_id
  facility_id?: string;
  appointment_id?: string;
  chief_complaint: string;
  diagnosis?: string;
  icd_code?: string;
  notes?: string;
  consulted_at: string;
  created_at: string;
}

export interface ConsultationNote {
  id: string;
  consultation_id: string;
  note_type: 'subjective' | 'objective' | 'assessment' | 'plan' | 'general';
  content: string;
  created_at: string;
}

// ─────────────────────────────────────────
// PRESCRIPTIONS
// ─────────────────────────────────────────

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string; // profile_id
  consultation_id?: string;
  type: PrescriptionType;
  status: PrescriptionStatus;
  notes?: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
  // joined fields
  items?: PrescriptionItem[];
  document?: PrescriptionDocument;
  doctor_name?: string;
  patient_name?: string;
  sehat_id?: string;
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medicine_name: string;
  dosage: string; // e.g. "500mg"
  frequency: string; // e.g. "Twice daily"
  duration: string; // e.g. "7 days"
  instructions?: string;
  quantity?: number;
}

export interface PrescriptionDocument {
  id: string;
  prescription_id: string;
  file_url: string;
  file_name: string;
  file_type: 'image/jpeg' | 'image/png' | 'application/pdf';
  file_size_bytes: number;
  uploaded_at: string;
}

// ─────────────────────────────────────────
// DIAGNOSTICS
// ─────────────────────────────────────────

export interface DiagnosticOrder {
  id: string;
  patient_id: string;
  ordered_by: string; // doctor profile_id
  facility_id?: string;
  test_name: string;
  test_type?: string;
  priority: 'routine' | 'urgent' | 'emergency';
  status: DiagnosticOrderStatus;
  notes?: string;
  ordered_at: string;
}

export interface DiagnosticReport {
  id: string;
  order_id: string;
  patient_id: string;
  file_url?: string;
  findings?: string;
  reported_at: string;
  reported_by?: string; // facility staff profile_id
}

// ─────────────────────────────────────────
// REFERRALS
// ─────────────────────────────────────────

export interface Referral {
  id: string;
  patient_id: string;
  referred_by: string; // profile_id (doctor or health worker)
  referred_to_provider?: string; // profile_id
  referred_to_facility?: string; // facility_id
  reason: string;
  clinical_summary?: string;
  status: ReferralStatus;
  priority: 'routine' | 'urgent' | 'emergency';
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────
// FOLLOW-UPS
// ─────────────────────────────────────────

export interface FollowUp {
  id: string;
  patient_id: string;
  created_by: string; // profile_id
  consultation_id?: string;
  due_date: string;
  instructions: string;
  status: FollowUpStatus;
  completed_at?: string;
  notes?: string;
  sync_status?: SyncStatus;
  created_at: string;
}

// ─────────────────────────────────────────
// PHARMACY
// ─────────────────────────────────────────

export interface PharmacyDispensing {
  id: string;
  prescription_id: string;
  pharmacy_id: string; // profile_id or facility_id
  dispensed_by: string; // profile_id
  status: DispensingItemStatus;
  notes?: string;
  dispensed_at?: string;
  created_at: string;
  items?: PharmacyDispensingItem[];
}

export interface PharmacyDispensingItem {
  id: string;
  dispensing_id: string;
  prescription_item_id: string;
  medicine_name: string;
  quantity_dispensed?: number;
  status: DispensingItemStatus;
  notes?: string;
}

// ─────────────────────────────────────────
// DOCUMENTS
// ─────────────────────────────────────────

export interface Document {
  id: string;
  patient_id: string;
  uploaded_by: string; // profile_id
  file_url: string;
  file_name: string;
  file_type: string;
  category: 'prescription' | 'lab_report' | 'discharge_summary' | 'vaccination' | 'other';
  description?: string;
  uploaded_at: string;
}

// ─────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string; // profile_id
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  related_id?: string; // ID of related resource
  related_type?: string; // type of related resource
  created_at: string;
}

// ─────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────

export interface AuditLog {
  id: string;
  user_id: string;
  action: string; // e.g. 'CREATE_PRESCRIPTION', 'VIEW_PATIENT'
  resource_type: string;
  resource_id: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

// ─────────────────────────────────────────
// HEALTH TIMELINE ENTRY (Composed type)
// ─────────────────────────────────────────

export type TimelineEventType =
  | 'registration'
  | 'vitals'
  | 'assessment'
  | 'appointment'
  | 'consultation'
  | 'prescription'
  | 'diagnostic_order'
  | 'diagnostic_report'
  | 'referral'
  | 'follow_up'
  | 'document'
  | 'dispensing';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  date: string;
  by?: string; // performed by (name)
  data?: unknown; // raw event data
  sync_status?: SyncStatus;
}

// ─────────────────────────────────────────
// OFFLINE SYNC (Mobile)
// ─────────────────────────────────────────

export interface PendingSyncRecord {
  local_id: string;
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: Record<string, unknown>;
  created_at: string;
  retry_count: number;
  last_error?: string;
}

// ─────────────────────────────────────────
// API RESPONSE WRAPPERS
// ─────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}
