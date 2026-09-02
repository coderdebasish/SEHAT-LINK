'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Search, UserPlus, Activity, AlertTriangle,
  MapPin, Phone, Calendar, ArrowRight, Settings
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/dashboard/health-worker', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/health-worker/patients', label: 'Patient Directory', icon: Search, section: 'Field Actions' },
  { href: '/dashboard/health-worker/register', label: 'Register Patient', icon: UserPlus, section: 'Field Actions' },
  { href: '/dashboard/health-worker/vitals', label: 'Record Vitals', icon: Activity, section: 'Field Actions' },
  { href: '/dashboard/health-worker/high-risk', label: 'High Risk List', icon: AlertTriangle, section: 'Monitoring' },
  { href: '/dashboard/health-worker/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

export default function HealthWorkerPatientsPage() {
  const { profile, loading, signOut } = useRequireAuth('health_worker')
  const [search, setSearch] = useState('')

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  const PATIENTS = [
    { id: 'SL-MH-2026-000001', name: 'Priya Ramesh Patil', gender: 'F', age: 28, village: 'Nimgaon', phone: '9822011223', risk: 'normal', lastVisit: '2 days ago' },
    { id: 'SL-MH-2026-000002', name: 'Sunita Vijay Jadhav', gender: 'F', age: 34, village: 'Khed Town', phone: '9822144556', risk: 'high', lastVisit: '1 day ago' },
    { id: 'SL-MH-2026-000003', name: 'Ramesh Balu Bhosale', gender: 'M', age: 52, village: 'Rajgurunagar', phone: '9822377889', risk: 'medium', lastVisit: '5 days ago' },
    { id: 'SL-MH-2026-000004', name: 'Anandi Gopal Deshmukh', gender: 'F', age: 65, village: 'Chakan', phone: '9822599000', risk: 'critical', lastVisit: 'Today' },
  ]

  const filtered = PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.village.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Patient Directory" subtitle="Assigned Village Roster" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className="input pl-9"
                placeholder="Search patient name, SEHAT ID, or village..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Link href="/dashboard/health-worker/register" className="btn btn-primary">
              <UserPlus className="w-4 h-4" /> Register New Patient
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(p => (
              <div key={p.id} className="card card-hover space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{p.name}</h3>
                    <p className="font-mono text-xs text-blue-700 font-bold">{p.id}</p>
                  </div>
                  <span className={`badge ${
                    p.risk === 'critical' ? 'bg-red-100 text-red-700' :
                    p.risk === 'high' ? 'bg-amber-100 text-amber-700' :
                    p.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {p.risk.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{p.village}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{p.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{p.gender}, {p.age} yrs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-gray-400" />
                    <span>Visited {p.lastVisit}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link href="/dashboard/health-worker/vitals" className="btn btn-sm btn-secondary text-xs">
                    Record Vitals <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
