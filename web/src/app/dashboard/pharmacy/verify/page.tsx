'use client'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Search, FileText, CheckCircle,
  History, Settings, Loader2, CheckCircle2, AlertTriangle, Package
} from 'lucide-react'
import { getAge } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard/pharmacy', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/pharmacy/verify', label: 'Verify Prescription', icon: Search, section: 'Prescriptions' },
  { href: '/dashboard/pharmacy/active', label: 'Active Prescriptions', icon: FileText, section: 'Prescriptions' },
  { href: '/dashboard/pharmacy/history', label: 'Dispensing History', icon: History, section: 'Prescriptions' },
  { href: '/dashboard/pharmacy/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

type PrescriptionRow = {
  id: string
  status: string
  type: string
  created_at: string
  notes: string | null
  valid_until: string | null
  doctor: { full_name: string } | null
  prescription_items: Array<{
    id: string
    medicine_name: string
    dosage: string | null
    frequency: string | null
    duration: string | null
    instructions: string | null
    quantity: number | null
  }>
  pharmacy_dispensing: Array<{ id: string; status: string; dispensed_at: string | null }> | null
}

type PatientResult = {
  id: string
  sehat_id: string
  full_name: string
  dob: string | null
  gender: string | null
  blood_group: string | null
  prescriptions: PrescriptionRow[]
}

export default function PharmacyVerifyPage() {
  const auth = useRequireAuth('pharmacy')
  const [sehatId, setSehatId] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<PatientResult | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [dispensingId, setDispensingId] = useState<string | null>(null)
  const [dispensed, setDispensed] = useState<Record<string, boolean>>({})
  const [dispensingNotes, setDispensingNotes] = useState('')

  const { profile, loading, signOut } = auth
  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    if (!sehatId.trim()) return
    setSearching(true)
    setResult(null)
    setNotFound(false)
    setDispensingId(null)

    const supabase = createClient()

    // 1. Find patient by SEHAT ID
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id, sehat_id, full_name, dob, gender, blood_group')
      .eq('sehat_id', sehatId.trim().toUpperCase())
      .single()

    if (patientError || !patient) {
      setNotFound(true)
      setSearching(false)
      return
    }

    // 2. Find active prescriptions for this patient
    const { data: prescriptions } = await supabase
      .from('prescriptions')
      .select(`
        id, status, type, created_at, notes, valid_until,
        doctor:profiles!prescriptions_doctor_id_fkey(full_name),
        prescription_items(id, medicine_name, dosage, frequency, duration, instructions, quantity),
        pharmacy_dispensing(id, status, dispensed_at)
      `)
      .eq('patient_id', patient.id)
      .in('status', ['active', 'partially_dispensed'])
      .order('created_at', { ascending: false })

    setResult({ ...patient, prescriptions: (prescriptions as PrescriptionRow[] | null) || [] })
    setSearching(false)
  }

  async function handleDispense(prescriptionId: string) {
    if (!profile?.facility_id) {
      alert('Your profile is not linked to a pharmacy facility. Please contact admin.')
      return
    }
    setDispensingId(prescriptionId)

    const supabase = createClient()

    // Insert dispensing record
    const { error: dispensingError } = await supabase
      .from('pharmacy_dispensing')
      .insert({
        prescription_id: prescriptionId,
        pharmacy_id: profile.facility_id,
        dispensed_by: profile.id,
        status: 'dispensed',
        notes: dispensingNotes || null,
        dispensed_at: new Date().toISOString(),
      })

    if (dispensingError) {
      alert(`Dispensing failed: ${dispensingError.message}`)
      setDispensingId(null)
      return
    }

    // Update prescription status to dispensed
    await supabase
      .from('prescriptions')
      .update({ status: 'dispensed' })
      .eq('id', prescriptionId)

    // Add notification for patient (if linked to profile)
    if (result?.id) {
      const { data: patientProfile } = await supabase
        .from('patients')
        .select('profile_id')
        .eq('id', result.id)
        .single()

      if (patientProfile?.profile_id) {
        await supabase.from('notifications').insert({
          user_id: patientProfile.profile_id,
          type: 'dispensing_update',
          title: 'Prescription Dispensed',
          body: `Your prescription has been dispensed at ${profile.full_name}'s pharmacy. All medications have been provided.`,
        })
      }
    }

    setDispensed(prev => ({ ...prev, [prescriptionId]: true }))
    setDispensingId(null)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Verify Prescription" subtitle="SEHAT ID Lookup & Dispensing" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content max-w-2xl mx-auto space-y-6">

          {/* Search */}
          <div className="card space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">Patient SEHAT Health ID Lookup</h2>
            <p className="text-xs text-gray-500">Patient presents their SEHAT Health ID card — enter or scan the ID below to retrieve active prescriptions</p>
            <form onSubmit={handleLookup} className="flex gap-3">
              <input
                className="input font-mono font-bold text-blue-700 flex-1 text-base"
                placeholder="SL-MH-2026-000001"
                value={sehatId}
                onChange={e => setSehatId(e.target.value.toUpperCase())}
                required
              />
              <button type="submit" disabled={searching} className="btn btn-primary flex-shrink-0">
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Look Up</>}
              </button>
            </form>
          </div>

          {/* Not found */}
          {notFound && (
            <div className="card border-red-100 bg-red-50 text-center py-8">
              <AlertTriangle className="w-8 h-8 mx-auto text-red-400 mb-2" />
              <p className="font-semibold text-red-800">Patient not found</p>
              <p className="text-xs text-red-600 mt-1">No patient found with SEHAT ID: <span className="font-mono font-bold">{sehatId}</span></p>
            </div>
          )}

          {/* Results */}
          {result && (
            <>
              {/* Patient info */}
              <div className="card border-t-4 border-t-amber-500">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-gray-900">{result.full_name}</h3>
                      <span className="badge bg-emerald-100 text-emerald-700 font-semibold">Verified</span>
                    </div>
                    <p className="font-mono text-sm font-bold text-blue-700">{result.sehat_id}</p>
                    <div className="flex gap-2 mt-2">
                      {result.dob && <span className="badge bg-gray-100 text-gray-700 text-xs">{getAge(result.dob)}</span>}
                      {result.gender && <span className="badge bg-gray-100 text-gray-700 text-xs capitalize">{result.gender}</span>}
                      {result.blood_group && result.blood_group !== 'unknown' && (
                        <span className="badge bg-red-50 text-red-700 text-xs">Blood: {result.blood_group}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prescriptions */}
              {result.prescriptions.length === 0 ? (
                <div className="card text-center py-8">
                  <Package className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                  <p className="text-gray-500 font-medium">No active prescriptions found</p>
                  <p className="text-xs text-gray-400 mt-1">This patient has no active or partially-dispensed prescriptions</p>
                </div>
              ) : (
                result.prescriptions.map(rx => (
                  <div key={rx.id} className="card space-y-4 border-t-4 border-t-amber-400">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="badge bg-amber-100 text-amber-800 font-semibold mb-1">Active Prescription</span>
                        <p className="text-xs text-gray-500 mt-1">Dr. {(rx.doctor as { full_name: string } | null)?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400 font-mono">
                          Issued: {new Date(rx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {rx.valid_until && ` · Valid until: ${new Date(rx.valid_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                        </p>
                      </div>
                      <span className="badge bg-blue-100 text-blue-800 text-xs uppercase">{rx.type}</span>
                    </div>

                    {dispensed[rx.id] ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                        <p className="font-bold text-emerald-900">Dispensing Confirmed & Recorded!</p>
                        <p className="text-xs text-emerald-700">The dispensing record has been saved to SEHAT audit logs. Patient has been notified.</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <h4 className="font-bold text-gray-900 text-sm">Prescribed Medicines ({rx.prescription_items.length} items)</h4>
                          {rx.prescription_items.map(item => (
                            <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-900">{item.medicine_name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {[item.dosage, item.frequency, item.duration].filter(Boolean).join(' · ')}
                                </p>
                                {item.instructions && (
                                  <p className="text-xs text-amber-700 mt-0.5 italic">{item.instructions}</p>
                                )}
                              </div>
                              {item.quantity && (
                                <span className="badge bg-blue-100 text-blue-800 font-bold ml-3 flex-shrink-0">Qty: {item.quantity}</span>
                              )}
                            </div>
                          ))}
                        </div>

                        {rx.notes && (
                          <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-800">
                            <strong>Doctor&apos;s Note:</strong> {rx.notes}
                          </div>
                        )}

                        <div className="form-group">
                          <label className="label text-xs font-bold">Dispensing Notes (optional)</label>
                          <input
                            className="input text-xs"
                            placeholder="e.g., Vitamin D not available, substituted with..."
                            value={dispensingNotes}
                            onChange={e => setDispensingNotes(e.target.value)}
                          />
                        </div>

                        {!profile.facility_id && (
                          <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg text-xs text-orange-800">
                            <strong>⚠ Warning:</strong> Your profile is not linked to a pharmacy facility. Contact admin to enable dispensing.
                          </div>
                        )}

                        <button
                          onClick={() => handleDispense(rx.id)}
                          disabled={dispensingId === rx.id || !profile.facility_id}
                          className="btn w-full font-bold"
                          style={{ background: 'hsl(38,90%,50%)', color: '#000' }}
                        >
                          {dispensingId === rx.id ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                          ) : (
                            <><CheckCircle className="w-4 h-4" /> Confirm Dispensing All Items</>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
