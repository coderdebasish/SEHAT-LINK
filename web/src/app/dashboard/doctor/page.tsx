'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { DashboardShell } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Users, Stethoscope, FileText, Upload,
  GitBranch, Settings, Search, Calendar, Plus, ArrowUpRight,
  Loader2, Clock, CheckCircle2, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { cn, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { getAppointmentsForProvider } from '@/lib/supabase/queries/appointments'
import { subscribeGlobalSync } from '@/lib/realtimeSync'

const NAV_ITEMS = [
  { href: '/dashboard/doctor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/doctor/patients', label: 'Patient Records', icon: Users, section: 'Clinical Work' },
  { href: '/dashboard/doctor/consultations', label: 'Consultations', icon: FileText, section: 'Clinical Work' },
  { href: '/dashboard/doctor/prescriptions/upload', label: 'Upload Prescription', icon: Upload, section: 'Clinical Work' },
  { href: '/dashboard/doctor/referrals', label: 'Referrals & Diagnostics', icon: GitBranch, section: 'Clinical Work' },
  { href: '/dashboard/doctor/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

type AppointmentRow = {
  id: string
  scheduled_at: string
  status: string
  reason: string | null
  token_number: number | null
  patient: {
    sehat_id: string
    full_name: string
    dob: string | null
    gender: string | null
  } | null
  facility: { name: string; village: string } | null
}

export default function DoctorDashboard() {
  const auth = useRequireAuth('doctor')
  if (auth.loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!auth.profile) return null

  return (
    <DashboardShell
      profile={auth.profile}
      navItems={NAV_ITEMS}
      onSignOut={auth.signOut}
      title="Doctor Dashboard"
      subtitle={`Clinician Portal — ${auth.profile.full_name}`}
      actions={
        <Link href="/dashboard/doctor/patients" className="btn btn-primary btn-sm">
          <Search className="w-4 h-4" /> Find Patient
        </Link>
      }
    >
      <DoctorOverview auth={auth} />
    </DashboardShell>
  )
}

function DoctorOverview({ auth }: { auth: ReturnType<typeof useRequireAuth> }) {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [consultationsToday, setConsultationsToday] = useState(0)
  const [pendingFollowups, setPendingFollowups] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchSehatId, setSearchSehatId] = useState('')

  useEffect(() => {
    if (!auth.profile?.id) return

    const providerId = auth.profile.id
    const facilityId = auth.profile.facility_id

    async function loadData() {
      setLoading(true)
      const supabase = createClient()

      const [appointmentsRes, consultRes, followRes] = await Promise.all([
        getAppointmentsForProvider(providerId, facilityId),
        supabase.from('consultations')
          .select('id', { count: 'exact' })
          .eq('doctor_id', providerId)
          .gte('consulted_at', new Date().toISOString().split('T')[0]),
        supabase.from('follow_ups')
          .select('id', { count: 'exact' })
          .eq('created_by', providerId)
          .eq('status', 'scheduled')
          .lte('due_date', new Date().toISOString().split('T')[0]),
      ])

      setAppointments((appointmentsRes.data as AppointmentRow[] | null) || [])
      setConsultationsToday(consultRes.count || 0)
      setPendingFollowups(followRes.count || 0)
      setLoading(false)
    }

    loadData()

    // Real-time: listen for any appointment creation/updates
    const supabase = createClient()
    const channel = supabase.channel(`doctor-appointments-${providerId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'appointments'
      }, () => loadData())
      .subscribe()

    const unsubscribeGlobal = subscribeGlobalSync(loadData)

    return () => {
      supabase.removeChannel(channel)
      unsubscribeGlobal()
    }
  }, [auth.profile?.id, auth.profile?.facility_id])

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
    no_show: 'bg-orange-100 text-orange-600',
  }

  function handlePatientSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchSehatId.trim()) {
      window.location.href = `/dashboard/doctor/patients?sehat_id=${encodeURIComponent(searchSehatId.trim().toUpperCase())}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Patient Search */}
      <div className="card border-violet-100" style={{ background: 'hsl(270 80% 98%)' }}>
        <h2 className="text-sm font-semibold text-violet-800 mb-3">Quick Patient Search by SEHAT ID</h2>
        <form onSubmit={handlePatientSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 font-mono"
              placeholder="SL-MH-2026-000001"
              value={searchSehatId}
              onChange={e => setSearchSehatId(e.target.value.toUpperCase())}
            />
          </div>
          <button type="submit" className="btn btn-sm flex-shrink-0" style={{ background: 'hsl(270, 80%, 45%)', color: '#fff' }}>
            Find Patient
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Upcoming Appointments', value: loading ? '...' : appointments.length.toString(), icon: Calendar, color: 'bg-violet-50 text-violet-600' },
          { label: 'Consultations Today', value: loading ? '...' : consultationsToday.toString(), icon: Stethoscope, color: 'bg-blue-50 text-blue-600' },
          { label: 'Follow-ups Overdue', value: loading ? '...' : pendingFollowups.toString(), icon: AlertCircle, color: 'bg-amber-50 text-amber-600' },
          { label: 'Total Patients', value: '—', icon: Users, color: 'bg-rose-50 text-rose-600' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className={cn('stat-icon', stat.color)}><stat.icon className="w-5 h-5" /></div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's & Upcoming appointments — LIVE from Supabase */}
        <div className="lg:col-span-2 card">
          <div className="section-header">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">Upcoming &amp; Today&apos;s Appointments</h2>
              <span className="badge bg-violet-100 text-violet-800 font-bold text-xs">
                {loading ? '...' : appointments.length} booked
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                LIVE SYNCED
              </span>
            </div>
            <Link href="/dashboard/doctor/consultations" className="btn btn-sm btn-ghost text-violet-600">View All</Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-violet-200" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No upcoming appointments scheduled</p>
              <p className="text-xs mt-1">Bookings made by patients for your profile will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-2">
              {appointments.map(appt => {
                const apptDate = new Date(appt.scheduled_at)
                const isToday = apptDate.toDateString() === new Date().toDateString()
                return (
                  <div key={appt.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="text-center min-w-[70px] flex-shrink-0">
                      <p className="text-xs font-bold text-violet-900 font-mono">
                        {apptDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[10px] font-medium text-gray-400 font-mono">
                        {isToday ? 'Today' : apptDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </p>
                      {appt.token_number && (
                        <span className="badge bg-purple-100 text-purple-700 text-[10px] font-mono font-bold mt-0.5">
                          #{appt.token_number}
                        </span>
                      )}
                    </div>
                    <div className="avatar avatar-sm bg-violet-100 text-violet-700 font-bold flex-shrink-0">
                      {(appt.patient?.full_name || 'P').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{appt.patient?.full_name || 'Patient'}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {appt.reason || 'Consultation'} ·{' '}
                        <span className="font-mono font-semibold text-blue-600">{appt.patient?.sehat_id}</span>
                      </p>
                    </div>
                    <span className={cn('badge text-xs font-semibold', statusColors[appt.status] || 'bg-gray-100 text-gray-600')}>
                      {appt.status}
                    </span>
                    <Link
                      href={`/dashboard/doctor/patients?sehat_id=${appt.patient?.sehat_id}`}
                      className="btn btn-sm btn-secondary flex-shrink-0"
                    >
                      Open
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions + Upload CTA */}
        <div className="space-y-4">
          <div className="card border-violet-200" style={{ background: 'linear-gradient(135deg, hsl(270,60%,15%) 0%, hsl(250,60%,22%) 100%)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
                <Upload className="w-5 h-5 text-violet-200" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Upload Prescription</p>
                <p className="text-violet-300 text-xs">Scan / Photo / PDF</p>
              </div>
            </div>
            <p className="text-violet-200/70 text-xs mb-3">Upload a scanned or handwritten prescription. It&apos;ll be instantly linked to the patient&apos;s SEHAT record and visible to the pharmacy.</p>
            <Link href="/dashboard/doctor/prescriptions/upload" className="btn w-full text-sm font-medium" style={{ background: 'hsl(270, 80%, 60%)', color: '#fff', textDecoration: 'none' }}>
              <Upload className="w-4 h-4" /> Upload Now
            </Link>
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
            <div className="space-y-1.5">
              {[
                { label: 'Start Consultation', href: '/dashboard/doctor/consultations', icon: Plus, color: 'text-violet-500' },
                { label: 'Write Prescription', href: '/dashboard/doctor/prescriptions/upload', icon: Upload, color: 'text-emerald-500' },
                { label: 'Create Referral', href: '/dashboard/doctor/referrals', icon: GitBranch, color: 'text-amber-500' },
              ].map(a => (
                <Link key={a.label} href={a.href} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 hover:text-gray-900 transition-colors" style={{ textDecoration: 'none' }}>
                  <a.icon className={cn('w-4 h-4', a.color)} />
                  {a.label}
                  <ArrowUpRight className="w-3 h-3 text-gray-300 ml-auto" />
                </Link>
              ))}
            </div>
          </div>

          {/* Facility info */}
          {auth.provider?.facility && (
            <div className="card border-violet-100 bg-violet-50/50">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-violet-600" />
                <span className="text-xs font-bold text-violet-800">Your Facility</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{auth.provider.facility.name}</p>
              <p className="text-xs text-gray-500">{auth.provider.facility.village}, {auth.provider.facility.taluka}</p>
              {auth.provider.specialization && (
                <span className="badge bg-violet-100 text-violet-700 text-xs mt-2">{auth.provider.specialization}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
