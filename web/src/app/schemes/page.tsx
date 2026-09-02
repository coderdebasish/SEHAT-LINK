'use client'

import Link from 'next/link'
import { Heart, ArrowLeft, ShieldCheck, Check, ExternalLink, HelpCircle } from 'lucide-react'

interface Scheme {
  id: string
  title: string
  subtitle: string
  coverage: string
  eligibility: string[]
  benefits: string[]
  applyProcess: string
  type: string
}

const GOVERNMENT_SCHEMES: Scheme[] = [
  {
    id: 's1',
    title: 'Ayushman Bharat - PM-JAY',
    subtitle: 'Pradhan Mantri Jan Arogya Yojana',
    coverage: '₹5,000,000 per family / year',
    type: 'Central Government',
    eligibility: [
      'BPL Card Holders / SECC 2011 Database registered families',
      'Families without adult male/earning member',
      'Rural households living in kucha houses',
    ],
    benefits: [
      'Cashless secondary and tertiary hospital care',
      'Pre and post-hospitalization coverage up to 15 days',
      'Over 1,900 medical procedures included',
    ],
    applyProcess: 'Visit nearest PHC / CSC center with Aadhaar & Ration Card or show SEHAT Health ID.',
  },
  {
    id: 's2',
    title: 'Mahatma Jyotirao Phule Jan Arogya Yojana (MPJAY)',
    subtitle: 'Maharashtra State Health Insurance Scheme',
    coverage: '₹5,000,000 per family / year',
    type: 'State Government (Maharashtra)',
    eligibility: [
      'Yellow, Antyodaya, and Orange Ration Card holders in Maharashtra',
      'Farmers from 14 drought-affected districts of Maharashtra',
    ],
    benefits: [
      'Free surgical and medical treatment across 996 procedures',
      'Free diagnostic tests, consultations, and medicines during hospitalization',
      'Coverage for major surgeries like heart bypass, kidney transplant, cancer surgery',
    ],
    applyProcess: 'Contact Arogyamitra at any empaneled District Hospital or PHC with Ration Card & SEHAT ID.',
  },
  {
    id: 's3',
    title: 'National Health Mission (NHM) Rural Services',
    subtitle: 'Maternal, Neonatal & Child Health Support',
    coverage: 'Free Healthcare + Cash Incentives',
    type: 'Central + State Joint Scheme',
    eligibility: [
      'All pregnant women in rural areas',
      'Infants up to 1 year of age',
      'Adolescent girls for anemia and nutritional care',
    ],
    benefits: [
      'Free institutional delivery and free transport (108 Ambulance)',
      'Free immunizations against 12 vaccine-preventable diseases',
      'Janani Suraksha Yojana (JSY) direct cash transfer to mother',
    ],
    applyProcess: 'Register with your village ASHA / Auxiliary Nurse Midwife (ANM) or at local PHC.',
  },
]

export default function SchemesPage() {
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
            <p className="text-xs text-gray-500 leading-none mt-0.5">Government Schemes Directory</p>
          </div>
        </div>

        <Link href="/login" className="btn btn-primary btn-sm">
          Login Platform
        </Link>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-emerald-900 via-teal-800 to-blue-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="badge bg-white/15 text-white border border-white/20">Health Protection</span>
          <h1 className="text-3xl md:text-4xl font-bold">Government Health Schemes &amp; Financial Support</h1>
          <p className="text-teal-100 text-sm md:text-base max-w-xl mx-auto">
            Learn about health insurance and healthcare subsidies available for rural citizens in Maharashtra under Central and State programs.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="page-container py-10 flex-1 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {GOVERNMENT_SCHEMES.map(scheme => (
              <div key={scheme.id} className="card card-hover space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="badge bg-emerald-100 text-emerald-800 font-semibold mb-2">
                      {scheme.type}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900">{scheme.title}</h2>
                    <p className="text-sm text-gray-500 font-medium">{scheme.subtitle}</p>
                  </div>
                  <div className="text-right bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex-shrink-0">
                    <p className="text-xs text-emerald-700 font-semibold uppercase">Coverage Limit</p>
                    <p className="text-lg font-bold text-emerald-900">{scheme.coverage}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Eligibility
                    </h4>
                    <ul className="space-y-1.5 text-xs text-gray-600">
                      {scheme.eligibility.map((e, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-teal-600" /> Key Benefits
                    </h4>
                    <ul className="space-y-1.5 text-xs text-gray-600">
                      {scheme.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>How to apply / access:</strong> {scheme.applyProcess}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar guidance */}
          <div className="space-y-6">
            <div className="card bg-gradient-to-br from-blue-900 to-teal-900 text-white space-y-4">
              <h3 className="text-lg font-bold">Need Help Enrolling?</h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                SEHAT-LINK Health Workers can assist you directly in linking your Ration Card or Aadhaar with Ayushman Bharat / MPJAY during home visits.
              </p>
              <div className="pt-2">
                <Link href="/login" className="btn btn-sm bg-white text-blue-900 font-bold hover:bg-blue-50 w-full justify-center">
                  Login &amp; Check Status
                </Link>
              </div>
            </div>

            <div className="card space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Official Portals</h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="https://pmjay.gov.in" target="_blank" rel="noreferrer" className="flex items-center justify-between text-blue-600 hover:underline">
                    <span>Ayushman Bharat Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://www.jeevandayee.gov.in" target="_blank" rel="noreferrer" className="flex items-center justify-between text-blue-600 hover:underline">
                    <span>Mahatma Jyotirao Phule Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 text-xs text-center border-t border-gray-800">
        <p>© 2026 SEHAT-LINK. Integrated Healthcare Platform for Maharashtra.</p>
      </footer>
    </div>
  )
}
