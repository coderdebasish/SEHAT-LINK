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

export default function RegisterPatientPage() {
  const auth = useRequireAuth('health_worker')
  const { profile, loading, signOut } = auth
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('female')
  const [bloodGroup, setBloodGroup] = useState('unknown')
  const [phone, setPhone] = useState('')
  const [village, setVillage] = useState('')
  const [taluka, setTaluka] = useState('Khed')
  const [addressLine1, setAddressLine1] = useState('')
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [generatedId, setGeneratedId] = useState<string | null>(null)
  const [registerError, setRegisterError] = useState<string | null>(null)

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!profile) return null

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setRegisterError(null)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('patients')
        .insert({
          full_name: fullName,
          dob: dob || null,
          gender,
          blood_group: bloodGroup,
          phone: phone || null,
          address_line1: addressLine1 || null,
          village: village || null,
          taluka: taluka || null,
          district: 'Pune',
          state: 'Maharashtra',
          emergency_name: emergencyName || null,
          emergency_phone: emergencyPhone || null,
          registered_by: profile?.id,
          primary_facility_id: profile?.facility_id || null,
        })
        .select('sehat_id, full_name')
        .single()

      if (!error && data) {
        setGeneratedId(data.sehat_id)
      } else {
        setRegisterError(error?.message || 'Registration failed. Please check the form and try again.')
      }
    } catch (err) {
      setRegisterError('Unexpected error. Please try again.')
      console.error(err)
    }
    setSubmitting(false)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar profile={profile} navItems={NAV_ITEMS} onSignOut={signOut} />
      <div className="dashboard-main">
        <Topbar title="Register New Patient" subtitle="Community Health Enrollment" profile={profile} onSignOut={signOut} />
        <main className="dashboard-content max-w-2xl mx-auto space-y-6">
          {generatedId ? (
            <div className="card text-center py-8 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Patient Enrolled Successfully!</h2>
              <p className="text-sm text-gray-500">Generated SEHAT Health ID:</p>
              <div className="text-2xl font-bold font-mono text-blue-700 bg-blue-50 py-3 px-6 rounded-xl border border-blue-100 inline-block">
                {generatedId}
              </div>
              <div className="pt-4 flex gap-3 justify-center">
                <button onClick={() => { setGeneratedId(null); setFullName('') }} className="btn btn-primary btn-sm">
                  Register Another Patient
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="card space-y-5">
              <h2 className="font-bold text-gray-900 text-lg">Patient Registration Form</h2>

              <div className="form-group">
                <label className="label">Full Name (English / Marathi)</label>
                <input className="input" placeholder="e.g. Priya Ramesh Patil" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Date of Birth</label>
                  <input className="input" type="date" value={dob} onChange={e => setDob(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">Gender</label>
                  <select className="input" value={gender} onChange={e => setGender(e.target.value)}>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Blood Group</label>
                  <select className="input" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Mobile Number</label>
                  <input className="input font-mono" placeholder="10-digit number" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Village / Basti</label>
                  <input className="input" value={village} onChange={e => setVillage(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">Taluka</label>
                  <input className="input" value={taluka} onChange={e => setTaluka(e.target.value)} required />
                </div>
              </div>

              <button type="submit" disabled={submitting || !fullName} className="btn btn-primary w-full">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Register & Issue SEHAT ID'}
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  )
}
