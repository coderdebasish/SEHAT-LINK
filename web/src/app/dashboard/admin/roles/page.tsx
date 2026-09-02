'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Users, Shield, Building2, UserCheck,
  BarChart3, ScrollText, Settings, Lock, CheckCircle2
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

export default function AdminRolesPage() {
  const { profile, loading, signOut } = useRequireAuth('admin')

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  const ROLES = [
    { name: 'Patient', key: 'patient', scope: 'Own Data', users: 1420, desc: 'View longitudinal health record, appointments, digital & scanned prescriptions.' },
    { name: 'Health Worker', key: 'health_worker', scope: 'Assigned Patients', users: 48, desc: 'Register patients, record vitals, conduct field assessments, manage follow-ups.' },
    { name: 'Doctor', key: 'doctor', scope: 'Consulting Patients', users: 24, desc: 'SOAP consultations, digital prescriptions, upload scanned paper prescriptions.' },
    { name: 'Pharmacy', key: 'pharmacy', scope: 'SEHAT ID Lookup Only', users: 18, desc: 'Retrieve patient prescriptions via Health ID, verify medicines, update dispensing.' },
    { name: 'Facility Staff', key: 'facility_staff', scope: 'Facility Scope', users: 32, desc: 'OPD queue management, appointment scheduling, bed & lab report coordination.' },
    { name: 'Administrator', key: 'admin', scope: 'System-Wide', users: 4, desc: 'Full platform administration, user management, facility controls, audit logs.' },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Role &amp; Permissions Matrix" subtitle="Platform RBAC Policy Configuration" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROLES.map((r, i) => (
              <div key={i} className="card space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Lock className="w-5 h-5" />
                  </div>
                  <span className="badge bg-blue-100 text-blue-800 font-bold">{r.users} Active Users</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{r.name}</h3>
                  <p className="text-xs text-blue-700 font-mono font-semibold">Scope: {r.scope}</p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{r.desc}</p>
                <div className="pt-2 border-t flex items-center justify-between text-xs text-emerald-700 font-medium">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Enforced by RLS Policy</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
