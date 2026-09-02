import { createClient } from '@/lib/supabase/client'

// ─────────────────────────────────────────
// Patient queries
// ─────────────────────────────────────────

export async function getPatientByProfileId(profileId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patients')
    .select(`
      *,
      primary_facility:facilities(id, name, village, taluka, district)
    `)
    .eq('profile_id', profileId)
    .single()
  return { data, error }
}

export async function getPatientBySehatId(sehatId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patients')
    .select(`
      *,
      primary_facility:facilities(id, name, village, taluka)
    `)
    .eq('sehat_id', sehatId.trim().toUpperCase())
    .single()
  return { data, error }
}

export async function getAllPatients(facilityId?: string) {
  const supabase = createClient()
  let query = supabase
    .from('patients')
    .select(`*, primary_facility:facilities(name, village)`)
    .order('created_at', { ascending: false })

  if (facilityId) {
    query = query.eq('primary_facility_id', facilityId)
  }
  return query
}

export async function registerNewPatient(data: {
  full_name: string
  dob?: string
  gender?: string
  blood_group?: string
  phone?: string
  address_line1?: string
  village?: string
  taluka?: string
  district?: string
  state?: string
  pincode?: string
  emergency_name?: string
  emergency_relation?: string
  emergency_phone?: string
  primary_facility_id?: string
  registered_by?: string
}) {
  const supabase = createClient()
  return supabase
    .from('patients')
    .insert(data)
    .select('*')
    .single()
}
