'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Users, Shield, Building2, UserCheck,
  BarChart3, ScrollText, Settings, MapPin, Phone, Plus, CheckCircle2,
  Edit2, Trash2, X, Loader2, AlertTriangle
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

interface Facility {
  id: string
  name: string
  type: string
  village: string | null
  taluka: string | null
  district: string
  phone: string | null
  email: string | null
  is_active: boolean
}

export default function AdminFacilitiesPage() {
  const { profile, loading, signOut } = useRequireAuth('admin')
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [type, setType] = useState('primary_health_centre')
  const [village, setVillage] = useState('')
  const [taluka, setTaluka] = useState('Khed')
  const [district, setDistrict] = useState('Pune')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    loadFacilities()

    const supabase = createClient()
    const channel = supabase.channel('admin-facilities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'facilities' }, loadFacilities)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function loadFacilities() {
    setLoadingData(true)
    const supabase = createClient()
    const { data } = await supabase.from('facilities').select('*').order('name')
    setFacilities(data || [])
    setLoadingData(false)
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  const TYPE_LABELS: Record<string, string> = {
    primary_health_centre: 'PHC',
    community_health_centre: 'CHC',
    district_hospital: 'District Hospital',
    sub_district_hospital: 'Sub-District Hospital',
    sub_centre: 'Sub-Centre',
    pharmacy: 'Pharmacy',
    diagnostic_lab: 'Diagnostic Lab',
    other: 'Other',
  }

  function handleOpenAdd() {
    setEditingFacility(null)
    setName(''); setType('primary_health_centre'); setVillage(''); setTaluka('Khed')
    setDistrict('Pune'); setPhone(''); setEmail('')
    setFormError(null)
    setShowModal(true)
  }

  function handleOpenEdit(f: Facility) {
    setEditingFacility(f)
    setName(f.name); setType(f.type); setVillage(f.village || ''); setTaluka(f.taluka || 'Khed')
    setDistrict(f.district); setPhone(f.phone || ''); setEmail(f.email || '')
    setFormError(null)
    setShowModal(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to remove this facility? This action cannot be undone.')) return
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('facilities').delete().eq('id', id)
    if (error) alert(`Delete failed: ${error.message}`)
    setDeletingId(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)

    const supabase = createClient()
    const payload = {
      name, type,
      village: village || null,
      taluka: taluka || null,
      district,
      phone: phone || null,
      email: email || null,
    }

    if (editingFacility) {
      const { error } = await supabase.from('facilities').update(payload).eq('id', editingFacility.id)
      if (error) { setFormError(error.message); setSubmitting(false); return }
    } else {
      const { error } = await supabase.from('facilities').insert(payload)
      if (error) { setFormError(error.message); setSubmitting(false); return }
    }

    setShowModal(false)
    setSubmitting(false)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Facility Management" subtitle="Healthcare Centers & Network Nodes" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Registered Network Facilities</h3>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                {loadingData ? 'Loading...' : `${facilities.length} facilities · Live synced with Supabase`}
              </p>
            </div>
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Add Facility
            </button>
          </div>

          {loadingData ? (
            <div className="card flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-200" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {facilities.map((f) => (
                <div key={f.id} className="card space-y-3 relative group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <span className="badge bg-blue-100 text-blue-800 font-bold mb-1">
                        {TYPE_LABELS[f.type] || f.type}
                      </span>
                      <h4 className="font-bold text-gray-900 text-base">{f.name}</h4>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {f.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <button onClick={() => handleOpenEdit(f)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        disabled={deletingId === f.id}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Delete"
                      >
                        {deletingId === f.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      {[f.village, f.taluka ? `${f.taluka} Taluka` : null, f.district].filter(Boolean).join(', ')}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      {f.phone || 'No phone on record'}
                    </p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-400 font-mono">{f.id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ADD / EDIT FACILITY MODAL */}
          {showModal && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="card max-w-lg w-full space-y-5 bg-white shadow-2xl rounded-2xl p-6">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-lg text-gray-900">
                    {editingFacility ? 'Edit Facility Details' : 'Add New Healthcare Facility'}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {formError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="form-group">
                    <label className="label">Facility Name</label>
                    <input className="input" placeholder="e.g. Shirur Primary Health Centre" value={name} onChange={e => setName(e.target.value)} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="label">Facility Type</label>
                      <select className="input" value={type} onChange={e => setType(e.target.value)}>
                        <option value="primary_health_centre">PHC (Primary Health Centre)</option>
                        <option value="community_health_centre">CHC (Community Health Centre)</option>
                        <option value="sub_district_hospital">Sub-District Hospital</option>
                        <option value="district_hospital">District Hospital</option>
                        <option value="sub_centre">Sub-Centre</option>
                        <option value="pharmacy">Pharmacy</option>
                        <option value="diagnostic_lab">Diagnostic Lab</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label">Village / Town</label>
                      <input className="input" placeholder="e.g. Khed" value={village} onChange={e => setVillage(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="label">Taluka</label>
                      <input className="input" value={taluka} onChange={e => setTaluka(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="label">District</label>
                      <input className="input" value={district} onChange={e => setDistrict(e.target.value)} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="label">Contact Phone</label>
                      <input className="input" placeholder="+91 2135 XXXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="label">Email (optional)</label>
                      <input className="input" type="email" placeholder="facility@sehat.in" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>

                  <div className="pt-3 flex gap-3 justify-end">
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" disabled={submitting} className="btn btn-primary">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingFacility ? 'Save Changes' : 'Create Facility'}
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
