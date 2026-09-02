import { createClient } from '@/lib/supabase/client'

export async function getAssessmentsForPatient(patientId: string) {
  const supabase = createClient()
  return supabase
    .from('assessments')
    .select(`*, worker:profiles!assessments_worker_id_fkey(id, full_name)`)
    .eq('patient_id', patientId)
    .order('visited_at', { ascending: false })
}

export async function getAssessmentsForWorker(workerId: string) {
  const supabase = createClient()
  return supabase
    .from('assessments')
    .select(`*, patient:patients(id, sehat_id, full_name, dob, gender, village)`)
    .eq('worker_id', workerId)
    .order('visited_at', { ascending: false })
    .limit(50)
}

export async function createAssessment(data: {
  patient_id: string
  worker_id: string
  chief_complaint: string
  symptoms?: string[]
  notes?: string
  risk_flag?: 'low' | 'medium' | 'high' | 'critical'
}) {
  const supabase = createClient()
  return supabase.from('assessments').insert(data).select('*').single()
}

// ─────────────────────────────────────────
// Follow-ups
// ─────────────────────────────────────────

export async function getFollowUpsForPatient(patientId: string) {
  const supabase = createClient()
  return supabase
    .from('follow_ups')
    .select(`*, created_by_profile:profiles!follow_ups_created_by_fkey(id, full_name)`)
    .eq('patient_id', patientId)
    .order('due_date', { ascending: true })
}

export async function getFollowUpsForWorker(workerId: string) {
  const supabase = createClient()
  return supabase
    .from('follow_ups')
    .select(`*, patient:patients(id, sehat_id, full_name, village)`)
    .eq('created_by', workerId)
    .order('due_date', { ascending: true })
}

export async function createFollowUp(data: {
  patient_id: string
  created_by: string
  due_date: string
  instructions: string
  consultation_id?: string
}) {
  const supabase = createClient()
  return supabase.from('follow_ups').insert(data).select('*').single()
}

export async function updateFollowUpStatus(followUpId: string, status: string) {
  const supabase = createClient()
  return supabase
    .from('follow_ups')
    .update({ status, completed_at: status === 'completed' ? new Date().toISOString() : null })
    .eq('id', followUpId)
    .select()
    .single()
}

// ─────────────────────────────────────────
// Referrals
// ─────────────────────────────────────────

