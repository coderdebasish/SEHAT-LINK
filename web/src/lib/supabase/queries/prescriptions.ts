import { createClient } from '@/lib/supabase/client'

export async function getPrescriptionsForPatient(patientId: string) {
  const supabase = createClient()
  return supabase
    .from('prescriptions')
    .select(`
      *,
      doctor:profiles!prescriptions_doctor_id_fkey(id, full_name),
      consultation:consultations(id, chief_complaint, consulted_at),
      prescription_items(*),
      prescription_documents(*),
      pharmacy_dispensing(id, status, dispensed_at, pharmacy:facilities(name))
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
}

export async function getPrescriptionBySehatId(sehatId: string) {
  const supabase = createClient()
  const { data: patient } = await supabase
    .from('patients')
    .select('id, full_name, dob, gender, sehat_id')
    .eq('sehat_id', sehatId.trim().toUpperCase())
    .single()

  if (!patient) return { data: null, error: new Error('Patient not found') }

  const { data: prescriptions, error } = await supabase
    .from('prescriptions')
    .select(`
      *,
      doctor:profiles!prescriptions_doctor_id_fkey(id, full_name),
      prescription_items(*),
      pharmacy_dispensing(id, status, dispensed_at)
    `)
    .eq('patient_id', patient.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return { data: { patient, prescriptions }, error }
}

export async function createPrescription(data: {
  patient_id: string
  doctor_id: string
  consultation_id?: string
  type: 'digital' | 'scanned'
  notes?: string
  valid_until?: string
  items: Array<{
    medicine_name: string
    dosage?: string
    frequency?: string
    duration?: string
    instructions?: string
    quantity?: number
  }>
}) {
  const supabase = createClient()
  const { items, ...prescriptionData } = data

  const { data: prescription, error: prescriptionError } = await supabase
    .from('prescriptions')
    .insert({ ...prescriptionData, status: 'active' })
    .select()
    .single()

  if (prescriptionError || !prescription) return { data: null, error: prescriptionError }

  const { error: itemsError } = await supabase
    .from('prescription_items')
    .insert(items.map(item => ({ ...item, prescription_id: prescription.id })))

  if (itemsError) return { data: null, error: itemsError }

  return { data: prescription, error: null }
}

export async function dispensePrescription(data: {
  prescription_id: string
  pharmacy_id: string
  dispensed_by: string
  notes?: string
}) {
  const supabase = createClient()
  const { error } = await supabase
    .from('pharmacy_dispensing')
    .insert({ ...data, status: 'dispensed', dispensed_at: new Date().toISOString() })

  if (error) return { error }

  // Update prescription status to dispensed
  const { error: updateError } = await supabase
    .from('prescriptions')
    .update({ status: 'dispensed' })
    .eq('id', data.prescription_id)

  return { error: updateError }
}
