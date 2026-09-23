import { useState } from 'react';
import { PrayerRecord, PRAYER_NAMES } from '../../models/PrayerRecord';
import { ChevronDown, Flame, Info, Target, Trophy } from 'lucide-react';
import { getFirstRecordDate, getPrayerInsights, getTimelineDays } from '../../utils/statsUtils';
import { getCompactGregorianDate, getTodayGregorian } from '../../utils/dateUtils';

interface StatisticsCardProps {
  records: PrayerRecord[];
}

function calculateStats(records: PrayerRecord[]) {
  const sortedDays = getTimelineDays(records);
  const firstRecordedDate = getFirstRecordDate(records);
  const missedOrUnrecordedPrayers = sortedDays.reduce((sum, day) => sum + day.missed + day.unrecorded, 0);
  const insights = getPrayerInsights(records);
  
  // Calculate overall consistency
  let totalPrayed = 0;
  let totalRelevant = 0;
  let totalQada = 0;
  
  sortedDays.forEach((day) => {
    totalPrayed += day.completed;
    totalQada += day.qada;
    totalRelevant += day.date === getTodayGregorian()
      ? Math.max(day.prayersLogged.size - day.excused, 0)
      : Math.max(PRAYER_NAMES.length - day.excused, 0);
  });
  
  const consistency = totalRelevant > 0 
    ? Math.round((totalPrayed / totalRelevant) * 100) 
    : 0;
  
  return {
    ...insights,
    consistency,
    totalDays: sortedDays.length,
    totalPrayed,
    totalQada,
    missedOrUnrecordedPrayers,
    firstRecordedDate,
  };
}

export function StatisticsCard({ records }: StatisticsCardProps) {
  const stats = calculateStats(records);
  const [showStreakDetails, setShowStreakDetails] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Your Statistics
      </h2>

      <div className="grid grid-cols-3 gap-4">
        {/* Current On-Time Streak */}
        <button
          type="button"
          onClick={() => setShowStreakDetails((visible) => !visible)}
          aria-expanded={showStreakDetails}
          aria-controls="streak-explanation"
          className="text-center p-3 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          <div className="flex justify-center mb-2">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.currentStreak}
          </span>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Current On-Time Streak
          </p>
        </button>

        {/* Best On-Time Streak */}
        <button
          type="button"
          onClick={() => setShowStreakDetails((visible) => !visible)}
          aria-expanded={showStreakDetails}
          aria-controls="streak-explanation"
          className="text-center p-3 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          <div className="flex justify-center mb-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.bestStreak}
          </span>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Best On-Time Streak
          </p>
        </button>

        {/* Consistency */}
        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
          <div className="flex justify-center mb-2">
            <Target className="w-6 h-6 text-green-500" />
          </div>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.rolling30Days.rate}%
          </span>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            30-Day On-Time
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowStreakDetails((visible) => !visible)}
        aria-expanded={showStreakDetails}
        aria-controls="streak-explanation"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:text-primary-400 dark:hover:bg-primary-900/20"
      >
        <Info className="h-4 w-4" aria-hidden="true" />
        How on-time streaks work
        <ChevronDown
          className={`h-4 w-4 transition-transform ${showStreakDetails ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {showStreakDetails && (
        <div
          id="streak-explanation"
          className="mt-2 rounded-lg border border-primary-100 bg-primary-50 p-3 text-sm text-gray-700 dark:border-primary-900/50 dark:bg-primary-900/20 dark:text-gray-300"
        >
          <p>
            A day increases your streak when every non-excused prayer is marked Prayed or Jamah.
            Qada, missed, and past unrecorded prayers break it. Fully excused days keep the streak
            safe without increasing it.
          </p>
          {stats.lastBreak && (
            <div className="mt-3 border-t border-primary-100 pt-3 dark:border-primary-900/50">
              <p className="font-medium text-gray-900 dark:text-white">
                Most recent break · {getCompactGregorianDate(stats.lastBreak.date)}
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {stats.lastBreak.reasons.map((reason) => <li key={reason}>{reason}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">First Record</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {stats.firstRecordedDate ? getCompactGregorianDate(stats.firstRecordedDate) : 'Not yet'}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-600 dark:text-gray-400">Days Tracked</span>
          <span className="font-medium text-gray-900 dark:text-white">{stats.totalDays}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-600 dark:text-gray-400">Lifetime Consistency</span>
          <span className="font-medium text-gray-900 dark:text-white">{stats.consistency}%</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-600 dark:text-gray-400">Prayers Completed</span>
          <span className="font-medium text-gray-900 dark:text-white">{stats.totalPrayed}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-600 dark:text-gray-400">Qada</span>
          <span className="font-medium text-gray-900 dark:text-white">{stats.totalQada}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-600 dark:text-gray-400">Missed + Unrecorded Prayers</span>
          <span className="font-medium text-gray-900 dark:text-white">{stats.missedOrUnrecordedPrayers}</span>
        </div>
      </div>
    </div>
  );
}
