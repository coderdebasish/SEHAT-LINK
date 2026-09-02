export interface AppointmentItem {
  id: string
  patientName: string
  sehatId: string
  doctorName: string
  facilityName: string
  date: string
  time: string
  reason: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'canceled'
  token: string
}

const STORAGE_KEY = 'sehat_global_appointments_v1'

const DEFAULT_APPOINTMENTS: AppointmentItem[] = [
  {
    id: 'apt-1',
    patientName: 'Priya Ramesh Patil',
    sehatId: 'SL-MH-2026-000001',
    doctorName: 'Dr. Rajesh Sharma',
    facilityName: 'Khed Primary Health Centre',
    date: '2026-09-04',
    time: '10:00 AM',
    reason: 'Follow-up Checkup & Prescription Review',
    status: 'scheduled',
    token: 'T-01'
  },
  {
    id: 'apt-2',
    patientName: 'Sunita Vishnu Pawar',
    sehatId: 'SL-MH-2026-000004',
    doctorName: 'Dr. Rajesh Sharma',
    facilityName: 'Khed Primary Health Centre',
    date: '2026-09-04',
    time: '11:30 AM',
    reason: 'High Risk ANC Checkup (3rd Trimester)',
    status: 'in-progress',
    token: 'T-02'
  },
  {
    id: 'apt-3',
    patientName: 'Shantaram Tukaram Shinde',
    sehatId: 'SL-MH-2026-000005',
    doctorName: 'Dr. Rajesh Sharma',
    facilityName: 'Khed Primary Health Centre',
    date: '2026-09-04',
    time: '12:00 PM',
    reason: 'Diabetes Blood Sugar Evaluation',
    status: 'scheduled',
    token: 'T-03'
  }
]

export function getStoredAppointments(): AppointmentItem[] {
  if (typeof window === 'undefined') return DEFAULT_APPOINTMENTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_APPOINTMENTS))
      return DEFAULT_APPOINTMENTS
    }
    return JSON.parse(raw)
  } catch (e) {
    return DEFAULT_APPOINTMENTS
  }
}

export function saveAppointment(apt: Omit<AppointmentItem, 'id' | 'token'>): AppointmentItem {
  const current = getStoredAppointments()
  const nextTokenNum = current.length + 1
  const token = `T-${nextTokenNum < 10 ? '0' + nextTokenNum : nextTokenNum}`
  const newApt: AppointmentItem = {
    ...apt,
    id: `apt-${Date.now()}`,
    token
  }
  const updated = [newApt, ...current]
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('sehat_appointments_updated'))
  }
  return newApt
}
