'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Users, Calendar, FileSpreadsheet, BedDouble, Settings,
  Loader2, CheckCircle2, Clock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAppointmentsForFacility, updateAppointmentStatus } from '@/lib/supabase/queries/appointments'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard/facility', label: 'Facility Overview', icon: LayoutDashboard },
  { href: '/dashboard/facility/queue', label: 'OPD Queue Manager', icon: Users, section: 'Operations' },
  { href: '/dashboard/facility/appointments', label: 'Appointments', icon: Calendar, section: 'Operations' },
  { href: '/dashboard/facility/labs', label: 'Lab Diagnostics', icon: FileSpreadsheet, section: 'Operations' },
  { href: '/dashboard/facility/beds', label: 'Bed Management', icon: BedDouble, section: 'Operations' },
  { href: '/dashboard/facility/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

type AppointmentRow = {
  id: string
  scheduled_at: string
  status: string
  reason: string | null
  token_number: number | null
  patient: { sehat_id: string; full_name: string; dob: string | null; gender: string | null } | null
  provider: { full_name: string } | null
  facility: { name: string } | null
}

export default function FacilityAppointmentsPage() {
  const auth = useRequireAuth('facility_staff')
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (!auth.profile?.facility_id) return

    const facilityId = auth.profile.facility_id

    async function loadData() {
      setLoading(true)
      const { data } = await getAppointmentsForFacility(facilityId)
      setAppointments((data as AppointmentRow[] | null) || [])
      setLoading(false)
    }

    loadData()

    // Real-time subscription — instant sync when patient/doctor books or updates
    const supabase = createClient()
    const channel = supabase.channel(`facility-appointments-${facilityId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'appointments',
        filter: `facility_id=eq.${facilityId}`
      }, () => loadData())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [auth.profile?.facility_id])

  async function handleStatusUpdate(appointmentId: string, newStatus: string) {
    setUpdatingId(appointmentId)
    await updateAppointmentStatus(appointmentId, newStatus)
    setUpdatingId(null)
  }

  if (auth.loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!auth.profile) return null

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
    no_show: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="dashboard-layout">
      <Sidebar profile={auth.profile} navItems={NAV_ITEMS} onSignOut={auth.signOut} />
      <div className="dashboard-main">
        <Topbar
          title="Facility Appointment Roster"
          subtitle="Today's OPD Schedule — Live Synced"
          profile={auth.profile}
          onSignOut={auth.signOut}
        />
        <main className="dashboard-content space-y-6">
          <div className="card flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Today&apos;s Appointment Schedule</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Live — updates instantly when patients or doctors book appointments
              </p>
            </div>
            {!auth.profile.facility_id && (
              <div className="badge bg-orange-100 text-orange-700 text-xs">
                ⚠ Facility not linked to your profile
              </div>
            )}
          </div>

          {loading ? (
            <div className="card flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-200" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="card text-center py-12">
              <Calendar className="w-10 h-10 mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">No appointments scheduled for today</p>
              <p className="text-xs text-gray-400 mt-1">
                {auth.profile.facility_id
                  ? 'Appointments booked by patients or doctors will appear here automatically'
                  : 'Contact admin to link your profile to a facility'}
              </p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Time & Token</th>
                      <th>Patient</th>
                      <th>SEHAT Health ID</th>
                      <th>Assigned Doctor</th>
                      <th>Purpose</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(a => (
                      <tr key={a.id} className={a.status === 'completed' ? 'opacity-60' : ''}>
                        <td>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-xs font-bold text-blue-700 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(a.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {a.token_number && (
                              <span className="badge bg-purple-100 text-purple-700 font-mono font-bold text-[10px]">
                                Token #{a.token_number}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="font-semibold text-gray-900">{a.patient?.full_name || '—'}</td>
                        <td className="font-mono text-xs text-blue-700 font-bold">{a.patient?.sehat_id || '—'}</td>
                        <td className="text-xs text-gray-700 font-medium">{a.provider?.full_name || '—'}</td>
                        <td className="text-xs text-gray-500 max-w-xs truncate">{a.reason || 'General Consultation'}</td>
                        <td>
                          <span className={cn('badge text-xs font-semibold', statusColors[a.status] || 'bg-gray-100 text-gray-600')}>
                            {a.status}
                          </span>
                        </td>
                        <td>
                          {updatingId === a.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          ) : (
                            <select
                              className="input text-xs py-1 px-2 w-32"
                              value={a.status}
                              onChange={e => handleStatusUpdate(a.id, e.target.value)}
                              disabled={a.status === 'completed' || a.status === 'cancelled'}
                            >
                              <option value="scheduled">Scheduled</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="no_show">No Show</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
