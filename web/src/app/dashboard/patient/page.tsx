'use client'

import { useEffect, useState } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Activity, Calendar, FileText,
  Pill, ClipboardList, ArrowUpRight, GitBranch,
  FolderOpen, Settings, Shield, Copy, CheckCheck,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { cn, getAge, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { getPatientTimeline } from '@/lib/supabase/queries/clinical'

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
  vitals: Activity,
  assessment: ClipboardList,
  consultation: FileText,
  prescription: Pill,
  appointment: Calendar,
  referral: GitBranch,
  followup: ArrowUpRight,
}

export default function PatientDashboard() {
  const auth = useRequireAuth('patient')

  if (auth.loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!auth.profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={auth.profile} navItems={NAV_ITEMS} onSignOut={auth.signOut} />
      <div className="dashboard-main">
        <Topbar
          title="My Health Overview"
          subtitle={`Welcome back, ${auth.profile.full_name.split(' ')[0]}`}
          profile={auth.profile}
          onSignOut={auth.signOut}
        />
        <main className="dashboard-content">
          <PatientOverview auth={auth} />
        </main>
      </div>
    </div>
  )
}

function PatientOverview({ auth }: { auth: ReturnType<typeof useRequireAuth> }) {
  const { profile, patient } = auth
  const [copied, setCopied] = useState(false)
  const [timeline, setTimeline] = useState<Array<{
    id: string; type: string; date: string;
    title: string; subtitle: string; color: string
  }>>([])
  const [stats, setStats] = useState({ appointments: 0, prescriptions: 0, consultations: 0, followups: 0 })
  const [loadingData, setLoadingData] = useState(true)

  function copySehatId() {
    const id = patient?.sehat_id || 'SL-MH-2026-000001'
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  useEffect(() => {
    if (!patient?.id) { setLoadingData(false); return }

    const supabase = createClient()
    const patientId = patient.id

    async function loadData() {
      setLoadingData(true)

      const [timelineResult, appointmentsRes, prescriptionsRes, consultationsRes, followUpsRes] = await Promise.all([
        getPatientTimeline(patientId),
        supabase.from('appointments').select('id', { count: 'exact' })
          .eq('patient_id', patientId).in('status', ['scheduled', 'confirmed']),
        supabase.from('prescriptions').select('id', { count: 'exact' })
          .eq('patient_id', patientId).eq('status', 'active'),
        supabase.from('consultations').select('id', { count: 'exact' }).eq('patient_id', patientId),
        supabase.from('follow_ups').select('id', { count: 'exact' })
          .eq('patient_id', patientId).eq('status', 'scheduled'),
      ])

      setTimeline(timelineResult.data?.slice(0, 5) || [])
      setStats({
        appointments: appointmentsRes.count || 0,
        prescriptions: prescriptionsRes.count || 0,
        consultations: consultationsRes.count || 0,
        followups: followUpsRes.count || 0,
      })
      setLoadingData(false)
    }

    loadData()

    // Realtime subscription for this patient's data
    const channel = supabase.channel(`patient-overview-${patientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `patient_id=eq.${patientId}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions', filter: `patient_id=eq.${patientId}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations', filter: `patient_id=eq.${patientId}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vitals', filter: `patient_id=eq.${patientId}` }, loadData)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [patient?.id])

  const sehatId = patient?.sehat_id || 'SL-MH-2026-000001'
  const age = patient?.dob ? getAge(patient.dob) : '—'
  const bloodGroup = patient?.blood_group || '—'

  return (
    <div className="space-y-6">
      {/* SEHAT ID Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, hsl(218,45%,12%) 0%, hsl(210,60%,22%) 100%)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-sky-300" />
              </div>
              <span className="text-sky-300 text-sm font-medium">Your SEHAT Health ID</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/15 border border-white/20 text-white text-lg px-4 py-2 rounded-lg font-mono font-bold">
                {sehatId}
              </div>
              <button
                onClick={copySehatId}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Copy SEHAT ID"
              >
                {copied ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/60" />}
              </button>
            </div>
            <p className="text-white/50 text-xs mt-2">Share this ID with your doctor, pharmacy, or health worker</p>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-4 py-3 bg-white/8 rounded-xl">
              <div className="text-white font-bold text-xl">{age}</div>
              <div className="text-white/50 text-xs">Age</div>
            </div>
            <div className="text-center px-4 py-3 bg-white/8 rounded-xl">
              <div className="text-white font-bold text-xl">{bloodGroup}</div>
              <div className="text-white/50 text-xs">Blood Group</div>
            </div>
            <div className="text-center px-4 py-3 bg-white/8 rounded-xl">
              <div className="text-green-400 font-bold text-xl">●</div>
              <div className="text-white/50 text-xs">Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Upcoming Appointments', value: stats.appointments, icon: Calendar, color: 'bg-blue-50 text-blue-600', href: '/dashboard/patient/appointments' },
          { label: 'Active Prescriptions', value: stats.prescriptions, icon: Pill, color: 'bg-violet-50 text-violet-600', href: '/dashboard/patient/prescriptions' },
          { label: 'Consultations', value: stats.consultations, icon: FileText, color: 'bg-emerald-50 text-emerald-600', href: '/dashboard/patient/timeline' },
          { label: 'Follow-ups Due', value: stats.followups, icon: Activity, color: 'bg-amber-50 text-amber-600', href: '/dashboard/patient/timeline' },
        ].map(stat => (
          <Link key={stat.label} href={stat.href} style={{ textDecoration: 'none' }}>
            <div className="stat-card cursor-pointer hover:shadow-md transition-shadow">
              <div className={cn('stat-icon', stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {loadingData ? <Loader2 className="w-5 h-5 animate-spin text-gray-300" /> : stat.value}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Timeline */}
        <div className="lg:col-span-2 card">
          <div className="section-header">
            <h2 className="text-base font-semibold text-gray-900">Recent Health Events</h2>
            <Link href="/dashboard/patient/timeline" className="btn btn-sm btn-ghost text-blue-600">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          ) : timeline.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No health events recorded yet.</p>
              <p className="text-xs mt-1">Your health worker will start adding records after your first visit.</p>
            </div>
          ) : (
            <div className="timeline">
              {timeline.map((event, i) => {
                const Icon = ICON_MAP[event.type] || Activity
                return (
                  <div key={event.id} className="timeline-item">
                    {i < timeline.length - 1 && <div className="timeline-line" />}
                    <div className={cn('timeline-dot', COLOR_MAP[event.type] || 'bg-gray-50 text-gray-600')} style={{ width: 38, height: 38 }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 pt-1.5">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{event.subtitle}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(event.date)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Book Appointment', href: '/dashboard/patient/appointments', icon: Calendar, color: 'text-blue-600 bg-blue-50' },
                { label: 'View Prescriptions', href: '/dashboard/patient/prescriptions', icon: Pill, color: 'text-violet-600 bg-violet-50' },
                { label: 'Health Timeline', href: '/dashboard/patient/timeline', icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'My Documents', href: '/dashboard/patient/documents', icon: FolderOpen, color: 'text-amber-600 bg-amber-50' },
              ].map(action => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  style={{ textDecoration: 'none' }}
                >
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', action.color)}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{action.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* Facility info */}
          {patient?.primary_facility && (
            <div className="card border-blue-100" style={{ background: 'hsl(210 80% 98%)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">Your Primary Health Centre</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{patient.primary_facility.name}</p>
              <p className="text-xs text-gray-500">{patient.primary_facility.village}, {patient.primary_facility.taluka}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
