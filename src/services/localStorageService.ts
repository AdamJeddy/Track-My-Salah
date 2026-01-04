import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import { PrayerRecord, PrayerName, PrayerStatus } from '../models/PrayerRecord';
import { gregorianToHijri } from '../utils/dateUtils';

// Configure localforage
localforage.config({
  name: 'TrackMySalah',
  storeName: 'prayer_records',
  description: 'Prayer tracking records storage',
});

// Key prefix for prayer records
const RECORD_PREFIX = 'prayer_';

/**
 * Generate a unique key for a prayer record
 */
function getRecordKey(gregorianDate: string, prayerName: PrayerName): string {
  return `${RECORD_PREFIX}${gregorianDate}_${prayerName}`;
}

/**
 * Save or update a prayer record
 */
export async function saveRecord(
  gregorianDate: string,
  prayerName: PrayerName,
  status: PrayerStatus,
  notes?: string
): Promise<PrayerRecord> {
  const key = getRecordKey(gregorianDate, prayerName);
  
  // Check if record exists
  const existing = await localforage.getItem<PrayerRecord>(key);
  
  const record: PrayerRecord = {
    id: existing?.id || uuidv4(),
    gregorian_date: gregorianDate,
    hijri_date: gregorianToHijri(gregorianDate),
    prayer_name: prayerName,
    status,
    notes: notes?.substring(0, 255),
  };
  
  await localforage.setItem(key, record);
  return record;
}

/**
 * Get a specific prayer record
 */
export async function getRecord(
  gregorianDate: string,
  prayerName: PrayerName
): Promise<PrayerRecord | null> {
  const key = getRecordKey(gregorianDate, prayerName);
  return localforage.getItem<PrayerRecord>(key);
}

/**
 * Get all prayer records for a specific date
 */
export async function getRecordsByDate(gregorianDate: string): Promise<PrayerRecord[]> {
  const records: PrayerRecord[] = [];
  
  await localforage.iterate<PrayerRecord, void>((value, key) => {
    if (key.startsWith(`${RECORD_PREFIX}${gregorianDate}`)) {
      records.push(value);
    }
  });
  
  return records;
}

/**
 * Get all prayer records
 */
export async function getAllRecords(): Promise<PrayerRecord[]> {
  const records: PrayerRecord[] = [];
  
  await localforage.iterate<PrayerRecord, void>((value, key) => {
    if (key.startsWith(RECORD_PREFIX)) {
      records.push(value);
    }
  });
  
  // Sort by date and prayer order
  const prayerOrder: Record<PrayerName, number> = {
    Fajr: 1,
    Dhuhr: 2,
    Asr: 3,
    Maghrib: 4,
    Isha: 5,
  };
  
  records.sort((a, b) => {
    const dateCompare = a.gregorian_date.localeCompare(b.gregorian_date);
    if (dateCompare !== 0) return dateCompare;
    return prayerOrder[a.prayer_name] - prayerOrder[b.prayer_name];
  });
  
  return records;
}

/**
 * Get records within a date range
 */
export async function getRecordsByDateRange(
  startDate: string,
  endDate: string
): Promise<PrayerRecord[]> {
  const records: PrayerRecord[] = [];
  
  await localforage.iterate<PrayerRecord, void>((value, key) => {
    if (
      key.startsWith(RECORD_PREFIX) &&
      value.gregorian_date >= startDate &&
      value.gregorian_date <= endDate
    ) {
      records.push(value);
    }
  });
  
  return records;
}

/**
 * Delete a specific prayer record
 */
export async function deleteRecord(
  gregorianDate: string,
  prayerName: PrayerName
): Promise<void> {
  const key = getRecordKey(gregorianDate, prayerName);
  await localforage.removeItem(key);
}

/**
 * Delete all records (for data reset)
 */
export async function clearAllRecords(): Promise<void> {
  const keysToRemove: string[] = [];
  
  await localforage.iterate<PrayerRecord, void>((_, key) => {
    if (key.startsWith(RECORD_PREFIX)) {
      keysToRemove.push(key);
    }
  });
  
  for (const key of keysToRemove) {
    await localforage.removeItem(key);
  }
}

/**
 * Import records from array (for CSV import)
 */
export async function importRecords(records: PrayerRecord[]): Promise<number> {
  let imported = 0;
  
  for (const record of records) {
    const key = getRecordKey(record.gregorian_date, record.prayer_name);
    await localforage.setItem(key, {
      ...record,
      id: record.id || uuidv4(),
    });
    imported++;
  }
  
  return imported;
}

/**
 * Get unique dates that have records
 */
export async function getRecordedDates(): Promise<string[]> {
  const dates = new Set<string>();
  
  await localforage.iterate<PrayerRecord, void>((value, key) => {
    if (key.startsWith(RECORD_PREFIX)) {
      dates.add(value.gregorian_date);
    }
  });
  
  return Array.from(dates).sort();
}

/**
 * Get user's gender preference ('male' | 'female' | null)
 */
export async function getGenderPreference(): Promise<'male' | 'female' | null> {
  const gender = await localforage.getItem<'male' | 'female' | null>('user_gender');
  return gender || null;
}

/**
 * Set user's gender preference
 */
export async function setGenderPreference(gender: 'male' | 'female'): Promise<void> {
  await localforage.setItem('user_gender', gender);
}

/**
 * Onboarding completion flag
 */
export async function getOnboardingStatus(): Promise<boolean> {
  const value = await localforage.getItem<boolean>('onboarded');
  return Boolean(value);
}

export async function setOnboardingStatus(completed: boolean): Promise<void> {
  await localforage.setItem('onboarded', completed);
}
