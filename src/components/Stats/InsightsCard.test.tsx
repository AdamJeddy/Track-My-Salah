import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PRAYER_NAMES, type PrayerRecord } from '../../models/PrayerRecord';
import { InsightsCard } from './InsightsCard';

function day(date: string): PrayerRecord[] {
  return PRAYER_NAMES.map((prayer_name) => ({
    id: `${date}-${prayer_name}`,
    gregorian_date: date,
    hijri_date: '',
    prayer_name,
    status: 'Prayed',
  }));
}

function text(records: PrayerRecord[]) {
  return renderToStaticMarkup(<InsightsCard records={records} />).replace(/<[^>]*>/g, '');
}

describe('private prayer insights', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 8, 30, 12)); });
  afterEach(() => vi.useRealTimers());

  it('shows an encouraging empty state before enough data is available', () => {
    expect(text([])).toContain('Log your prayers to start seeing private insights');
  });

  it('shows strongest prayer, focus prayer, and recent direction', () => {
    const records = [
      ...day('2026-09-16'),
      ...day('2026-09-17'),
      ...day('2026-09-18'),
      ...day('2026-09-19'),
      ...day('2026-09-20'),
      ...day('2026-09-21'),
      ...day('2026-09-22'),
      ...day('2026-09-23'),
      ...day('2026-09-24'),
      ...day('2026-09-25'),
      ...day('2026-09-26'),
      ...day('2026-09-27'),
      ...day('2026-09-28'),
      ...day('2026-09-29'),
    ];
    records.find((record) => record.gregorian_date === '2026-09-16' && record.prayer_name === 'Asr')!.status = 'Missed';
    records.find((record) => record.gregorian_date === '2026-09-24' && record.prayer_name === 'Isha')!.status = 'Missed';

    const result = text(records);

    expect(result).toContain('Fajr is strongest at 100% on time');
    expect(result).toContain('Asr has the most room to improve');
    expect(result).toContain('Your on-time rate is holding steady');
  });

  it('uses singular wording for a one-point change', () => {
    const records: PrayerRecord[] = [];
    const previousDates = ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20', '2026-09-21', '2026-09-22'];
    previousDates.forEach((date) => records.push(...day(date).map((record) => ({ ...record, status: 'Excused' as const }))));
    const previousFinalDay = records.filter((record) => record.gregorian_date === '2026-09-22');
    previousFinalDay[0].status = 'Prayed';
    previousFinalDay[1].status = 'Missed';

    const currentDates = ['2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27', '2026-09-28', '2026-09-29'];
    currentDates.forEach((date, dayIndex) => {
      const currentDay = day(date);
      currentDay.forEach((record, prayerIndex) => {
        record.status = dayIndex * PRAYER_NAMES.length + prayerIndex < 18 ? 'Prayed' : 'Missed';
      });
      records.push(...currentDay);
    });

    expect(text(records)).toContain('Your on-time rate is up 1 point from the previous 7 days');
  });
});
