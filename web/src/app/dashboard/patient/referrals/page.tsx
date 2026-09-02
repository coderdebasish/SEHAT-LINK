'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, History, FileText, Calendar, ClipboardList, GitBranch, FolderOpen, Settings, Loader2, Package, ArrowRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard/patient', label: 'My Health Card', icon: LayoutDashboard },
  { href: '/dashboard/patient/timeline', label: 'Medical History', icon: History, section: 'Health Records' },
  { href: '/dashboard/patient/prescriptions', label: 'My Prescriptions', icon: FileText, section: 'Health Records' },
  { href: '/dashboard/patient/diagnostics', label: 'Diagnostics & Reports', icon: ClipboardList, section: 'Health Records' },
  { href: '/dashboard/patient/referrals', label: 'Referrals', icon: GitBranch, section: 'Health Records' },
  { href: '/dashboard/patient/documents', label: 'Documents', icon: FolderOpen, section: 'Health Records' },
  { href: '/dashboard/patient/appointments', label: 'Appointments', icon: Calendar, section: 'Services' },
  { href: '/dashboard/patient/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

type ReferralRow = {
  id: string
  referral_reason: string
  priority: string
  status: string
  notes: string | null
  created_at: string
  from_facility: { name: string } | null
  to_facility: { name: string } | null
  doctor: { full_name: string } | null
}

export default function PatientReferralsPage() {
  const auth = useRequireAuth('patient')
  const [referrals, setReferrals] = useState<ReferralRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth.patient?.id) return

    async function loadReferrals() {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('referrals')
        .select(`
          id, referral_reason, priority, status, notes, created_at,
          from_facility:facilities!referrals_from_facility_id_fkey(name),
          to_facility:facilities!referrals_to_facility_id_fkey(name),
          doctor:profiles!referrals_referred_by_fkey(full_name)
        `)
        .eq('patient_id', auth.patient!.id)
        .order('created_at', { ascending: false })

      setReferrals((data as any) || [])
      setLoading(false)
    }

    loadReferrals()

    const supabase = createClient()
    const channel = supabase.channel(`patient-referrals-${auth.patient.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'referrals' }, () => loadReferrals())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [auth.patient?.id])

  if (auth.loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!auth.profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={auth.profile} navItems={NAV_ITEMS} onSignOut={auth.signOut} />
      <div className="dashboard-main">
        <Topbar title="My Hospital Referrals" subtitle="Specialist Consultations &amp; Tertiary Care Linkage" profile={auth.profile} onSignOut={auth.signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Hospital Referrals Roster</h3>
              <span className="badge bg-purple-100 text-purple-800 font-semibold">{referrals.length} Records</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-purple-300" />
              </div>
            ) : referrals.length === 0 ? (
              <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-xl text-center text-xs text-emerald-900 space-y-1">
                <p className="font-bold text-sm">No Pending Hospital Referrals</p>
                <p className="text-emerald-700">All previous consultations were completed locally without requiring tertiary referral.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map(ref => {
                  const doctorName = Array.isArray(ref.doctor) ? ref.doctor[0]?.full_name : ref.doctor?.full_name
                  const fromName = Array.isArray(ref.from_facility) ? ref.from_facility[0]?.name : ref.from_facility?.name
                  const toName = Array.isArray(ref.to_facility) ? ref.to_facility[0]?.name : ref.to_facility?.name
                  return (
                    <div key={ref.id} className="p-4 border border-gray-100 rounded-xl space-y-2 hover:border-purple-100 hover:bg-purple-50/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="badge bg-purple-100 text-purple-800 font-bold uppercase text-xs">{ref.priority || 'Normal'} Priority</span>
                          <span className="badge bg-blue-100 text-blue-800 text-xs font-semibold">{ref.status}</span>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">{formatDate(ref.created_at)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                        <span>{fromName || 'Khed PHC'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                        <span className="text-purple-900 font-bold">{toName || 'District Hospital Shirur'}</span>
                      </div>

                      <p className="text-xs font-medium text-gray-700">Reason: {ref.referral_reason}</p>
                      {doctorName && <p className="text-[11px] text-gray-400">Referred by {doctorName}</p>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
