'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Users, UserPlus, Activity, ClipboardList,
  RefreshCw, GitBranch, AlertTriangle, Settings, CheckCircle2
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

export default function HealthWorkerFollowUpsPage() {
  const { profile, loading, signOut } = useRequireAuth('health_worker')

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  const FOLLOWUPS = [
    { patient: 'Ramesh Bhosale', id: 'SL-MH-2026-000002', due: 'Overdue by 3 days', purpose: 'Hypertension BP Re-check', village: 'Chakan Sector 4', status: 'Pending' },
    { patient: 'Priya Ramesh Patil', id: 'SL-MH-2026-000001', due: 'Today, 04:00 PM', purpose: 'Post-Prescription Adherence Check', village: 'Nimgaon', status: 'Scheduled' },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Patient Follow-up Schedule" subtitle="Home Visit &amp; Medication Adherence Tracking" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card overflow-hidden">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Due Date / Time</th>
                    <th>Patient Name</th>
                    <th>SEHAT Health ID</th>
                    <th>Purpose of Visit</th>
                    <th>Village</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {FOLLOWUPS.map((f, i) => (
                    <tr key={i}>
                      <td className="font-mono text-xs font-bold text-amber-700">{f.due}</td>
                      <td className="font-semibold text-gray-900">{f.patient}</td>
                      <td className="font-mono text-xs text-blue-700">{f.id}</td>
                      <td className="text-xs text-gray-700">{f.purpose}</td>
                      <td className="text-xs text-gray-600">{f.village}</td>
                      <td>
                        <button onClick={() => alert(`Completed Follow-up for ${f.patient}`)} className="btn btn-secondary btn-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
