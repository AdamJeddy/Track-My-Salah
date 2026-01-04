import localforage from 'localforage';

export type NotificationSettings = {
  enabled: boolean;
  time: string; // HH:mm 24h
};

const SETTINGS_KEY = 'notification_settings';
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  time: '21:00',
};

let reminderTimeout: number | null = null;

function getNextDelayMs(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours ?? 21, minutes ?? 0, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
}

function clearScheduledReminder() {
  if (reminderTimeout !== null) {
    window.clearTimeout(reminderTimeout);
    reminderTimeout = null;
  }
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const stored = await localforage.getItem<NotificationSettings>(SETTINGS_KEY);
  if (!stored) return DEFAULT_SETTINGS;
  return {
    enabled: stored.enabled ?? DEFAULT_SETTINGS.enabled,
    time: stored.time || DEFAULT_SETTINGS.time,
  };
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await localforage.setItem(SETTINGS_KEY, settings);
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'default') {
    return Notification.requestPermission();
  }
  return Notification.permission;
}

async function showReminder(registration: ServiceWorkerRegistration) {
  try {
    await registration.showNotification('Daily reminder', {
      body: 'Log your prayers for today.',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'daily-prayer-reminder',
    });
  } catch (error) {
    console.error('Notification show failed:', error);
  }
}

export async function applyNotificationScheduler(settings: NotificationSettings): Promise<void> {
  clearScheduledReminder();

  if (!settings.enabled) return;
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  if (!('serviceWorker' in navigator)) return;
  if (Notification.permission !== 'granted') return;

  const registration = await navigator.serviceWorker.ready;

  const scheduleNext = () => {
    const delay = getNextDelayMs(settings.time);
    reminderTimeout = window.setTimeout(async () => {
      await showReminder(registration);
      scheduleNext();
    }, delay);
  };

  scheduleNext();
}

// Convenience helper to update settings and scheduler together
export async function updateNotificationSettings(settings: NotificationSettings): Promise<void> {
  await saveNotificationSettings(settings);
  await applyNotificationScheduler(settings);
}
