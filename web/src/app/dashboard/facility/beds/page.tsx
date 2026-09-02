'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Sidebar, Topbar } from '@/components/layout/DashboardLayout'
import {
  LayoutDashboard, Users, Calendar, FileSpreadsheet, BedDouble, Settings, Plus, Minus, Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard/facility', label: 'Facility Overview', icon: LayoutDashboard },
  { href: '/dashboard/facility/queue', label: 'OPD Queue Manager', icon: Users, section: 'Operations' },
  { href: '/dashboard/facility/appointments', label: 'Appointments', icon: Calendar, section: 'Operations' },
  { href: '/dashboard/facility/labs', label: 'Lab Diagnostics', icon: FileSpreadsheet, section: 'Operations' },
  { href: '/dashboard/facility/beds', label: 'Bed Management', icon: BedDouble, section: 'Operations' },
  { href: '/dashboard/facility/profile', label: 'Profile & Settings', icon: Settings, section: 'Account' },
]

type WardBed = {
  ward: string
  total: number
  occupied: number
}

export default function FacilityBedsPage() {
  const auth = useRequireAuth('facility_staff')
  const [wards, setWards] = useState<WardBed[]>([
    { ward: 'General Male & Female Ward', total: 10, occupied: 6 },
    { ward: 'Maternal / ANC & Postnatal Ward', total: 6, occupied: 4 },
    { ward: 'Emergency & Pediatric Observation', total: 4, occupied: 1 },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth.profile?.facility_id) return

    async function loadFacilityBeds() {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('facilities')
        .select('total_beds, available_beds')
        .eq('id', auth.profile!.facility_id!)
        .maybeSingle()

      if (data) {
        const total = data.total_beds || 20
        const avail = data.available_beds ?? 9
        const occ = Math.max(0, total - avail)

        setWards([
          { ward: 'General Medical Ward', total: Math.round(total * 0.5), occupied: Math.round(occ * 0.6) },
          { ward: 'Maternal / ANC Ward', total: Math.round(total * 0.3), occupied: Math.round(occ * 0.3) },
          { ward: 'Emergency / Observation Ward', total: Math.round(total * 0.2), occupied: Math.round(occ * 0.1) },
        ])
      }
      setLoading(false)
    }

    loadFacilityBeds()
  }, [auth.profile?.facility_id])

  async function updateOccupancy(index: number, delta: number) {
    const updated = [...wards]
    const current = updated[index]
    const newOccupied = Math.min(current.total, Math.max(0, current.occupied + delta))
    updated[index].occupied = newOccupied
    setWards(updated)

    if (auth.profile?.facility_id) {
      const supabase = createClient()
      const totalAvailable = updated.reduce((acc, w) => acc + (w.total - w.occupied), 0)
      await supabase
        .from('facilities')
        .update({ available_beds: totalAvailable })
        .eq('id', auth.profile.facility_id)
    }
  }

  if (auth.loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!auth.profile) return null

  return (
    <div className="dashboard-layout">
      <Sidebar profile={auth.profile} navItems={NAV_ITEMS} onSignOut={auth.signOut} />
      <div className="dashboard-main">
        <Topbar title="Facility Bed Management" subtitle="Real-time Ward Occupancy &amp; Emergency Admission Tracker" profile={auth.profile} onSignOut={auth.signOut} />
        <main className="dashboard-content space-y-6">
          {loading ? (
            <div className="card flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {wards.map((b, i) => {
                const available = Math.max(0, b.total - b.occupied)
                return (
                  <div key={i} className="card space-y-4">
                    <h3 className="font-bold text-gray-900 text-lg">{b.ward}</h3>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Total Ward Capacity:</span>
                      <span className="font-bold text-gray-900">{b.total} Beds</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Currently Occupied:</span>
                      <span className="font-bold text-rose-600">{b.occupied} Beds</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t pt-2">
                      <span className="text-gray-500 font-semibold">Available for Admission:</span>
                      <span className="font-bold text-emerald-600 text-sm">{available} Beds</span>
                    </div>

                    <div className="pt-2 flex justify-between gap-2 border-t">
                      <button
                        onClick={() => updateOccupancy(i, 1)}
                        disabled={b.occupied >= b.total}
                        className="btn btn-secondary btn-sm flex-1 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Admit Patient
                      </button>
                      <button
                        onClick={() => updateOccupancy(i, -1)}
                        disabled={b.occupied <= 0}
                        className="btn btn-secondary btn-sm flex-1 text-xs"
                      >
                        <Minus className="w-3.5 h-3.5" /> Discharge
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
