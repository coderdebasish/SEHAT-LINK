'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Users, UserPlus, Activity, ClipboardList,
  RefreshCw, GitBranch, AlertTriangle, Settings, Plus, CheckCircle2
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard/health-worker', label: 'My Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/health-worker/patients', label: 'Assigned Patients', icon: Users, section: 'Patients' },
  { href: '/dashboard/health-worker/register', label: 'Register New Patient', icon: UserPlus, section: 'Patients' },
  { href: '/dashboard/health-worker/vitals', label: 'Record Vitals', icon: Activity, section: 'Clinical' },
  { href: '/dashboard/health-worker/assessments', label: 'Assessments', icon: ClipboardList, section: 'Clinical' },
  { href: '/dashboard/health-worker/follow-ups', label: 'Follow-ups', icon: RefreshCw, section: 'Clinical' },
  { href: '/dashboard/health-worker/referrals', label: 'Referrals', icon: GitBranch, section: 'Clinical' },
  { href: '/dashboard/health-worker/high-risk', label: 'Alerts / High Risk', icon: AlertTriangle, section: 'Alerts' },
  { href: '/dashboard/health-worker/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

export default function HealthWorkerAssessmentsPage() {
  const { profile, loading, signOut } = useRequireAuth('health_worker')

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  const ASSESSMENTS = [
    { patient: 'Sunita Vishnu Pawar', id: 'SL-MH-2026-000004', type: 'ANC 3rd Trimester Screening', date: '02 Sep 2026', findings: 'Pedal edema present, elevated blood pressure. Recommended immediate PHC OB-GYN consultation.', risk: 'High' },
    { patient: 'Savita Kulkarni', id: 'SL-MH-2026-000003', type: 'Diabetes & Hypertension Screening', date: '28 Aug 2026', findings: 'Blood sugar normal, BP 130/85. Advised reduced salt intake.', risk: 'Medium' },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Field Health Assessments" subtitle="Community Health Worker Clinical Screenings" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Field Assessment Logs</h3>
              <p className="text-xs text-gray-500">NCD (Non-Communicable Disease) &amp; Maternal Health Surveys</p>
            </div>
            <button onClick={() => alert('New Assessment Form Modal')} className="btn btn-primary">
              <Plus className="w-4 h-4" /> New Field Assessment
            </button>
          </div>

          <div className="space-y-4">
            {ASSESSMENTS.map((a, i) => (
              <div key={i} className="card space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{a.patient}</h4>
                    <span className="font-mono text-xs text-blue-700 font-bold">{a.id}</span>
                  </div>
                  <span className="text-xs text-gray-400">{a.date}</span>
                </div>
                <p className="text-xs font-semibold text-emerald-700">{a.type}</p>
                <p className="text-xs text-gray-700 font-mono bg-gray-50 p-2.5 rounded-lg">{a.findings}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
