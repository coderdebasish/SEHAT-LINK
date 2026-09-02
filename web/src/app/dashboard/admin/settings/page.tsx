'use client'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Users, Shield, Building2, UserCheck,
  BarChart3, ScrollText, Settings, Save, CheckCircle2
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard/admin', label: 'System Overview', icon: LayoutDashboard },
  { href: '/dashboard/admin/users', label: 'User Management', icon: Users, section: 'Management' },
  { href: '/dashboard/admin/roles', label: 'Role & Permissions', icon: Shield, section: 'Management' },
  { href: '/dashboard/admin/facilities', label: 'Facility Management', icon: Building2, section: 'Management' },
  { href: '/dashboard/admin/providers', label: 'Provider Management', icon: UserCheck, section: 'Management' },
  { href: '/dashboard/admin/analytics', label: 'Analytics & Reports', icon: BarChart3, section: 'Insights' },
  { href: '/dashboard/admin/audit-logs', label: 'Audit Logs', icon: ScrollText, section: 'Insights' },
  { href: '/dashboard/admin/settings', label: 'System Settings', icon: Settings, section: 'System' },
]

export default function AdminSettingsPage() {
  const { profile, loading, signOut } = useRequireAuth('admin')
  const [saved, setSaved] = useState(false)

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="System Settings" subtitle="Platform Parameters &amp; Configurations" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content max-w-2xl mx-auto space-y-6">
          {saved && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> Platform configuration saved successfully!
            </div>
          )}

          <form onSubmit={e => { e.preventDefault(); setSaved(true) }} className="card space-y-5">
            <h3 className="font-bold text-gray-900 text-base">SEHAT Health ID Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Default State Code</label>
                <input className="input font-mono uppercase" defaultValue="MH" />
              </div>
              <div className="form-group">
                <label className="label">ID Prefix</label>
                <input className="input font-mono uppercase" defaultValue="SL" />
              </div>
            </div>

            <h3 className="font-bold text-gray-900 text-base pt-2">Prescription Storage Policy</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Max Upload Size (MB)</label>
                <input className="input font-mono" defaultValue="5" type="number" />
              </div>
              <div className="form-group">
                <label className="label">Allowed Formats</label>
                <input className="input font-mono" defaultValue="JPG, PNG, PDF" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              <Save className="w-4 h-4" /> Save System Settings
            </button>
          </form>
        </main>
      </div>
    </div>
  )
}
