'use client'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Users, Shield, Building2, UserCheck,
  BarChart3, ScrollText, Settings, User, Plus, CheckCircle2,
  Edit2, Trash2, X
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

interface Provider {
  id: string
  name: string
  role: string
  facility: string
  regNo: string
  status: string
}

export default function AdminProvidersPage() {
  const { profile, loading, signOut } = useRequireAuth('admin')
  const [providers, setProviders] = useState<Provider[]>([
    { id: '1', name: 'Dr. Rajesh Sharma', role: 'Medical Officer (MBBS, MD)', facility: 'Khed PHC', regNo: 'MCI-2015-88412', status: 'Verified' },
    { id: '2', name: 'Dr. Sunita Deshmukh', role: 'Pediatrician (MD)', facility: 'Chakan CHC', regNo: 'MCI-2018-99321', status: 'Verified' },
    { id: '3', name: 'Meena Patil', role: 'ASHA Health Worker Supervisor', facility: 'Khed PHC', regNo: 'NHM-HW-4412', status: 'Verified' },
    { id: '4', name: 'Suresh More', role: 'Health Inspector', facility: 'Manchar SDH', regNo: 'NHM-HI-1290', status: 'Verified' },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [roleTitle, setRoleTitle] = useState('Medical Officer (MBBS)')
  const [facility, setFacility] = useState('Khed PHC')
  const [regNo, setRegNo] = useState('')

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  function handleOpenAdd() {
    setEditingProvider(null)
    setName('')
    setRoleTitle('Medical Officer (MBBS)')
    setFacility('Khed PHC')
    setRegNo(`MCI-2026-${Math.floor(10000 + Math.random() * 90000)}`)
    setShowModal(true)
  }

  function handleOpenEdit(p: Provider) {
    setEditingProvider(p)
    setName(p.name)
    setRoleTitle(p.role)
    setFacility(p.facility)
    setRegNo(p.regNo)
    setShowModal(true)
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to remove this provider?')) {
      setProviders(prev => prev.filter(p => p.id !== id))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingProvider) {
      setProviders(prev => prev.map(p => p.id === editingProvider.id ? {
        ...p,
        name,
        role: roleTitle,
        facility,
        regNo
      } : p))
    } else {
      const newP: Provider = {
        id: Date.now().toString(),
        name,
        role: roleTitle,
        facility,
        regNo,
        status: 'Verified'
      }
      setProviders(prev => [newP, ...prev])
    }
    setShowModal(false)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Provider Management" subtitle="Doctors, Specialists &amp; Field Staff Credentials" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Verified Healthcare Providers</h3>
              <p className="text-xs text-gray-500">Medical staff registered under District Health Officer (DHO) portal</p>
            </div>
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Add Healthcare Provider
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Provider Name</th>
                    <th>Specialization / Role</th>
                    <th>Facility Assignment</th>
                    <th>License / Reg No.</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((p) => (
                    <tr key={p.id}>
                      <td className="font-semibold text-gray-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">
                          <User className="w-4 h-4" />
                        </div>
                        {p.name}
                      </td>
                      <td className="text-xs text-gray-700">{p.role}</td>
                      <td className="text-xs font-semibold text-gray-800">{p.facility}</td>
                      <td className="font-mono text-xs text-blue-700">{p.regNo}</td>
                      <td>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {p.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenEdit(p)} className="p-1 text-gray-400 hover:text-blue-600 rounded">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1 text-gray-400 hover:text-rose-600 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ADD / EDIT PROVIDER MODAL */}
          {showModal && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="card max-w-lg w-full space-y-5 bg-white shadow-2xl rounded-2xl p-6">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-lg text-gray-900">
                    {editingProvider ? 'Edit Provider Credentials' : 'Add New Healthcare Provider'}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="form-group">
                    <label className="label">Full Name &amp; Title</label>
                    <input className="input" placeholder="e.g. Dr. Anaya Kulkarni" value={name} onChange={e => setName(e.target.value)} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="label">Specialization / Role</label>
                      <input className="input" placeholder="e.g. Pediatrician (MD)" value={roleTitle} onChange={e => setRoleTitle(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="label">Facility Assignment</label>
                      <input className="input" placeholder="e.g. Khed PHC" value={facility} onChange={e => setFacility(e.target.value)} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Medical Council / Registration Number</label>
                    <input className="input font-mono uppercase" value={regNo} onChange={e => setRegNo(e.target.value)} required />
                  </div>

                  <div className="pt-3 flex gap-3 justify-end">
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingProvider ? 'Save Changes' : 'Register Provider'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
