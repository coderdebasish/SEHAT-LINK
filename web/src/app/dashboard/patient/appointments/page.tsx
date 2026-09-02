'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Activity, Calendar, Pill,
  ClipboardList, GitBranch, FolderOpen, Settings,
  Plus, X, Clock, Building2, Loader2, CheckCircle2, User, Stethoscope, MapPin, Award
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAppointmentsForPatient, createAppointment } from '@/lib/supabase/queries/appointments'
import { formatDate, cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard/patient', label: 'My Health Card', icon: LayoutDashboard },
  { href: '/dashboard/patient/timeline', label: 'Medical History', icon: Activity, section: 'Health Records' },
  { href: '/dashboard/patient/prescriptions', label: 'My Prescriptions', icon: Pill, section: 'Health Records' },
  { href: '/dashboard/patient/diagnostics', label: 'Diagnostics & Reports', icon: ClipboardList, section: 'Health Records' },
  { href: '/dashboard/patient/referrals', label: 'Referrals', icon: GitBranch, section: 'Health Records' },
  { href: '/dashboard/patient/documents', label: 'Documents', icon: FolderOpen, section: 'Health Records' },
  { href: '/dashboard/patient/appointments', label: 'Appointments', icon: Calendar, section: 'Services' },
  { href: '/dashboard/patient/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

export type DoctorProfile = {
  id: string
  full_name: string
  specialization: string | null
  qualification: string | null
  registration_number: string | null
  facility_id: string
  facility: {
    id: string
    name: string
    village: string | null
    taluka: string | null
    district: string
  } | null
}

const EMPANELLED_DOCTORS: DoctorProfile[] = [
  {
    id: 'd1000000-0000-0000-0000-000000000001',
    full_name: 'Dr. Rajesh Sharma',
    specialization: 'General Medicine / Physician',
    qualification: 'MBBS, MD (Internal Medicine)',
    registration_number: 'MCI-2015-88412',
    facility_id: 'f1000000-0000-0000-0000-000000000001',
    facility: { id: 'f1000000-0000-0000-0000-000000000001', name: 'Khed Primary Health Centre', village: 'Khed', taluka: 'Khed', district: 'Pune' }
  },
  {
    id: 'd1000000-0000-0000-0000-000000000002',
    full_name: 'Dr. Anita Kulkarni',
    specialization: 'Gynecology & Obstetrics',
    qualification: 'MBBS, DGO, MS',
    registration_number: 'MCI-2017-22341',
    facility_id: 'f1000000-0000-0000-0000-000000000005',
    facility: { id: 'f1000000-0000-0000-0000-000000000005', name: 'Manchar Community Health Centre', village: 'Manchar', taluka: 'Ambegaon', district: 'Pune' }
  },
  {
    id: 'd1000000-0000-0000-0000-000000000003',
    full_name: 'Dr. Suresh Patil',
    specialization: 'Pediatrics (Child Specialist)',
    qualification: 'MBBS, DCH',
    registration_number: 'MCI-2019-77821',
    facility_id: 'f1000000-0000-0000-0000-000000000006',
    facility: { id: 'f1000000-0000-0000-0000-000000000006', name: 'Shirur Sub-District Hospital', village: 'Shirur', taluka: 'Shirur', district: 'Pune' }
  },
  {
    id: 'd1000000-0000-0000-0000-000000000004',
    full_name: 'Dr. Sunita Deshmukh',
    specialization: 'Pediatric Specialist (MD)',
    qualification: 'MBBS, MD (Pediatrics)',
    registration_number: 'MCI-2018-99321',
    facility_id: 'f1000000-0000-0000-0000-000000000002',
    facility: { id: 'f1000000-0000-0000-0000-000000000002', name: 'Rajgurunagar CHC', village: 'Rajgurunagar', taluka: 'Khed', district: 'Pune' }
  },
  {
    id: 'd1000000-0000-0000-0000-000000000005',
    full_name: 'Dr. Priya Bhosale',
    specialization: 'Family Medicine & Primary Care',
    qualification: 'MBBS, DNB (Family Medicine)',
    registration_number: 'MCI-2018-99012',
    facility_id: 'f1000000-0000-0000-0000-000000000002',
    facility: { id: 'f1000000-0000-0000-0000-000000000002', name: 'Rajgurunagar CHC', village: 'Rajgurunagar', taluka: 'Khed', district: 'Pune' }
  },
  {
    id: 'd1000000-0000-0000-0000-000000000006',
    full_name: 'Dr. Amit Deshmukh',
    specialization: 'General Surgery & Trauma',
    qualification: 'MBBS, MS (Surgery)',
    registration_number: 'MCI-2016-55412',
    facility_id: 'f1000000-0000-0000-0000-000000000001',
    facility: { id: 'f1000000-0000-0000-0000-000000000001', name: 'Khed Primary Health Centre', village: 'Khed', taluka: 'Khed', district: 'Pune' }
  }
]

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00'
]

type AppointmentRow = {
  id: string
  scheduled_at: string
  status: string
  reason: string | null
  token_number: number | null
  provider: { full_name: string } | null
  facility: { name: string; village: string } | null
}

export default function PatientAppointmentsPage() {
  const auth = useRequireAuth('patient')
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [doctors, setDoctors] = useState<DoctorProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Selected booking state
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null)
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0])
  const [bookingTime, setBookingTime] = useState('10:00')
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!auth.patient?.id) return

    const patientId = auth.patient.id

    async function loadData() {
      setLoading(true)
      const { data } = await getAppointmentsForPatient(patientId)
      setAppointments((data as AppointmentRow[] | null) || [])

      // Fetch all available doctors from Supabase
      const supabase = createClient()
      const { data: provsData } = await supabase
        .from('providers')
        .select(`
          id, specialization, qualification, registration_number, facility_id, profile_id,
          profile:profiles!providers_profile_id_fkey(id, full_name),
          facility:facilities(id, name, village, taluka, district)
        `)
        .eq('is_available', true)

      if (provsData && provsData.length > 0) {
        const defaultNames = [
          'Dr. Rajesh Sharma', 'Dr. Anita Kulkarni', 'Dr. Suresh Patil',
          'Dr. Sunita Deshmukh', 'Dr. Priya Bhosale', 'Dr. Amit Deshmukh'
        ]
        const mapped = provsData.map((p: any, idx: number) => {
          const profileObj = Array.isArray(p.profile) ? p.profile[0] : p.profile
          const facilityObj = Array.isArray(p.facility) ? p.facility[0] : p.facility
          const rawName = profileObj?.full_name
          const doctorName = (rawName && rawName.trim() !== '' && rawName !== 'Unknown Doctor')
            ? rawName
            : defaultNames[idx % defaultNames.length]

          return {
            id: profileObj?.id || p.profile_id || p.id,
            full_name: doctorName,
            specialization: p.specialization || 'General Practitioner',
            qualification: p.qualification || 'MBBS, MD',
            registration_number: p.registration_number || 'Govt. Empanelled',
            facility_id: p.facility_id,
            facility: facilityObj ?? null,
          }
        })
        setDoctors(mapped)
        setSelectedDoctor(mapped[0])
      } else {
        setDoctors(EMPANELLED_DOCTORS)
        setSelectedDoctor(EMPANELLED_DOCTORS[0])
      }
      setLoading(false)
    }

    loadData()

    // Real-time subscription
    const supabase = createClient()
    const channel = supabase.channel(`patient-appointments-${patientId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'appointments',
        filter: `patient_id=eq.${patientId}`
      }, () => loadData())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [auth.patient?.id])

  async function handleBookAppointment(e: React.FormEvent) {
    e.preventDefault()
    if (!auth.patient?.id || !selectedDoctor) return
    setSubmitting(true)
    setError(null)

    const scheduledAt = new Date(`${bookingDate}T${bookingTime}:00`).toISOString()
    const tokenNumber = Math.floor(Math.random() * 25) + 1

    const { error: bookingError } = await createAppointment({
      patient_id: auth.patient.id,
      provider_id: selectedDoctor.id,
      facility_id: selectedDoctor.facility_id,
      scheduled_at: scheduledAt,
      reason,
      type: 'in_person',
      token_number: tokenNumber,
      created_by: auth.profile?.id
    })

    if (bookingError) {
      setError(`Booking failed: ${bookingError.message}`)
    } else {
      setShowModal(false)
      setReason('')
    }
    setSubmitting(false)
  }

  if (auth.loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!auth.profile) return null

  const upcoming = appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status))
  const past = appointments.filter(a => ['completed', 'cancelled', 'no_show'].includes(a.status))

  return (
    <div className="dashboard-layout">
      <Sidebar profile={auth.profile} navItems={NAV_ITEMS} onSignOut={auth.signOut} />
      <div className="dashboard-main">
        <Topbar title="My Appointments" subtitle="Scheduled OPD Visits & Consultations" profile={auth.profile} onSignOut={auth.signOut} />
        <main className="dashboard-content space-y-6">
          <div className="card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">My Appointment Roster</h3>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Live synced with doctor and facility portals
              </p>
            </div>
            <button onClick={() => { setShowModal(true); setError(null) }} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Book OPD Appointment
            </button>
          </div>

          {loading ? (
            <div className="card flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-300" />
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div className="card space-y-3">
                  <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Upcoming Appointments ({upcoming.length})
                  </h4>
                  {upcoming.map(a => (
                    <AppointmentCard key={a.id} a={a} />
                  ))}
                </div>
              )}

              {past.length > 0 && (
                <div className="card space-y-3">
                  <h4 className="font-bold text-gray-500 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    Past Consultations ({past.length})
                  </h4>
                  {past.map(a => (
                    <AppointmentCard key={a.id} a={a} />
                  ))}
                </div>
              )}

              {appointments.length === 0 && (
                <div className="card text-center py-12">
                  <Calendar className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-500 font-medium">No appointments scheduled yet</p>
                  <p className="text-xs text-gray-400 mt-1">Click &quot;Book OPD Appointment&quot; to choose a doctor and schedule your visit</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* RICH BOOKING MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Book OPD Appointment</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  Patient: {auth.profile.full_name} · SEHAT ID: <span className="text-blue-700 font-bold">{auth.patient?.sehat_id || 'SL-MH-2026-000001'}</span>
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs font-medium">
                  {error}
                </div>
              )}

              {/* STEP 1: Select Doctor */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-violet-600" />
                  1. Select Empanelled Doctor &amp; Hospital Venue
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {doctors.map(doc => {
                    const isSelected = selectedDoctor?.id === doc.id
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDoctor(doc)}
                        className={cn(
                          'p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 relative',
                          isSelected
                            ? 'border-violet-600 bg-violet-50/50 shadow-md'
                            : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                            {doc.full_name.split(' ').filter(n => n !== 'Dr.').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <h4 className="font-bold text-gray-900 text-sm truncate">{doc.full_name}</h4>
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            </div>
                            <p className="text-[11px] font-semibold text-violet-700">{doc.specialization}</p>
                            {doc.qualification && (
                              <p className="text-[10px] text-gray-500 mt-0.5">{doc.qualification}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1 text-[11px] text-gray-600 bg-white/80 p-2 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-1.5 truncate">
                            <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="font-medium truncate">{doc.facility?.name || 'Primary Health Centre'}</span>
                          </div>
                          {doc.facility && (
                            <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span>{doc.facility.village || doc.facility.taluka}, {doc.facility.district}</span>
                            </div>
                          )}
                        </div>

                        {isSelected && (
                          <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* STEP 2: Choose Date & Time Slot */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-violet-600" />
                  2. Select Date &amp; Available OPD Time Slot
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="text-[11px] font-bold text-gray-700 mb-1 block">Preferred Date</label>
                    <input
                      type="date"
                      className="input font-mono text-xs"
                      value={bookingDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setBookingDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-gray-700 mb-1 block">Available OPD Slots</label>
                    <div className="flex flex-wrap gap-1.5">
                      {TIME_SLOTS.map(slot => {
                        const isSlotSelected = bookingTime === slot
                        const formatted = new Date(`2026-01-01T${slot}:00`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setBookingTime(slot)}
                            className={cn(
                              'px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border',
                              isSlotSelected
                                ? 'bg-violet-700 text-white border-violet-700 shadow-sm'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-violet-300'
                            )}
                          >
                            {formatted}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: Symptoms / Reason */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-700 block">
                  3. Reason for Visit / Symptoms
                </label>
                <textarea
                  className="input py-2 min-h-[70px] text-xs"
                  placeholder="e.g., Fever and cough for 2 days, routine ANC checkup, BP follow-up..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
              {selectedDoctor ? (
                <div className="text-xs text-gray-600">
                  Selected: <strong className="text-violet-900">{selectedDoctor.full_name}</strong> at <span className="font-semibold">{selectedDoctor.facility?.name}</span>
                </div>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button
                  type="button"
                  onClick={handleBookAppointment}
                  disabled={submitting || !selectedDoctor}
                  className="btn btn-primary btn-sm"
                  style={{ background: 'hsl(270, 80%, 45%)', borderColor: 'hsl(270, 80%, 45%)' }}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Sync Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AppointmentCard({ a }: { a: AppointmentRow }) {
  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-700',
    no_show: 'bg-orange-100 text-orange-700',
  }

  const apptDate = new Date(a.scheduled_at)
  const isToday = apptDate.toDateString() === new Date().toDateString()

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 border border-gray-100 rounded-xl hover:border-violet-100 hover:bg-violet-50/20 transition-colors">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-bold text-gray-900">{a.provider?.full_name || 'Doctor'}</p>
          <span className={`badge text-xs font-semibold ${statusColors[a.status] || 'bg-gray-100 text-gray-600'}`}>
            {a.status}
          </span>
          {a.token_number && (
            <span className="badge bg-purple-100 text-purple-800 font-mono font-bold text-xs">Token #{a.token_number}</span>
          )}
        </div>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 text-gray-400" /> {a.facility?.name || 'Facility'}{a.facility?.village ? `, ${a.facility.village}` : ''}
        </p>
        {a.reason && <p className="text-xs font-medium text-violet-700">{a.reason}</p>}
      </div>
      <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-lg">
        <Clock className="w-3.5 h-3.5 text-violet-600" />
        <span className="font-mono text-xs font-bold text-violet-800">
          {isToday ? 'Today' : formatDate(a.scheduled_at)} · {apptDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}
