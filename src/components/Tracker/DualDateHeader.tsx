import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getFormattedGregorianDate, getFormattedHijriDate, isToday } from '../../utils/dateUtils';

interface DualDateHeaderProps {
  date: string; // YYYY-MM-DD format
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export function DualDateHeader({ date, onPrevDay, onNextDay, onToday }: DualDateHeaderProps) {
  const gregorianDisplay = getFormattedGregorianDate(date);
  const hijriDisplay = getFormattedHijriDate(date);
  const isTodayDate = isToday(date);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onPrevDay}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="text-center flex-1">
          {/* Gregorian Date */}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {gregorianDisplay}
          </h1>
          {/* Hijri Date */}
          <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
            {hijriDisplay}
          </p>
        </div>

        <button
          onClick={onNextDay}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Next day"
        >
          <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Today Button */}
      {!isTodayDate && (
        <button
          onClick={onToday}
          className="w-full mt-2 py-2 px-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
        >
          Go to Today
        </button>
      )}
    </div>
  );
}
