'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Users, Shield, Building2, UserCheck,
  BarChart3, ScrollText, Settings, Activity, TrendingUp, FileText, CheckCircle2
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

export default function AdminAnalyticsPage() {
  const { profile, loading, signOut } = useRequireAuth('admin')

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Analytics &amp; District Health Reports" subtitle="Longitudinal Population Health Insights" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card text-center p-4">
              <p className="text-xs text-gray-500 font-medium">Total Registered Patients</p>
              <p className="text-2xl font-extrabold text-blue-700 mt-1">1,420</p>
              <span className="text-[10px] text-green-600 font-semibold">+12% this month</span>
            </div>
            <div className="card text-center p-4">
              <p className="text-xs text-gray-500 font-medium">Vitals Assessments Recorded</p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">3,840</p>
              <span className="text-[10px] text-green-600 font-semibold">+18% this month</span>
            </div>
            <div className="card text-center p-4">
              <p className="text-xs text-gray-500 font-medium">Digital &amp; Uploaded Prescriptions</p>
              <p className="text-2xl font-extrabold text-violet-700 mt-1">980</p>
              <span className="text-[10px] text-green-600 font-semibold">+8% this month</span>
            </div>
            <div className="card text-center p-4">
              <p className="text-xs text-gray-500 font-medium">Pharmacy Dispensing Rate</p>
              <p className="text-2xl font-extrabold text-amber-700 mt-1">94.2%</p>
              <span className="text-[10px] text-green-600 font-semibold">Optimal fulfillment</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card space-y-4">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" /> Disease Prevalence Distribution (Taluka Khed)
              </h3>
              <div className="space-y-3">
                {[
                  { disease: 'Hypertension (High BP)', count: 320, pct: 65 },
                  { disease: 'Type-2 Diabetes', count: 210, pct: 42 },
                  { disease: 'Seasonal Dengue / Fever', count: 145, pct: 28 },
                  { disease: 'Respiratory Infection', count: 98, pct: 19 },
                ].map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-800">{d.disease}</span>
                      <span className="text-blue-700">{d.count} Cases ({d.pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${d.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card space-y-4">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" /> Monthly Field Worker Activity
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Meena Patil (Khed PHC)', vitals: 142, enrolls: 38 },
                  { name: 'Sunita Pawar (Chakan CHC)', vitals: 118, enrolls: 29 },
                  { name: 'Ramesh Kale (Manchar SDH)', vitals: 96, enrolls: 22 },
                ].map((w, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-xs text-gray-900">{w.name}</p>
                      <p className="text-[10px] text-gray-500">{w.vitals} vitals recorded · {w.enrolls} new SEHAT IDs</p>
                    </div>
                    <span className="badge bg-emerald-100 text-emerald-800 font-bold">Top Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
