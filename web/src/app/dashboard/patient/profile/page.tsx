'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, History, FileText, Calendar, FileCheck, User, QrCode, Shield
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard/patient', label: 'My Health Card', icon: LayoutDashboard },
  { href: '/dashboard/patient/timeline', label: 'Medical History', icon: History, section: 'Health Records' },
  { href: '/dashboard/patient/prescriptions', label: 'My Prescriptions', icon: FileText, section: 'Health Records' },
  { href: '/dashboard/patient/appointments', label: 'Appointments', icon: Calendar, section: 'Services' },
  { href: '/dashboard/patient/reports', label: 'Lab Reports', icon: FileCheck, section: 'Services' },
  { href: '/dashboard/patient/profile', label: 'Profile Settings', icon: User, section: 'Account' },
]

export default function PatientProfilePage() {
  const { profile, loading, signOut } = useRequireAuth('patient')

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Patient Profile &amp; SEHAT ID Card" subtitle="Personal Health Identity Details" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content max-w-2xl mx-auto space-y-6">
          <div className="card space-y-6 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-blue-300 font-bold">Government of Maharashtra · Health Dept</span>
                <h2 className="text-2xl font-black mt-1">SEHAT HEALTH CARD</h2>
              </div>
              <Shield className="w-8 h-8 text-blue-400" />
            </div>

            <div className="py-4 border-y border-slate-700/50 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-gray-400 font-mono">PATIENT SEHAT ID</p>
                <p className="text-2xl font-mono font-extrabold text-blue-400 tracking-wider">SL-MH-2026-000001</p>
              </div>
              <div className="w-14 h-14 bg-white p-1 rounded-lg flex items-center justify-center">
                <QrCode className="w-12 h-12 text-slate-900" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400">Full Name</p>
                <p className="font-bold text-white text-sm">{profile.full_name || 'Priya Ramesh Patil'}</p>
              </div>
              <div>
                <p className="text-gray-400">Gender / Age</p>
                <p className="font-bold text-white text-sm">Female / 28 Yrs</p>
              </div>
              <div>
                <p className="text-gray-400">Registered Village</p>
                <p className="font-bold text-white text-sm">Nimgaon, Khed Taluka</p>
              </div>
              <div>
                <p className="text-gray-400">Linked Phone</p>
                <p className="font-bold text-white text-sm">+91 98221 00101</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
