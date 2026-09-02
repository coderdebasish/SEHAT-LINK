'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, History, FileText, Calendar, ClipboardList, GitBranch, FolderOpen, Settings, Eye, Loader2, Package
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

type LabOrderRow = {
  id: string
  test_name: string
  test_category: string | null
  status: string
  results: Record<string, any> | null
  notes: string | null
  created_at: string
  doctor: { full_name: string } | null
  facility: { name: string; village: string } | null
}

export default function PatientDiagnosticsPage() {
  const auth = useRequireAuth('patient')
  const [labOrders, setLabOrders] = useState<LabOrderRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth.patient?.id) return

    async function loadDiagnostics() {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('lab_orders')
        .select(`
          id, test_name, test_category, status, results, notes, created_at,
          doctor:profiles!lab_orders_doctor_id_fkey(full_name),
          facility:facilities(name, village)
        `)
        .eq('patient_id', auth.patient!.id)
        .order('created_at', { ascending: false })

      setLabOrders((data as any) || [])
      setLoading(false)
    }

    loadDiagnostics()

    const supabase = createClient()
    const channel = supabase.channel(`patient-labs-${auth.patient.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lab_orders' }, () => loadDiagnostics())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [auth.patient?.id])

  if (auth.loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!auth.profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={auth.profile} navItems={NAV_ITEMS} onSignOut={auth.signOut} />
      <div className="dashboard-main">
        <Topbar title="Diagnostics &amp; Lab Reports" subtitle="Pathology, Blood Work &amp; Radiology Reports" profile={auth.profile} onSignOut={auth.signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Lab Orders &amp; Test Results</h3>
              <span className="badge bg-blue-100 text-blue-800 font-semibold">{labOrders.length} Records</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-blue-300" />
              </div>
            ) : labOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No lab reports found</p>
                <p className="text-xs mt-1">Diagnostic orders created by your doctor or lab technician will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {labOrders.map(lab => {
                  const doctorName = Array.isArray(lab.doctor) ? lab.doctor[0]?.full_name : lab.doctor?.full_name
                  const facilityName = Array.isArray(lab.facility) ? lab.facility[0]?.name : lab.facility?.name
                  return (
                    <div key={lab.id} className="p-4 border border-gray-100 rounded-xl hover:border-blue-100 hover:bg-blue-50/20 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-base">{lab.test_name}</h4>
                          <span className="badge bg-purple-100 text-purple-800 text-xs font-semibold">{lab.status}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {facilityName || 'Khed PHC Lab'} · Ordered by {doctorName || 'Dr. Rajesh Sharma'}
                        </p>
                        {lab.results && (
                          <div className="mt-2 text-xs font-mono text-emerald-800 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                            Result: {JSON.stringify(lab.results).replace(/[{}"\\]/g, ' ')}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs text-gray-400 font-mono block mb-2">{formatDate(lab.created_at)}</span>
                        <button onClick={() => alert(`Lab Order ID: ${lab.id}\nTest: ${lab.test_name}\nStatus: ${lab.status}`)} className="btn btn-secondary btn-sm">
                          <Eye className="w-3.5 h-3.5" /> View Report
                        </button>
                      </div>
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
