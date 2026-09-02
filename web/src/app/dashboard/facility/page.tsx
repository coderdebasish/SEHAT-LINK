'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Calendar, Users, FlaskConical,
  Bed, Settings
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard/facility', label: 'Facility Overview', icon: LayoutDashboard },
  { href: '/dashboard/facility/queue', label: 'OPD Queue Manager', icon: Users, section: 'Operations' },
  { href: '/dashboard/facility/appointments', label: 'Appointments', icon: Calendar, section: 'Operations' },
  { href: '/dashboard/facility/labs', label: 'Lab Diagnostics', icon: FlaskConical, section: 'Operations' },
  { href: '/dashboard/facility/beds', label: 'Bed Management', icon: Bed, section: 'Operations' },
  { href: '/dashboard/facility/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

export default function FacilityDashboard() {
  const { profile, loading, signOut } = useRequireAuth('facility_staff')
  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Facility Staff Dashboard" subtitle="Khed Primary Health Centre Operations" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content">
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Today\'s Appointments', value: '34', icon: Calendar, color: 'bg-orange-50 text-orange-600' },
                { label: 'Queue Now', value: '8', icon: Users, color: 'bg-blue-50 text-blue-600' },
                { label: 'Pending Lab Reports', value: '12', icon: FlaskConical, color: 'bg-violet-50 text-violet-600' },
                { label: 'Beds Available', value: '6', icon: Bed, color: 'bg-green-50 text-green-600' },
              ].map(stat => (
                <div key={stat.label} className="stat-card">
                  <div className={cn('stat-icon', stat.color)}><stat.icon className="w-5 h-5" /></div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="card">
                <div className="section-header">
                  <h2 className="text-base font-semibold text-gray-900">Today&apos;s Appointments</h2>
                  <Link href="/dashboard/facility/appointments" className="btn btn-sm btn-ghost text-orange-600">Manage</Link>
                </div>
                <div className="space-y-2">
                  {[
                    { time: '09:00', name: 'Priya Ramesh Patil', doctor: 'Dr. Rajesh Sharma', token: 'T01', status: 'completed' },
                    { time: '09:30', name: 'Sunita Vishnu Pawar', doctor: 'Dr. Sunita Deshmukh', token: 'T02', status: 'completed' },
                    { time: '10:00', name: 'Shantaram Tukaram Shinde', doctor: 'Dr. Rajesh Sharma', token: 'T03', status: 'in-queue' },
                  ].map(a => (
                    <div key={a.token} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-400 w-12">{a.time}</span>
                      <span className="badge bg-gray-100 text-gray-600 text-xs font-mono">{a.token}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{a.name}</p>
                        <p className="text-xs text-gray-400">{a.doctor}</p>
                      </div>
                      <span className={cn('badge text-xs', {
                        'bg-green-100 text-green-700': a.status === 'completed',
                        'bg-blue-100 text-blue-700': a.status === 'in-queue',
                      })}>{a.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="section-header">
                  <h2 className="text-base font-semibold text-gray-900">Pending Lab Reports</h2>
                  <Link href="/dashboard/facility/labs" className="btn btn-sm btn-ghost text-violet-600">View All</Link>
                </div>
                <div className="space-y-3">
                  {[
                    { patient: 'Priya Ramesh Patil', test: 'Complete Blood Count (CBC)', ordered: '1 day ago', status: 'completed' },
                    { patient: 'Sunita Vishnu Pawar', test: 'Urine Routine & Protein', ordered: 'Today', status: 'processing' },
                  ].map(r => (
                    <div key={r.patient} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{r.patient}</p>
                        <p className="text-xs text-gray-500">{r.test} · {r.ordered}</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className={cn('badge text-xs', {
                          'bg-blue-100 text-blue-700': r.status === 'processing',
                          'bg-green-100 text-green-700': r.status === 'completed',
                        })}>{r.status}</span>
                        <Link href="/dashboard/facility/labs" className="btn btn-sm btn-secondary text-xs">View</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
