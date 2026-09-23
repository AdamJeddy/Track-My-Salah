import type { PrayerRecord } from '../models/PrayerRecord';
import { addDays, getTodayGregorian } from './dateUtils';
import { buildInsightSummary } from './statsUtils';

export type SummaryPeriod = 'weekly' | 'monthly';

export interface SummaryPeriodRanges {
  startDate: string;
  endDate: string;
  comparisonStartDate: string;
  comparisonEndDate: string;
  label: string;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getSummaryPeriodRanges(
  period: SummaryPeriod,
  today = getTodayGregorian(),
): SummaryPeriodRanges {
  if (period === 'weekly') {
    return {
      startDate: addDays(today, -7),
      endDate: addDays(today, -1),
      comparisonStartDate: addDays(today, -14),
      comparisonEndDate: addDays(today, -8),
      label: 'This week',
    };
  }

  const [year, month] = today.split('-').map(Number);
  const previousMonthEnd = new Date(year, month - 1, 0);
  const previousMonthStart = new Date(
    previousMonthEnd.getFullYear(),
    previousMonthEnd.getMonth(),
    1,
  );
  const comparisonMonthEnd = new Date(
    previousMonthStart.getFullYear(),
    previousMonthStart.getMonth(),
    0,
  );
  const comparisonMonthStart = new Date(
    comparisonMonthEnd.getFullYear(),
    comparisonMonthEnd.getMonth(),
    1,
  );

  return {
    startDate: formatLocalDate(previousMonthStart),
    endDate: formatLocalDate(previousMonthEnd),
    comparisonStartDate: formatLocalDate(comparisonMonthStart),
    comparisonEndDate: formatLocalDate(comparisonMonthEnd),
    label: 'Last month',
  };
}

export function buildNotificationInsight(
  records: PrayerRecord[],
  period: SummaryPeriod,
  today = getTodayGregorian(),
): string | null {
  const ranges = getSummaryPeriodRanges(period, today);
  return buildInsightSummary(
    records,
    ranges.startDate,
    ranges.endDate,
    ranges.comparisonStartDate,
    ranges.comparisonEndDate,
    ranges.label,
    today,
  );
}
