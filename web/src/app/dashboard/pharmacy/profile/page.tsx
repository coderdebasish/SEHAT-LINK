'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Search, FileText, History, Settings, Building, Phone, MapPin
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard/pharmacy', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/pharmacy/verify', label: 'Verify Prescription', icon: Search, section: 'Prescriptions' },
  { href: '/dashboard/pharmacy/active', label: 'Active Prescriptions', icon: FileText, section: 'Prescriptions' },
  { href: '/dashboard/pharmacy/history', label: 'Dispensing History', icon: History, section: 'Prescriptions' },
  { href: '/dashboard/pharmacy/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

export default function PharmacyProfilePage() {
  const { profile, loading, signOut } = useRequireAuth('pharmacy')

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Pharmacy Profile &amp; License" subtitle="Registered Drug Store Node" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content max-w-2xl mx-auto space-y-6">
          <div className="card space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-2xl">
                <Building className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">LifeCare Pharmacy Chakan</h2>
                <p className="text-xs font-mono text-amber-700 font-bold">Drug License No: MH-PUN-2022-88319</p>
                <p className="text-xs text-gray-500">{profile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">Pharmacist In Charge</span>
                <p className="text-sm font-semibold text-gray-800">Vijay Deshmukh (B.Pharm)</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">Location Node</span>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-amber-600" /> Chakan Bazaar, Khed Taluka</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-bold text-gray-900 text-sm">Monthly Fulfillment Stats</h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-amber-50 rounded-xl">
                  <p className="text-xs text-gray-500">Prescriptions Verified</p>
                  <p className="text-xl font-bold text-amber-700">184</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <p className="text-xs text-gray-500">Fulfillment Accuracy</p>
                  <p className="text-xl font-bold text-amber-700">100%</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
