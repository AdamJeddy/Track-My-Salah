import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildTimelineDayMap } from './statsUtils';
import { PRAYER_NAMES, type PrayerRecord } from '../models/PrayerRecord';

function recordsFor(date: string): PrayerRecord[] {
  return PRAYER_NAMES.map((prayer_name) => ({
    id: `${date}-${prayer_name}`, gregorian_date: date, hijri_date: '', prayer_name, status: 'Prayed',
  }));
}

describe('statistics timeline (#4)', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 8, 22, 12)); });
  afterEach(() => vi.useRealTimers());

  it('includes prayers logged today even when tracking starts today', () => {
    const today = buildTimelineDayMap(recordsFor('2026-09-22')).get('2026-09-22');
    expect(today?.completed).toBe(5);
  });

  it('does not treat remaining prayers today as unrecorded', () => {
    const map = buildTimelineDayMap([...recordsFor('2026-09-20'), recordsFor('2026-09-22')[0]]);
    expect(map.get('2026-09-22')?.completed).toBe(1);
    expect(map.get('2026-09-22')?.unrecorded).toBe(0);
    expect(map.get('2026-09-21')?.unrecorded).toBe(5);
  });

  it('ignores future records and keeps an empty history empty', () => {
    expect(buildTimelineDayMap(recordsFor('2026-09-23')).size).toBe(0);
    expect(buildTimelineDayMap([]).size).toBe(0);
  });

  it('counts a cleared past prayer as unrecorded but leaves today pending', () => {
    const map = buildTimelineDayMap([{ ...recordsFor('2026-09-21')[0], status: null }]);
    expect(map.get('2026-09-21')?.unrecorded).toBe(5);
    expect(map.get('2026-09-22')?.unrecorded).toBe(0);
    expect(map.get('2026-09-22')?.isSkipped).toBe(false);
  });
});
