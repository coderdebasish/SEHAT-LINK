'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Users, Calendar, FileSpreadsheet, BedDouble, Settings, Plus, CheckCircle2
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard/facility', label: 'Facility Overview', icon: LayoutDashboard },
  { href: '/dashboard/facility/queue', label: 'OPD Queue Manager', icon: Users, section: 'Operations' },
  { href: '/dashboard/facility/appointments', label: 'Appointments', icon: Calendar, section: 'Operations' },
  { href: '/dashboard/facility/labs', label: 'Lab Diagnostics', icon: FileSpreadsheet, section: 'Operations' },
  { href: '/dashboard/facility/beds', label: 'Bed Management', icon: BedDouble, section: 'Operations' },
  { href: '/dashboard/facility/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

export default function FacilityLabsPage() {
  const { profile, loading, signOut } = useRequireAuth('facility_staff')

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  const LABS = [
    { patient: 'Priya Ramesh Patil', id: 'SL-MH-2026-000001', test: 'Complete Blood Count (CBC)', date: '01 Sep 2026', status: 'Completed', result: 'Hb: 12.4 g/dL · Normal' },
    { patient: 'Sunita Vishnu Pawar', id: 'SL-MH-2026-000004', test: 'Urine Routine & Protein', date: '02 Sep 2026', status: 'Completed', result: 'Trace Protein Present' },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Lab Diagnostic Reports" subtitle="PHC &amp; CHC Pathology Reports" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Diagnostic Test Orders</h3>
              <p className="text-xs text-gray-500">Pathology tests requested by facility doctors</p>
            </div>
            <button onClick={() => alert('Upload New Lab Report')} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Upload Lab Report
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Report Date</th>
                    <th>Patient Name</th>
                    <th>SEHAT Health ID</th>
                    <th>Test Name</th>
                    <th>Clinical Result Summary</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {LABS.map((l, i) => (
                    <tr key={i}>
                      <td className="text-xs text-gray-500">{l.date}</td>
                      <td className="font-semibold text-gray-900">{l.patient}</td>
                      <td className="font-mono text-xs text-blue-700 font-bold">{l.id}</td>
                      <td className="text-xs text-gray-700 font-medium">{l.test}</td>
                      <td className="text-xs font-mono text-gray-800">{l.result}</td>
                      <td>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {l.status}
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
