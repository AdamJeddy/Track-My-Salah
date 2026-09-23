export interface NotificationSettings {
  enabled: boolean;
  time: string;
  weeklySummaryEnabled: boolean;
  monthlySummaryEnabled: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  time: '21:00',
  weeklySummaryEnabled: false,
  monthlySummaryEnabled: false,
};

export function normalizeNotificationSettings(
  stored: Partial<NotificationSettings> | null | undefined,
): NotificationSettings {
  if (!stored) return DEFAULT_NOTIFICATION_SETTINGS;

  return {
    enabled: stored.enabled ?? DEFAULT_NOTIFICATION_SETTINGS.enabled,
    time: stored.time || DEFAULT_NOTIFICATION_SETTINGS.time,
    weeklySummaryEnabled: stored.weeklySummaryEnabled ?? DEFAULT_NOTIFICATION_SETTINGS.weeklySummaryEnabled,
    monthlySummaryEnabled: stored.monthlySummaryEnabled ?? DEFAULT_NOTIFICATION_SETTINGS.monthlySummaryEnabled,
  };
}
