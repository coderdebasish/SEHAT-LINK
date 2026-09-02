'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Bell, ChevronDown, Heart, Zap } from 'lucide-react'
import { cn, getInitials, ROLE_LABELS, ROLE_COLORS } from '@/lib/utils'
import type { Profile } from '@sehat-link/types'
import { initGlobalRealtimeListener } from '@/lib/realtimeSync'

interface SidebarProps {
  profile: Profile
  navItems: { href: string; label: string; icon: React.ElementType; section?: string }[]
  onSignOut: () => void
}

export function Sidebar({ profile, navItems, onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const roleColor = ROLE_COLORS[profile.role] || ROLE_COLORS.patient

  // Group by section
  const sections: Record<string, typeof navItems> = {}
  navItems.forEach(item => {
    const key = item.section || ''
    if (!sections[key]) sections[key] = []
    sections[key].push(item)
  })

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <div className="text-white font-bold text-base leading-none">SEHAT-LINK</div>
            <div className="text-[11px] mt-0.5" style={{ color: 'hsl(214 30% 55%)' }}>
              {ROLE_LABELS[profile.role]}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section}>
            {section && <p className="sidebar-section-label">{section}</p>}
            {items.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn('sidebar-link', isActive && 'active')}
                >
                  <item.icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t" style={{ borderColor: 'hsl(215 25% 18%)' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div
            className={cn('avatar avatar-sm text-white flex-shrink-0')}
            style={{ background: 'hsl(210, 100%, 45%)' }}
          >
            {getInitials(profile.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile.full_name}</p>
            <p className="text-xs truncate" style={{ color: 'hsl(214 30% 55%)' }}>
              {profile.role.replace('_', ' ')}
            </p>
          </div>
          <button
            onClick={onSignOut}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors flex-shrink-0"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </aside>
  )
}

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  profile: Profile
  onSignOut: () => void
}

export function Topbar({ title, subtitle, actions, profile, onSignOut }: TopbarProps) {
  useEffect(() => {
    const cleanup = initGlobalRealtimeListener()
    return () => {
      cleanup()
    }
  }, [])

  return (
    <header className="dashboard-topbar">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-gray-900 leading-none">{title}</h1>
          <span className="badge bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1 border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            LIVE REALTIME
          </span>
        </div>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Realtime Notifications Active">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div
            className="avatar avatar-sm text-white"
            style={{ background: 'hsl(210, 100%, 45%)', fontSize: '0.7rem' }}
          >
            {getInitials(profile.full_name)}
          </div>
          <button onClick={onSignOut} className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
            {profile.full_name.split(' ')[0]}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
