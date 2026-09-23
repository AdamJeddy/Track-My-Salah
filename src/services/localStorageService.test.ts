import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrayerRecord } from '../models/PrayerRecord';

const mocks = vi.hoisted(() => ({
  data: new Map<string, unknown>(),
  push: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
}));
vi.mock('./widgetService', () => ({ pushMonthToWidget: mocks.push }));
vi.mock('localforage', () => ({ default: {
  config: vi.fn(),
  getItem: async (key: string) => mocks.data.get(key) ?? null,
  setItem: async (key: string, value: unknown) => { mocks.data.set(key, value); },
  removeItem: async (key: string) => { mocks.data.delete(key); },
  iterate: async (callback: (value: unknown, key: string) => void) => {
    mocks.data.forEach((value, key) => callback(value, key));
  },
} }));
import {
  clearAllRecords,
  deleteRecord,
  getBackupMetadata,
  importRecords,
  saveRecord,
  setBackupMetadata,
} from './localStorageService';

describe('widget synchronization after persistence (#3)', () => {
  beforeEach(() => { mocks.data.clear(); mocks.push.mockReset().mockResolvedValue(undefined); });

  it('refreshes after a prayer has been persisted', async () => {
    mocks.push.mockImplementation(async () => {
      expect(mocks.data.get('prayer_2026-09-22_Fajr')).toMatchObject({ status: 'Prayed' });
    });
    await saveRecord('2026-09-22', 'Fajr', 'Prayed');
    expect(mocks.push).toHaveBeenCalledOnce();
  });

  it('refreshes after imports, deletions and resets without deleting preferences', async () => {
    const record: PrayerRecord = { id: '1', gregorian_date: '2026-09-22', hijri_date: '', prayer_name: 'Fajr', status: 'Prayed' };
    await importRecords([record]);
    expect(mocks.push).toHaveBeenCalledTimes(1);
    await deleteRecord('2026-09-22', 'Fajr');
    expect(mocks.data.size).toBe(0);
    expect(mocks.push).toHaveBeenCalledTimes(2);
    await importRecords([record]);
    mocks.data.set('user_gender', 'male');
    await clearAllRecords();
    expect([...mocks.data.keys()]).toEqual(['user_gender']);
    expect(mocks.push).toHaveBeenCalledTimes(4);
  });

  it('retains a successful save if the native widget fails', async () => {
    mocks.push.mockRejectedValueOnce(new Error('Widget unavailable'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(saveRecord('2026-09-22', 'Fajr', 'Prayed')).resolves.toMatchObject({ status: 'Prayed' });
      expect(mocks.data.has('prayer_2026-09-22_Fajr')).toBe(true);
    } finally {
      log.mockRestore();
    }
  });
});

describe('backup metadata', () => {
  beforeEach(() => {
    mocks.data.clear();
  });

  it('starts empty and remembers the latest successful export', async () => {
    await expect(getBackupMetadata()).resolves.toBeNull();

    await setBackupMetadata({
      createdAt: '2026-09-23T18:30:00.000Z',
      recordCount: 42,
      destination: 'Documents/TrackMySalah',
    });

    await expect(getBackupMetadata()).resolves.toEqual({
      createdAt: '2026-09-23T18:30:00.000Z',
      recordCount: 42,
      destination: 'Documents/TrackMySalah',
    });
  });
});
