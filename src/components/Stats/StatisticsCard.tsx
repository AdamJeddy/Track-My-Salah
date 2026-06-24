import { PrayerRecord, PRAYER_NAMES } from '../../models/PrayerRecord';
import { Flame, Trophy, Target } from 'lucide-react';
import { getFirstRecordDate, getTimelineDays } from '../../utils/statsUtils';
import { getCompactGregorianDate } from '../../utils/dateUtils';

interface StatisticsCardProps {
  records: PrayerRecord[];
}

function calculateStats(records: PrayerRecord[]) {
  const sortedDays = getTimelineDays(records);
  const firstRecordedDate = getFirstRecordDate(records);
  const missedOrUnrecordedPrayers = sortedDays.reduce((sum, day) => sum + day.missed + day.unrecorded, 0);
  
  // Calculate streaks (days where all non-excused prayers were prayed)
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  
  // A "good day" is when all logged prayers (excluding excused) are Prayed or Jamah
  for (let i = sortedDays.length - 1; i >= 0; i--) {
    const day = sortedDays[i];
    const totalRelevant = Math.max(PRAYER_NAMES.length - day.excused, 0);
    
    const isGoodDay = totalRelevant > 0 && day.completed === totalRelevant && day.missed === 0 && day.unrecorded === 0;
    
    if (isGoodDay) {
      if (i === sortedDays.length - 1 || tempStreak > 0) {
        tempStreak++;
      }
    } else {
      if (currentStreak === 0) currentStreak = tempStreak;
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 0;
    }
  }
  
  // Final streak calculation
  if (currentStreak === 0) currentStreak = tempStreak;
  bestStreak = Math.max(bestStreak, tempStreak);
  
  // Calculate overall consistency
  let totalPrayed = 0;
  let totalRelevant = 0;
  let totalQada = 0;
  
  sortedDays.forEach((day) => {
    totalPrayed += day.completed;
    totalQada += day.qada;
    totalRelevant += Math.max(PRAYER_NAMES.length - day.excused, 0);
  });
  
  const consistency = totalRelevant > 0 
    ? Math.round((totalPrayed / totalRelevant) * 100) 
    : 0;
  
  return {
    currentStreak,
    bestStreak,
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Your Statistics
      </h2>

      <div className="grid grid-cols-3 gap-4">
        {/* Current Streak */}
        <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl">
          <div className="flex justify-center mb-2">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.currentStreak}
          </span>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Current Streak
          </p>
        </div>

        {/* Best Streak */}
        <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl">
          <div className="flex justify-center mb-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.bestStreak}
          </span>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Best Streak
          </p>
        </div>

        {/* Consistency */}
        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
          <div className="flex justify-center mb-2">
            <Target className="w-6 h-6 text-green-500" />
          </div>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.consistency}%
          </span>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Consistency
          </p>
        </div>
      </div>

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
