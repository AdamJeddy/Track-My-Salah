import localforage from 'localforage';
import { getAllRecords } from './localStorageService';
import { getPeriodSummary } from '../utils/statsUtils';
import { addDays, getTodayGregorian } from '../utils/dateUtils';

export type NotificationSettings = {
  enabled: boolean;
  time: string; // HH:mm 24h
  weeklySummaryEnabled: boolean;
  monthlySummaryEnabled: boolean;
};

const SETTINGS_KEY = 'notification_settings';
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  time: '21:00',
  weeklySummaryEnabled: true,
  monthlySummaryEnabled: true,
};

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const stored = await localforage.getItem<NotificationSettings>(SETTINGS_KEY);
  if (!stored) return DEFAULT_SETTINGS;
  return {
    enabled: stored.enabled ?? DEFAULT_SETTINGS.enabled,
    time: stored.time || DEFAULT_SETTINGS.time,
    weeklySummaryEnabled: stored.weeklySummaryEnabled ?? DEFAULT_SETTINGS.weeklySummaryEnabled,
    monthlySummaryEnabled: stored.monthlySummaryEnabled ?? DEFAULT_SETTINGS.monthlySummaryEnabled,
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

let dailyTimeout: number | null = null;
let weeklyTimeout: number | null = null;
let monthlyTimeout: number | null = null;

function clearAllTimeouts() {
  [dailyTimeout, weeklyTimeout, monthlyTimeout].forEach((t) => {
    if (t !== null) window.clearTimeout(t);
  });
  dailyTimeout = null;
  weeklyTimeout = null;
  monthlyTimeout = null;
}

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

function getMsUntilNextFriday(h: number, m: number): number {
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  const daysUntil = (5 - now.getDay() + 7) % 7; // 5 = Friday
  if (daysUntil === 0 && target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 7);
  } else {
    target.setDate(target.getDate() + daysUntil);
  }
  return target.getTime() - now.getTime();
}

function getMsUntilNextFirstOfMonth(h: number, m: number): number {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), 1, h, m, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setMonth(target.getMonth() + 1);
  }
  return target.getTime() - now.getTime();
}

function formatPercent(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

async function buildSummaryBody(period: 'weekly' | 'monthly'): Promise<string | null> {
  const records = await getAllRecords();
  if (records.length === 0) return null;

  const today = getTodayGregorian();

  let startDate: string;
  let endDate: string;
  let label: string;

  if (period === 'weekly') {
    endDate = addDays(today, -1);
    startDate = addDays(today, -7);
    label = 'This week';
  } else {
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = prevMonth.getFullYear();
    const month = prevMonth.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
    label = 'Last month';
  }

  const summary = getPeriodSummary(records, startDate, endDate);
  if (summary.totalPossible === 0) return null;

  const jamahPct = formatPercent(summary.jamah, summary.totalPossible);
  const onTimePct = formatPercent(summary.onTime, summary.totalPossible);

  return `${label}: ${summary.jamah} Jamah (${jamahPct}%), ${summary.onTime} on time (${onTimePct}%)`;
}

async function showReminder(registration: ServiceWorkerRegistration) {
  try {
    await registration.showNotification('Daily reminder', {
      body: 'Log your prayers for today.',
      icon: '/android-chrome-192x192.png',
      badge: '/android-chrome-192x192.png',
      tag: 'daily-prayer-reminder',
    });
  } catch (error) {
    console.error('Notification show failed:', error);
  }
}

async function showSummaryNotification(
  registration: ServiceWorkerRegistration,
  period: 'weekly' | 'monthly',
) {
  try {
    const body = (await buildSummaryBody(period))
      || 'Your prayer summary is ready. Open the app to view it.';
    const title = period === 'weekly' ? 'Weekly prayer summary' : 'Monthly prayer summary';
    await registration.showNotification(title, {
      body,
      icon: '/android-chrome-192x192.png',
      badge: '/android-chrome-192x192.png',
      tag: `${period}-prayer-summary`,
    });
  } catch (error) {
    console.error('Summary notification failed:', error);
  }
}

export async function applyNotificationScheduler(settings: NotificationSettings): Promise<void> {
  clearAllTimeouts();

  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  if (!('serviceWorker' in navigator)) return;
  if (Notification.permission !== 'granted') return;

  const [hours, minutes] = settings.time.split(':').map(Number);
  const h = hours ?? 21;
  const m = minutes ?? 0;

  const registration = await navigator.serviceWorker.ready;

  // Daily reminder
  if (settings.enabled) {
    const scheduleDaily = () => {
      const delay = getNextDelayMs(settings.time);
      dailyTimeout = window.setTimeout(async () => {
        await showReminder(registration);
        scheduleDaily();
      }, delay);
    };
    scheduleDaily();
  }

  // Weekly summary (Friday)
  if (settings.weeklySummaryEnabled) {
    const scheduleWeekly = () => {
      const delay = getMsUntilNextFriday(h, m);
      weeklyTimeout = window.setTimeout(async () => {
        await showSummaryNotification(registration, 'weekly');
        scheduleWeekly();
      }, delay);
    };
    scheduleWeekly();
  }

  // Monthly summary (1st of month)
  if (settings.monthlySummaryEnabled) {
    const scheduleMonthly = () => {
      const delay = getMsUntilNextFirstOfMonth(h, m);
      monthlyTimeout = window.setTimeout(async () => {
        await showSummaryNotification(registration, 'monthly');
        scheduleMonthly();
      }, delay);
    };
    scheduleMonthly();
  }
}

export async function updateNotificationSettings(settings: NotificationSettings): Promise<void> {
  await saveNotificationSettings(settings);
  await applyNotificationScheduler(settings);
}
