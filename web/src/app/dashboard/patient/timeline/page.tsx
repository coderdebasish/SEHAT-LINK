'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Activity, Calendar, Pill,
  ClipboardList, GitBranch, FolderOpen, Settings, Filter, Loader2
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { getPatientTimeline } from '@/lib/supabase/queries/clinical'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard/patient', label: 'My Health Card', icon: LayoutDashboard },
  { href: '/dashboard/patient/timeline', label: 'Medical History', icon: Activity, section: 'Health Records' },
  { href: '/dashboard/patient/prescriptions', label: 'My Prescriptions', icon: Pill, section: 'Health Records' },
  { href: '/dashboard/patient/diagnostics', label: 'Diagnostics & Reports', icon: ClipboardList, section: 'Health Records' },
  { href: '/dashboard/patient/referrals', label: 'Referrals', icon: GitBranch, section: 'Health Records' },
  { href: '/dashboard/patient/documents', label: 'Documents', icon: FolderOpen, section: 'Health Records' },
  { href: '/dashboard/patient/appointments', label: 'Appointments', icon: Calendar, section: 'Services' },
  { href: '/dashboard/patient/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

const COLOR_MAP: Record<string, string> = {
  vitals: 'bg-emerald-50 text-emerald-600',
  assessment: 'bg-amber-50 text-amber-600',
  consultation: 'bg-blue-50 text-blue-600',
  prescription: 'bg-violet-50 text-violet-600',
  appointment: 'bg-sky-50 text-sky-600',
  referral: 'bg-rose-50 text-rose-600',
  followup: 'bg-orange-50 text-orange-600',
}
const ICON_MAP: Record<string, React.ElementType> = {
  vitals: Activity, assessment: ClipboardList, consultation: Pill,
  prescription: Pill, appointment: Calendar, referral: GitBranch, followup: Activity,
}
const LABEL_MAP: Record<string, string> = {
  vitals: 'Vitals', assessment: 'Assessment', consultation: 'Consultation',
  prescription: 'Prescription', appointment: 'Appointment', referral: 'Referral', followup: 'Follow-up',
}

export default function PatientTimelinePage() {
  const auth = useRequireAuth('patient')
  const [timeline, setTimeline] = useState<Array<{
    id: string; type: string; date: string;
    title: string; subtitle: string; color: string
  }>>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!auth.patient?.id) { setLoading(false); return }

    const patientId = auth.patient.id

    async function loadTimeline() {
      setLoading(true)
      const { data } = await getPatientTimeline(patientId)
      setTimeline(data || [])
      setLoading(false)
    }

    loadTimeline()

    // Real-time subscription
    const supabase = createClient()
    const channel = supabase.channel(`patient-timeline-${patientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vitals', filter: `patient_id=eq.${patientId}` }, loadTimeline)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assessments', filter: `patient_id=eq.${patientId}` }, loadTimeline)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations', filter: `patient_id=eq.${patientId}` }, loadTimeline)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions', filter: `patient_id=eq.${patientId}` }, loadTimeline)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `patient_id=eq.${patientId}` }, loadTimeline)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [auth.patient?.id])

  if (auth.loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!auth.profile) return null

  const filtered = filter === 'all' ? timeline : timeline.filter(e => e.type === filter)

  return (
    <div className="dashboard-layout">
      <Sidebar profile={auth.profile} navItems={NAV_ITEMS} onSignOut={auth.signOut} />
      <div className="dashboard-main">
        <Topbar title="Longitudinal Health Timeline" subtitle="Complete Medical Record History" profile={auth.profile} onSignOut={auth.signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">SEHAT Health Timeline</h2>
              <p className="text-xs text-gray-500">
                Patient: {auth.profile.full_name} ·{' '}
                {auth.patient?.sehat_id && (
                  <span className="font-mono text-blue-700 font-bold">{auth.patient.sehat_id}</span>
                )}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'vitals', 'assessment', 'consultation', 'prescription', 'appointment', 'referral', 'followup'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn('btn btn-sm', filter === f ? 'btn-primary' : 'btn-secondary')}
                  style={{ textTransform: 'capitalize', fontSize: '11px' }}
                >
                  {f === 'all' ? <Filter className="w-3 h-3" /> : null}
                  {f === 'all' ? 'All Events' : LABEL_MAP[f] || f}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-7 h-7 animate-spin text-blue-200" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No {filter === 'all' ? '' : filter} records found</p>
                <p className="text-xs mt-1">
                  {filter === 'all'
                    ? 'Your health records will appear here after your first visit with a health worker or doctor.'
                    : `No ${filter} events in your health record yet.`}
                </p>
              </div>
            ) : (
              <div className="timeline">
                {filtered.map((event, i) => {
                  const Icon = ICON_MAP[event.type] || Activity
                  return (
                    <div key={event.id} className="timeline-item">
                      {i < filtered.length - 1 && <div className="timeline-line" />}
                      <div className={cn('timeline-dot', COLOR_MAP[event.type] || 'bg-gray-50 text-gray-600')} style={{ width: 40, height: 40 }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="badge text-[10px] uppercase font-bold tracking-wider" style={{ background: COLOR_MAP[event.type]?.split(' ')[0], color: COLOR_MAP[event.type]?.split(' ')[1] }}>
                                {LABEL_MAP[event.type] || event.type}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-gray-900 mt-1">{event.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{event.subtitle}</p>
                          </div>
                          <span className="text-xs text-gray-400 font-mono whitespace-nowrap flex-shrink-0">{formatDate(event.date)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {!loading && timeline.length > 0 && (
            <p className="text-xs text-center text-gray-400">
              Showing {filtered.length} of {timeline.length} health events ·{' '}
              <span className="flex items-center gap-1 inline-flex">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Live synced
              </span>
            </p>
          )}
        </main>
      </div>
    </div>
  )
}
