'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Activity, Calendar, Pill,
  ClipboardList, GitBranch, FolderOpen, Settings, CheckCircle, Package, Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, cn } from '@/lib/utils'
import { subscribeGlobalSync } from '@/lib/realtimeSync'

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

type PrescriptionItem = {
  id: string
  medicine_name: string
  dosage: string | null
  frequency: string | null
  duration: string | null
  instructions: string | null
}

type PrescriptionRow = {
  id: string
  status: string
  created_at: string
  notes: string | null
  doctor: { full_name: string } | null
  prescription_items: PrescriptionItem[]
  pharmacy_dispensing: Array<{ id: string; status: string; dispensed_at: string | null }> | null
}

export default function PatientPrescriptionsPage() {
  const auth = useRequireAuth('patient')
  const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPrescriptions() {
      const supabase = createClient()
      const patientIds = [
        auth.patient?.id,
        'a0000000-0000-0000-0000-000000000001'
      ].filter(Boolean) as string[]

      const { data } = await supabase
        .from('prescriptions')
        .select(`
          id, status, created_at, notes,
          doctor:profiles!prescriptions_doctor_id_fkey(full_name),
          prescription_items(id, medicine_name, dosage, frequency, duration, instructions),
          pharmacy_dispensing(id, status, dispensed_at)
        `)
        .in('patient_id', patientIds)
        .order('created_at', { ascending: false })

      let list: PrescriptionRow[] = (data as any) || []

      // Read locally synced uploaded prescriptions from local storage
      try {
        const localItems: PrescriptionRow[] = JSON.parse(localStorage.getItem('sehat_uploaded_prescriptions') || '[]')
        if (localItems.length > 0) {
          const existingIds = new Set(list.map(r => r.id))
          for (const item of localItems) {
            if (!existingIds.has(item.id)) {
              list.unshift(item)
            }
          }
        }
      } catch (e) {
        console.warn('Local storage parse error:', e)
      }

      // Default demo prescription roster fallback
      if (list.length === 0) {
        list = [
          {
            id: 'rx000000-0000-0000-0000-000000000001',
            status: 'active',
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            notes: 'Follow up after 5 days if fever persists.',
            doctor: { full_name: 'Dr. Rajesh Sharma' },
            prescription_items: [
              {
                id: 'item-1',
                medicine_name: 'Amoxicillin 500mg Capsule',
                dosage: '500mg',
                frequency: 'Twice daily (morning + evening)',
                duration: '5 days',
                instructions: 'Take after meals with water'
              },
              {
                id: 'item-2',
                medicine_name: 'Paracetamol 650mg Tablet',
                dosage: '650mg',
                frequency: 'As needed (max 3x daily)',
                duration: '3 days',
                instructions: 'Take only when temperature > 100°F'
              },
              {
                id: 'item-3',
                medicine_name: 'ORS Sachets',
                dosage: '1 sachet',
                frequency: 'After each loose stool',
                duration: 'As needed',
                instructions: 'Dissolve in 200ml clean water'
              }
            ],
            pharmacy_dispensing: null
          }
        ]
      }

      setPrescriptions(list)
      setLoading(false)
    }

    loadPrescriptions()

    const supabase = createClient()
    const patientId = auth.patient?.id || 'a0000000-0000-0000-0000-000000000001'
    const channel = supabase.channel(`patient-prescriptions-${patientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions' }, () => loadPrescriptions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescription_items' }, () => loadPrescriptions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pharmacy_dispensing' }, () => loadPrescriptions())
      .subscribe()

    const unsubscribeGlobal = subscribeGlobalSync(loadPrescriptions)

    return () => {
      supabase.removeChannel(channel)
      unsubscribeGlobal()
    }
  }, [auth.patient?.id])

  if (auth.loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!auth.profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={auth.profile} navItems={NAV_ITEMS} onSignOut={auth.signOut} />
      <div className="dashboard-main">
        <Topbar title="My Prescriptions" subtitle="Digital &amp; Dispensed Medications" profile={auth.profile} onSignOut={auth.signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card bg-violet-900 text-white p-6">
            <div className="flex items-center gap-3 mb-2">
              <Pill className="w-6 h-6 text-violet-300" />
              <h2 className="text-xl font-bold">Prescription Security Guarantee</h2>
            </div>
            <p className="text-xs text-violet-200 leading-relaxed max-w-xl">
              Pharmacies only need your SEHAT Health ID (<span className="font-mono text-white font-bold">{auth.patient?.sehat_id || 'SL-MH-2026-000001'}</span>) to access and dispense your active prescriptions securely.
            </p>
          </div>

          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Active &amp; Past Prescriptions</h3>
              <span className="badge bg-violet-100 text-violet-800 font-semibold">{prescriptions.length} Records</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-violet-300" />
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No prescriptions found</p>
                <p className="text-xs mt-1">Prescriptions issued by your doctor will appear here in real-time</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map(rx => {
                  const doctorName = Array.isArray(rx.doctor) ? rx.doctor[0]?.full_name : rx.doctor?.full_name
                  const isDispensed = rx.status === 'dispensed' || (rx.pharmacy_dispensing && rx.pharmacy_dispensing.length > 0)
                  return (
                    <div key={rx.id} className="p-4 border border-violet-100 bg-violet-50/40 rounded-xl space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 font-mono">Rx #{rx.id.slice(0, 15).toUpperCase()}</p>
                            <span className={cn('badge text-xs font-semibold', isDispensed ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800')}>
                              {isDispensed ? 'Dispensed' : rx.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">Prescribed by {doctorName || 'Dr. Rajesh Sharma'}</p>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">{formatDate(rx.created_at)}</span>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-violet-100">
                        {(rx.prescription_items || []).map(item => (
                          <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{item.medicine_name}</p>
                              <p className="text-xs text-gray-500">
                                {item.dosage || '1 tablet'} · {item.frequency || 'Daily'} · {item.duration || '5 Days'}
                              </p>
                              {item.instructions && <p className="text-[11px] text-violet-700 font-medium">{item.instructions}</p>}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{isDispensed ? 'Dispensed' : 'Active'}</span>
                            </div>
                          </div>
                        ))}
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
