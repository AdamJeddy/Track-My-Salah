import { PrayerName, PrayerStatus, PRAYER_NAMES } from '../../models/PrayerRecord';
import { Check, X, Users, Clock } from 'lucide-react';

interface DailySummaryProps {
  prayerStatuses: Record<PrayerName, PrayerStatus>;
}

export function DailySummary({ prayerStatuses }: DailySummaryProps) {
  const stats = PRAYER_NAMES.reduce(
    (acc, prayer) => {
      const status = prayerStatuses[prayer];
      if (status === 'Prayed') acc.prayed++;
      else if (status === 'Jamah') acc.jamah++;
      else if (status === 'Missed') acc.missed++;
      else if (status === 'Excused') acc.excused++;
      else acc.pending++;
      return acc;
    },
    { prayed: 0, jamah: 0, missed: 0, excused: 0, pending: 0 }
  );

  const totalLogged = stats.prayed + stats.jamah + stats.missed + stats.excused;
  const totalPrayed = stats.prayed + stats.jamah;
  const progressPercentage = (totalLogged / 5) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
        Daily Summary
      </h2>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">
            {totalLogged}/5 Logged
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2 rounded-lg bg-prayed/10">
          <div className="flex justify-center mb-1">
            <Check className="w-4 h-4 text-prayed" />
          </div>
          <span className="text-lg font-bold text-prayed">{stats.prayed}</span>
          <p className="text-xs text-gray-500 dark:text-gray-400">Prayed</p>
        </div>

        <div className="p-2 rounded-lg bg-jamah/10">
          <div className="flex justify-center mb-1">
            <Users className="w-4 h-4 text-jamah" />
          </div>
          <span className="text-lg font-bold text-jamah">{stats.jamah}</span>
          <p className="text-xs text-gray-500 dark:text-gray-400">Jamah</p>
        </div>

        <div className="p-2 rounded-lg bg-missed/10">
          <div className="flex justify-center mb-1">
            <X className="w-4 h-4 text-missed" />
          </div>
          <span className="text-lg font-bold text-missed">{stats.missed}</span>
          <p className="text-xs text-gray-500 dark:text-gray-400">Missed</p>
        </div>

        <div className="p-2 rounded-lg bg-excused/10">
          <div className="flex justify-center mb-1">
            <Clock className="w-4 h-4 text-excused" />
          </div>
          <span className="text-lg font-bold text-excused">{stats.excused}</span>
          <p className="text-xs text-gray-500 dark:text-gray-400">Excused</p>
        </div>
      </div>

      {/* Prayers Completed Today */}
      {totalPrayed > 0 && (
        <p className="text-center text-sm text-primary-600 dark:text-primary-400 mt-3 font-medium">
          🤲 {totalPrayed} prayer{totalPrayed !== 1 ? 's' : ''} completed today
        </p>
      )}
    </div>
  );
}
