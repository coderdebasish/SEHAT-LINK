import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format date to readable string */
export function formatDate(dateStr: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

/** Format datetime */
export function formatDateTime(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Get initials from name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

/** Calculate age from date of birth */
export function getAge(dob: string | null | undefined): string {
  if (!dob) return '—'
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return `${age} yrs`
}

/** Role display names */
export const ROLE_LABELS: Record<string, string> = {
  patient: 'Patient',
  health_worker: 'Health Worker',
  doctor: 'Doctor',
  pharmacy: 'Pharmacist',
  facility_staff: 'Facility Staff',
  admin: 'Administrator',
}

/** Role dashboard routes */
export const ROLE_DASHBOARD_ROUTES: Record<string, string> = {
  patient: '/dashboard/patient',
  health_worker: '/dashboard/health-worker',
  doctor: '/dashboard/doctor',
  pharmacy: '/dashboard/pharmacy',
  facility_staff: '/dashboard/facility',
  admin: '/dashboard/admin',
}

/** Role accent colors (Tailwind classes) */
export const ROLE_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  patient:        { bg: 'bg-sky-50',     text: 'text-sky-700',    border: 'border-sky-200',   badge: 'bg-sky-100 text-sky-700' },
  health_worker:  { bg: 'bg-emerald-50', text: 'text-emerald-700',border: 'border-emerald-200',badge: 'bg-emerald-100 text-emerald-700' },
  doctor:         { bg: 'bg-violet-50',  text: 'text-violet-700', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700' },
  pharmacy:       { bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700' },
  facility_staff: { bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
  admin:          { bg: 'bg-rose-50',    text: 'text-rose-700',   border: 'border-rose-200',   badge: 'bg-rose-100 text-rose-700' },
}

/** Risk flag colors */
export const RISK_COLORS: Record<string, string> = {
  low:      'bg-green-100 text-green-700',
  medium:   'bg-yellow-100 text-yellow-700',
  high:     'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
}

/** Prescription status colors */
export const PRESCRIPTION_STATUS_COLORS: Record<string, string> = {
  active:              'bg-blue-100 text-blue-700',
  dispensed:           'bg-green-100 text-green-700',
  partially_dispensed: 'bg-yellow-100 text-yellow-700',
  expired:             'bg-gray-100 text-gray-600',
  cancelled:           'bg-red-100 text-red-700',
}

/** Format file size */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