export async function getReferralsForPatient(patientId: string) {
  const supabase = createClient()
  return supabase
    .from('referrals')
    .select(`
      *,
      referred_by_profile:profiles!referrals_referred_by_fkey(id, full_name, role),
      referred_to_facility:facilities(id, name, village)
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
}

export async function getReferralsByCreator(profileId: string) {
  const supabase = createClient()
  return supabase
    .from('referrals')
    .select(`
      *,
      patient:patients(id, sehat_id, full_name, village),
      referred_to_facility:facilities(id, name, village)
    `)
    .eq('referred_by', profileId)
    .order('created_at', { ascending: false })
}

export async function createReferral(data: {
  patient_id: string
  referred_by: string
  referred_to_facility?: string
  referred_to_provider?: string
  reason: string
  clinical_summary?: string
  priority?: 'routine' | 'urgent' | 'emergency'
}) {
  const supabase = createClient()
  return supabase.from('referrals').insert(data).select('*').single()
}

// ─────────────────────────────────────────
// Diagnostics
// ─────────────────────────────────────────

export async function getDiagnosticOrdersForPatient(patientId: string) {
  const supabase = createClient()
  return supabase
    .from('diagnostic_orders')
    .select(`
      *,
      ordered_by_profile:profiles!diagnostic_orders_ordered_by_fkey(id, full_name),
      facility:facilities(id, name),
      diagnostic_reports(*)
    `)
    .eq('patient_id', patientId)
    .order('ordered_at', { ascending: false })
}

export async function createDiagnosticOrder(data: {
  patient_id: string
  ordered_by: string
  facility_id?: string
  test_name: string
  test_type?: string
  priority?: 'routine' | 'urgent' | 'emergency'
  notes?: string
}) {
  const supabase = createClient()
  return supabase.from('diagnostic_orders').insert(data).select('*').single()
}

// ─────────────────────────────────────────
// Provider lookup
// ─────────────────────────────────────────

export async function getProviderByProfileId(profileId: string) {
  const supabase = createClient()
  return supabase
    .from('providers')
    .select(`*, facility:facilities(id, name, village, taluka, district)`)
    .eq('profile_id', profileId)
    .single()
}

export async function getProvidersByFacility(facilityId: string) {
  const supabase = createClient()
  return supabase
    .from('providers')
    .select(`*, profile:profiles(id, full_name, role)`)
    .eq('facility_id', facilityId)
    .eq('is_available', true)
}

// ─────────────────────────────────────────
// Patient health timeline (aggregate query)
// ─────────────────────────────────────────

export async function getPatientTimeline(patientId: string) {
  const supabase = createClient()

  const [vitals, assessments, consultations, prescriptions, appointments, referrals, followUps] =
    await Promise.all([
      supabase.from('vitals')
        .select('id, recorded_at, blood_pressure_systolic, blood_pressure_diastolic, pulse_rate, temperature, spo2, blood_sugar, recorded_by_profile:profiles!vitals_recorded_by_fkey(full_name)')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(10),

      supabase.from('assessments')
        .select('id, visited_at, chief_complaint, risk_flag, worker:profiles!assessments_worker_id_fkey(full_name)')
        .eq('patient_id', patientId)
        .order('visited_at', { ascending: false })
        .limit(10),

      supabase.from('consultations')
        .select('id, consulted_at, chief_complaint, diagnosis, doctor:profiles!consultations_doctor_id_fkey(full_name)')
        .eq('patient_id', patientId)
        .order('consulted_at', { ascending: false })
        .limit(10),

      supabase.from('prescriptions')
        .select('id, created_at, status, type, doctor:profiles!prescriptions_doctor_id_fkey(full_name)')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(10),

      supabase.from('appointments')
        .select('id, scheduled_at, status, reason, provider:profiles!appointments_provider_id_fkey(full_name), facility:facilities(name)')
        .eq('patient_id', patientId)
        .order('scheduled_at', { ascending: false })
        .limit(10),

      supabase.from('referrals')
        .select('id, created_at, reason, status, priority')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(5),

      supabase.from('follow_ups')
        .select('id, due_date, instructions, status')
        .eq('patient_id', patientId)
        .order('due_date', { ascending: false })
        .limit(5),
    ])

  type TimelineEvent = {
    id: string
    type: string
    date: string
    title: string
    subtitle: string
    status?: string
    color: string
    risk?: string
  }

  // Supabase FK joins can return arrays or single objects depending on query structure.
  // Safely extract a field by handling both array and object shapes.
  function getField(joined: unknown, field: string = 'full_name'): string {
    if (!joined) return ''
    const obj = Array.isArray(joined) ? joined[0] : joined
    if (!obj || typeof obj !== 'object') return ''
    return (obj as Record<string, unknown>)[field] as string || ''
  }

  const events: TimelineEvent[] = []

  vitals.data?.forEach(v => events.push({
    id: v.id, type: 'vitals', date: v.recorded_at,
    title: `Vitals recorded by ${getField(v.recorded_by_profile) || 'Health Worker'}`,
    subtitle: `BP: ${v.blood_pressure_systolic ?? '—'}/${v.blood_pressure_diastolic ?? '—'} mmHg · Pulse: ${v.pulse_rate ?? '—'} bpm · SpO₂: ${v.spo2 ?? '—'}%`,
    color: 'emerald'
  }))

  assessments.data?.forEach(a => events.push({
    id: a.id, type: 'assessment', date: a.visited_at,
    title: `Field Assessment — ${a.chief_complaint}`,
    subtitle: `By ${getField(a.worker) || 'Health Worker'} · Risk: ${a.risk_flag || 'low'}`,
    status: a.risk_flag || 'low', color: 'amber', risk: a.risk_flag || 'low'
  }))

  consultations.data?.forEach(c => events.push({
    id: c.id, type: 'consultation', date: c.consulted_at,
    title: `Consultation — ${c.chief_complaint}`,
    subtitle: `${getField(c.doctor) ? 'Dr. ' + getField(c.doctor) : 'Doctor'} · ${c.diagnosis || 'Diagnosis pending'}`,
    color: 'blue'
  }))

  prescriptions.data?.forEach(p => events.push({
    id: p.id, type: 'prescription', date: p.created_at,
    title: `Prescription issued (${p.type})`,
    subtitle: `By ${getField(p.doctor) ? 'Dr. ' + getField(p.doctor) : 'Doctor'} · Status: ${p.status}`,
    status: p.status, color: 'violet'
  }))

  appointments.data?.forEach(a => events.push({
    id: a.id, type: 'appointment', date: a.scheduled_at,
    title: `Appointment — ${a.reason || 'Consultation'}`,
    subtitle: `${getField(a.provider) || 'Doctor'} at ${getField(a.facility, 'name') || 'Facility'}`,
    status: a.status, color: 'sky'
  }))

  referrals.data?.forEach(r => events.push({
    id: r.id, type: 'referral', date: r.created_at,
    title: `Referral — ${r.reason}`,
    subtitle: `Priority: ${r.priority} · Status: ${r.status}`,
    status: r.status, color: 'rose'
  }))

  followUps.data?.forEach(f => events.push({
    id: f.id, type: 'followup', date: f.due_date + 'T00:00:00',
    title: `Follow-up due — ${f.instructions}`,
    subtitle: `Status: ${f.status}`,
    status: f.status, color: 'orange'
  }))

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return { data: events, errors: [vitals.error, assessments.error, consultations.error].filter(Boolean) }
}
