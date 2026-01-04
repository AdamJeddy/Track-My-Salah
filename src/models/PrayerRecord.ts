// Prayer names enum
export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

// Prayer status enum
export type PrayerStatus = 'Prayed' | 'Jamah' | 'Missed' | 'Excused' | 'Qada' | null;

// Main PrayerRecord interface
export interface PrayerRecord {
  id: string;                    // UUID - Primary Key
  gregorian_date: string;        // ISO 8601 format (YYYY-MM-DD) - Indexed
  hijri_date: string;            // Format: "1447-06-10"
  prayer_name: PrayerName;       // Enum
  status: PrayerStatus;          // Enum
  notes?: string;                // Optional, max 255 characters
}

// Daily prayer summary for a specific date
export interface DailyPrayerSummary {
  gregorian_date: string;
  hijri_date: string;
  prayers: {
    [key in PrayerName]?: PrayerRecord;
  };
}

// Constants
export const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// Order dictates how status buttons render in UI
export const PRAYER_STATUS_OPTIONS: PrayerStatus[] = ['Jamah', 'Prayed', 'Qada', 'Missed', 'Excused'];

// Status color mapping for UI
export const STATUS_COLORS: Record<NonNullable<PrayerStatus>, string> = {
  Prayed: 'bg-prayed',
  Jamah: 'bg-jamah',
  Missed: 'bg-missed',
  Excused: 'bg-excused',
  Qada: 'bg-qada',
};

export const STATUS_TEXT_COLORS: Record<NonNullable<PrayerStatus>, string> = {
  Prayed: 'text-prayed',
  Jamah: 'text-jamah',
  Missed: 'text-missed',
  Excused: 'text-excused',
  Qada: 'text-qada',
};
