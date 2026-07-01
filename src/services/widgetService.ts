import { Capacitor, registerPlugin } from '@capacitor/core';
import { PRAYER_NAMES, type PrayerName, type PrayerStatus } from '../models/PrayerRecord';
import { getTodayGregorian } from '../utils/dateUtils';
import { getRecordsByDate, saveRecord } from './localStorageService';

interface PrayerWidgetPlugin {
  updateWidgetData(options: { date: string; prayers: Record<string, string | null> }): Promise<void>;
  getWidgetData(): Promise<{ hasData: boolean; date?: string; prayers?: Record<string, string>; lastModified?: number }>;
  openWidgetPicker(): Promise<void>;
}

const PrayerWidget = registerPlugin<PrayerWidgetPlugin>('PrayerWidget');

/**
 * Push today's prayer statuses to the widget SharedPreferences.
 */
export async function pushTodayToWidget(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const today = getTodayGregorian();
  const records = await getRecordsByDate(today);

  const prayers: Record<string, string | null> = {};
  for (const name of PRAYER_NAMES) {
    prayers[name] = null;
  }
  for (const record of records) {
    prayers[record.prayer_name] = record.status;
  }

  try {
    await PrayerWidget.updateWidgetData({
      date: today,
      prayers,
    });
  } catch (e) {
    console.error('Failed to push widget data:', e);
  }
}

/**
 * Pull widget data and sync any prayers logged via the widget into localforage.
 */
export async function syncWidgetData(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const data = await PrayerWidget.getWidgetData();
    if (!data.hasData || !data.prayers || !data.date) return;

    const today = getTodayGregorian();
    if (data.date !== today) return; // only import today's data

    // Merge widget-logged prayers into localforage
    const existingRecords = await getRecordsByDate(today);
    const existingMap = new Map<PrayerName, PrayerStatus>();
    for (const r of existingRecords) {
      existingMap.set(r.prayer_name, r.status);
    }

    for (const name of PRAYER_NAMES) {
      const widgetStatus = data.prayers[name];
      if (widgetStatus && !existingMap.has(name)) {
        // Prayer was logged via widget but not yet in localforage
        await saveRecord(today, name, widgetStatus as PrayerStatus, 'Logged from widget');
      }
    }
  } catch (e) {
    console.error('Failed to sync widget data:', e);
  }
}

/**
 * Open the system widget picker to let the user add the widget.
 */
export async function openWidgetPicker(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await PrayerWidget.openWidgetPicker();
  } catch (e) {
    console.error('Failed to open widget picker:', e);
  }
}
