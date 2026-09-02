import { createClient } from '@/lib/supabase/client'

export async function getVitalsForPatient(patientId: string, limit = 20) {
  const supabase = createClient()
  return supabase
    .from('vitals')
    .select(`*, recorded_by_profile:profiles!vitals_recorded_by_fkey(full_name, role)`)
    .eq('patient_id', patientId)
    .order('recorded_at', { ascending: false })
    .limit(limit)
}

export async function recordVitals(data: {
  patient_id: string
  recorded_by: string
  blood_pressure_systolic?: number
  blood_pressure_diastolic?: number
  pulse_rate?: number
  temperature?: number
  weight?: number
  height?: number
  spo2?: number
  blood_sugar?: number
  notes?: string
}) {
  const supabase = createClient()
  return supabase.from('vitals').insert(data).select('*').single()
}
