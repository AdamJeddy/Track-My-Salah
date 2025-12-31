import { PrayerName, PrayerStatus, PRAYER_NAMES } from '../../models/PrayerRecord';
import { StatusToggle } from './StatusToggle';
import { Sun, Sunrise, Cloud, Sunset, Moon } from 'lucide-react';

interface PrayerListProps {
  prayerStatuses: Record<PrayerName, PrayerStatus>;
  onStatusChange: (prayer: PrayerName, status: PrayerStatus) => void;
  disabled?: boolean;
}

const PRAYER_ICONS: Record<PrayerName, React.ReactNode> = {
  Fajr: <Sunrise className="w-6 h-6" />,
  Dhuhr: <Sun className="w-6 h-6" />,
  Asr: <Cloud className="w-6 h-6" />,
  Maghrib: <Sunset className="w-6 h-6" />,
  Isha: <Moon className="w-6 h-6" />,
};

const PRAYER_TIMES: Record<PrayerName, string> = {
  Fajr: 'Dawn',
  Dhuhr: 'Midday',
  Asr: 'Afternoon',
  Maghrib: 'Sunset',
  Isha: 'Night',
};

export function PrayerList({ prayerStatuses, onStatusChange, disabled }: PrayerListProps) {
  return (
    <div className="space-y-3">
      {PRAYER_NAMES.map((prayer) => (
        <div
          key={prayer}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-start gap-4">
            {/* Prayer Icon and Name */}
            <div className="flex items-center gap-3 min-w-[100px]">
              <div className="text-primary-600 dark:text-primary-400">
                {PRAYER_ICONS[prayer]}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {prayer}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {PRAYER_TIMES[prayer]}
                </p>
              </div>
            </div>

            {/* Status Toggle */}
            <div className="flex-1">
              <StatusToggle
                currentStatus={prayerStatuses[prayer]}
                onStatusChange={(status) => onStatusChange(prayer, status)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
