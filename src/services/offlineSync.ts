// Offline Synchronization Engine for An Tâm
// Queues meditation sessions, gratitude journals, and zen garden growth locally
// and auto-syncs with server via POST /api/sync/offline-batch when online

export interface QueuedSession {
  id: string;
  minutes: number;
  trackId?: string;
  timestamp: string;
}

export interface QueuedJournal {
  id: string;
  title: string;
  content: string;
  mood: string;
  gratitudeItems: string[];
  createdAt: string;
}

export interface QueuedWater {
  id: string;
  plantId: string;
  drops: number;
  timestamp: string;
}

interface OfflineQueueData {
  sessions: QueuedSession[];
  journals: QueuedJournal[];
  waters: QueuedWater[];
  lastSync?: string;
}

const STORAGE_KEY = 'antam_offline_queue';

class OfflineSyncEngine {
  private queue: OfflineQueueData = { sessions: [], journals: [], waters: [] };
  private isSyncing = false;
  private listeners: Array<(pendingCount: number, isOnline: boolean) => void> = [];

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.notifyListeners();
        this.syncNow();
      });
      window.addEventListener('offline', () => {
        this.notifyListeners();
      });
    }
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.queue = JSON.parse(data);
      }
    } catch (e) {
      this.queue = { sessions: [], journals: [], waters: [] };
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (e) {}
  }

  public subscribe(cb: (pendingCount: number, isOnline: boolean) => void) {
    this.listeners.push(cb);
    cb(this.getPendingCount(), typeof navigator !== 'undefined' ? navigator.onLine : true);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notifyListeners() {
    const count = this.getPendingCount();
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.listeners.forEach(cb => cb(count, isOnline));
  }

  public getPendingCount(): number {
    return (
      (this.queue.sessions?.length || 0) +
      (this.queue.journals?.length || 0) +
      (this.queue.waters?.length || 0)
    );
  }

  public queueSession(minutes: number, trackId?: string) {
    this.queue.sessions.push({
      id: 'qs_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      minutes,
      trackId,
      timestamp: new Date().toISOString()
    });
    this.saveToStorage();
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.syncNow();
    }
  }

  public queueJournal(journal: { title: string; content: string; mood: string; gratitudeItems: string[] }) {
    this.queue.journals.push({
      id: 'qj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      ...journal,
      createdAt: new Date().toISOString()
    });
    this.saveToStorage();
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.syncNow();
    }
  }

  public queueGardenWater(plantId: string, drops: number) {
    this.queue.waters.push({
      id: 'qw_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      plantId,
      drops,
      timestamp: new Date().toISOString()
    });
    this.saveToStorage();
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.syncNow();
    }
  }

  public async syncNow(): Promise<{ synced: number; success: boolean }> {
    if (this.isSyncing) return { synced: 0, success: false };
    if (this.getPendingCount() === 0) return { synced: 0, success: true };
    if (typeof navigator !== 'undefined' && !navigator.onLine) return { synced: 0, success: false };

    this.isSyncing = true;
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('antam_token') : null;

    try {
      const payload = {
        sessions: this.queue.sessions,
        journals: this.queue.journals,
        gardenWaters: this.queue.waters
      };

      const res = await fetch('/api/sync/offline-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const syncedCount = this.getPendingCount();
        this.queue = { sessions: [], journals: [], waters: [], lastSync: new Date().toISOString() };
        this.saveToStorage();
        this.isSyncing = false;
        return { synced: syncedCount, success: true };
      }
    } catch (e) {
      // Offline network error - items safely kept in queue
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }

    return { synced: 0, success: false };
  }
}

export const offlineSync = new OfflineSyncEngine();
