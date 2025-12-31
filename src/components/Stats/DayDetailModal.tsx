import { X } from 'lucide-react';
import { PrayerRecord, PrayerName, PrayerStatus, PRAYER_NAMES } from '../../models/PrayerRecord';
import { getFormattedGregorianDate, getFormattedHijriDate } from '../../utils/dateUtils';

interface DayDetailModalProps {
  date: string;
  records: PrayerRecord[];
  onClose: () => void;
}

const STATUS_BADGE: Record<NonNullable<PrayerStatus>, string> = {
  Prayed: 'bg-prayed/20 text-green-700 dark:text-green-400',
  Jamah: 'bg-jamah/20 text-blue-700 dark:text-blue-400',
  Missed: 'bg-missed/20 text-red-700 dark:text-red-400',
  Excused: 'bg-excused/20 text-gray-700 dark:text-gray-400',
};

export function DayDetailModal({ date, records, onClose }: DayDetailModalProps) {
  // Get status for each prayer
  const prayerStatuses: Record<PrayerName, PrayerStatus> = {
    Fajr: null,
    Dhuhr: null,
    Asr: null,
    Maghrib: null,
    Isha: null,
  };
  
  records.forEach((record) => {
    prayerStatuses[record.prayer_name] = record.status;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getFormattedGregorianDate(date)}
            </h2>
            <p className="text-sm text-primary-600 dark:text-primary-400">
              {getFormattedHijriDate(date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Prayer List */}
        <div className="p-4 space-y-3">
          {PRAYER_NAMES.map((prayer) => {
            const status = prayerStatuses[prayer];
            
            return (
              <div
                key={prayer}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {prayer}
                </span>
                {status ? (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_BADGE[status]}`}>
                    {status}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-sm text-gray-400 dark:text-gray-500">
                    Not logged
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="px-4 pb-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {records.filter((r) => r.status === 'Prayed' || r.status === 'Jamah').length} of{' '}
              {records.filter((r) => r.status !== 'Excused' && r.status !== null).length || 5} prayers completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
