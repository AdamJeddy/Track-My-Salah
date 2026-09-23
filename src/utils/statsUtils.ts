import { PrayerRecord, PRAYER_NAMES, PrayerName } from '../models/PrayerRecord';
import { addDays, getTodayGregorian, gregorianToHijri } from './dateUtils';

export interface TimelineDayStats {
  date: string;
  hijriDate: string;
  prayed: number;
  jamah: number;
  missed: number;
  excused: number;
  qada: number;
  total: number;
  completed: number;
  unrecorded: number;
  prayersLogged: Set<PrayerName>;
  hasAnyRecord: boolean;
  isSkipped: boolean;
}

export interface TrackingRange {
  startDate: string;
  endDate: string;
}

function createEmptyDay(date: string): TimelineDayStats {
  return {
    date,
    hijriDate: gregorianToHijri(date),
    prayed: 0,
    jamah: 0,
    missed: 0,
    excused: 0,
    qada: 0,
    total: 0,
    completed: 0,
    unrecorded: 0,
    prayersLogged: new Set<PrayerName>(),
    hasAnyRecord: false,
    isSkipped: false,
  };
}

export function getFirstRecordDate(records: PrayerRecord[]): string | null {
  if (records.length === 0) {
    return null;
  }

  return records.reduce((earliest, record) => (
    record.gregorian_date < earliest ? record.gregorian_date : earliest
  ), records[0].gregorian_date);
}

export function getTrackingRange(records: PrayerRecord[]): TrackingRange | null {
  const startDate = getFirstRecordDate(records);
  if (!startDate) {
    return null;
  }

  const endDate = getTodayGregorian();
  if (startDate > endDate) {
    return null;
  }

  return {
    startDate,
    endDate,
  };
}

export function buildTimelineDayMap(records: PrayerRecord[]): Map<string, TimelineDayStats> {
  const range = getTrackingRange(records);
  const dayMap = new Map<string, TimelineDayStats>();

  if (!range) {
    return dayMap;
  }

  let cursor = range.startDate;
  while (cursor <= range.endDate) {
    dayMap.set(cursor, createEmptyDay(cursor));
    cursor = addDays(cursor, 1);
  }

  records
    .filter((record) => record.gregorian_date <= range.endDate)
    .forEach((record) => {
      const day = dayMap.get(record.gregorian_date) ?? createEmptyDay(record.gregorian_date);

      day.hasAnyRecord = true;
      if (record.status !== null) day.prayersLogged.add(record.prayer_name);
      day.total++;

      if (record.hijri_date) {
        day.hijriDate = record.hijri_date;
      }

      if (record.status === 'Prayed') {
        day.prayed++;
        day.completed++;
      } else if (record.status === 'Jamah') {
        day.jamah++;
        day.completed++;
      } else if (record.status === 'Missed') {
        day.missed++;
      } else if (record.status === 'Excused') {
        day.excused++;
      } else if (record.status === 'Qada') {
        day.qada++;
        day.completed++;
      }

      dayMap.set(record.gregorian_date, day);
    });

  dayMap.forEach((day) => {
    day.isSkipped = !day.hasAnyRecord && day.date >= range.startDate && day.date < range.endDate;
    // Today's remaining prayers are still pending, not missed.
    day.unrecorded = day.date === getTodayGregorian()
      ? 0
      : Math.max(PRAYER_NAMES.length - day.prayersLogged.size, 0);
  });

  return dayMap;
}

