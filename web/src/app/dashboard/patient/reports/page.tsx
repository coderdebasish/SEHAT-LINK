'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, History, FileText, Calendar, FileCheck, User, Download, Eye
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard/patient', label: 'My Health Card', icon: LayoutDashboard },
  { href: '/dashboard/patient/timeline', label: 'Medical History', icon: History, section: 'Health Records' },
  { href: '/dashboard/patient/prescriptions', label: 'My Prescriptions', icon: FileText, section: 'Health Records' },
  { href: '/dashboard/patient/appointments', label: 'Appointments', icon: Calendar, section: 'Services' },
  { href: '/dashboard/patient/reports', label: 'Lab Reports', icon: FileCheck, section: 'Services' },
  { href: '/dashboard/patient/profile', label: 'Profile Settings', icon: User, section: 'Account' },
]

export default function PatientReportsPage() {
  const { profile, loading, signOut } = useRequireAuth('patient')

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  const REPORTS = [
    { name: 'Complete Blood Count (CBC)', facility: 'Khed PHC Lab', date: '01 Sep 2026', doctor: 'Dr. Rajesh Sharma', summary: 'Hb: 12.4 g/dL · WBC: 6,800 /uL' },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="My Diagnostic Lab Reports" subtitle="Digital Pathology &amp; Test Results" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content space-y-6">
          <div className="space-y-4">
            {REPORTS.map((r, i) => (
              <div key={i} className="card flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-900 text-base">{r.name}</h4>
                  <p className="text-xs text-gray-600">{r.facility} · Ordered by {r.doctor}</p>
                  <p className="text-xs font-mono text-emerald-700 font-bold mt-1">{r.summary}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => alert(`Viewing PDF for ${r.name}`)} className="btn btn-secondary btn-sm">
                    <Eye className="w-3.5 h-3.5" /> View PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
