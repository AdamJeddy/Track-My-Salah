import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildInsightSummary, buildTimelineDayMap, getPrayerInsights } from './statsUtils';
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

describe('prayer insights', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 8, 30, 12)); });
  afterEach(() => vi.useRealTimers());

  it('calculates a rolling 30-day on-time rate without penalizing pending or excused prayers', () => {
    const qadaDay = recordsFor('2026-09-29');
    qadaDay[0] = { ...qadaDay[0], status: 'Qada' };
    const excusedToday = recordsFor('2026-09-30').slice(0, 2);
    excusedToday[0] = { ...excusedToday[0], status: 'Excused' };

    const insights = getPrayerInsights([
      ...recordsFor('2026-09-28'),
      ...qadaDay,
      ...excusedToday,
    ]);

    expect(insights.rolling30Days).toEqual({ onTime: 10, eligible: 11, rate: 91 });
  });

  it('explains the most recent streak break using the affected prayer and status', () => {
    const qadaDay = recordsFor('2026-09-29');
    qadaDay[0] = { ...qadaDay[0], status: 'Qada' };

    const insights = getPrayerInsights([...qadaDay, ...recordsFor('2026-09-30')]);

    expect(insights.currentStreak).toBe(1);
    expect(insights.lastBreak).toEqual({
      date: '2026-09-29',
      reasons: ['Fajr was completed as Qada'],
    });
  });

  it('identifies the strongest prayer and the prayer with the most room to improve', () => {
    const secondDay = recordsFor('2026-09-29');
    secondDay[2] = { ...secondDay[2], status: 'Missed' };

    const insights = getPrayerInsights([
      ...recordsFor('2026-09-28'),
      ...secondDay,
      ...recordsFor('2026-09-30'),
    ]);

    expect(insights.strongestPrayer).toMatchObject({ prayer: 'Fajr', rate: 100 });
    expect(insights.focusPrayer).toMatchObject({ prayer: 'Asr', rate: 67 });
  });

  it('does not single out a strongest prayer when every rate is tied', () => {
    const insights = getPrayerInsights(recordsFor('2026-09-30'));

    expect(insights.strongestPrayer).toBeNull();
    expect(insights.focusPrayer).toBeNull();
  });

  it('builds a supportive notification summary with rate, strongest prayer, and trend', () => {
    const currentWeek = [
      ...recordsFor('2026-09-24'),
      ...recordsFor('2026-09-25'),
      ...recordsFor('2026-09-26'),
      ...recordsFor('2026-09-27'),
      ...recordsFor('2026-09-28'),
      ...recordsFor('2026-09-29'),
    ];
    currentWeek[2] = { ...currentWeek[2], status: 'Missed' };
    const previousWeek = [
      ...recordsFor('2026-09-17'),
      ...recordsFor('2026-09-18'),
      ...recordsFor('2026-09-19'),
      ...recordsFor('2026-09-20'),
      ...recordsFor('2026-09-21'),
      ...recordsFor('2026-09-22'),
      ...recordsFor('2026-09-23'),
    ];
    previousWeek[2] = { ...previousWeek[2], status: 'Missed' };
    previousWeek[3] = { ...previousWeek[3], status: 'Missed' };

    const summary = buildInsightSummary(
      [...previousWeek, ...currentWeek],
      '2026-09-24',
      '2026-09-29',
      '2026-09-17',
      '2026-09-23',
      'This week',
    );

    expect(summary).toBe('This week: 29/30 on time (97%). Strongest: Fajr at 100%. Up 3 points.');
  });
});
