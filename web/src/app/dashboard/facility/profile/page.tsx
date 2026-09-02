'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Users, Calendar, FileSpreadsheet, BedDouble, Settings, Building, MapPin, Phone
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard/facility', label: 'Facility Overview', icon: LayoutDashboard },
  { href: '/dashboard/facility/queue', label: 'OPD Queue Manager', icon: Users, section: 'Operations' },
  { href: '/dashboard/facility/appointments', label: 'Appointments', icon: Calendar, section: 'Operations' },
  { href: '/dashboard/facility/labs', label: 'Lab Diagnostics', icon: FileSpreadsheet, section: 'Operations' },
  { href: '/dashboard/facility/beds', label: 'Bed Management', icon: BedDouble, section: 'Operations' },
  { href: '/dashboard/facility/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

export default function FacilityProfilePage() {
  const { profile, loading, signOut } = useRequireAuth('facility_staff')

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Facility Node Profile" subtitle="Khed Primary Health Centre Configuration" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content max-w-2xl mx-auto space-y-6">
          <div className="card space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-2xl">
                <Building className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Khed Primary Health Centre (PHC)</h2>
                <p className="text-xs font-mono text-blue-700 font-bold">Facility Code: PHC-MH-PUN-001</p>
                <p className="text-xs text-gray-500">{profile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">Taluka &amp; District</span>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-600" /> Khed, Pune District</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">Emergency Line</span>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><Phone className="w-4 h-4 text-blue-600" /> +91 2135 222100</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
