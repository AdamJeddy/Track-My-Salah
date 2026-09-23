import { describe, expect, it } from 'vitest';
import { DEFAULT_NOTIFICATION_SETTINGS, normalizeNotificationSettings } from './notificationSettings';

describe('notification settings', () => {
  it('keeps every notification opt-in by default', () => {
    expect(DEFAULT_NOTIFICATION_SETTINGS).toEqual({
      enabled: false,
      time: '21:00',
      weeklySummaryEnabled: false,
      monthlySummaryEnabled: false,
    });
    expect(normalizeNotificationSettings(null)).toEqual(DEFAULT_NOTIFICATION_SETTINGS);
  });

  it('preserves saved choices while safely defaulting missing insight preferences', () => {
    expect(normalizeNotificationSettings({ enabled: true, time: '20:30' })).toEqual({
      enabled: true,
      time: '20:30',
      weeklySummaryEnabled: false,
      monthlySummaryEnabled: false,
    });
  });
});
