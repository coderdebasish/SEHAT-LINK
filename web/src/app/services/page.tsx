'use client'

import Link from 'next/link'
import {
  Heart, ArrowLeft, Shield, Users, Stethoscope, Activity, MapPin, Pill,
  FileCheck, ClipboardList, PhoneCall, ArrowRight, CheckCircle2, Hospital
} from 'lucide-react'

export default function ServicesPage() {
  const services = [
    {
      id: 'prescriptions',
      icon: Pill,
      title: 'Real-Time Prescription & Pharmacy Sync',
      subtitle: 'Zero-click inline verification for instant medicine dispensing',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      badge: 'Real-Time Sync',
      description: 'Doctors can prescribe digitally or upload handwritten scanned prescriptions. Local pharmacies receive real-time notifications and inspect the exact uploaded document in high-res without clicking away.',
      features: [
        'Supports both digital Rx entry and physical scanned document PDFs/images',
        'Instant cross-tab and cross-device synchronization',
        'High-resolution inline document viewer with fullscreen inspector',
        'Secure audit logging for dispensing compliance'
      ]
    },
    {
      id: 'health-id',
      icon: Shield,
      title: 'Unified SEHAT Health Identity',
      subtitle: 'Single persistent health record across lifetime care',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      badge: 'Core Identity',
      description: 'Every rural citizen receives a unique SEHAT Health ID (e.g. SL-MH-2026-000001). All vitals, consultations, lab tests, and prescriptions are tied to this single ID for longitudinal tracking.',
      features: [
        'QR-code enabled health card generation',
        'Instant lookup across health workers, doctors, and pharmacies',
        'Strict Row-Level Security (RLS) ensuring privacy',
        'Complete longitudinal patient timeline'
      ]
    },
    {
      id: 'consultations',
      icon: Stethoscope,
      title: 'Tele-Consultation & Specialist Referrals',
      subtitle: 'Connecting primary health centers to district medical experts',
      color: 'bg-violet-100 text-violet-800 border-violet-200',
      badge: 'Clinical Care',
      description: 'Enables doctors at Sub-Centres and Primary Health Centres (PHCs) to refer complex cases to district specialists, complete with vitals history and uploaded medical attachments.',
      features: [
        'Structured clinical notes and diagnostic attachments',
        'Priority referral tags for urgent emergency cases',
        'Patient timeline history available to consulting doctors',
        'Closed-loop referral outcome tracking'
      ]
    },
    {
      id: 'field-vitals',
      icon: Activity,
      title: 'Field Vitals & High-Risk Assessment',
      subtitle: 'Offline-first mobile app for ASHA & ANM health workers',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      badge: 'Field Care',
      description: 'Empowers village health workers to record patient vitals, blood pressure, sugar levels, and maternal health risks during home visits, automatically flagging high-risk patients.',
      features: [
        'Works seamlessly in low-network rural environments',
        'Automated high-risk alert flags for hypertension and diabetes',
        'Follow-up visit scheduling and reminders',
        'Direct sync with local PHC doctor dashboards'
      ]
    },
    {
      id: 'facility-queue',
      icon: Hospital,
      title: 'Facility Queue & Bed Availability',
      subtitle: 'Live OPD queue status and bed tracking for public health facilities',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      badge: 'Infrastructure',
      description: 'Provides real-time visibility into OPD waiting queues, emergency bed occupancy, and diagnostic lab availability across Sub-Centres, PHCs, CHCs, and Civil Hospitals.',
      features: [
        'Live OPD token and queue management',
        'ICU and general bed availability indicators',
        'Lab sample tracking and report dispatch',
        'Facility finder by location and distance'
      ]
    },
    {
      id: 'schemes',
      icon: ClipboardList,
      title: 'Government Health Scheme Integration',
      subtitle: 'Seamless eligibility checking for Ayushman Bharat & NHM benefits',
      color: 'bg-rose-100 text-rose-800 border-rose-200',
      badge: 'Public Welfare',
      description: 'Integrates government health insurance and welfare schemes directly into the patient workflow, ensuring citizens receive full benefit coverage without administrative delays.',
      features: [
        'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY) linkage',
        'National Health Mission (NHM) maternal and child care schemes',
        'Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY) support',
        'Free medicine & diagnostic test entitlement verification'
      ]
    }
  ]

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
            <p className="text-xs text-gray-500 leading-none mt-0.5">Healthcare Services</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1">
          <Link href="/about" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
            About
          </Link>
          <Link href="/services" className="px-3 py-2 text-sm font-bold text-blue-700 bg-blue-50 rounded-lg">
            Services
          </Link>
          <Link href="/find-facilities" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
            Find Facilities
          </Link>
          <Link href="/find-doctors" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
            Find Doctors
          </Link>
          <Link href="/health-info" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
            Health Info
          </Link>
          <Link href="/schemes" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
            Schemes
          </Link>
        </div>

        <Link href="/login" className="btn btn-primary btn-sm">
          Login Platform
        </Link>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="badge bg-blue-500/20 text-blue-200 border border-blue-400/30">Comprehensive Rural Ecosystem</span>
          <h1 className="text-4xl md:text-5xl font-bold">SEHAT-LINK Platform Services</h1>
          <p className="text-blue-100 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Connecting village health workers, medical practitioners, diagnostic labs, and local pharmacies into one real-time healthcare network.
          </p>
        </div>
      </section>

      {/* Services List */}
      <main className="page-container py-12 flex-1 max-w-5xl space-y-8">
        <div className="grid grid-cols-1 gap-8">
          {services.map(service => {
            const IconComponent = service.icon
            return (
              <div key={service.id} className="card bg-white p-8 space-y-6 hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${service.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="badge bg-gray-100 text-gray-700 text-xs mb-1 font-semibold">{service.badge}</span>
                      <h2 className="text-2xl font-bold text-gray-900">{service.title}</h2>
                      <p className="text-xs text-gray-500 font-medium">{service.subtitle}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {service.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 font-medium bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Banner */}
        <div className="card bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-8 text-center space-y-4 shadow-xl">
          <h3 className="text-2xl font-bold">Ready to access integrated healthcare services?</h3>
          <p className="text-blue-100 text-sm max-w-xl mx-auto">
            Log in with your credentials or visit your nearest Primary Health Centre to register your SEHAT Health ID.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link href="/login" className="btn bg-white text-blue-900 hover:bg-blue-50 font-bold px-6 py-2.5">
              Login to Platform <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/find-facilities" className="btn bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5">
              Find Facilities Near You
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 text-xs text-center border-t border-gray-800">
        <p>© 2026 SEHAT-LINK. Integrated Healthcare Platform for Maharashtra.</p>
      </footer>
    </div>
  )
}
