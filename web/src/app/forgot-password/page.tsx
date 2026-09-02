'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Activity, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
            <Activity className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-center text-2xl font-bold">Reset Your SEHAT-LINK Password</h2>
        <p className="text-center text-xs text-gray-400">Enter your registered email address to receive password reset instructions</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 p-8 shadow-2xl rounded-2xl border border-slate-700 space-y-6">
          {submitted ? (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500/30 text-emerald-200 rounded-xl space-y-2 text-center text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-sm text-white">Password Reset Email Sent!</p>
              <p className="text-gray-300">We have dispatched a password recovery link to <span className="font-mono font-bold text-blue-400">{email}</span>.</p>
              <div className="pt-3">
                <Link href="/login" className="btn btn-primary btn-sm w-full">
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="label text-gray-300 text-xs">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    className="input pl-9 bg-slate-900 border-slate-700 text-white"
                    type="email"
                    placeholder="doctor@sehat.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Send Reset Link
              </button>

              <div className="pt-2 text-center">
                <Link href="/login" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
