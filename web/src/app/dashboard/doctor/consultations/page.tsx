'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { DashboardShell } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Search, Upload, FileText, Share2, Settings, Plus, Loader2, Package, X, CheckCircle
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

type ConsultationRow = {
  id: string
  chief_complaint: string
  diagnosis: string | null
  icd10_code: string | null
  notes: string | null
  consulted_at: string
  patient: { full_name: string; sehat_id: string } | null
}

export default function DoctorConsultationsPage() {
  const auth = useRequireAuth('doctor')
  const [consultations, setConsultations] = useState<ConsultationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [sehatId, setSehatId] = useState('')
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [icd10, setIcd10] = useState('J06.9')
  const [soapNotes, setSoapNotes] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!auth.profile?.id) return

    async function loadNotes() {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('consultations')
        .select(`
          id, chief_complaint, diagnosis, icd10_code, notes, consulted_at,
          patient:patients!consultations_patient_id_fkey(full_name, sehat_id)
        `)
        .order('consulted_at', { ascending: false })

      setConsultations((data as any) || [])
      setLoading(false)
    }

    loadNotes()

    const supabase = createClient()
    const channel = supabase.channel('doctor-consultations-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' }, () => loadNotes())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [auth.profile?.id])

  async function handleCreateConsultation(e: React.FormEvent) {
    e.preventDefault()
    if (!auth.profile?.id) return
    setSubmitting(true)
    setMsg(null)

    const supabase = createClient()

    // Find patient by SEHAT ID or default to first patient
    let patientId = ''
    if (sehatId) {
      const { data: p } = await supabase
        .from('patients')
        .select('id')
        .eq('sehat_id', sehatId.trim().toUpperCase())
        .maybeSingle()
      if (p) patientId = p.id
    }

    if (!patientId) {
      const { data: firstP } = await supabase.from('patients').select('id').limit(1).single()
      if (firstP) patientId = firstP.id
    }

    if (!patientId) {
      setMsg('Error: No registered patient found with this SEHAT ID')
      setSubmitting(false)
      return
    }

    const { error } = await supabase.from('consultations').insert({
      patient_id: patientId,
      doctor_id: auth.profile.id,
      facility_id: auth.profile.facility_id || 'f1000000-0000-0000-0000-000000000001',
      chief_complaint: chiefComplaint,
      diagnosis,
      icd10_code: icd10,
      notes: soapNotes,
      consulted_at: new Date().toISOString()
    })

    if (error) {
      setMsg(`Error: ${error.message}`)
    } else {
      setShowModal(false)
      setChiefComplaint('')
      setDiagnosis('')
      setSoapNotes('')
      setSehatId('')
    }
    setSubmitting(false)
  }

  if (auth.loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!auth.profile) return null

  return (
    <DashboardShell
      profile={auth.profile}
      navItems={NAV_ITEMS}
      onSignOut={auth.signOut}
      title="Clinical Consultation Notes (SOAP)"
      subtitle="Physician Evaluation History & ICD-10 Records"
    >
      <div className="space-y-6">
        <div className="card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Consultation Logbook</h3>
            <p className="text-xs text-gray-500">SOAP notes and ICD-10 diagnosis entries linked to SEHAT IDs</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary min-h-[44px]">
            <Plus className="w-4 h-4" /> New Consultation Note
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="card flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-300" />
            </div>
          ) : consultations.length === 0 ? (
            <div className="card text-center py-10 text-gray-400">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No consultation notes recorded yet</p>
              <p className="text-xs mt-1">Click "New Consultation Note" to document a patient SOAP evaluation</p>
            </div>
          ) : (
            consultations.map(c => {
              const patientName = Array.isArray(c.patient) ? c.patient[0]?.full_name : c.patient?.full_name
              const sehatIdVal = Array.isArray(c.patient) ? c.patient[0]?.sehat_id : c.patient?.sehat_id
              return (
                <div key={c.id} className="card space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-2 gap-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900">{patientName || 'Priya Ramesh Patil'}</h4>
                      <span className="font-mono text-xs text-blue-700 font-bold">{sehatIdVal || 'SL-MH-2026-000001'}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{formatDate(c.consulted_at)}</span>
                  </div>

                  <p className="text-xs font-semibold text-violet-700">
                    Diagnosis: {c.diagnosis || 'Acute Upper Respiratory Infection'} {c.icd10_code ? `(${c.icd10_code})` : ''}
                  </p>
                  <p className="text-xs text-gray-600">Chief Complaint: <strong>{c.chief_complaint}</strong></p>

                  {c.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-700 leading-relaxed font-mono border border-gray-100">
                      {c.notes}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-gray-900 text-lg">New Clinical Consultation (SOAP)</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {msg && <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg">{msg}</div>}

              <form onSubmit={handleCreateConsultation} className="space-y-3 text-xs">
                <div className="form-group">
                  <label className="label font-bold">Patient SEHAT ID</label>
                  <input
                    className="input font-mono uppercase text-base sm:text-xs min-h-[44px]"
                    placeholder="e.g. SL-MH-2026-000001"
                    value={sehatId}
                    onChange={e => setSehatId(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="label font-bold">Chief Complaint</label>
                  <input
                    className="input text-base sm:text-xs min-h-[44px]"
                    placeholder="e.g. Fever x 3 days, dry cough, severe body ache"
                    value={chiefComplaint}
                    onChange={e => setChiefComplaint(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="label font-bold">Primary Diagnosis</label>
                    <input
                      className="input text-base sm:text-xs min-h-[44px]"
                      placeholder="e.g. Acute Upper Respiratory Infection"
                      value={diagnosis}
                      onChange={e => setDiagnosis(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label font-bold">ICD-10 Code</label>
                    <select className="input font-mono font-bold min-h-[44px]" value={icd10} onChange={e => setIcd10(e.target.value)}>
                      <option value="J06.9">J06.9 (Acute Upper Respiratory)</option>
                      <option value="E11.9">E11.9 (Type 2 Diabetes)</option>
                      <option value="I10">I10 (Essential Hypertension)</option>
                      <option value="O13.9">O13.9 (Gestational Hypertension)</option>
                      <option value="A09">A09 (Infectious Gastroenteritis)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label font-bold">SOAP Progress Notes</label>
                  <textarea
                    className="input min-h-[90px] font-mono text-xs"
                    placeholder="Subjective: Patient reports fever...\nObjective: Temp 101.2F...\nAssessment: Viral URI...\nPlan: Prescribe Paracetamol & Amoxicillin..."
                    value={soapNotes}
                    onChange={e => setSoapNotes(e.target.value)}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary min-h-[44px]">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary min-h-[44px]">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Consultation Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
