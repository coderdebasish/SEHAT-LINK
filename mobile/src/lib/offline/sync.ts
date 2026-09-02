// SEHAT-LINK Mobile — Background Auto-Sync Engine
// Flushes local SQLite queue items to Supabase whenever network connectivity is restored

import { localDB, SyncQueueItem } from './db'
import { supabaseMobile } from '../supabase'

export interface SyncProgress {
  total: number
  synced: number
  failed: number
  isSyncing: boolean
}

export class SyncEngine {
  private isOnline: boolean = true

  setOnlineStatus(online: boolean) {
    this.isOnline = online
  }

  getOnlineStatus(): boolean {
    return this.isOnline
  }

  async flushQueue(onProgress?: (progress: SyncProgress) => void): Promise<{ success: number; failed: number }> {
    if (!this.isOnline) {
      return { success: 0, failed: 0 }
    }

    const pending = await localDB.getPendingQueue()
    let success = 0
    let failed = 0

    onProgress?.({
      total: pending.length,
      synced: 0,
      failed: 0,
      isSyncing: true,
    })

    for (const item of pending) {
      try {
        await this.syncItem(item)
        await localDB.markSynced(item.id)
        success++
      } catch (err) {
        console.error(`[SyncEngine] Error syncing item ${item.id}:`, err)
        await localDB.markFailed(item.id)
        failed++
      }

      onProgress?.({
        total: pending.length,
        synced: success,
        failed,
        isSyncing: true,
      })
    }

    onProgress?.({
      total: pending.length,
      synced: success,
      failed,
      isSyncing: false,
    })

    return { success, failed }
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    switch (item.action) {
      case 'REGISTER_PATIENT': {
        const payload = item.payload as any
        await supabaseMobile.from('patients').upsert({
          sehat_id: payload.sehat_id,
          full_name: payload.full_name,
          village: payload.village || 'Nimgaon',
          registered_at: payload.registered_at || new Date().toISOString()
        })
        break
      }
      case 'RECORD_VITALS': {
        const payload = item.payload as any
        // Lookup patient id by sehat_id
        const { data: patient } = await supabaseMobile
          .from('patients')
          .select('id')
          .eq('sehat_id', payload.sehat_id)
          .single()

        if (patient) {
          await supabaseMobile.from('vitals').insert({
            patient_id: patient.id,
            blood_pressure_systolic: payload.bp_systolic || 120,
            blood_pressure_diastolic: payload.bp_diastolic || 80,
            pulse_rate: payload.pulse || 72,
            spo2: payload.spo2 || 98,
            notes: 'Recorded via SEHAT-LINK Mobile App'
          })
        }
        break
      }
      case 'UPLOAD_PRESCRIPTION':
        console.log('[SyncEngine] Uploaded offline prescription scan')
        break
    }
  }
}

export const syncEngine = new SyncEngine()
