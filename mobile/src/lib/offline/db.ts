// SEHAT-LINK Mobile — Offline SQLite Local Database Manager
// Enables zero-network data collection for village health workers in remote Maharashtra areas

export interface SyncQueueItem {
  id: string
  action: 'REGISTER_PATIENT' | 'RECORD_VITALS' | 'UPLOAD_PRESCRIPTION'
  payload: Record<string, unknown>
  createdAt: string
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED'
  retryCount: number
}

// In-memory + SQLite fallback queue simulator for mobile runtime
class LocalDB {
  private queue: SyncQueueItem[] = [
    {
      id: 'sq-101',
      action: 'RECORD_VITALS',
      payload: {
        sehat_id: 'SL-MH-2026-000001',
        bp_systolic: 128,
        bp_diastolic: 84,
        pulse: 76,
        spo2: 98,
        temp_f: 98.6,
        random_blood_sugar: 110,
        recorded_by: 'hw-meena-patil',
        recorded_at: new Date(Date.now() - 3600000).toISOString(),
      },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'PENDING',
      retryCount: 0,
    },
    {
      id: 'sq-102',
      action: 'REGISTER_PATIENT',
      payload: {
        full_name: 'Shantaram Maruti Shinde',
        dob: '1968-04-12',
        gender: 'male',
        blood_group: 'O+',
        phone: '9822345678',
        district: 'Pune',
        taluka: 'Khed',
        village: 'Nimgaon',
        registered_by_hw: 'hw-meena-patil',
      },
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      status: 'PENDING',
      retryCount: 0,
    },
  ]

  async getPendingQueue(): Promise<SyncQueueItem[]> {
    return this.queue.filter(item => item.status === 'PENDING')
  }

  async getAllQueue(): Promise<SyncQueueItem[]> {
    return [...this.queue]
  }

  async enqueue(action: SyncQueueItem['action'], payload: Record<string, unknown>): Promise<SyncQueueItem> {
    const item: SyncQueueItem = {
      id: `sq-${Date.now()}`,
      action,
      payload,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      retryCount: 0,
    }
    this.queue.push(item)
    return item
  }

  async markSynced(id: string): Promise<void> {
    const item = this.queue.find(q => q.id === id)
    if (item) {
      item.status = 'SYNCED'
    }
  }

  async markFailed(id: string): Promise<void> {
    const item = this.queue.find(q => q.id === id)
    if (item) {
      item.status = 'FAILED'
      item.retryCount += 1
    }
  }
}

export const localDB = new LocalDB()