export function getTimelineDays(records: PrayerRecord[]): TimelineDayStats[] {
  return Array.from(buildTimelineDayMap(records).values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getMissingPrayerNames(day: TimelineDayStats): PrayerName[] {
  return PRAYER_NAMES.filter((prayer) => !day.prayersLogged.has(prayer));
}

export interface PeriodSummary {
  totalPossible: number;
  jamah: number;
  onTime: number;
}

export interface OnTimeRate {
  onTime: number;
  eligible: number;
  rate: number;
}

export interface PrayerPerformance extends OnTimeRate {
  prayer: PrayerName;
}

export interface PrayerInsights {
  currentStreak: number;
  bestStreak: number;
  rolling30Days: OnTimeRate;
  strongestPrayer: PrayerPerformance | null;
  focusPrayer: PrayerPerformance | null;
  sevenDayTrend: {
    current: OnTimeRate;
    previous: OnTimeRate;
    change: number | null;
  };
  lastBreak: {
    date: string;
    reasons: string[];
  } | null;
}

export type StreakDayState = 'on-time' | 'neutral' | 'break';

function toRate(onTime: number, eligible: number): OnTimeRate {
  return {
    onTime,
    eligible,
    rate: eligible > 0 ? Math.round((onTime / eligible) * 100) : 0,
  };
}

function recordsByDateAndPrayer(records: PrayerRecord[]): Map<string, Map<PrayerName, PrayerRecord>> {
  const result = new Map<string, Map<PrayerName, PrayerRecord>>();
  records.forEach((record) => {
    const day = result.get(record.gregorian_date) ?? new Map<PrayerName, PrayerRecord>();
    day.set(record.prayer_name, record);
    result.set(record.gregorian_date, day);
  });
  return result;
}

export function getStreakDayState(
  day: TimelineDayStats,
  today = getTodayGregorian(),
): StreakDayState {
  const totalRelevant = Math.max(PRAYER_NAMES.length - day.excused, 0);
  if (totalRelevant === 0) return 'neutral';

  const completedOnTime = day.prayed + day.jamah;
  if (completedOnTime === totalRelevant && day.missed === 0 && day.qada === 0 && day.unrecorded === 0) {
    return 'on-time';
  }

  const isPendingToday = day.date === today
    && day.missed === 0
    && day.qada === 0
    && day.prayersLogged.size < PRAYER_NAMES.length;
  return isPendingToday ? 'neutral' : 'break';
}

export function getOnTimeRate(
  records: PrayerRecord[],
  startDate: string,
  endDate: string,
  today = getTodayGregorian(),
): OnTimeRate {
  const firstRecordDate = getFirstRecordDate(records);
  const effectiveStart = firstRecordDate && firstRecordDate > startDate ? firstRecordDate : startDate;
  const effectiveEnd = endDate < today ? endDate : today;
  if (!firstRecordDate || effectiveStart > effectiveEnd) return toRate(0, 0);

  const indexedRecords = recordsByDateAndPrayer(records);
  let onTime = 0;
  let eligible = 0;

  for (let date = effectiveStart; date <= effectiveEnd; date = addDays(date, 1)) {
    const dayRecords = indexedRecords.get(date);
    PRAYER_NAMES.forEach((prayer) => {
      const record = dayRecords?.get(prayer);
      if (record?.status === 'Excused') return;
      if (date === today && (!record || record.status === null)) return;

      eligible++;
      if (record?.status === 'Prayed' || record?.status === 'Jamah') onTime++;
    });
  }

  return toRate(onTime, eligible);
}

function getPrayerPerformance(
  records: PrayerRecord[],
  startDate: string,
  endDate: string,
  today = getTodayGregorian(),
): PrayerPerformance[] {
  const indexedRecords = recordsByDateAndPrayer(records);
  const firstRecordDate = getFirstRecordDate(records);
  const effectiveStart = firstRecordDate && firstRecordDate > startDate ? firstRecordDate : startDate;
  const effectiveEnd = endDate < today ? endDate : today;
  if (!firstRecordDate || effectiveStart > effectiveEnd) return [];

  return PRAYER_NAMES.map((prayer) => {
    let onTime = 0;
    let eligible = 0;

    for (let date = effectiveStart; date <= effectiveEnd; date = addDays(date, 1)) {
      const record = indexedRecords.get(date)?.get(prayer);
      if (record?.status === 'Excused') continue;
      if (date === today && (!record || record.status === null)) continue;

      eligible++;
      if (record?.status === 'Prayed' || record?.status === 'Jamah') onTime++;
    }

    return { prayer, ...toRate(onTime, eligible) };
  }).filter((performance) => performance.eligible > 0);
}

function getBreakReasons(
  date: string,
  records: Map<string, Map<PrayerName, PrayerRecord>>,
): string[] {
  const dayRecords = records.get(date);
  return PRAYER_NAMES.flatMap((prayer) => {
    const status = dayRecords?.get(prayer)?.status;
    if (status === 'Missed') return [`${prayer} was missed`];
    if (status === 'Qada') return [`${prayer} was completed as Qada`];
    if (status === null || status === undefined) return [`${prayer} was unrecorded`];
    return [];
  });
}

export function getPrayerInsights(records: PrayerRecord[], today = getTodayGregorian()): PrayerInsights {
  const timeline = getTimelineDays(records);
  const indexedRecords = recordsByDateAndPrayer(records);
  let currentStreak = 0;
  let bestStreak = 0;
  let runningStreak = 0;

  timeline.forEach((day) => {
    const state = getStreakDayState(day, today);
    if (state === 'on-time') {
      runningStreak++;
      bestStreak = Math.max(bestStreak, runningStreak);
    } else if (state === 'break') {
      runningStreak = 0;
    }
  });

  for (let index = timeline.length - 1; index >= 0; index--) {
    const state = getStreakDayState(timeline[index], today);
    if (state === 'on-time') currentStreak++;
    if (state === 'break') break;
  }

  const lastBreakDay = [...timeline].reverse().find((day) => getStreakDayState(day, today) === 'break');
  const rollingStart = addDays(today, -29);
  const performance = getPrayerPerformance(records, rollingStart, today, today);
  const strongestPrayer = [...performance].sort((a, b) => b.rate - a.rate)[0] ?? null;
  const weakestPrayer = [...performance].sort((a, b) => a.rate - b.rate)[0] ?? null;
  const focusPrayer = strongestPrayer && weakestPrayer && weakestPrayer.rate < strongestPrayer.rate
    ? weakestPrayer
    : null;
  const currentSevenDays = getOnTimeRate(records, addDays(today, -7), addDays(today, -1), today);
  const previousSevenDays = getOnTimeRate(records, addDays(today, -14), addDays(today, -8), today);

  return {
    currentStreak,
    bestStreak,
    rolling30Days: getOnTimeRate(records, rollingStart, today, today),
    strongestPrayer,
    focusPrayer,
    sevenDayTrend: {
      current: currentSevenDays,
      previous: previousSevenDays,
      change: currentSevenDays.eligible > 0 && previousSevenDays.eligible > 0
        ? currentSevenDays.rate - previousSevenDays.rate
        : null,
    },
    lastBreak: lastBreakDay
      ? { date: lastBreakDay.date, reasons: getBreakReasons(lastBreakDay.date, indexedRecords) }
      : null,
  };
}

export function buildInsightSummary(
  records: PrayerRecord[],
  startDate: string,
  endDate: string,
  comparisonStartDate: string,
  comparisonEndDate: string,
  label: string,
  today = getTodayGregorian(),
): string | null {
  const period = getOnTimeRate(records, startDate, endDate, today);
  if (period.eligible === 0) return null;

  const strongest = [...getPrayerPerformance(records, startDate, endDate, today)]
    .sort((a, b) => b.rate - a.rate)[0];
  const comparison = getOnTimeRate(records, comparisonStartDate, comparisonEndDate, today);
  const trend = comparison.eligible > 0 ? period.rate - comparison.rate : null;
  const trendUnit = Math.abs(trend ?? 0) === 1 ? 'point' : 'points';
  const trendText = trend === null
    ? ''
    : trend > 0
      ? ` Up ${trend} ${trendUnit}.`
      : trend < 0
        ? ` Down ${Math.abs(trend)} ${trendUnit}.`
        : ' Holding steady.';
  const strongestText = strongest ? ` Strongest: ${strongest.prayer} at ${strongest.rate}%.` : '';

  return `${label}: ${period.onTime}/${period.eligible} on time (${period.rate}%).${strongestText}${trendText}`;
}

/**
 * Compute prayer summary for a date range (inclusive).
 * totalPossible = 5 prayers × number of days in range.
 * jamah = prayers marked Jamah.
 * onTime = Jamah + Prayed (prayers done on time, excluding Qada).
 */
export function getPeriodSummary(records: PrayerRecord[], startDate: string, endDate: string): PeriodSummary {
  const rangeRecords = records.filter(
    (r) => r.gregorian_date >= startDate && r.gregorian_date <= endDate,
  );

  let jamah = 0;
  let onTime = 0;

  for (const record of rangeRecords) {
    if (record.status === 'Jamah') {
      jamah++;
      onTime++;
    } else if (record.status === 'Prayed') {
      onTime++;
    }
  }

  // Count days in range
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const daysDiff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalPossible = Math.max(daysDiff, 1) * PRAYER_NAMES.length;

  return { totalPossible, jamah, onTime };
}
