'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Search, FileText, History, Settings, CheckCircle2
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard/pharmacy', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/pharmacy/verify', label: 'Verify Prescription', icon: Search, section: 'Prescriptions' },
  { href: '/dashboard/pharmacy/active', label: 'Active Prescriptions', icon: FileText, section: 'Prescriptions' },
  { href: '/dashboard/pharmacy/history', label: 'Dispensing History', icon: History, section: 'Prescriptions' },
  { href: '/dashboard/pharmacy/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

export default function PharmacyHistoryPage() {
  const { profile, loading, signOut } = useRequireAuth('pharmacy')

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  const HISTORY = [
    { patient: 'Priya Ramesh Patil', id: 'SL-MH-2026-000001', rxId: 'Rx-2026-0830-01', date: '30 Aug 2026', items: 'Amoxicillin 500mg (15 Caps), Paracetamol 650mg (10 Tabs)', status: 'Dispensed' },
    { patient: 'Shantaram Tukaram Shinde', id: 'SL-MH-2026-000005', rxId: 'Rx-2026-0828-02', date: '28 Aug 2026', items: 'Metformin 500mg (30 Tabs)', status: 'Dispensed' },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Dispensing Audit History" subtitle="Completed Pharmacy Medicine Logs" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card overflow-hidden">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Dispensed Date</th>
                    <th>Patient Name</th>
                    <th>SEHAT Health ID</th>
                    <th>Items Supplied</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {HISTORY.map((h, i) => (
                    <tr key={i}>
                      <td className="text-xs text-gray-500">{h.date}</td>
                      <td className="font-semibold text-gray-900">{h.patient}</td>
                      <td className="font-mono text-xs text-blue-700 font-bold">{h.id}</td>
                      <td className="text-xs text-gray-700">{h.items}</td>
                      <td>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {h.status}
                        </span>
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
