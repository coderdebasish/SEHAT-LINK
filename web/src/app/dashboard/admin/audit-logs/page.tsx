'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Users, Shield, Building2, UserCheck,
  BarChart3, ScrollText, Settings, ShieldCheck
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard/admin', label: 'System Overview', icon: LayoutDashboard },
  { href: '/dashboard/admin/users', label: 'User Management', icon: Users, section: 'Management' },
  { href: '/dashboard/admin/roles', label: 'Role & Permissions', icon: Shield, section: 'Management' },
  { href: '/dashboard/admin/facilities', label: 'Facility Management', icon: Building2, section: 'Management' },
  { href: '/dashboard/admin/providers', label: 'Provider Management', icon: UserCheck, section: 'Management' },
  { href: '/dashboard/admin/analytics', label: 'Analytics & Reports', icon: BarChart3, section: 'Insights' },
  { href: '/dashboard/admin/audit-logs', label: 'Audit Logs', icon: ScrollText, section: 'Insights' },
  { href: '/dashboard/admin/settings', label: 'System Settings', icon: Settings, section: 'System' },
]

export default function AdminAuditLogsPage() {
  const { profile, loading, signOut } = useRequireAuth('admin')

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  const LOGS = [
    { time: 'Today, 03:22 PM', actor: 'Dr. Rajesh Sharma (doctor)', action: 'UPLOAD_PRESCRIPTION', target: 'SL-MH-2026-000001', ip: '103.21.12.4' },
    { time: 'Today, 02:45 PM', actor: 'Meena Patil (health_worker)', action: 'RECORD_VITALS', target: 'SL-MH-2026-000001', ip: '103.21.12.9' },
    { time: 'Today, 01:10 PM', actor: 'LifeCare Pharmacy (pharmacy)', action: 'DISPENSE_PRESCRIPTION', target: 'SL-MH-2026-000001', ip: '103.21.15.2' },
    { time: 'Today, 11:30 AM', actor: 'System Admin (admin)', action: 'CREATE_USER', target: 'doctor@sehat.in', ip: '103.21.10.1' },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="System Audit Logs" subtitle="HIPAA/DISHA Compliant Immutable Event Stream" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card flex items-center gap-3 bg-blue-50 border border-blue-100">
            <ShieldCheck className="w-6 h-6 text-blue-700 flex-shrink-0" />
            <p className="text-xs text-blue-900 leading-relaxed">
              All clinical access, prescription uploads, and data mutations are logged immutably in PostgreSQL audit triggers to satisfy healthcare compliance standards.
            </p>
          </div>

          <div className="card overflow-hidden">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User / Actor</th>
                    <th>Action Executed</th>
                    <th>Target Patient / Entity</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {LOGS.map((l, i) => (
                    <tr key={i}>
                      <td className="text-xs text-gray-500">{l.time}</td>
                      <td className="font-semibold text-xs text-gray-900">{l.actor}</td>
                      <td>
                        <span className="badge bg-slate-100 text-slate-800 font-mono text-[11px] font-bold">{l.action}</span>
                      </td>
                      <td className="font-mono text-xs text-blue-700 font-bold">{l.target}</td>
                      <td className="font-mono text-xs text-gray-400">{l.ip}</td>
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
