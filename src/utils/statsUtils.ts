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

  // Exclude today since the day hasn't finished yet
  const endDate = addDays(getTodayGregorian(), -1);
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
      day.prayersLogged.add(record.prayer_name);
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
    day.isSkipped = !day.hasAnyRecord && day.date >= range.startDate && day.date <= range.endDate;
    day.unrecorded = Math.max(PRAYER_NAMES.length - day.prayersLogged.size, 0);
  });

  return dayMap;
}

export function getTimelineDays(records: PrayerRecord[]): TimelineDayStats[] {
  return Array.from(buildTimelineDayMap(records).values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getMissingPrayerNames(day: TimelineDayStats): PrayerName[] {
  return PRAYER_NAMES.filter((prayer) => !day.prayersLogged.has(prayer));
}
