import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { StatisticsCard } from './StatisticsCard';
import { PRAYER_NAMES, type PrayerRecord } from '../../models/PrayerRecord';

function day(date: string): PrayerRecord[] {
  return PRAYER_NAMES.map((prayer_name) => ({
    id: `${date}-${prayer_name}`, gregorian_date: date, hijri_date: '', prayer_name, status: 'Prayed',
  }));
}

function dayWithStatus(date: string, status: PrayerRecord['status']): PrayerRecord[] {
  return day(date).map((record) => ({ ...record, status }));
}

function text(records: PrayerRecord[]) {
  return renderToStaticMarkup(<StatisticsCard records={records} />).replace(/<[^>]*>/g, '');
}

describe('live statistics and on-time streaks (#4, #5)', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 8, 22, 12)); });
  afterEach(() => vi.useRealTimers());

  it('includes today in totals and extends a completed streak', () => {
    const result = text([...day('2026-09-21'), ...day('2026-09-22')]);
    expect(result).toContain('2Current On-Time Streak');
    expect(result).toContain('2Best On-Time Streak');
    expect(result).toContain('Prayers Completed10');
    expect(result).toContain('100%30-Day On-Time');
    expect(result).toContain('How on-time streaks work');
  });

  it('preserves the streak while today is pending without penalizing consistency', () => {
    const result = text([...day('2026-09-21'), day('2026-09-22')[0]]);
    expect(result).toContain('1Current On-Time Streak');
    expect(result).toContain('Prayers Completed6');
    expect(result).toContain('100%30-Day On-Time');
    expect(result).toContain('Missed + Unrecorded Prayers0');
  });

  it('breaks the current streak when a prayer is explicitly missed today', () => {
    const missedToday = { ...day('2026-09-22')[0], status: 'Missed' as const };
    const result = text([...day('2026-09-21'), missedToday]);
    expect(result).toContain('0Current On-Time Streak');
    expect(result).toContain('1Best On-Time Streak');
  });

  it('retains historical best streak after a missed day (#5)', () => {
    const result = text([...day('2026-09-18'), ...day('2026-09-19'), ...day('2026-09-21')]);
    expect(result).toContain('1Current On-Time Streak');
    expect(result).toContain('2Best On-Time Streak');
  });

  it('requires every non-excused prayer to be on time', () => {
    const qadaDay = day('2026-09-20');
    qadaDay[0] = { ...qadaDay[0], status: 'Qada' };
    const result = text([
      ...day('2026-09-18'),
      ...day('2026-09-19'),
      ...qadaDay,
      ...day('2026-09-21'),
    ]);
    expect(result).toContain('1Current On-Time Streak');
    expect(result).toContain('2Best On-Time Streak');
  });

  it('treats a fully excused day as neutral without increasing the streak', () => {
    const result = text([
      ...day('2026-09-18'),
      ...dayWithStatus('2026-09-19', 'Excused'),
      ...day('2026-09-20'),
    ]);
    expect(result).toContain('2Best On-Time Streak');
  });

  it('counts a partially excused day when every required prayer is on time', () => {
    const partialExcused = day('2026-09-21');
    partialExcused[0] = { ...partialExcused[0], status: 'Excused' };
    const result = text(partialExcused);
    expect(result).toContain('1Current On-Time Streak');
    expect(result).toContain('1Best On-Time Streak');
  });
});
