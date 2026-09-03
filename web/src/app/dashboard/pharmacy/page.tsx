'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Search, FileText, CheckCircle,
  Clock, XCircle, History, Settings
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard/pharmacy', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/pharmacy/verify', label: 'Verify Prescription', icon: Search, section: 'Prescriptions' },
  { href: '/dashboard/pharmacy/active', label: 'Active Prescriptions', icon: FileText, section: 'Prescriptions' },
  { href: '/dashboard/pharmacy/history', label: 'Dispensing History', icon: History, section: 'Prescriptions' },
  { href: '/dashboard/pharmacy/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

export default function PharmacyDashboard() {
  const { profile, loading, signOut } = useRequireAuth('pharmacy')
  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  return (
    <DashboardShell
      profile={profile}
      navItems={NAV_ITEMS}
      onSignOut={signOut}
      title="Pharmacy Dashboard"
      subtitle="Prescription Fulfilment"
    >
      <PharmacyOverview />
    </DashboardShell>
  )
}

function PharmacyOverview() {
  const [searchValue, setSearchValue] = useState('')
  const [searched, setSearched] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchValue.trim()) setSearched(true)
  }

  return (
    <div className="space-y-6">
      {/* Primary workflow: SEHAT ID lookup */}
      <div className="card border-amber-100" style={{ background: 'linear-gradient(135deg, hsl(38,80%,13%) 0%, hsl(30,70%,20%) 100%)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
            <Search className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <p className="text-white font-semibold">Prescription Lookup</p>
            <p className="text-amber-300/70 text-xs">Enter patient&apos;s SEHAT Health ID</p>
          </div>
        </div>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            className="input flex-1 bg-white/10 border-white/20 text-white placeholder-white/40 font-mono focus:bg-white/15"
            placeholder="SL-MH-2026-XXXXXX"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            style={{ color: '#fff' }}
          />
          <button type="submit" className="btn flex-shrink-0" style={{ background: 'hsl(38,90%,50%)', color: '#000', fontWeight: 600 }}>
            Look Up
          </button>
        </form>

        {/* Demo result */}
        {searched && searchValue === 'SL-MH-2026-000001' && (
          <div className="mt-4 bg-white/10 rounded-xl p-4 border border-white/15">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-white font-semibold">Priya Ramesh Patil</p>
                <p className="text-amber-300/70 text-xs font-mono">SL-MH-2026-000001 · F, 31 yrs</p>
              </div>
              <span className="badge bg-green-500/20 text-green-300 border border-green-500/30">Active Prescription</span>
            </div>
            <div className="space-y-2">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Prescription — Dr. Sharma · 2 days ago</p>
              {[
                { med: 'Amoxicillin 500mg', freq: 'Twice daily', dur: '5 days', status: 'available' },
                { med: 'Paracetamol 650mg', freq: 'As needed', dur: '3 days', status: 'available' },
                { med: 'Vitamin D3 60K IU', freq: 'Once weekly', dur: '4 weeks', status: 'not_available' },
              ].map(item => (
                <div key={item.med} className="flex items-center gap-3 bg-white/8 rounded-lg p-3">
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{item.med}</p>
                    <p className="text-white/50 text-xs">{item.freq} · {item.dur}</p>
                  </div>
                  <select
                    className="text-xs rounded-lg px-2 py-1.5 border-0 font-medium cursor-pointer"
                    defaultValue={item.status}
                    style={{
                      background: item.status === 'available' ? 'hsl(142,60%,85%)' : 'hsl(0,60%,85%)',
                      color: item.status === 'available' ? 'hsl(142,60%,25%)' : 'hsl(0,60%,30%)',
                    }}
                  >
                    <option value="available">Available</option>
                    <option value="dispensed">Dispensed</option>
                    <option value="partially_dispensed">Partial</option>
                    <option value="not_available">Not Available</option>
                  </select>
                </div>
              ))}
            </div>
            <button className="btn w-full mt-4" style={{ background: 'hsl(38,90%,50%)', color: '#000', fontWeight: 600 }}>
              <CheckCircle className="w-4 h-4" /> Confirm Dispensing
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'New Today', value: '14', icon: FileText, color: 'bg-amber-50 text-amber-600' },
          { label: 'Pending Dispense', value: '5', icon: Clock, color: 'bg-blue-50 text-blue-600' },
          { label: 'Dispensed Today', value: '9', icon: CheckCircle, color: 'bg-green-50 text-green-600' },
          { label: 'Not Available', value: '2', icon: XCircle, color: 'bg-red-50 text-red-600' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className={cn('stat-icon', stat.color)}><stat.icon className="w-5 h-5" /></div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Dispensing */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Dispensing</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>SEHAT ID</th>
                <th>Patient</th>
                <th>Medicines</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'SL-MH-2026-000007', name: 'Amit Rokade', meds: 3, doctor: 'Dr. Sharma', status: 'dispensed', time: '09:15 AM' },
                { id: 'SL-MH-2026-000008', name: 'Lakshmi Rao', meds: 2, doctor: 'Dr. Patel', status: 'partially_dispensed', time: '10:00 AM' },
                { id: 'SL-MH-2026-000009', name: 'Kiran Shinde', meds: 4, doctor: 'Dr. Sharma', status: 'dispensed', time: '11:30 AM' },
              ].map(row => (
                <tr key={row.id}>
                  <td className="font-mono text-xs text-blue-700">{row.id}</td>
                  <td className="font-medium">{row.name}</td>
                  <td>{row.meds} items</td>
                  <td className="text-gray-500">{row.doctor}</td>
                  <td>
                    <span className={cn('badge', {
                      'bg-green-100 text-green-700': row.status === 'dispensed',
                      'bg-yellow-100 text-yellow-700': row.status === 'partially_dispensed',
                    })}>
                      {row.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-gray-400 text-xs">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
