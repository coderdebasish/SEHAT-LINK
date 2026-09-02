'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Users, Upload, FileText, GitBranch, Settings,
  Search, Loader2, Activity, Pill, Calendar, AlertTriangle
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getPatientBySehatId } from '@/lib/supabase/queries/patients'
import { getPatientTimeline } from '@/lib/supabase/queries/clinical'
import { getAge, formatDate, cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard/doctor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/doctor/patients', label: 'Patient Records', icon: Users, section: 'Clinical Work' },
  { href: '/dashboard/doctor/consultations', label: 'Consultations', icon: FileText, section: 'Clinical Work' },
  { href: '/dashboard/doctor/prescriptions/upload', label: 'Upload Prescription', icon: Upload, section: 'Clinical Work' },
  { href: '/dashboard/doctor/referrals', label: 'Referrals & Diagnostics', icon: GitBranch, section: 'Clinical Work' },
  { href: '/dashboard/doctor/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

const COLOR_MAP: Record<string, string> = {
  vitals: 'bg-emerald-50 text-emerald-600', assessment: 'bg-amber-50 text-amber-600',
  consultation: 'bg-blue-50 text-blue-600', prescription: 'bg-violet-50 text-violet-600',
  appointment: 'bg-sky-50 text-sky-600', referral: 'bg-rose-50 text-rose-600', followup: 'bg-orange-50 text-orange-600',
}
const ICON_MAP: Record<string, React.ElementType> = {
  vitals: Activity, assessment: AlertTriangle, consultation: FileText,
  prescription: Pill, appointment: Calendar, referral: GitBranch, followup: Activity,
}

function PatientsContent({ auth }: { auth: ReturnType<typeof useRequireAuth> }) {
  const searchParams = useSearchParams()
  const prefilledSehatId = searchParams.get('sehat_id') || ''

  const [sehatId, setSehatId] = useState(prefilledSehatId)
  const [searching, setSearching] = useState(false)
  const [patient, setPatient] = useState<null | { id: string; sehat_id: string; full_name: string; dob: string | null; gender: string | null; blood_group: string | null; phone: string | null; village: string | null; district: string; primary_facility?: { name: string } | null }>(null)
  const [timeline, setTimeline] = useState<Array<{ id: string; type: string; date: string; title: string; subtitle: string; color: string }>>([])
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (prefilledSehatId) {
      handleSearch(undefined, prefilledSehatId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledSehatId])

  async function handleSearch(e?: React.FormEvent, overrideId?: string) {
    if (e) e.preventDefault()
    const idToSearch = overrideId || sehatId
    if (!idToSearch.trim()) return
    setSearching(true)
    setNotFound(false)
    setPatient(null)
    setTimeline([])

    const { data, error } = await getPatientBySehatId(idToSearch)
    if (error || !data) {
      setNotFound(true)
    } else {
      setPatient(data as typeof patient)
      const timelineResult = await getPatientTimeline(data.id)
      setTimeline(timelineResult.data || [])
    }
    setSearching(false)
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="card border-violet-100" style={{ background: 'hsl(270 80% 98%)' }}>
        <h2 className="font-bold text-violet-800 text-base mb-3">Find Patient by SEHAT Health ID</h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 font-mono font-bold text-blue-700"
              placeholder="SL-MH-2026-000001"
              value={sehatId}
              onChange={e => setSehatId(e.target.value.toUpperCase())}
            />
          </div>
          <button type="submit" disabled={searching} className="btn flex-shrink-0" style={{ background: 'hsl(270, 80%, 45%)', color: '#fff' }}>
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Look Up Patient'}
          </button>
        </form>
      </div>

      {/* Not found */}
      {notFound && (
        <div className="card border-red-100 bg-red-50 text-center py-8">
          <AlertTriangle className="w-8 h-8 mx-auto text-red-400 mb-2" />
          <p className="font-semibold text-red-800">Patient not found</p>
          <p className="text-xs text-red-600 mt-1">No patient found with SEHAT ID: <span className="font-mono font-bold">{sehatId}</span></p>
        </div>
      )}

      {/* Patient found */}
      {patient && (
        <>
          {/* Patient card */}
          <div className="card border-t-4 border-t-violet-600">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="avatar avatar-lg bg-violet-100 text-violet-700 font-bold text-lg">
                  {patient.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{patient.full_name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm text-blue-700 font-bold">{patient.sehat_id}</span>
                    <span className="badge bg-emerald-100 text-emerald-700 font-semibold">Active</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                    {patient.dob && <span className="badge bg-gray-100 text-gray-700">Age: {getAge(patient.dob)}</span>}
                    {patient.gender && <span className="badge bg-gray-100 text-gray-700">{patient.gender}</span>}
                    {patient.blood_group && patient.blood_group !== 'unknown' && <span className="badge bg-red-50 text-red-700">Blood: {patient.blood_group}</span>}
                    {patient.village && <span className="badge bg-blue-50 text-blue-700">{patient.village}, {patient.district}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <a href={`/dashboard/doctor/consultations?patient_id=${patient.id}&patient_name=${encodeURIComponent(patient.full_name)}&sehat_id=${patient.sehat_id}`} className="btn btn-primary btn-sm">
                  + Start Consultation
                </a>
                <a href={`/dashboard/doctor/prescriptions/upload?patient_id=${patient.id}&sehat_id=${patient.sehat_id}`} className="btn btn-secondary btn-sm">
                  Upload Prescription
                </a>
              </div>
            </div>
          </div>

          {/* Patient timeline */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Complete Health Timeline</h3>
            {timeline.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No health records found for this patient</p>
              </div>
            ) : (
              <div className="space-y-3">
                {timeline.map((event, i) => {
                  const Icon = ICON_MAP[event.type] || Activity
                  return (
                    <div key={event.id} className={cn(
                      'flex items-start gap-3 p-3 rounded-xl border',
                      i === 0 ? 'border-violet-100 bg-violet-50/30' : 'border-gray-100 hover:bg-gray-50'
                    )}>
                      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', COLOR_MAP[event.type] || 'bg-gray-50 text-gray-600')}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{event.subtitle}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(event.date)}</p>
                      </div>
                      <span className="badge bg-gray-100 text-gray-600 text-[10px] uppercase font-bold capitalize flex-shrink-0">{event.type}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty state - no search yet */}
      {!patient && !notFound && !searching && (
        <div className="card text-center py-12">
          <Search className="w-10 h-10 mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">Enter a patient&apos;s SEHAT Health ID to load their complete medical record</p>
          <p className="text-xs text-gray-400 mt-1">The full longitudinal health timeline will appear here</p>
        </div>
      )}
    </div>
  )
}

export default function DoctorPatientsPage() {
  const auth = useRequireAuth('doctor')
  if (auth.loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!auth.profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={auth.profile} navItems={NAV_ITEMS} onSignOut={auth.signOut} />
      <div className="dashboard-main">
        <Topbar title="Patient Health Records" subtitle="SEHAT ID Lookup & Clinical Timeline" profile={auth.profile} onSignOut={auth.signOut} />
        <main className="dashboard-content">
          <Suspense fallback={<div className="page-loader"><div className="spinner" /></div>}>
            <PatientsContent auth={auth} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
