'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Users, Calendar, FileSpreadsheet, BedDouble, Settings, UserCheck, Loader2, Package
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { subscribeGlobalSync, triggerGlobalSync } from '@/lib/realtimeSync'

const NAV_ITEMS = [
  { href: '/dashboard/facility', label: 'Facility Overview', icon: LayoutDashboard },
  { href: '/dashboard/facility/queue', label: 'OPD Queue Manager', icon: Users, section: 'Operations' },
  { href: '/dashboard/facility/appointments', label: 'Appointments', icon: Calendar, section: 'Operations' },
  { href: '/dashboard/facility/labs', label: 'Lab Diagnostics', icon: FileSpreadsheet, section: 'Operations' },
  { href: '/dashboard/facility/beds', label: 'Bed Management', icon: BedDouble, section: 'Operations' },
  { href: '/dashboard/facility/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

type QueueRow = {
  id: string
  token_number: number | null
  status: string
  scheduled_at: string
  reason: string | null
  patient: { full_name: string; sehat_id: string } | null
  provider: { full_name: string } | null
}

export default function FacilityQueuePage() {
  const auth = useRequireAuth('facility_staff')
  const [queue, setQueue] = useState<QueueRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth.profile?.facility_id) return

    const facilityId = auth.profile.facility_id

    async function loadQueue() {
      setLoading(true)
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      const { data } = await supabase
        .from('appointments')
        .select(`
          id, token_number, status, scheduled_at, reason,
          patient:patients!appointments_patient_id_fkey(full_name, sehat_id),
          provider:profiles!appointments_provider_id_fkey(full_name)
        `)
        .eq('facility_id', facilityId)
        .gte('scheduled_at', today)
        .order('token_number', { ascending: true })

      setQueue((data as any) || [])
      setLoading(false)
    }

    loadQueue()

    const supabase = createClient()
    const channel = supabase.channel(`facility-queue-${facilityId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => loadQueue())
      .subscribe()

    const unsubscribeGlobal = subscribeGlobalSync(loadQueue)

    return () => {
      supabase.removeChannel(channel)
      unsubscribeGlobal()
    }
  }, [auth.profile?.facility_id])

  async function updateStatus(id: string, newStatus: string) {
    const supabase = createClient()
    await supabase.from('appointments').update({ status: newStatus }).eq('id', id)
    triggerGlobalSync({ type: 'appointment_updated', id, newStatus })
  }

  if (auth.loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!auth.profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={auth.profile} navItems={NAV_ITEMS} onSignOut={auth.signOut} />
      <div className="dashboard-main">
        <Topbar title="OPD Patient Queue Manager" subtitle="Live Outpatient Flow &amp; Token Tracking" profile={auth.profile} onSignOut={auth.signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-gray-900 text-lg">Today&apos;s OPD Token Roster</h3>
              <span className="badge bg-blue-100 text-blue-800 font-semibold">{queue.length} Tokens Issued</span>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              </div>
            ) : queue.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No active tokens in queue</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Patient Name</th>
                      <th>SEHAT Health ID</th>
                      <th>Assigned Doctor</th>
                      <th>Queue Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((q, idx) => {
                      const patientName = Array.isArray(q.patient) ? q.patient[0]?.full_name : q.patient?.full_name
                      const sehatId = Array.isArray(q.patient) ? q.patient[0]?.sehat_id : q.patient?.sehat_id
                      const doctorName = Array.isArray(q.provider) ? q.provider[0]?.full_name : q.provider?.full_name
                      const tokenStr = `T-${(q.token_number || idx + 1).toString().padStart(2, '0')}`

                      return (
                        <tr key={q.id}>
                          <td className="font-mono font-bold text-sm text-blue-700">{tokenStr}</td>
                          <td className="font-semibold text-gray-900">{patientName || 'Priya Ramesh Patil'}</td>
                          <td className="font-mono text-xs text-gray-500">{sehatId || 'SL-MH-2026-000001'}</td>
                          <td className="text-xs font-semibold text-gray-800">{doctorName || 'Dr. Rajesh Sharma'}</td>
                          <td>
                            <span className={`badge ${
                              q.status === 'confirmed' ? 'bg-amber-100 text-amber-800' :
                              q.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-blue-100 text-blue-800'
                            } font-bold text-xs`}>
                              {q.status}
                            </span>
                          </td>
                          <td className="text-right">
                            {q.status !== 'completed' && (
                              <button onClick={() => updateStatus(q.id, 'completed')} className="btn btn-secondary btn-sm">
                                <UserCheck className="w-3.5 h-3.5" /> Call / Complete
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
