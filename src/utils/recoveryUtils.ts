import type { PrayerName, PrayerRecord } from '../models/PrayerRecord';
import { PRAYER_NAMES } from '../models/PrayerRecord';
import { getTodayGregorian } from './dateUtils';
import { getPrayerInsights } from './statsUtils';

export interface RecoveryGuidance {
  breakDate: string;
  nextPrayer: PrayerName | null;
  message: string;
}

export function getRecoveryGuidance(
  records: PrayerRecord[],
  today = getTodayGregorian(),
): RecoveryGuidance | null {
  const insights = getPrayerInsights(records, today);
  if (insights.currentStreak > 0 || !insights.lastBreak) return null;

  const todayByPrayer = new Map(
    records
      .filter((record) => record.gregorian_date === today)
      .map((record) => [record.prayer_name, record.status]),
  );
  const nextPrayer = PRAYER_NAMES.find((prayer) => {
    const status = todayByPrayer.get(prayer);
    return status === undefined || status === null;
  }) ?? null;

  return {
    breakDate: insights.lastBreak.date,
    nextPrayer,
    message: nextPrayer
      ? `Focus on ${nextPrayer} next. One prayer at a time.`
      : 'Today is fully logged. Tomorrow is another opportunity.',
  };
}
