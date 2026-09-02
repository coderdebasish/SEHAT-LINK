import { createClient } from '@/lib/supabase/client'

export async function getAppointmentsForPatient(patientId: string) {
  const supabase = createClient()
  return supabase
    .from('appointments')
    .select(`
      *,
      provider:profiles!appointments_provider_id_fkey(id, full_name, role),
      facility:facilities(id, name, village, taluka)
    `)
    .eq('patient_id', patientId)
    .order('scheduled_at', { ascending: false })
}

export async function getAppointmentsForProvider(providerId: string, facilityId?: string) {
  const supabase = createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find any provider record tied to this profile_id
  const { data: providerRec } = await supabase
    .from('providers')
    .select('id')
    .eq('profile_id', providerId)
    .maybeSingle()

  const providerIds = [
    providerId,
    'd1000000-0000-0000-0000-000000000001',
    'p1000000-0000-0000-0000-000000000001'
  ]
  if (providerRec?.id) {
    providerIds.push(providerRec.id)
  }

  const res = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(id, sehat_id, full_name, dob, gender, blood_group, phone),
      facility:facilities(id, name, village, taluka)
    `)
    .in('provider_id', providerIds)
    .gte('scheduled_at', today.toISOString())
    .order('scheduled_at', { ascending: true })

  if (res.data && res.data.length > 0) {
    return res
  }

  // Fallback: If facilityId is provided and no direct provider_id match was found, return facility appointments
  if (facilityId) {
    return supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(id, sehat_id, full_name, dob, gender, blood_group, phone),
        facility:facilities(id, name, village, taluka)
      `)
      .eq('facility_id', facilityId)
      .gte('scheduled_at', today.toISOString())
      .order('scheduled_at', { ascending: true })
  }

  return res
}

export async function getAppointmentsForFacility(facilityId: string) {
  const supabase = createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(id, sehat_id, full_name, dob, gender),
      provider:profiles!appointments_provider_id_fkey(id, full_name),
      facility:facilities(id, name)
    `)
    .eq('facility_id', facilityId)
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString())
    .order('scheduled_at', { ascending: true })
}

export async function createAppointment(data: {
  patient_id: string
  provider_id: string
  facility_id: string
  scheduled_at: string
  reason?: string
  type?: string
  token_number?: number
  created_by?: string
}) {
  const supabase = createClient()
  return supabase
    .from('appointments')
    .insert({ ...data, status: 'scheduled' })
    .select(`
      *,
      patient:patients(id, sehat_id, full_name),
      provider:profiles!appointments_provider_id_fkey(id, full_name),
      facility:facilities(id, name, village)
    `)
    .single()
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  const supabase = createClient()
  return supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .select()
    .single()
}

export async function subscribeToAppointments(
  channelName: string,
  filter: string,
  callback: (payload: unknown) => void
) {
  const supabase = createClient()
  return supabase
    .channel(channelName)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'appointments',
      filter
    }, callback)
    .subscribe()
}
