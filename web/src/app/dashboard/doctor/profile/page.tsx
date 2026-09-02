'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Search, Upload, FileText, Share2, Settings, User, Building, Award
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard/doctor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/doctor/patients', label: 'Patient Records', icon: Search, section: 'Clinical Work' },
  { href: '/dashboard/doctor/prescriptions/upload', label: 'Upload Prescription', icon: Upload, section: 'Clinical Work' },
  { href: '/dashboard/doctor/consultations', label: 'Consultation Notes', icon: FileText, section: 'Clinical Work' },
  { href: '/dashboard/doctor/referrals', label: 'Referrals & Labs', icon: Share2, section: 'Clinical Work' },
  { href: '/dashboard/doctor/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

export default function DoctorProfilePage() {
  const { profile, loading, signOut } = useRequireAuth('doctor')

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Doctor Profile &amp; Credentials" subtitle="Medical Practitioner Registration" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content max-w-2xl mx-auto space-y-6">
          <div className="card space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-800 flex items-center justify-center font-bold text-2xl">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{profile.full_name || 'Dr. Rajesh Sharma'}</h2>
                <p className="text-xs font-mono text-violet-700 font-bold">Medical Officer (MBBS, MD General Medicine)</p>
                <p className="text-xs text-gray-500">{profile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">Medical Registration No</span>
                <p className="text-sm font-mono font-bold text-blue-700 flex items-center gap-1.5"><Award className="w-4 h-4 text-violet-600" /> MCI-2015-88412</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">Facility Posting</span>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><Building className="w-4 h-4 text-violet-600" /> Khed Primary Health Centre</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-bold text-gray-900 text-sm">Consultation Activity Stats</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-violet-50 rounded-xl">
                  <p className="text-xs text-gray-500">Consultations</p>
                  <p className="text-xl font-bold text-violet-700">128</p>
                </div>
                <div className="p-3 bg-violet-50 rounded-xl">
                  <p className="text-xs text-gray-500">Uploaded Rx</p>
                  <p className="text-xl font-bold text-violet-700">94</p>
                </div>
                <div className="p-3 bg-violet-50 rounded-xl">
                  <p className="text-xs text-gray-500">Referrals</p>
                  <p className="text-xl font-bold text-violet-700">16</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
