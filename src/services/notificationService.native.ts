import { LocalNotifications, type ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import localforage from 'localforage';
import { getAllRecords } from './localStorageService';
import { buildNotificationInsight } from '../utils/notificationInsights';
import {
  normalizeNotificationSettings,
  type NotificationSettings,
} from './notificationSettings';

export type { NotificationSettings } from './notificationSettings';

const SETTINGS_KEY = 'notification_settings';
const DAILY_ID = 1;
const WEEKLY_ID = 2;
const MONTHLY_ID = 3;

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const stored = await localforage.getItem<Partial<NotificationSettings>>(SETTINGS_KEY);
  return normalizeNotificationSettings(stored);
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

/** Compute the next occurrence of a target day-of-week (0=Sun, 6=Sat) at the given hour/minute. */
function getNextWeekdayDate(weekday: number, hour: number, minute: number): Date {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);

  const daysUntil = (weekday - now.getDay() + 7) % 7;
  if (daysUntil === 0 && target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 7);
  } else {
    target.setDate(target.getDate() + daysUntil);
  }
  return target;
}

/** Compute the next 1st of the month at the given hour/minute. */
function getNextFirstOfMonth(hour: number, minute: number): Date {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), 1, hour, minute, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setMonth(target.getMonth() + 1);
  }
  return target;
}

async function buildSummaryBody(period: 'weekly' | 'monthly'): Promise<string | null> {
  const records = await getAllRecords();
  if (records.length === 0) return null;
  return buildNotificationInsight(records, period);
}

export async function applyNotificationScheduler(settings: NotificationSettings): Promise<void> {
  // Cancel all existing scheduled notifications
  await LocalNotifications.cancel({
    notifications: [{ id: DAILY_ID }, { id: WEEKLY_ID }, { id: MONTHLY_ID }],
  });

  if (!Capacitor.isNativePlatform()) return;

  const permission = await LocalNotifications.checkPermissions();
  if (permission.display !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  const [hours, minutes] = settings.time.split(':').map(Number);
  const h = hours ?? 21;
  const m = minutes ?? 0;

  const notifications: ScheduleOptions['notifications'] = [];

  // Daily reminder
  if (settings.enabled) {
    notifications.push({
      id: DAILY_ID,
      title: 'Daily reminder',
      body: 'Log your prayers for today.',
      schedule: { on: { hour: h, minute: m }, allowWhileIdle: true },
      sound: undefined,
      smallIcon: 'ic_stat_icon_notification',
    });
  }

  // Weekly summary (Friday)
  if (settings.weeklySummaryEnabled) {
    const weeklyBody = (await buildSummaryBody('weekly')) || 'Your weekly prayer insight is ready. Open the app to view it.';
    const nextFriday = getNextWeekdayDate(5, h, m); // 5 = Friday
    notifications.push({
      id: WEEKLY_ID,
      title: 'Weekly prayer insight',
      body: weeklyBody,
      schedule: { at: nextFriday, allowWhileIdle: true },
      sound: undefined,
      smallIcon: 'ic_stat_icon_notification',
    });
  }

  // Monthly summary (1st of month)
  if (settings.monthlySummaryEnabled) {
    const monthlyBody = (await buildSummaryBody('monthly')) || 'Your monthly prayer insight is ready. Open the app to view it.';
    const nextFirst = getNextFirstOfMonth(h, m);
    notifications.push({
      id: MONTHLY_ID,
      title: 'Monthly prayer insight',
      body: monthlyBody,
      schedule: { at: nextFirst, allowWhileIdle: true },
      sound: undefined,
      smallIcon: 'ic_stat_icon_notification',
    });
  }

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }
}

export async function updateNotificationSettings(settings: NotificationSettings): Promise<void> {
  await saveNotificationSettings(settings);
  await applyNotificationScheduler(settings);
}
