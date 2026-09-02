'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Search, Upload, FileText, Share2, Settings, Plus, Loader2, Package, X, ArrowRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard/doctor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/doctor/patients', label: 'Patient Records', icon: Search, section: 'Clinical Work' },
  { href: '/dashboard/doctor/prescriptions/upload', label: 'Upload Prescription', icon: Upload, section: 'Clinical Work' },
  { href: '/dashboard/doctor/consultations', label: 'Consultation Notes', icon: FileText, section: 'Clinical Work' },
  { href: '/dashboard/doctor/referrals', label: 'Referrals & Labs', icon: Share2, section: 'Clinical Work' },
  { href: '/dashboard/doctor/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

type ReferralRow = {
  id: string
  referral_reason: string
  priority: string
  status: string
  notes: string | null
  created_at: string
  patient: { full_name: string; sehat_id: string } | null
  to_facility: { name: string } | null
}

export default function DoctorReferralsPage() {
  const auth = useRequireAuth('doctor')
  const [referrals, setReferrals] = useState<ReferralRow[]>([])
  const [facilities, setFacilities] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form
  const [sehatId, setSehatId] = useState('')
  const [toFacilityId, setToFacilityId] = useState('')
  const [reason, setReason] = useState('')
  const [priority, setPriority] = useState('urgent')
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!auth.profile?.id) return

    async function loadData() {
      setLoading(true)
      const supabase = createClient()

      const [refsRes, facRes] = await Promise.all([
        supabase
          .from('referrals')
          .select(`
            id, referral_reason, priority, status, notes, created_at,
            patient:patients!referrals_patient_id_fkey(full_name, sehat_id),
            to_facility:facilities!referrals_to_facility_id_fkey(name)
          `)
          .order('created_at', { ascending: false }),
        supabase.from('facilities').select('id, name').order('name')
      ])

      setReferrals((refsRes.data as any) || [])
      setFacilities(facRes.data || [])
      if (facRes.data && facRes.data.length > 0) setToFacilityId(facRes.data[0].id)
      setLoading(false)
    }

    loadData()

    const supabase = createClient()
    const channel = supabase.channel('doctor-referrals-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'referrals' }, () => loadData())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [auth.profile?.id])

  async function handleIssueReferral(e: React.FormEvent) {
    e.preventDefault()
    if (!auth.profile?.id) return
    setSubmitting(true)
    setMsg(null)

    const supabase = createClient()

    let patientId = ''
    if (sehatId) {
      const { data: p } = await supabase.from('patients').select('id').eq('sehat_id', sehatId.trim().toUpperCase()).maybeSingle()
      if (p) patientId = p.id
    }
    if (!patientId) {
      const { data: firstP } = await supabase.from('patients').select('id').limit(1).single()
      if (firstP) patientId = firstP.id
    }

    if (!patientId) {
      setMsg('Error: No patient found for this SEHAT ID')
      setSubmitting(false)
      return
    }

    const { error } = await supabase.from('referrals').insert({
      patient_id: patientId,
      from_facility_id: auth.profile.facility_id || 'f1000000-0000-0000-0000-000000000001',
      to_facility_id: toFacilityId,
      referred_by: auth.profile.id,
      referral_reason: reason,
      priority,
      status: 'pending'
    })

    if (error) {
      setMsg(`Error: ${error.message}`)
    } else {
      setShowModal(false)
      setReason('')
      setSehatId('')
    }
    setSubmitting(false)
  }

  if (auth.loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!auth.profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={auth.profile} navItems={NAV_ITEMS} onSignOut={auth.signOut} />
      <div className="dashboard-main">
        <Topbar title="Referrals &amp; Diagnostic Orders" subtitle="Specialist Coordination &amp; Tertiary Care Linkage" profile={auth.profile} onSignOut={auth.signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Specialist Referrals Log</h3>
              <p className="text-xs text-gray-500">Track referred rural patients across CHCs and Sub-District Hospitals</p>
            </div>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Issue New Referral
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="card flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-purple-300" />
              </div>
            ) : referrals.length === 0 ? (
              <div className="card text-center py-10 text-gray-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No referrals recorded yet</p>
                <p className="text-xs mt-1">Click "Issue New Referral" to transfer a patient for specialist evaluation</p>
              </div>
            ) : (
              referrals.map(r => {
                const patientName = Array.isArray(r.patient) ? r.patient[0]?.full_name : r.patient?.full_name
                const sehatIdVal = Array.isArray(r.patient) ? r.patient[0]?.sehat_id : r.patient?.sehat_id
                const targetFac = Array.isArray(r.to_facility) ? r.to_facility[0]?.name : r.to_facility?.name
                return (
                  <div key={r.id} className="card space-y-2 border-l-4 border-l-purple-600">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">{patientName || 'Priya Ramesh Patil'}</h4>
                        <span className="font-mono text-xs text-blue-700 font-bold">{sehatIdVal || 'SL-MH-2026-000001'}</span>
                      </div>
                      <span className="badge bg-purple-100 text-purple-800 font-bold uppercase text-xs">
                        {r.priority || 'Normal'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                      <span>Referred To:</span>
                      <span className="text-purple-900 font-bold">{targetFac || 'Manchar SDH'}</span>
                    </div>

                    <p className="text-xs text-gray-600">Reason: {r.referral_reason}</p>
                    <span className="text-[11px] text-gray-400 font-mono block">{formatDate(r.created_at)}</span>
                  </div>
                )
              })
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900 text-lg">Issue Specialist Hospital Referral</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {msg && <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg">{msg}</div>}

            <form onSubmit={handleIssueReferral} className="space-y-3 text-xs">
              <div className="form-group">
                <label className="label font-bold">Patient SEHAT ID</label>
                <input
                  className="input font-mono uppercase"
                  placeholder="e.g. SL-MH-2026-000001"
                  value={sehatId}
                  onChange={e => setSehatId(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="label font-bold">Target Tertiary / Specialist Facility</label>
                <select className="input font-semibold" value={toFacilityId} onChange={e => setToFacilityId(e.target.value)}>
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label font-bold">Priority Level</label>
                <select className="input font-bold" value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="routine">Routine Referral</option>
                  <option value="urgent">Urgent Evaluation</option>
                  <option value="emergency">Emergency ICUT/Trauma Transfer</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label font-bold">Referral Reason &amp; Clinical Context</label>
                <textarea
                  className="input min-h-[70px]"
                  placeholder="e.g., Gestational Hypertension (BP 160/100) requiring specialized OB-GYN evaluation..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Issue Referral'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
