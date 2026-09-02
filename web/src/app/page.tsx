import Link from 'next/link'
import {
  Heart, Shield, Users, Stethoscope, Pill, ClipboardList,
  ArrowRight, CheckCircle, MapPin, Phone, ChevronRight,
  Activity, FileText, Bell, Search
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── NAVIGATION ── */}
      <nav className="public-nav">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-700">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900 leading-none tracking-tight">SEHAT-LINK</span>
            <p className="text-xs text-gray-500 leading-none mt-0.5">Integrated Rural Healthcare</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {[
            { href: '/about', label: 'About' },
            { href: '/services', label: 'Services' },
            { href: '/find-facilities', label: 'Find Facilities' },
            { href: '/find-doctors', label: 'Find Doctors' },
            { href: '/health-info', label: 'Health Info' },
            { href: '/schemes', label: 'Schemes' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="btn btn-primary">
            Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="page-container w-full relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-white/80 font-medium">Now live across Pune district, Maharashtra</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6 text-balance">
              One Patient.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-emerald-300">
                One Record.
              </span><br />
              Connected Care.
            </h1>
            <p className="text-lg text-white/75 mb-8 max-w-xl leading-relaxed">
              SEHAT-LINK connects patients, health workers, doctors, pharmacies and diagnostic centers through a single unified digital health identity — your SEHAT Health ID.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-lg bg-white text-blue-800 hover:bg-blue-50 font-semibold" style={{ textDecoration: 'none' }}>
                Access Platform <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/find-doctors" className="btn btn-lg bg-white/10 border border-white/25 text-white hover:bg-white/20 font-medium" style={{ textDecoration: 'none' }}>
                Find a Doctor
              </Link>
            </div>

            {/* Quick access chips */}
            <div className="flex flex-wrap gap-2 mt-8">
              {['Find Hospitals', 'Health Information', 'Government Schemes', 'Book Appointment'].map(label => (
                <span key={label} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 border border-white/15 rounded-full text-sm text-white/70 cursor-pointer hover:bg-white/15 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" /> {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Floating stats card */}
        <div className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2 z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 w-72 space-y-4">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Platform Overview</p>
            {[
              { icon: Users, label: 'Registered Patients', value: '12,480+', color: 'text-sky-300' },
              { icon: Stethoscope, label: 'Doctors Connected', value: '340+', color: 'text-emerald-300' },
              { icon: MapPin, label: 'Health Facilities', value: '86', color: 'text-amber-300' },
              { icon: Activity, label: 'Consultations Today', value: '1,240', color: 'text-violet-300' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">{stat.value}</p>
                  <p className="text-white/55 text-xs mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="stats-band">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '12,480+', label: 'Patients Registered' },
              { number: '340+',    label: 'Healthcare Providers' },
              { number: '86',      label: 'Facilities Connected' },
              { number: '98%',     label: 'Record Accuracy' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="text-center mb-14">
            <span className="badge bg-blue-50 text-blue-700 mb-3">How It Works</span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your complete health journey, connected</h2>
            <p className="text-gray-500 max-w-xl mx-auto">From registration to consultation, prescription to dispensing — every step is linked through your unique SEHAT Health ID.</p>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-0 md:gap-2">
            {[
              {
                step: '01',
                icon: Users,
                title: 'Patient Registration',
                desc: 'Health worker registers you and generates your unique SEHAT Health ID (e.g. SL-MH-2026-000001)',
                color: 'bg-sky-50 text-sky-600',
              },
              {
                step: '02',
                icon: Activity,
                title: 'Field Assessment',
                desc: 'Health worker records your vitals, symptoms and assessment during home or PHC visits',
                color: 'bg-emerald-50 text-emerald-600',
              },
              {
                step: '03',
                icon: Stethoscope,
                title: 'Doctor Consultation',
                desc: 'Doctor reviews your full history and creates a digital or scanned prescription linked to your record',
                color: 'bg-violet-50 text-violet-600',
              },
              {
                step: '04',
                icon: Pill,
                title: 'Pharmacy Dispensing',
                desc: 'Share your SEHAT ID at any linked pharmacy. They verify and dispense your medicines directly.',
                color: 'bg-amber-50 text-amber-600',
              },
            ].map((item, i, arr) => (
              <div key={item.step} className="flex items-start flex-col flex-1 min-w-0">
                <div className="flex items-start gap-3 w-full">
                  <div className={`feature-icon-box ${item.color} flex-shrink-0`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  {i < arr.length - 1 && <div className="step-connector mt-5 flex-1" />}
                </div>
                <div className="mt-4 pr-4">
                  <div className="text-xs font-bold text-gray-400 mb-1">STEP {item.step}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="py-20 bg-gray-50">
        <div className="page-container">
          <div className="text-center mb-14">
            <span className="badge bg-emerald-50 text-emerald-700 mb-3">Platform Features</span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for everyone in the care chain</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Shield,
                title: 'Unified SEHAT Health ID',
                desc: 'One persistent identity connecting every healthcare interaction across your lifetime.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: FileText,
                title: 'Digital & Scanned Prescriptions',
                desc: 'Doctors can create digital prescriptions or upload handwritten scans — both linked to your record.',
                color: 'bg-violet-50 text-violet-600',
              },
              {
                icon: Activity,
                title: 'Complete Health Timeline',
                desc: 'View your full care history — vitals, consultations, prescriptions, reports — in one chronological view.',
                color: 'bg-emerald-50 text-emerald-600',
              },
              {
                icon: Bell,
                title: 'Real-time Notifications',
                desc: 'Get instant alerts for appointments, follow-ups, prescription status and referral updates.',
                color: 'bg-amber-50 text-amber-600',
              },
              {
                icon: Search,
                title: 'Find Healthcare Near You',
                desc: 'Locate PHCs, CHCs, hospitals, pharmacies and diagnostic labs in your district without logging in.',
                color: 'bg-rose-50 text-rose-600',
              },
              {
                icon: ClipboardList,
                title: 'Government Scheme Access',
                desc: 'Information on Ayushman Bharat, NHM programs and other government health initiatives.',
                color: 'bg-teal-50 text-teal-600',
              },
            ].map(feature => (
              <div key={feature.title} className="card card-hover">
                <div className={`feature-icon-box w-11 h-11 rounded-xl ${feature.color} mb-4`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR EACH ROLE ── */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="text-center mb-14">
            <span className="badge bg-violet-50 text-violet-700 mb-3">Role-Based Access</span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">One platform, multiple perspectives</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Every stakeholder gets a purpose-built interface with access only to what they need.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                role: 'Patient',
                color: 'border-sky-200 bg-sky-50',
                iconColor: 'bg-sky-100 text-sky-700',
                icon: Users,
                items: ['View Health Timeline', 'View Prescriptions', 'Book Appointments', 'Download Health Records'],
              },
              {
                role: 'Health Worker',
                color: 'border-emerald-200 bg-emerald-50',
                iconColor: 'bg-emerald-100 text-emerald-700',
                icon: Activity,
                items: ['Register New Patients', 'Record Vitals & Assessment', 'Create Follow-ups', 'Track High-Risk Cases'],
              },
              {
                role: 'Doctor',
                color: 'border-violet-200 bg-violet-50',
                iconColor: 'bg-violet-100 text-violet-700',
                icon: Stethoscope,
                items: ['Search by SEHAT ID', 'View Full Patient History', 'Create Digital Prescription', 'Upload Scanned Prescription'],
              },
              {
                role: 'Pharmacy',
                color: 'border-amber-200 bg-amber-50',
                iconColor: 'bg-amber-100 text-amber-700',
                icon: Pill,
                items: ['Lookup by SEHAT ID', 'Verify Prescriptions', 'Update Dispensing Status', 'Track Dispensing History'],
              },
              {
                role: 'Facility Staff',
                color: 'border-orange-200 bg-orange-50',
                iconColor: 'bg-orange-100 text-orange-700',
                icon: MapPin,
                items: ['Manage Appointments', 'Queue Management', 'Upload Lab Reports', 'Coordinate Referrals'],
              },
              {
                role: 'Administrator',
                color: 'border-rose-200 bg-rose-50',
                iconColor: 'bg-rose-100 text-rose-700',
                icon: Shield,
                items: ['User & Role Management', 'Facility Management', 'Analytics & Reports', 'Audit Logs'],
              },
            ].map(role => (
              <div key={role.role} className={`card border ${role.color}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${role.iconColor}`}>
                    <role.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{role.role}</h3>
                </div>
                <ul className="space-y-2">
                  {role.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-br from-blue-800 to-blue-900">
        <div className="page-container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to experience connected healthcare?</h2>
          <p className="text-blue-200 mb-8 max-w-lg mx-auto">Access your health records, connect with doctors and manage your complete health journey — from anywhere.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/login" className="btn btn-lg bg-white text-blue-800 font-semibold hover:bg-blue-50" style={{ textDecoration: 'none' }}>
              Login to Platform <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/find-facilities" className="btn btn-lg border border-blue-500 text-white hover:bg-blue-700/50" style={{ textDecoration: 'none' }}>
              Find Facilities Near You
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-14">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="text-white font-bold text-lg">SEHAT-LINK</span>
              </div>
              <p className="text-sm leading-relaxed">Integrated Rural Healthcare Access &amp; Care Continuity Platform for Maharashtra.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Platform</h4>
              <ul className="space-y-2 text-sm">
                {['About SEHAT-LINK', 'How It Works', 'Healthcare Network', 'Technology'].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Services</h4>
              <ul className="space-y-2 text-sm">
                {['Find Doctors', 'Find Hospitals', 'Find Pharmacies', 'Government Schemes'].map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Contact</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> 1800-XXX-XXXX</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Pune, Maharashtra</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>© 2026 SEHAT-LINK. All rights reserved.</p>
            <p className="text-xs">Built for Smart India Hackathon 2026 | Healthcare Category</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
