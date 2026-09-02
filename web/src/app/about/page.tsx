'use client'

import Link from 'next/link'
import { Heart, ArrowLeft, Shield, Users, Stethoscope, Activity, MapPin, CheckCircle2 } from 'lucide-react'

export default function AboutPage() {
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
            <p className="text-xs text-gray-500 leading-none mt-0.5">About the Platform</p>
          </div>
        </div>

        <Link href="/login" className="btn btn-primary btn-sm">
          Login Platform
        </Link>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="badge bg-blue-500/20 text-blue-200 border border-blue-400/30">Mission &amp; Vision</span>
          <h1 className="text-4xl md:text-5xl font-bold">Bridging Rural Healthcare Gaps in Maharashtra</h1>
          <p className="text-blue-100 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            SEHAT-LINK is a unified, offline-first digital health ecosystem designed to guarantee seamless continuity of care between village health workers, PHCs, doctors, and pharmacies.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="page-container py-12 flex-1 space-y-12">
        {/* Core Pillar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center space-y-3">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Unified SEHAT Health ID</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Every rural citizen receives a unique format ID (`SL-MH-2026-XXXXXX`) maintaining longitudinal medical records across their entire lifetime.
            </p>
          </div>

          <div className="card text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Offline-First Mobile Sync</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Health workers collect vitals and field data in low/no network areas. Data syncs automatically as soon as connectivity returns.
            </p>
          </div>

          <div className="card text-center space-y-3">
            <div className="w-12 h-12 bg-violet-100 text-violet-700 rounded-2xl flex items-center justify-center mx-auto">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Closed-Loop Prescriptions</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Doctors issue digital or uploaded paper prescriptions that pharmacies unlock using only the patient&apos;s SEHAT Health ID.
            </p>
          </div>
        </div>

        {/* Impact story */}
        <div className="card bg-white p-8 space-y-6 border-l-4 border-l-blue-600">
          <h2 className="text-2xl font-bold text-gray-900">Why SEHAT-LINK was Built</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            In rural healthcare, patient records are frequently lost between home visits by ASHA workers, consultations at Primary Health Centres (PHCs), and prescription dispensing at local pharmacies. This fragmentation causes missed follow-ups, redundant diagnostics, and delayed care for high-risk patients.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Zero lost prescription records — instant digital accessibility',
              'High-risk patient tracking with automated alert flags',
              'Seamless referral routing from PHC to District Hospitals',
              'Strict Row-Level Security (RLS) protecting patient privacy',
            ].map((point, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 text-xs text-center border-t border-gray-800">
        <p>© 2026 SEHAT-LINK. Integrated Healthcare Platform for Maharashtra.</p>
      </footer>
    </div>
  )
}
