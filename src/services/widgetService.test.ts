import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PRAYER_NAMES, type PrayerRecord } from '../models/PrayerRecord';

const mocks = vi.hoisted(() => ({
  platform: vi.fn(() => 'android'),
  records: vi.fn<() => Promise<PrayerRecord[]>>(),
  update: vi.fn<(options: unknown) => Promise<void>>().mockResolvedValue(undefined),
}));
vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: mocks.platform },
  registerPlugin: () => ({ updateWidgetData: mocks.update }),
}));
vi.mock('./localStorageService', () => ({ getAllRecords: mocks.records }));
import { pushMonthToWidget } from './widgetService';

describe('widget data (#3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 31, 12));
    mocks.platform.mockReturnValue('android');
    mocks.records.mockResolvedValue([]);
  });
  afterEach(() => vi.useRealTimers());

  it('sends every day for a six-week month', async () => {
    await pushMonthToWidget();
    expect(mocks.update).toHaveBeenCalledWith({ data: expect.objectContaining({
      monthLabel: 'August 2026', firstDayOfWeek: 6, numDays: 31, days: expect.any(Array),
    }) });
    const { data } = mocks.update.mock.calls[0][0] as { data: { days: unknown[] } };
    expect(data.days).toHaveLength(31);
  });

  it('counts Qada and excused prayers toward a complete day', async () => {
    mocks.records.mockResolvedValue(PRAYER_NAMES.map((prayer_name, i) => ({
      id: prayer_name, gregorian_date: '2026-08-31', hijri_date: '', prayer_name,
      status: i === 0 ? 'Excused' : 'Qada',
    })));
    await pushMonthToWidget();
    const { data } = mocks.update.mock.calls[0][0] as { data: { trackedDays: number; days: { status: string }[] } };
    expect(data.trackedDays).toBe(1);
    expect(data.days[30].status).toBe('complete');
  });

  it('keeps the current month when only older records exist', async () => {
    mocks.records.mockResolvedValue([{
      id: 'old', gregorian_date: '2026-07-01', hijri_date: '', prayer_name: 'Fajr', status: 'Prayed',
    }]);
    await pushMonthToWidget();
    expect(mocks.update).toHaveBeenCalledWith({ data: expect.objectContaining({ monthLabel: 'August 2026', trackedDays: 0 }) });
  });

  it('does not call the Android plugin on web', async () => {
    mocks.platform.mockReturnValue('web');
    await pushMonthToWidget();
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
