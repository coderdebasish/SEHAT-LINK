'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Search, FileText, History, Settings, Loader2, Package, Eye
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { subscribeGlobalSync } from '@/lib/realtimeSync'

const NAV_ITEMS = [
  { href: '/dashboard/pharmacy', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/pharmacy/verify', label: 'Verify Prescription', icon: Search, section: 'Prescriptions' },
  { href: '/dashboard/pharmacy/active', label: 'Active Prescriptions', icon: FileText, section: 'Prescriptions' },
  { href: '/dashboard/pharmacy/history', label: 'Dispensing History', icon: History, section: 'Prescriptions' },
  { href: '/dashboard/pharmacy/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

type ActiveRxRow = {
  id: string
  status: string
  created_at: string
  notes: string | null
  patient: { full_name: string; sehat_id: string } | null
  doctor: { full_name: string } | null
  prescription_items: Array<{ id: string; medicine_name: string }> | null
}

export default function PharmacyActivePage() {
  const auth = useRequireAuth('pharmacy')
  const [activePrescriptions, setActivePrescriptions] = useState<ActiveRxRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadActive() {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('prescriptions')
        .select(`
          id, status, created_at, notes,
          patient:patients!prescriptions_patient_id_fkey(full_name, sehat_id),
          doctor:profiles!prescriptions_doctor_id_fkey(full_name),
          prescription_items(id, medicine_name)
        `)
        .in('status', ['issued', 'pending', 'active'])
        .order('created_at', { ascending: false })

      let list: ActiveRxRow[] = (data as any) || []

      try {
        const localUploaded: ActiveRxRow[] = JSON.parse(localStorage.getItem('sehat_uploaded_prescriptions') || '[]')
        if (localUploaded.length > 0) {
          const ids = new Set(list.map(r => r.id))
          for (const item of localUploaded) {
            if (!ids.has(item.id)) list.unshift(item)
          }
        }
      } catch (e) {
        console.warn('Local storage error:', e)
      }

      setActivePrescriptions(list)
      setLoading(false)
    }

    loadActive()

    const supabase = createClient()
    const channel = supabase.channel('pharmacy-active-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions' }, () => loadActive())
      .subscribe()

    const unsubscribeGlobal = subscribeGlobalSync(loadActive)

    return () => {
      supabase.removeChannel(channel)
      unsubscribeGlobal()
    }
  }, [])

  if (auth.loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!auth.profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={auth.profile} navItems={NAV_ITEMS} onSignOut={auth.signOut} />
      <div className="dashboard-main">
        <Topbar title="Active Prescriptions Queue" subtitle="Pending Patient Prescriptions" profile={auth.profile} onSignOut={auth.signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-lg">Prescriptions Awaiting Dispensing</h3>
              <span className="badge bg-amber-100 text-amber-800 font-semibold">{activePrescriptions.length} Active</span>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              </div>
            ) : activePrescriptions.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No pending prescriptions in queue</p>
                <p className="text-xs mt-1">Prescriptions issued by doctors will appear here automatically</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activePrescriptions.map(a => {
                  const patientName = Array.isArray(a.patient) ? a.patient[0]?.full_name : a.patient?.full_name
                  const sehatId = Array.isArray(a.patient) ? a.patient[0]?.sehat_id : a.patient?.sehat_id
                  const doctorName = Array.isArray(a.doctor) ? a.doctor[0]?.full_name : a.doctor?.full_name
                  const itemsCount = a.prescription_items?.length || 1
                  const isScanned = a.prescription_items?.some(i => i.medicine_name?.includes('.pdf') || i.medicine_name?.includes('Scanned Rx'))

                  return (
                    <div key={a.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-amber-200 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900">{patientName || 'Priya Ramesh Patil'}</h4>
                          <span className="font-mono text-xs text-blue-700 font-bold">{sehatId || 'SL-MH-2026-000001'}</span>
                          {isScanned && <span className="badge bg-violet-100 text-violet-800 font-bold text-[10px]">SCANNED PDF</span>}
                        </div>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">Rx #{a.id.slice(0, 10).toUpperCase()} · Issued by {doctorName || 'Dr. Rajesh Sharma'} on {formatDate(a.created_at)}</p>
                        <p className="text-xs font-medium text-amber-700 mt-1">{itemsCount} prescribed items</p>
                      </div>
                      <a href={`/dashboard/pharmacy/verify?sehat_id=${sehatId || 'SL-MH-2026-000001'}`} className="btn btn-primary btn-sm flex items-center gap-1">
                        <Eye className="w-4 h-4" /> View &amp; Dispense
                      </a>
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
