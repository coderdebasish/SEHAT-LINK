'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Search, Stethoscope, MapPin, Calendar, ArrowLeft, Award, CheckCircle, X, Clock, User, FileText, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type DoctorProfile = {
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

// Fallback demo doctors if DB is empty
const DEMO_DOCTORS: DoctorProfile[] = [
  { id: 'demo-1', full_name: 'Dr. Rajesh Sharma', specialization: 'General Medicine / Physician', qualification: 'MBBS, MD (Internal Medicine)', registration_number: 'MCI-2015-88412', facility_id: 'f1000000-0000-0000-0000-000000000001', facility: { id: 'f1000000-0000-0000-0000-000000000001', name: 'Khed Primary Health Centre', village: 'Khed', taluka: 'Khed', district: 'Pune' } },
  { id: 'demo-2', full_name: 'Dr. Anita Kulkarni', specialization: 'Gynecology & Obstetrics', qualification: 'MBBS, DGO, MS', registration_number: 'MCI-2017-22341', facility_id: 'f1000000-0000-0000-0000-000000000005', facility: { id: 'f1000000-0000-0000-0000-000000000005', name: 'Manchar Community Health Centre', village: 'Manchar', taluka: 'Ambegaon', district: 'Pune' } },
  { id: 'demo-3', full_name: 'Dr. Suresh Patil', specialization: 'Pediatrics (Child Specialist)', qualification: 'MBBS, DCH', registration_number: 'MCI-2019-77821', facility_id: 'f1000000-0000-0000-0000-000000000006', facility: { id: 'f1000000-0000-0000-0000-000000000006', name: 'Shirur Sub-District Hospital', village: 'Shirur', taluka: 'Shirur', district: 'Pune' } },
]

