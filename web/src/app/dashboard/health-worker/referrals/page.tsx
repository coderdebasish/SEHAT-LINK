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

export default function HealthWorkerReferralsPage() {
  const { profile, loading, signOut } = useRequireAuth('health_worker')

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  const REFERRALS = [
    { patient: 'Sunita Vishnu Pawar', id: 'SL-MH-2026-000004', facility: 'Khed Primary Health Centre', reason: 'High Risk Pregnancy (BP 160/100)', date: '02 Sep 2026', status: 'Pending PHC Visit' },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Field Referral Tracker" subtitle="Community to PHC Escalations" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Active Field Escalations</h3>
              <p className="text-xs text-gray-500">Patients escalated by Health Worker to PHC Medical Officer</p>
            </div>
            <button onClick={() => alert('Create Referral Modal')} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Issue Field Referral
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date Issued</th>
                    <th>Patient Name</th>
                    <th>SEHAT Health ID</th>
                    <th>Referred To Facility</th>
                    <th>Escalation Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {REFERRALS.map((r, i) => (
                    <tr key={i}>
                      <td className="text-xs text-gray-500">{r.date}</td>
                      <td className="font-semibold text-gray-900">{r.patient}</td>
                      <td className="font-mono text-xs text-blue-700 font-bold">{r.id}</td>
                      <td className="text-xs font-semibold text-gray-800">{r.facility}</td>
                      <td className="text-xs text-rose-700">{r.reason}</td>
                      <td>
                        <span className="badge bg-amber-100 text-amber-800 font-bold">{r.status}</span>
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
