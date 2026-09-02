'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ROLE_DASHBOARD_ROUTES } from '@/lib/utils'
import type { Profile, UserRole } from '@sehat-link/types'

export type { Profile }

export interface PatientRecord {
  id: string
  sehat_id: string
  profile_id: string | null
  full_name: string
  dob: string | null
  gender: string | null
  blood_group: string | null
  phone: string | null
  address_line1: string | null
  village: string | null
  taluka: string | null
  district: string
  state: string
  pincode: string | null
  primary_facility_id: string | null
  primary_facility?: { id: string; name: string; village: string; taluka: string } | null
}

export interface ProviderRecord {
  id: string
  profile_id: string
  facility_id: string
  specialization: string | null
  registration_number: string | null
  qualification: string | null
  facility?: { id: string; name: string; village: string; taluka: string; district: string } | null
}

export interface AuthState {
  profile: Profile | null
  patient: PatientRecord | null      // populated when role === 'patient'
  provider: ProviderRecord | null    // populated when role === 'doctor' | 'health_worker'
  loading: boolean
  signOut: () => Promise<void>
  refetch: () => Promise<void>
}

export function useAuth(): AuthState {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [patient, setPatient] = useState<PatientRecord | null>(null)
  const [provider, setProvider] = useState<ProviderRecord | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setProfile(null); setPatient(null); setProvider(null)
      setLoading(false); return
    }

    // Fetch profile from DB
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profileData) {
      setLoading(false); return
    }

    // Cast DB row to typed Profile — role comes back as string from Supabase, cast to UserRole
    const typedProfile: Profile = {
      id: profileData.id,
      full_name: profileData.full_name,
      email: user.email ?? profileData.email ?? undefined,
      phone: profileData.phone ?? undefined,
      avatar_url: profileData.avatar_url ?? undefined,
      role: profileData.role as UserRole,
      facility_id: profileData.facility_id ?? undefined,
      is_active: profileData.is_active,
      created_at: profileData.created_at,
      updated_at: profileData.updated_at,
    }

    setProfile(typedProfile)

    // Fetch role-specific entity
    if (typedProfile.role === 'patient') {
      const { data: patientData } = await supabase
        .from('patients')
        .select(`*, primary_facility:facilities(id, name, village, taluka)`)
        .eq('profile_id', user.id)
        .single()
      setPatient(patientData)
    }

    if (typedProfile.role === 'doctor' || typedProfile.role === 'health_worker') {
      const { data: providerData } = await supabase
        .from('providers')
        .select(`*, facility:facilities(id, name, village, taluka, district)`)
        .eq('profile_id', user.id)
        .single()
      setProvider(providerData)
    }

    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }, [router])

  return { profile, patient, provider, loading, signOut, refetch: fetchAll }
}

export function useRequireAuth(requiredRole?: string): AuthState {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (auth.loading) return
    if (!auth.profile) { router.push('/login'); return }
    if (requiredRole && auth.profile.role !== requiredRole) {
      router.push(ROLE_DASHBOARD_ROUTES[auth.profile.role] || '/dashboard')
    }
  }, [auth.profile, auth.loading, requiredRole, router])

  return auth
}
