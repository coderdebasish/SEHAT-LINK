'use client'

import Link from 'next/link'
import { Heart, ArrowLeft, AlertTriangle, ShieldCheck, Thermometer, Droplets, Activity } from 'lucide-react'

export default function HealthInfoPage() {
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
            <p className="text-xs text-gray-500 leading-none mt-0.5">Health Awareness &amp; Advisories</p>
          </div>
        </div>

        <Link href="/login" className="btn btn-primary btn-sm">
          Login Platform
        </Link>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-amber-900 via-orange-900 to-red-950 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="badge bg-white/15 text-white border border-white/20">Public Health Advisory</span>
          <h1 className="text-3xl md:text-4xl font-bold">Monsoon &amp; Seasonal Health Guidelines</h1>
          <p className="text-amber-100 text-sm md:text-base max-w-xl mx-auto">
            Essential preventive guidance for Dengue, Malaria, Waterborne Diseases, and Maternal Nutrition in rural communities.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="page-container py-10 flex-1 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dengue & Malaria */}
          <div className="card space-y-4 border-t-4 border-t-amber-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Dengue &amp; Vector Control</h3>
                <p className="text-xs text-gray-500">Prevention against Aedes Mosquitoes</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>Ensure water storage drums and pots are tightly covered. Change water every 3 days.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>Use mosquito nets while sleeping, especially for children and pregnant women.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>If high fever, severe headache, or joint pain persists &gt; 2 days, visit the nearest PHC immediately.</span>
              </li>
            </ul>
          </div>

          {/* Waterborne Care */}
          <div className="card space-y-4 border-t-4 border-t-blue-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Clean Water &amp; Diarrhea Care</h3>
                <p className="text-xs text-gray-500">Safe Drinking Water Guidelines</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Boil drinking water for at least 2 minutes during rainy season or use Medichlor drops.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Use Oral Rehydration Solution (ORS) sachets immediately at the onset of loose motions.</span>
              </li>
              <li className="flex items-start gap-2">
                <Activity className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Free ORS and Zinc tablets are available at all SEHAT-LINK primary health centres.</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 text-xs text-center border-t border-gray-800">
        <p>© 2026 SEHAT-LINK. Integrated Healthcare Platform for Maharashtra.</p>
      </footer>
    </div>
  )
}
