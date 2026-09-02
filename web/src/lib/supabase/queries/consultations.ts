import { createClient } from '@/lib/supabase/client'

export async function getConsultationsForPatient(patientId: string) {
  const supabase = createClient()
  return supabase
    .from('consultations')
    .select(`
      *,
      doctor:profiles!consultations_doctor_id_fkey(id, full_name),
      facility:facilities(id, name, village),
      consultation_notes(*),
      prescriptions(id, status, prescription_items(medicine_name, dosage, frequency, duration))
    `)
    .eq('patient_id', patientId)
    .order('consulted_at', { ascending: false })
}

export async function getConsultationsForDoctor(doctorId: string, limit = 50) {
  const supabase = createClient()
  return supabase
    .from('consultations')
    .select(`
      *,
      patient:patients(id, sehat_id, full_name, dob, gender, blood_group),
      facility:facilities(id, name, village),
      consultation_notes(*),
      prescriptions(id, status)
    `)
    .eq('doctor_id', doctorId)
    .order('consulted_at', { ascending: false })
    .limit(limit)
}

export async function createConsultation(data: {
  patient_id: string
  doctor_id: string
  facility_id?: string
  appointment_id?: string
  chief_complaint: string
  diagnosis?: string
  icd_code?: string
  notes?: string
  soap_notes?: Array<{ note_type: string; content: string }>
}) {
  const supabase = createClient()
  const { soap_notes, ...consultationData } = data

  const { data: consultation, error: consultationError } = await supabase
    .from('consultations')
    .insert(consultationData)
    .select()
    .single()

  if (consultationError || !consultation) return { data: null, error: consultationError }

  if (soap_notes && soap_notes.length > 0) {
    const { error: notesError } = await supabase
      .from('consultation_notes')
      .insert(soap_notes.map(n => ({ ...n, consultation_id: consultation.id })))

    if (notesError) return { data: null, error: notesError }
  }

  return { data: consultation, error: null }
}
