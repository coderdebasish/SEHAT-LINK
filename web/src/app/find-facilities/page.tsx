'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Search, MapPin, Phone, Clock, Building2, ArrowLeft, Filter, ExternalLink } from 'lucide-react'

interface Facility {
  id: string
  name: string
  type: string
  typeLabel: string
  district: string
  taluka: string
  address: string
  phone: string
  timing: string
  beds: number
  emergency: boolean
}

const SAMPLE_FACILITIES: Facility[] = [
  {
    id: 'f1',
    name: 'Khed Primary Health Centre (PHC)',
    type: 'primary_health_centre',
    typeLabel: 'Primary Health Centre',
    district: 'Pune',
    taluka: 'Khed',
    address: 'Main Road, Khed Rajgurunagar, Pune - 410505',
    phone: '+91 2135 222100',
    timing: '24x7 Emergency Services',
    beds: 12,
    emergency: true,
  },
  {
    id: 'f2',
    name: 'Manchar Community Health Centre (CHC)',
    type: 'community_health_centre',
    typeLabel: 'Community Health Centre',
    district: 'Pune',
    taluka: 'Ambegaon',
    address: 'State Highway 50, Manchar, Ambegaon, Pune - 410503',
    phone: '+91 2133 223450',
    timing: '24x7 Service',
    beds: 30,
    emergency: true,
  },
  {
    id: 'f3',
    name: 'LifeCare Pharmacy & Medicos',
    type: 'pharmacy',
    typeLabel: 'Pharmacy',
    district: 'Pune',
    taluka: 'Khed',
    address: 'Shop 4, Market Yard, Khed Rajgurunagar, Pune - 410505',
    phone: '+91 98220 12345',
    timing: '08:00 AM - 10:00 PM',
    beds: 0,
    emergency: false,
  },
  {
    id: 'f4',
    name: 'Seva Diagnostics & Pathology Lab',
    type: 'diagnostic_lab',
    typeLabel: 'Diagnostic Lab',
    district: 'Pune',
    taluka: 'Khed',
    address: 'Opp. Bus Stand, Khed Rajgurunagar, Pune - 410505',
    phone: '+91 98221 67890',
    timing: '07:00 AM - 08:00 PM',
    beds: 0,
    emergency: false,
  },
  {
    id: 'f5',
    name: 'Shirur Sub-District Hospital',
    type: 'district_hospital',
    typeLabel: 'Sub-District Hospital',
    district: 'Pune',
    taluka: 'Shirur',
    address: 'Nagar Road, Shirur, Pune - 412210',
    phone: '+91 2138 222300',
    timing: '24x7 Emergency & Trauma',
    beds: 100,
    emergency: true,
  },
  {
    id: 'f6',
    name: 'Junner Sub-Centre Health Clinic',
    type: 'sub_centre',
    typeLabel: 'Sub-Centre',
    district: 'Pune',
    taluka: 'Junnar',
    address: 'Village Otur, Junnar, Pune - 410504',
    phone: '+91 2132 242110',
    timing: '09:00 AM - 05:00 PM',
    beds: 4,
    emergency: false,
  },
]

export default function FindFacilitiesPage() {
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedTaluka, setSelectedTaluka] = useState('all')

  const filtered = SAMPLE_FACILITIES.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
                          f.address.toLowerCase().includes(search.toLowerCase()) ||
                          f.taluka.toLowerCase().includes(search.toLowerCase())
    const matchesType = selectedType === 'all' || f.type === selectedType
    const matchesTaluka = selectedTaluka === 'all' || f.taluka === selectedTaluka
    return matchesSearch && matchesType && matchesTaluka
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Nav */}
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
            <p className="text-xs text-gray-500 leading-none mt-0.5">Find Healthcare Facilities</p>
          </div>
        </div>

        <Link href="/login" className="btn btn-primary btn-sm">
          Login to Platform
        </Link>
      </header>

      {/* Hero Search */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-teal-800 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="badge bg-white/15 text-white border border-white/20">Healthcare Directory</span>
          <h1 className="text-3xl md:text-4xl font-bold">Find Healthcare Facilities Near You</h1>
          <p className="text-blue-100 text-sm md:text-base max-w-xl mx-auto">
            Search Primary Health Centres (PHCs), CHCs, District Hospitals, Diagnostic Labs and Pharmacies across Maharashtra.
          </p>

          {/* Search bar */}
          <div className="bg-white rounded-2xl p-3 shadow-xl max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 mt-6">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search facility name, village, or town..."
                className="input border-0 pl-11 text-gray-900 bg-transparent focus:ring-0"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-primary px-6">
              Search Facilities
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="page-container py-10 flex-1">
        {/* Filters bar */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Filter className="w-4 h-4 text-blue-600" /> Filter Facilities:
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Type filter */}
              <select
                className="input text-xs w-auto"
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
              >
                <option value="all">All Facility Types</option>
                <option value="primary_health_centre">Primary Health Centre (PHC)</option>
                <option value="community_health_centre">Community Health Centre (CHC)</option>
                <option value="district_hospital">District / Sub-District Hospital</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="diagnostic_lab">Diagnostic Lab</option>
                <option value="sub_centre">Sub-Centre</option>
              </select>

              {/* Taluka filter */}
              <select
                className="input text-xs w-auto"
                value={selectedTaluka}
                onChange={e => setSelectedTaluka(e.target.value)}
              >
                <option value="all">All Talukas (Pune District)</option>
                <option value="Khed">Khed</option>
                <option value="Ambegaon">Ambegaon</option>
                <option value="Shirur">Shirur</option>
                <option value="Junnar">Junnar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(facility => (
            <div key={facility.id} className="card card-hover flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="badge bg-blue-50 text-blue-700 font-medium">
                    {facility.typeLabel}
                  </span>
                  {facility.emergency && (
                    <span className="badge bg-red-50 text-red-700 font-semibold border border-red-200 animate-pulse">
                      24x7 Emergency
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-2 leading-snug">
                  {facility.name}
                </h3>

                <div className="space-y-2 text-xs text-gray-600 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>{facility.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a href={`tel:${facility.phone}`} className="text-blue-600 font-mono hover:underline">
                      {facility.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{facility.timing}</span>
                  </div>
                  {facility.beds > 0 && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{facility.beds} Inpatient Beds</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">
                  Taluka: {facility.taluka}
                </span>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(facility.name + ' ' + facility.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-secondary text-xs"
                >
                  Directions <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state card">
            <Building2 className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-semibold text-gray-700">No Facilities Found</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1">
              Try adjusting your search criteria or select &quot;All Talukas&quot;.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-xs text-center border-t border-gray-800">
        <p>© 2026 SEHAT-LINK. Integrated Healthcare Platform for Maharashtra.</p>
      </footer>
    </div>
  )
}
