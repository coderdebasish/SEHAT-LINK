'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Bell, ChevronDown, Heart, Menu, X } from 'lucide-react'
import { cn, getInitials, ROLE_LABELS, ROLE_COLORS } from '@/lib/utils'
import type { Profile } from '@sehat-link/types'
import { initGlobalRealtimeListener } from '@/lib/realtimeSync'

interface SidebarProps {
  profile: Profile
  navItems: { href: string; label: string; icon: React.ElementType; section?: string }[]
  onSignOut: () => void
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ profile, navItems, onSignOut, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  // Group by section
  const sections: Record<string, typeof navItems> = {}
  navItems.forEach(item => {
    const key = item.section || ''
    if (!sections[key]) sections[key] = []
    sections[key].push(item)
  })

  const content = (
    <aside className="sidebar flex flex-col h-full bg-slate-900 text-slate-200">
      {/* Logo Header */}
      <div className="sidebar-logo p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="text-white font-bold text-base leading-none">SEHAT-LINK</div>
            <div className="text-[11px] font-medium mt-1 text-slate-400">
              {ROLE_LABELS[profile.role]}
            </div>
          </div>
        </div>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav list */}
      <nav className="sidebar-nav flex-1 p-3 overflow-y-auto space-y-4">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section} className="space-y-1">
            {section && (
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {section}
              </p>
            )}
            {items.map(item => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose?.()}
                  className={cn(
                    'sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px]',
                    isActive
                      ? 'bg-blue-600/20 text-blue-300 border-l-4 border-blue-500 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div
            className="avatar avatar-sm text-white flex-shrink-0 font-bold shadow"
            style={{ background: 'hsl(210, 100%, 45%)' }}
          >
            {getInitials(profile.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate leading-tight">{profile.full_name}</p>
            <p className="text-xs text-slate-400 truncate capitalize mt-0.5">
              {profile.role.replace('_', ' ')}
            </p>
          </div>
          <button
            onClick={onSignOut}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0 sticky top-0 h-screen">
        {content}
      </div>

      {/* Mobile Drawer Slide-over */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-slide-in">
            {content}
          </div>
        </div>
      )}
    </>
  )
}

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  profile: Profile
  onSignOut: () => void
  onToggleMobileMenu?: () => void
}

export function Topbar({ title, subtitle, actions, profile, onSignOut, onToggleMobileMenu }: TopbarProps) {
  useEffect(() => {
    const cleanup = initGlobalRealtimeListener()
    return () => {
      cleanup()
    }
  }, [])

  return (
    <header className="dashboard-topbar bg-white border-b border-gray-200 px-4 md:px-6 h-16 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu hamburger toggle */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base md:text-lg font-bold text-gray-900 truncate leading-tight">{title}</h1>
            <span className="badge bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1 border border-emerald-200/60 hidden sm:inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              LIVE REALTIME
            </span>
          </div>
          {subtitle && <p className="text-xs text-gray-500 truncate mt-0.5 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {actions}
        <button
          className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          title="Realtime Notifications Active"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div
            className="avatar avatar-sm text-white font-bold"
            style={{ background: 'hsl(210, 100%, 45%)', fontSize: '0.7rem' }}
          >
            {getInitials(profile.full_name)}
          </div>
          <button
            onClick={onSignOut}
            className="text-xs md:text-sm font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1"
          >
            <span className="hidden sm:inline">{profile.full_name.split(' ')[0]}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}

export function DashboardShell({
  profile,
  navItems,
  onSignOut,
  title,
  subtitle,
  actions,
  children
}: {
  profile: Profile
  navItems: { href: string; label: string; icon: React.ElementType; section?: string }[]
  onSignOut: () => void
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="dashboard-layout flex min-h-screen bg-gray-50">
      <Sidebar
        profile={profile}
        navItems={navItems}
        onSignOut={onSignOut}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="dashboard-main flex-1 min-w-0 flex flex-col">
        <Topbar
          title={title}
          subtitle={subtitle}
          profile={profile}
          onSignOut={onSignOut}
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
          actions={actions}
        />
        <main className="dashboard-content flex-1 p-3 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