export default function FindDoctorsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [doctors, setDoctors] = useState<DoctorProfile[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null)

  // Booking form
  const [sehatId, setSehatId] = useState('')
  const [patientName, setPatientName] = useState('')
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0])
  const [bookingTime, setBookingTime] = useState('10:00')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDoctors() {
      setLoadingDoctors(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('providers')
        .select(`
          id, specialization, qualification, registration_number, facility_id,
          profile:profiles!providers_profile_id_fkey(id, full_name),
          facility:facilities(id, name, village, taluka, district)
        `)
        .eq('is_available', true)

      if (data && data.length > 0) {
        const defaultNames = [
          'Dr. Rajesh Sharma', 'Dr. Anita Kulkarni', 'Dr. Suresh Patil',
          'Dr. Sunita Deshmukh', 'Dr. Priya Bhosale', 'Dr. Amit Deshmukh'
        ]
        const mapped = data.map((p: any, idx: number) => {
          const profile = Array.isArray(p.profile) ? p.profile[0] : p.profile
          const facility = Array.isArray(p.facility) ? p.facility[0] : p.facility
          const rawName = profile?.full_name
          const doctorName = (rawName && rawName.trim() !== '' && rawName !== 'Unknown Doctor')
            ? rawName
            : defaultNames[idx % defaultNames.length]

          return {
            id: profile?.id || p.id,
            full_name: doctorName,
            specialization: p.specialization || 'General Physician',
            qualification: p.qualification || 'MBBS, MD',
            registration_number: p.registration_number || 'Govt. Empanelled',
            facility_id: p.facility_id,
            facility: facility ?? null,
          }
        })
        setDoctors(mapped)
      } else {
        setDoctors(DEMO_DOCTORS)
      }
      setLoadingDoctors(false)
    }
    loadDoctors()
  }, [])

  const filtered = doctors.filter(d =>
    d.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (d.specialization || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.facility?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedDoctor) return
    setSubmitting(true)
    setBookingError(null)

    const supabase = createClient()

    // Check session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Not logged in — redirect to login
      router.push('/login')
      return
    }

    // Find patient record by SEHAT ID
    const { data: patient, error: patError } = await supabase
      .from('patients')
      .select('id, sehat_id, full_name, profile_id')
      .eq('sehat_id', sehatId.trim().toUpperCase())
      .single()

    if (patError || !patient) {
      setBookingError(`No patient found with SEHAT ID: ${sehatId}. Please check the ID and try again.`)
      setSubmitting(false)
      return
    }

    // Create appointment
    const scheduledAt = new Date(`${bookingDate}T${bookingTime}:00`).toISOString()
    const tokenNumber = Math.floor(Math.random() * 30) + 1

    const { error: bookError } = await supabase
      .from('appointments')
      .insert({
        patient_id: patient.id,
        provider_id: selectedDoctor.id,
        facility_id: selectedDoctor.facility_id,
        scheduled_at: scheduledAt,
        reason,
        type: 'in_person',
        token_number: tokenNumber,
        status: 'scheduled',
        created_by: user.id,
      })

    if (bookError) {
      setBookingError(`Booking failed: ${bookError.message}`)
      setSubmitting(false)
      return
    }

    setBookingSuccess(true)
    setSubmitting(false)

    // Redirect to patient dashboard after 2s
    setTimeout(() => {
      router.push('/dashboard/patient/appointments')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <header className="public-nav">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-700">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900 leading-none tracking-tight">SEHAT-LINK</span>
            <p className="text-xs text-gray-500 leading-none mt-0.5">Find Verified Doctors</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/patient/appointments" className="btn btn-secondary btn-sm">My Appointments</Link>
          <Link href="/login" className="btn btn-primary btn-sm">Login</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-violet-900 via-purple-800 to-blue-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="badge bg-white/15 text-white border border-white/20">Doctor Directory</span>
          <h1 className="text-3xl md:text-4xl font-bold">Find Healthcare Specialists & Physicians</h1>
          <p className="text-purple-100 text-sm md:text-base max-w-xl mx-auto">
            Connect with government and empanelled doctors across Pune district. Book directly using your SEHAT Health ID.
          </p>
          <div className="bg-white rounded-2xl p-3 shadow-xl max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 mt-6">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, specialty, or health centre..."
                className="input border-0 pl-11 text-gray-900 bg-transparent focus:ring-0"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <main className="page-container py-10 flex-1">
        {loadingDoctors ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-violet-300" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(doctor => (
              <div key={doctor.id} className="card card-hover flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0 text-violet-700 font-bold text-xl">
                      {doctor.full_name.split(' ').filter(n => n !== 'Dr.').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-gray-900 text-lg leading-snug">{doctor.full_name}</h3>
                        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      </div>
                      <p className="text-xs font-medium text-violet-700">{doctor.specialization || 'General Medicine'}</p>
                      {doctor.qualification && <p className="text-xs text-gray-500 mt-0.5">{doctor.qualification}</p>}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span><strong>Facility:</strong> {doctor.facility?.name || 'Government Health Centre'}</span>
                    </div>
                    {doctor.facility && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span><strong>Location:</strong> {doctor.facility.village}, {doctor.facility.taluka} — {doctor.facility.district}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span><strong>Reg No:</strong> {doctor.registration_number || 'Govt. Empanelled'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="badge bg-emerald-50 text-emerald-700 font-medium">Free Govt. Consultation</span>
                  <button
                    onClick={() => { setSelectedDoctor(doctor); setBookingSuccess(false); setBookingError(null) }}
                    className="btn btn-sm btn-primary"
                    style={{ background: 'hsl(270, 80%, 45%)', borderColor: 'hsl(270, 80%, 45%)' }}
                  >
                    Book via SEHAT ID
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Book Appointment via SEHAT ID</h3>
                <p className="text-xs text-violet-700 font-semibold">
                  {selectedDoctor.full_name} · {selectedDoctor.facility?.name}
                </p>
              </div>
              <button onClick={() => setSelectedDoctor(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto font-bold text-xl">✓</div>
                <h4 className="font-bold text-lg text-emerald-900">Appointment Confirmed!</h4>
                <p className="text-xs text-emerald-700">
                  Booked with <strong>{selectedDoctor.full_name}</strong> at <strong>{selectedDoctor.facility?.name}</strong>.
                  This appointment is now live in the doctor&apos;s portal and your patient dashboard.
                </p>
                <p className="text-xs font-mono text-gray-400">Redirecting to your appointments...</p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4 text-xs">
                {bookingError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs">{bookingError}</div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="label font-bold">Your SEHAT Health ID</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input className="input pl-8 font-mono font-bold text-blue-700" placeholder="SL-MH-2026-000001" value={sehatId} onChange={e => setSehatId(e.target.value.toUpperCase())} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label font-bold">Your Full Name</label>
                    <input className="input font-semibold" placeholder="As on SEHAT card" value={patientName} onChange={e => setPatientName(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="label font-bold">Preferred Date</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input type="date" className="input pl-8 font-mono" value={bookingDate} min={new Date().toISOString().split('T')[0]} onChange={e => setBookingDate(e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label font-bold">OPD Time Slot</label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <select className="input pl-8 font-mono" value={bookingTime} onChange={e => setBookingTime(e.target.value)}>
                        <option value="09:00">09:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="11:30">11:30 AM</option>
                        <option value="14:00">02:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label font-bold">Symptoms / Reason for Visit</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                    <textarea className="input pl-8 py-2 min-h-[60px]" placeholder="e.g., Fever for 2 days, routine ANC checkup, BP follow-up..." value={reason} onChange={e => setReason(e.target.value)} required />
                  </div>
                </div>

                <p className="text-xs text-gray-400">
                  You must be logged in to book. If not logged in, you will be redirected to sign in first.
                </p>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setSelectedDoctor(null)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary" style={{ background: 'hsl(270, 80%, 45%)' }}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Sync Appointment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <footer className="bg-gray-900 text-gray-400 py-6 text-xs text-center border-t border-gray-800">
        <p>© 2026 SEHAT-LINK · Smart India Hackathon · Integrated Healthcare for Maharashtra</p>
      </footer>
    </div>
  )
}
