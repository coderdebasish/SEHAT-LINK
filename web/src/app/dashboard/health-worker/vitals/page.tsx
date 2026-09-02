'use client'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Search, UserPlus, Activity, AlertTriangle,
  Settings, CheckCircle2, Loader2
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard/health-worker', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/health-worker/patients', label: 'Patient Directory', icon: Search, section: 'Field Actions' },
  { href: '/dashboard/health-worker/register', label: 'Register Patient', icon: UserPlus, section: 'Field Actions' },
  { href: '/dashboard/health-worker/vitals', label: 'Record Vitals', icon: Activity, section: 'Field Actions' },
  { href: '/dashboard/health-worker/high-risk', label: 'High Risk List', icon: AlertTriangle, section: 'Monitoring' },
  { href: '/dashboard/health-worker/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

export default function RecordVitalsPage() {
  const { profile, loading, signOut } = useRequireAuth('health_worker')
  const [sehatId, setSehatId] = useState('SL-MH-2026-000001')
  const [systolic, setSystolic] = useState('120')
  const [diastolic, setDiastolic] = useState('80')
  const [pulse, setPulse] = useState('72')
  const [spo2, setSpo2] = useState('98')
  const [temp, setTemp] = useState('98.6')
  const [sugar, setSugar] = useState('105')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const supabase = createClient()
      // Query patient id by SEHAT ID
      const { data: patient, error: patErr } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('sehat_id', sehatId.trim().toUpperCase())
        .single()

      if (patErr || !patient) {
        setError(`No patient found with SEHAT ID: ${sehatId}`)
        setSubmitting(false)
        return
      }

      // Insert vitals with correct column names from schema
      const { error: vitalsError } = await supabase.from('vitals').insert({
        patient_id: patient.id,
        recorded_by: profile?.id,
        blood_pressure_systolic: parseInt(systolic) || null,
        blood_pressure_diastolic: parseInt(diastolic) || null,
        pulse_rate: parseInt(pulse) || null,
        spo2: parseInt(spo2) || null,
        temperature: parseFloat(temp) || null,
        blood_sugar: parseInt(sugar) || null,
        notes: notes || null,
      })

      if (vitalsError) {
        setError(`Failed to save vitals: ${vitalsError.message}`)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Unexpected error. Please try again.')
      console.error(err)
    }
    setSubmitting(false)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Record Vitals" subtitle="Community Health Field Assessment" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content max-w-2xl mx-auto space-y-6">
          {success ? (
            <div className="card text-center py-8 space-y-4">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Vitals Recorded Successfully!</h2>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                The health vitals have been linked to SEHAT ID <span className="font-mono text-blue-700 font-bold">{sehatId}</span> and will sync to the doctor&apos;s dashboard.
              </p>
              <button onClick={() => setSuccess(false)} className="btn btn-primary btn-sm">
                Record Another Patient
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card space-y-5">
              <h2 className="font-bold text-gray-900 text-lg">Field Assessment Form</h2>

              <div className="form-group">
                <label className="label">Patient SEHAT Health ID</label>
                <input
                  className="input font-mono font-bold text-blue-700"
                  value={sehatId}
                  onChange={e => setSehatId(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">BP Systolic (mmHg)</label>
                  <input className="input" type="number" value={systolic} onChange={e => setSystolic(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">BP Diastolic (mmHg)</label>
                  <input className="input" type="number" value={diastolic} onChange={e => setDiastolic(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Pulse Rate (bpm)</label>
                  <input className="input" type="number" value={pulse} onChange={e => setPulse(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">SpO2 (%)</label>
                  <input className="input" type="number" value={spo2} onChange={e => setSpo2(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Body Temp (°F)</label>
                  <input className="input" type="number" step="0.1" value={temp} onChange={e => setTemp(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">Blood Sugar (mg/dL)</label>
                  <input className="input" type="number" value={sugar} onChange={e => setSugar(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Field Notes / Symptoms</label>
                <textarea className="input resize-none" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Patient complaints, symptoms..." />
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Vitals Record'}
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  )
}
