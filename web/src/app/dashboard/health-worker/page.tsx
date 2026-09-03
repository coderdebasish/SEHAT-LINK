'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Users, UserPlus, Activity, ClipboardList,
  GitBranch, AlertTriangle, RefreshCw, Settings, MapPin, Search
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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

export default function HealthWorkerDashboard() {
  const { profile, loading, signOut } = useRequireAuth('health_worker')
  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  return (
    <DashboardShell
      profile={profile}
      navItems={NAV_ITEMS}
      onSignOut={signOut}
      title="Health Worker Dashboard"
      subtitle="Field & Community"
      actions={
        <Link href="/dashboard/health-worker/register" className="btn btn-primary btn-sm">
          <UserPlus className="w-4 h-4" /> Register Patient
        </Link>
      }
    >
      <HealthWorkerOverview />
    </DashboardShell>
  )
}

function HealthWorkerOverview() {
  return (
    <div className="space-y-6">
      {/* Quick Search */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Patient Search</h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search by SEHAT ID, name, or phone..." />
          </div>
          <button className="btn btn-primary">Search</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Assigned Patients', value: '48', icon: Users, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Follow-ups Due Today', value: '5', icon: RefreshCw, color: 'bg-amber-50 text-amber-600' },
          { label: 'High Risk Cases', value: '3', icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
          { label: 'Pending Sync', value: '0', icon: RefreshCw, color: 'bg-blue-50 text-blue-600' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className={cn('stat-icon', stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent patients */}
        <div className="lg:col-span-2 card">
          <div className="section-header">
            <h2 className="text-base font-semibold text-gray-900">Recent Patients</h2>
            <Link href="/dashboard/health-worker/patients" className="btn btn-sm btn-ghost text-emerald-600">View All</Link>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Priya Ramesh Patil', sehat: 'SL-MH-2026-000001', age: '31F', risk: 'low', last: '2 days ago' },
              { name: 'Ramesh Bhosale', sehat: 'SL-MH-2026-000002', age: '58M', risk: 'high', last: '3 days ago' },
              { name: 'Savita Kulkarni', sehat: 'SL-MH-2026-000003', age: '44F', risk: 'medium', last: '5 days ago' },
            ].map(p => (
              <div key={p.sehat} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="avatar avatar-md bg-emerald-100 text-emerald-700 font-bold">
                  {p.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{p.sehat} · {p.age}</p>
                </div>
                <span className={cn('badge', {
                  'bg-green-100 text-green-700': p.risk === 'low',
                  'bg-yellow-100 text-yellow-700': p.risk === 'medium',
                  'bg-red-100 text-red-700': p.risk === 'high',
                })}>
                  {p.risk}
                </span>
                <span className="text-xs text-gray-400 hidden sm:block">{p.last}</span>
                <Link href="/dashboard/health-worker/patients" className="btn btn-sm btn-secondary">View</Link>
              </div>
            ))}
          </div>
        </div>

        {/* Today's summary + Quick actions */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Today&apos;s Summary</h2>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Patients visited', value: '7' },
                { label: 'Vitals recorded', value: '7' },
                { label: 'Follow-ups done', value: '3' },
                { label: 'New registrations', value: '2' },
              ].map(s => (
                <div key={s.label} className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">{s.label}</span>
                  <span className="font-semibold text-gray-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Register New Patient', href: '/dashboard/health-worker/register', icon: UserPlus },
                { label: 'Record Vitals', href: '/dashboard/health-worker/vitals', icon: Activity },
                { label: 'Add Assessment', href: '/dashboard/health-worker/assessments', icon: ClipboardList },
                { label: 'Create Follow-up', href: '/dashboard/health-worker/follow-ups', icon: RefreshCw },
              ].map(a => (
                <Link key={a.label} href={a.href} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 hover:text-gray-900" style={{ textDecoration: 'none' }}>
                  <a.icon className="w-4 h-4 text-emerald-500" />
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* High risk alert */}
          <div className="card border-red-100 bg-red-50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-red-800">High Risk Alert</span>
            </div>
            <p className="text-xs text-red-700">Ramesh Bhosale — BP 160/100, follow-up overdue by 3 days</p>
            <Link href="/dashboard/health-worker/high-risk" className="btn btn-sm btn-danger mt-3 w-full" style={{ textDecoration: 'none' }}>View Cases</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
