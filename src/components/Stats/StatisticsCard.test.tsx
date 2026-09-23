import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { StatisticsCard } from './StatisticsCard';
import { PRAYER_NAMES, type PrayerRecord } from '../../models/PrayerRecord';

function day(date: string): PrayerRecord[] {
  return PRAYER_NAMES.map((prayer_name) => ({
    id: `${date}-${prayer_name}`, gregorian_date: date, hijri_date: '', prayer_name, status: 'Prayed',
  }));
}

function text(records: PrayerRecord[]) {
  return renderToStaticMarkup(<StatisticsCard records={records} />).replace(/<[^>]*>/g, '');
}

describe('live statistics (#4)', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 8, 22, 12)); });
  afterEach(() => vi.useRealTimers());

  it('includes today in totals and extends a completed streak', () => {
    const result = text([...day('2026-09-21'), ...day('2026-09-22')]);
    expect(result).toContain('2Current Streak');
    expect(result).toContain('2Best Streak');
    expect(result).toContain('Prayers Completed10');
    expect(result).toContain('100%Consistency');
  });

  it('preserves the streak while today is pending without penalizing consistency', () => {
    const result = text([...day('2026-09-21'), day('2026-09-22')[0]]);
    expect(result).toContain('1Current Streak');
    expect(result).toContain('Prayers Completed6');
    expect(result).toContain('100%Consistency');
    expect(result).toContain('Missed + Unrecorded Prayers0');
  });

  it('breaks the current streak when a prayer is explicitly missed today', () => {
    const missedToday = { ...day('2026-09-22')[0], status: 'Missed' as const };
    const result = text([...day('2026-09-21'), missedToday]);
    expect(result).toContain('0Current Streak');
    expect(result).toContain('1Best Streak');
  });

  it('retains historical best streak after a missed day (#5)', () => {
    const result = text([...day('2026-09-18'), ...day('2026-09-19'), ...day('2026-09-21')]);
    expect(result).toContain('1Current Streak');
    expect(result).toContain('2Best Streak');
  });
});
