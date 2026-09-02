import { createClient } from '@/lib/supabase/client'

const SYNC_EVENT_NAME = 'sehat-global-sync'
let broadcastChannel: BroadcastChannel | null = null

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('sehat-global-sync-channel')
    broadcastChannel.onmessage = (event) => {
      window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail: event.data }))
    }
  } catch (e) {
    console.warn('BroadcastChannel initialization:', e)
  }
}

/**
 * Triggers a global zero-refresh real-time sync across all open browser windows and tabs
 */
export function triggerGlobalSync(detail?: any) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail }))
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(detail || { timestamp: Date.now() })
    } catch (e) {
      console.warn('BroadcastChannel postMessage:', e)
    }
  }
  try {
    localStorage.setItem('sehat_last_sync_timestamp', Date.now().toString())
  } catch (e) {
    // ignore
  }
}

/**
 * Subscribe a page component to instant zero-refresh updates
 */
export function subscribeGlobalSync(callback: () => void) {
  if (typeof window === 'undefined') return () => {}

  const handler = () => callback()
  window.addEventListener(SYNC_EVENT_NAME, handler)
  window.addEventListener('storage', handler)
  window.addEventListener('sehat-rx-updated', handler)

  return () => {
    window.removeEventListener(SYNC_EVENT_NAME, handler)
    window.removeEventListener('storage', handler)
    window.removeEventListener('sehat-rx-updated', handler)
  }
}

/**
 * Initializes global Supabase WebSocket listener for the entire application
 */
export function initGlobalRealtimeListener() {
  if (typeof window === 'undefined') return () => {}

  const supabase = createClient()
  const channel = supabase.channel('sehat-app-realtime-global')
    .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
      triggerGlobalSync(payload)
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
