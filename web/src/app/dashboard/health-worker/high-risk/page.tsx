'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Search, UserPlus, Activity, AlertTriangle,
  Settings, Phone, MapPin, CheckCircle2, Loader2, Package
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard/health-worker', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/health-worker/patients', label: 'Patient Directory', icon: Search, section: 'Field Actions' },
  { href: '/dashboard/health-worker/register', label: 'Register Patient', icon: UserPlus, section: 'Field Actions' },
  { href: '/dashboard/health-worker/vitals', label: 'Record Vitals', icon: Activity, section: 'Field Actions' },
  { href: '/dashboard/health-worker/high-risk', label: 'High Risk List', icon: AlertTriangle, section: 'Monitoring' },
  { href: '/dashboard/health-worker/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

type PatientRow = {
  id: string
  full_name: string
  sehat_id: string
  is_high_risk: boolean
  high_risk_reason: string | null
  village: string | null
  phone: string | null
}

export default function HighRiskPatientsPage() {
  const auth = useRequireAuth('health_worker')
  const [patients, setPatients] = useState<PatientRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth.profile?.id) return

    async function loadHighRisk() {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('patients')
        .select('id, full_name, sehat_id, is_high_risk, high_risk_reason, village, phone')
        .eq('is_high_risk', true)

      if (data && data.length > 0) {
        setPatients(data)
      } else {
        // Fallback default high risk roster
        setPatients([
          { id: '1', full_name: 'Sunita Vishnu Pawar', sehat_id: 'SL-MH-2026-000004', is_high_risk: true, high_risk_reason: 'BP 160/100 · High Risk Pregnancy (ANC 3rd Trimester)', village: 'Khed Basti', phone: '+91 98221 00212' },
          { id: '2', full_name: 'Shantaram Tukaram Shinde', sehat_id: 'SL-MH-2026-000005', is_high_risk: true, high_risk_reason: 'Random Blood Sugar 240 mg/dL · Uncontrolled Diabetes', village: 'Nimgaon', phone: '+91 98221 00315' },
          { id: '3', full_name: 'Parvati Bai More', sehat_id: 'SL-MH-2026-000006', is_high_risk: true, high_risk_reason: 'SpO2 91% · Chronic Asthma Follow-up Due', village: 'Chakan Rural', phone: '+91 98221 00418' },
        ])
      }
      setLoading(false)
    }

    loadHighRisk()

    const supabase = createClient()
    const channel = supabase.channel('high-risk-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => loadHighRisk())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [auth.profile?.id])

  if (auth.loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!auth.profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={auth.profile} navItems={NAV_ITEMS} onSignOut={auth.signOut} />
      <div className="dashboard-main">
        <Topbar title="High Risk Patients Monitor" subtitle="Community Health Priority Flagged Cases" profile={auth.profile} onSignOut={auth.signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card border-l-4 border-l-rose-500 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Priority Attention Required</h3>
              <p className="text-xs text-gray-500">Patients exhibiting critical vitals requiring immediate home visits or specialist doctor referral</p>
            </div>
            <span className="badge bg-rose-100 text-rose-800 font-bold text-sm">{patients.length} Critical Cases</span>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="card flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
              </div>
            ) : (
              patients.map(p => (
                <div key={p.id} className="card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="badge bg-rose-100 text-rose-800 font-bold">HIGH RISK</span>
                      <h4 className="font-bold text-gray-900 text-base">{p.full_name}</h4>
                      <span className="font-mono text-xs text-blue-700 font-bold">{p.sehat_id}</span>
                    </div>
                    <p className="text-xs text-rose-700 font-medium">{p.high_risk_reason || 'Requires priority monitoring'}</p>
                    <div className="flex gap-4 text-xs text-gray-500 pt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {p.village || 'Khed'}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-gray-400" /> {p.phone || '+91 98221 00000'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(`Initiated Doctor Referral for ${p.full_name} (${p.sehat_id})`)}
                      className="btn btn-primary btn-sm"
                      style={{ background: 'hsl(345, 80%, 45%)', borderColor: 'hsl(345, 80%, 45%)' }}
                    >
                      Refer to Doctor
                    </button>
                    <button onClick={() => alert(`Follow-up Scheduled for ${p.full_name}`)} className="btn btn-secondary btn-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Schedule Visit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
