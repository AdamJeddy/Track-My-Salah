import { PrayerStatus, PRAYER_STATUS_OPTIONS } from '../../models/PrayerRecord';

interface StatusToggleProps {
  currentStatus: PrayerStatus;
  onStatusChange: (status: PrayerStatus) => void;
  disabled?: boolean;
}

const STATUS_CONFIG: Record<NonNullable<PrayerStatus>, { 
  label: string; 
  bgActive: string; 
  bgInactive: string;
  textActive: string;
  textInactive: string;
}> = {
  Prayed: {
    label: 'Prayed',
    bgActive: 'bg-prayed',
    bgInactive: 'bg-gray-100 dark:bg-gray-700',
    textActive: 'text-white',
    textInactive: 'text-gray-600 dark:text-gray-300',
  },
  Jamah: {
    label: 'Jamah',
    bgActive: 'bg-jamah',
    bgInactive: 'bg-gray-100 dark:bg-gray-700',
    textActive: 'text-white',
    textInactive: 'text-gray-600 dark:text-gray-300',
  },
  Missed: {
    label: 'Missed',
    bgActive: 'bg-missed',
    bgInactive: 'bg-gray-100 dark:bg-gray-700',
    textActive: 'text-white',
    textInactive: 'text-gray-600 dark:text-gray-300',
  },
  Excused: {
    label: 'Excused',
    bgActive: 'bg-excused',
    bgInactive: 'bg-gray-100 dark:bg-gray-700',
    textActive: 'text-white',
    textInactive: 'text-gray-600 dark:text-gray-300',
  },
};

export function StatusToggle({ currentStatus, onStatusChange, disabled }: StatusToggleProps) {
  const handleClick = (status: NonNullable<PrayerStatus>) => {
    if (disabled) return;
    // Toggle: if same status clicked, set to null; otherwise set new status
    onStatusChange(currentStatus === status ? null : status);
  };

  return (
    <div className="flex gap-1 flex-nowrap overflow-x-auto">
      {PRAYER_STATUS_OPTIONS.filter((s): s is NonNullable<PrayerStatus> => s !== null).map((status) => {
        const config = STATUS_CONFIG[status];
        const isActive = currentStatus === status;
        
        return (
          <button
            key={status}
            onClick={() => handleClick(status)}
            disabled={disabled}
            className={`
              px-2 py-1.5 rounded-md text-xs font-medium transition-all flex-shrink-0
              min-h-[36px] min-w-[60px]
              ${isActive ? config.bgActive : config.bgInactive}
              ${isActive ? config.textActive : config.textInactive}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'}
            `}
            aria-pressed={isActive}
            title={config.label}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
