'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Users, Shield, Building2, UserCheck,
  BarChart3, ScrollText, Settings, Search, Plus, CheckCircle2,
  Edit2, Trash2, X, Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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

type ProfileRow = {
  id: string
  full_name: string
  email: string | null
  role: string
  phone: string | null
  created_at: string
}

export default function AdminUsersPage() {
  const auth = useRequireAuth('admin')
  const [users, setUsers] = useState<ProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!auth.profile?.id) return

    async function loadUsers() {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, phone, created_at')
        .order('created_at', { ascending: false })

      setUsers(data || [])
      setLoading(false)
    }

    loadUsers()

    const supabase = createClient()
    const channel = supabase.channel('admin-profiles-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => loadUsers())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [auth.profile?.id])

  if (auth.loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!auth.profile) return null

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="dashboard-layout">
      <Sidebar profile={auth.profile} navItems={NAV_ITEMS} onSignOut={auth.signOut} />
      <div className="dashboard-main">
        <Topbar title="User Management" subtitle="Registered Accounts &amp; Role Assignments" profile={auth.profile} onSignOut={auth.signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className="input pl-9"
                placeholder="Search user name, email, or role..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="badge bg-purple-100 text-purple-800 font-semibold">{users.length} Active System Profiles</span>
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email / Contact</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="font-semibold text-gray-900">{u.full_name}</td>
                        <td className="font-mono text-xs text-gray-500">{u.email || u.phone || '—'}</td>
                        <td>
                          <span className={`badge ${
                            u.role === 'doctor' ? 'bg-violet-100 text-violet-700' :
                            u.role === 'health_worker' ? 'bg-emerald-100 text-emerald-700' :
                            u.role === 'pharmacy' ? 'bg-amber-100 text-amber-700' :
                            u.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                            'bg-blue-100 text-blue-700'
                          } font-bold text-xs`}>
                            {u.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active Profile
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
