'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Search, UserPlus, Activity, AlertTriangle,
  Settings, User, MapPin, Building
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard/health-worker', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/health-worker/patients', label: 'Patient Directory', icon: Search, section: 'Field Actions' },
  { href: '/dashboard/health-worker/register', label: 'Register Patient', icon: UserPlus, section: 'Field Actions' },
  { href: '/dashboard/health-worker/vitals', label: 'Record Vitals', icon: Activity, section: 'Field Actions' },
  { href: '/dashboard/health-worker/high-risk', label: 'High Risk List', icon: AlertTriangle, section: 'Monitoring' },
  { href: '/dashboard/health-worker/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

export default function HealthWorkerProfilePage() {
  const { profile, loading, signOut } = useRequireAuth('health_worker')

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Profile &amp; Account Settings" subtitle="ASHA / Community Health Worker Credentials" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content max-w-2xl mx-auto space-y-6">
          <div className="card space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-2xl">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{profile.full_name || 'Meena Patil'}</h2>
                <p className="text-xs font-mono text-emerald-700 font-bold">ASHA Health Worker Supervisor</p>
                <p className="text-xs text-gray-500">{profile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">Assigned PHC Node</span>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><Building className="w-4 h-4 text-emerald-600" /> Khed Primary Health Centre</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">Gram Panchayat Area</span>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-emerald-600" /> Nimgaon &amp; Chakan Sector 4</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-bold text-gray-900 text-sm">Field Activity Summary</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-gray-500">Registered</p>
                  <p className="text-xl font-bold text-emerald-700">142</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-gray-500">Vitals Recorded</p>
                  <p className="text-xl font-bold text-emerald-700">384</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-gray-500">Active High Risk</p>
                  <p className="text-xl font-bold text-emerald-700">3</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
