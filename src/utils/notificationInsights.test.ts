import { describe, expect, it } from 'vitest';
import { PRAYER_NAMES, type PrayerRecord } from '../models/PrayerRecord';
import { buildNotificationInsight, getSummaryPeriodRanges } from './notificationInsights';

function day(date: string): PrayerRecord[] {
  return PRAYER_NAMES.map((prayer_name) => ({
    id: `${date}-${prayer_name}`,
    gregorian_date: date,
    hijri_date: '',
    prayer_name,
    status: 'Prayed',
  }));
}

describe('notification insights', () => {
  it('uses the previous seven complete days and the seven days before them', () => {
    expect(getSummaryPeriodRanges('weekly', '2026-09-30')).toEqual({
      startDate: '2026-09-23',
      endDate: '2026-09-29',
      comparisonStartDate: '2026-09-16',
      comparisonEndDate: '2026-09-22',
      label: 'This week',
    });
  });

  it('compares the previous calendar month with the month before it', () => {
    expect(getSummaryPeriodRanges('monthly', '2026-03-15')).toEqual({
      startDate: '2026-02-01',
      endDate: '2026-02-28',
      comparisonStartDate: '2026-01-01',
      comparisonEndDate: '2026-01-31',
      label: 'Last month',
    });
  });

  it('returns notification-ready insight text from local records', () => {
    expect(buildNotificationInsight(day('2026-09-29'), 'weekly', '2026-09-30')).toBe(
      'This week: 5/5 on time (100%). Strongest: Fajr at 100%.',
    );
  });
});
