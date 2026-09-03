'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Eye, EyeOff, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ROLE_DASHBOARD_ROUTES } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        setError(authError.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again.'
          : authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Login failed. Please try again.')
        setLoading(false)
        return
      }

      // Fetch user role from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !profile) {
        setError('Could not load your profile. Please contact support.')
        setLoading(false)
        return
      }

      // Route to role-specific dashboard
      const dashboardRoute = ROLE_DASHBOARD_ROUTES[profile.role] || '/dashboard'
      router.push(dashboardRoute)
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-10 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, hsl(218, 45%, 10%) 0%, hsl(210, 60%, 18%) 50%, hsl(168, 50%, 20%) 100%)',
        }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-[-5%] left-[-10%] w-72 h-72 rounded-full bg-emerald-500/8 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="text-white font-bold text-xl leading-none">SEHAT-LINK</div>
            <div className="text-blue-300 text-xs mt-0.5">Integrated Rural Healthcare</div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            One Patient.<br />One Record.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-emerald-300">
              Connected Care.
            </span>
          </h2>
          <p className="text-blue-200/80 text-sm leading-relaxed mb-8">
            Securely access your role-specific healthcare dashboard. Your account type determines your personalized experience.
          </p>

          {/* Role chips */}
          <div className="space-y-2">
            {[
              { role: 'Patient', desc: 'View health records & appointments', color: 'bg-sky-500/15 border-sky-400/20 text-sky-300' },
              { role: 'Doctor', desc: 'Manage consultations & prescriptions', color: 'bg-violet-500/15 border-violet-400/20 text-violet-300' },
              { role: 'Health Worker', desc: 'Register patients & record vitals', color: 'bg-emerald-500/15 border-emerald-400/20 text-emerald-300' },
              { role: 'Pharmacy', desc: 'Verify & dispense prescriptions', color: 'bg-amber-500/15 border-amber-400/20 text-amber-300' },
            ].map(item => (
              <div key={item.role} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border ${item.color}`}>
                <div className="w-2 h-2 rounded-full bg-current flex-shrink-0" />
                <div>
                  <span className="font-medium text-sm">{item.role}</span>
                  <span className="text-xs opacity-70 ml-2">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div className="relative z-10 text-xs text-blue-400/60">
          © 2026 SEHAT-LINK · Smart India Hackathon
        </div>
      </div>

      {/* ── RIGHT PANEL: LOGIN FORM ── */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-6 sm:py-12 bg-white min-h-screen">
        <div className="w-full max-w-[440px] mx-auto space-y-6">
          {/* Back link & Mobile Logo header */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>

            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">SEHAT-LINK</span>
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
            <p className="text-gray-500 text-xs sm:text-sm">Sign in to access your healthcare dashboard</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="alert alert-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="label text-xs sm:text-sm font-bold">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="input text-base sm:text-sm min-h-[44px]"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="label text-xs sm:text-sm font-bold" style={{ marginBottom: 0 }}>Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-blue-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="input pr-10 text-base sm:text-sm min-h-[44px]"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn btn-primary btn-lg w-full min-h-[48px] font-bold text-sm sm:text-base mt-2 shadow-md"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo credentials — click to fill */}
          <div className="p-3.5 sm:p-4 bg-amber-50/90 border border-amber-200 rounded-xl space-y-2">
            <p className="text-xs text-amber-900 font-bold flex items-center justify-between">
              <span>🎯 Quick Demo Login Presets</span>
              <span className="text-[10px] font-normal text-amber-700">Tap to auto-fill</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'Patient',       email: 'patient@sehat.in',     color: 'bg-sky-100/80 text-sky-900 hover:bg-sky-200 border-sky-300' },
                { role: 'Doctor',        email: 'doctor@sehat.in',      color: 'bg-violet-100/80 text-violet-900 hover:bg-violet-200 border-violet-300' },
                { role: 'Health Worker', email: 'healthworker@sehat.in',color: 'bg-emerald-100/80 text-emerald-900 hover:bg-emerald-200 border-emerald-300' },
                { role: 'Pharmacy',      email: 'pharmacy@sehat.in',    color: 'bg-amber-100/80 text-amber-900 hover:bg-amber-200 border-amber-300' },
                { role: 'Facility',      email: 'facility@sehat.in',    color: 'bg-orange-100/80 text-orange-900 hover:bg-orange-200 border-orange-300' },
                { role: 'Admin',         email: 'admin@sehat.in',       color: 'bg-rose-100/80 text-rose-900 hover:bg-rose-200 border-rose-300' },
              ].map(demo => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => { setEmail(demo.email); setPassword('Sehat123') }}
                  className={`text-left p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer min-h-[44px] flex flex-col justify-center active:scale-95 ${demo.color}`}
                >
                  <div className="font-bold leading-none">{demo.role}</div>
                  <div className="opacity-75 text-[10px] mt-1 font-mono truncate">{demo.email}</div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-amber-800 text-center font-medium pt-1">
              Password for all: <span className="font-mono font-bold text-amber-950">Sehat123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
