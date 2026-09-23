import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrayerRecord } from '../models/PrayerRecord';
import { PRAYER_NAMES } from '../models/PrayerRecord';
import { getRecoveryGuidance } from './recoveryUtils';

function day(date: string, status: PrayerRecord['status']): PrayerRecord[] {
  return PRAYER_NAMES.map((prayer_name) => ({
    id: `${date}-${prayer_name}`,
    gregorian_date: date,
    hijri_date: '',
    prayer_name,
    status,
  }));
}

describe('gentle recovery guidance', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 23, 12));
  });

  afterEach(() => vi.useRealTimers());

  it('stays hidden while an on-time streak is active', () => {
    expect(getRecoveryGuidance(day('2026-09-22', 'Prayed'))).toBeNull();
  });

  it('suggests the next unlogged prayer after a streak break', () => {
    const records = day('2026-09-22', 'Prayed');
    records[0] = { ...records[0], status: 'Missed' };

    expect(getRecoveryGuidance(records)).toMatchObject({
      breakDate: '2026-09-22',
      nextPrayer: 'Fajr',
      message: 'Focus on Fajr next. One prayer at a time.',
    });
  });

  it('moves the next step past prayers already logged today', () => {
    const records = day('2026-09-22', 'Missed').concat(
      day('2026-09-23', null).slice(0, 2).map((record) => ({ ...record, status: 'Prayed' })),
    );

    expect(getRecoveryGuidance(records)?.nextPrayer).toBe('Asr');
  });

  it('acknowledges a fully logged recovery day without changing the strict streak', () => {
    const today = day('2026-09-23', 'Prayed');
    today[0] = { ...today[0], status: 'Missed' };

    expect(getRecoveryGuidance(today)).toMatchObject({
      nextPrayer: null,
      message: 'Today is fully logged. Tomorrow is another opportunity.',
    });
  });
});
