import { Sun, Sunrise, Cloud, Sunset, Moon } from 'lucide-react';
import type { ReactNode } from 'react';
import { PrayerName, PrayerStatus, PRAYER_NAMES, PRAYER_STATUS_OPTIONS } from '../../models/PrayerRecord';
import { StatusToggle, STATUS_CONFIG } from './StatusToggle';

interface PrayerListProps {
  prayerStatuses: Record<PrayerName, PrayerStatus>;
  onStatusChange: (prayer: PrayerName, status: PrayerStatus) => void;
  disabled?: boolean;
  gender?: 'male' | 'female' | null;
}

const PRAYER_ICONS: Record<PrayerName, ReactNode> = {
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

const getStatusOptions = (gender?: 'male' | 'female' | null) =>
  PRAYER_STATUS_OPTIONS.filter((status): status is NonNullable<PrayerStatus> => {
    if (status === null) return false;
    if (gender === 'male' && status === 'Excused') return false;
    return true;
  });

export function PrayerList({ prayerStatuses, onStatusChange, disabled, gender }: PrayerListProps) {
  const statusOptions = getStatusOptions(gender);
  const gridTemplateColumns = `minmax(105px,1fr) repeat(${statusOptions.length}, minmax(0,1fr))`;

  return (
    <div className="space-y-4">
      {/* Mobile: icon header with aligned icon-only buttons */}
      <div className="md:hidden">
        <div className="overflow-x-auto">
          <div className="space-y-2 min-w-[350px]">
            <div
              className="grid items-center gap-1.5 px-1 text-[11px] text-gray-500 dark:text-gray-400"
              style={{ gridTemplateColumns }}
            >
              <span className="font-semibold text-gray-700 dark:text-gray-200">Prayer</span>
              {statusOptions.map((status) => {
                const config = STATUS_CONFIG[status];
                return (
                  <div key={status} className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] font-semibold leading-tight text-gray-700 dark:text-gray-200">{config.label}</span>
                  </div>
                );
              })}
            </div>

            {PRAYER_NAMES.map((prayer) => (
              <div
                key={prayer}
                className="grid items-center gap-1.5 rounded-xl bg-white p-3 shadow-sm dark:bg-gray-800"
                style={{ gridTemplateColumns }}
              >
                <div className="flex items-center gap-1.5">
                  <div className="text-primary-600 dark:text-primary-400">
                    {PRAYER_ICONS[prayer]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold leading-tight text-gray-900 dark:text-white">{prayer}</h3>
                    <p className="text-xs leading-tight text-gray-500 dark:text-gray-400">{PRAYER_TIMES[prayer]}</p>
                  </div>
                </div>

                {statusOptions.map((status) => {
                  const config = STATUS_CONFIG[status];
                  const isActive = prayerStatuses[prayer] === status;
                  const handleClick = () => {
                    if (disabled) return;
                    const nextStatus = isActive ? null : status;
                    onStatusChange(prayer, nextStatus);
                  };

                  return (
                    <button
                      key={status}
                      onClick={handleClick}
                      disabled={disabled}
                      className={`
                        flex h-11 w-full items-center justify-center rounded-md transition-all
                        ${isActive ? `${config.bgActive} text-white` : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'}
                      `}
                      aria-pressed={isActive}
                      aria-label={config.label}
                      title={config.label}
                    >
                      {config.icon}
                      <span className="sr-only">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: keep existing row layout */}
      <div className="hidden md:block space-y-2">
        {PRAYER_NAMES.map((prayer) => (
          <div
            key={prayer}
            className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800"
          >
            <div className="flex items-center gap-2">
              <div className="flex min-w-[90px] flex-shrink-0 items-center gap-2">
                <div className="text-primary-600 dark:text-primary-400">
                  {PRAYER_ICONS[prayer]}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold leading-tight text-gray-900 dark:text-white">
                    {prayer}
                  </h3>
                  <p className="text-xs leading-tight text-gray-500 dark:text-gray-400">
                    {PRAYER_TIMES[prayer]}
                  </p>
                </div>
              </div>

              <div className="ml-1 flex-1">
                <StatusToggle
                  currentStatus={prayerStatuses[prayer]}
                  onStatusChange={(status) => onStatusChange(prayer, status)}
                  disabled={disabled}
                  gender={gender}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
