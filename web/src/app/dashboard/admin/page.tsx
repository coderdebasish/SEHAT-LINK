'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { DashboardShell } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Users, Shield, Building2, UserCheck,
  BarChart3, FileText, ScrollText, Settings, TrendingUp,
  Activity, Heart, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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

export default function AdminDashboard() {
  const { profile, loading, signOut } = useRequireAuth('admin')
  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  return (
    <DashboardShell
      profile={profile}
      navItems={NAV_ITEMS}
      onSignOut={signOut}
      title="Admin Dashboard"
      subtitle="System Administrator"
    >
      <AdminOverview />
    </DashboardShell>
  )
}

function AdminOverview() {
  return (
    <div className="space-y-6">
      {/* System health banner */}
      <div className="alert alert-success">
        <Activity className="w-4 h-4 flex-shrink-0" />
        <span><strong>System operational.</strong> All services running normally. Last sync: 2 minutes ago.</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '428', icon: Users, color: 'bg-rose-50 text-rose-600', sub: '+12 this week' },
          { label: 'Active Patients', value: '12,480', icon: Heart, color: 'bg-pink-50 text-pink-600', sub: '+340 this month' },
          { label: 'Active Facilities', value: '86', icon: Building2, color: 'bg-orange-50 text-orange-600', sub: 'Pune district' },
          { label: 'System Health', value: '99.8%', icon: TrendingUp, color: 'bg-green-50 text-green-600', sub: 'Uptime' },
        ].map(stat => (
          <div key={stat.label} className="stat-card flex-col items-start gap-2">
            <div className="flex items-center gap-3 w-full">
              <div className={cn('stat-icon', stat.color)}><stat.icon className="w-5 h-5" /></div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            </div>
            <p className="text-xs text-emerald-600 font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Role distribution */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Users by Role</h2>
          <div className="space-y-3">
            {[
              { role: 'Patients', count: 12480, color: 'bg-sky-500', pct: 96 },
              { role: 'Health Workers', count: 214, color: 'bg-emerald-500', pct: 50 },
              { role: 'Doctors', count: 156, color: 'bg-violet-500', pct: 36 },
              { role: 'Pharmacists', count: 48, color: 'bg-amber-500', pct: 11 },
              { role: 'Facility Staff', count: 82, color: 'bg-orange-500', pct: 19 },
              { role: 'Admins', count: 6, color: 'bg-rose-500', pct: 2 },
            ].map(r => (
              <div key={r.role}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{r.role}</span>
                  <span className="font-semibold text-gray-900">{r.count.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', r.color)} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 card">
          <div className="section-header">
            <h2 className="text-base font-semibold text-gray-900">Recent System Activity</h2>
            <Link href="/dashboard/admin/audit-logs" className="btn btn-sm btn-ghost text-rose-600">View Audit Log</Link>
          </div>
          <div className="space-y-3">
            {[
              { action: 'New patient registered', detail: 'SL-MH-2026-000012 — by HW Meena Patil', time: '5 min ago', icon: Users, color: 'bg-emerald-50 text-emerald-600' },
              { action: 'Prescription uploaded', detail: 'Dr. Sharma uploaded scanned Rx for SL-MH-2026-000001', time: '12 min ago', icon: FileText, color: 'bg-violet-50 text-violet-600' },
              { action: 'Dispensing confirmed', detail: 'LifeCare Pharmacy — SL-MH-2026-000007', time: '28 min ago', icon: Shield, color: 'bg-amber-50 text-amber-600' },
              { action: 'New user created', detail: 'Role: doctor — Dr. Anita Kulkarni', time: '1 hr ago', icon: UserCheck, color: 'bg-blue-50 text-blue-600' },
              { action: 'Referral accepted', detail: 'Rajgurunagar CHC accepted referral for SL-MH-2026-000002', time: '2 hr ago', icon: AlertCircle, color: 'bg-orange-50 text-orange-600' },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', log.color)}>
                  <log.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{log.action}</p>
                  <p className="text-xs text-gray-500 truncate">{log.detail}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Admin Actions */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add User / Role', href: '/dashboard/admin/users', icon: Users, color: 'bg-rose-50 text-rose-700 border-rose-100' },
            { label: 'Manage Facilities', href: '/dashboard/admin/facilities', icon: Building2, color: 'bg-orange-50 text-orange-700 border-orange-100' },
            { label: 'View Reports', href: '/dashboard/admin/analytics', icon: BarChart3, color: 'bg-blue-50 text-blue-700 border-blue-100' },
            { label: 'System Settings', href: '/dashboard/admin/settings', icon: Settings, color: 'bg-gray-50 text-gray-700 border-gray-100' },
          ].map(a => (
            <Link key={a.label} href={a.href} className={cn('card card-sm border flex items-center gap-3 hover:shadow-md transition-shadow', a.color)} style={{ textDecoration: 'none' }}>
              <a.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
