import { LocalNotifications, type ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
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

const NOTIFICATION_ID = 1;

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

export async function requestNotificationPermission(): Promise<NotificationPermission | 'granted' | 'denied'> {
  if (!Capacitor.isNativePlatform()) {
    return 'denied';
  }
  const result = await LocalNotifications.requestPermissions();
  return result.display === 'granted' ? 'granted' : 'denied';
}

export async function applyNotificationScheduler(settings: NotificationSettings): Promise<void> {
  // Cancel existing scheduled notification
  await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });

  if (!settings.enabled) return;
  if (!Capacitor.isNativePlatform()) return;

  const permission = await LocalNotifications.checkPermissions();
  if (permission.display !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  const [hours, minutes] = settings.time.split(':').map(Number);

  const schedule: ScheduleOptions = {
    notifications: [
      {
        id: NOTIFICATION_ID,
        title: 'Daily reminder',
        body: 'Log your prayers for today.',
        schedule: {
          on: {
            hour: hours ?? 21,
            minute: minutes ?? 0,
          },
          allowWhileIdle: true,
        },
        sound: undefined,
        smallIcon: 'ic_stat_icon_notification',
      },
    ],
  };

  await LocalNotifications.schedule(schedule);
}

export async function updateNotificationSettings(settings: NotificationSettings): Promise<void> {
  await saveNotificationSettings(settings);
  await applyNotificationScheduler(settings);
}
