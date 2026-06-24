import { PrayerRecord, PRAYER_NAMES } from '../../models/PrayerRecord';
import { useMemo } from 'react';
import { 
  getDatesInMonth, 
  getDatesInHijriMonth,
  getHijriMonthStartDay,
  getHijriDay
} from '../../utils/dateUtils';
import { buildTimelineDayMap, getTrackingRange } from '../../utils/statsUtils';
import momentHijri from 'moment-hijri';

const moment = momentHijri;

interface YearlyHeatmapProps {
  records: PrayerRecord[];
  year: number;
  calendarMode?: 'gregorian' | 'hijri';
  onDayClick?: (date: string) => void;
}

type DayStatus = 'empty' | 'unrecorded' | 'missed' | 'partial' | 'good' | 'complete';

// Month names
const GREGORIAN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HIJRI_MONTHS = ['Muḥ', 'Ṣaf', 'Rb1', 'Rb2', 'Jm1', 'Jm2', 'Raj', 'Sha', 'Ram', 'Shw', 'Qʿd', 'Ḥij'];

export function YearlyHeatmap({ records, year, calendarMode = 'gregorian', onDayClick }: YearlyHeatmapProps) {
  const trackingRange = useMemo(() => getTrackingRange(records), [records]);

  // Group records by date with status calculation
  const dayStatusMap = useMemo(() => {
    const dayMap = buildTimelineDayMap(records);
    // Convert to status levels
    const statusMap = new Map<string, DayStatus>();
    dayMap.forEach((stats, date) => {
      const relevant = Math.max(PRAYER_NAMES.length - stats.excused, 0);
      const prayedRatio = relevant > 0 ? stats.completed / relevant : 0;
      
      let status: DayStatus = 'empty';
      if (stats.missed > 0) {
        status = 'missed';
      } else if (stats.unrecorded > 0) {
        status = 'unrecorded';
      } else if (prayedRatio === 1) {
        status = 'complete';
      } else if (prayedRatio >= 0.8) {
        status = 'good';
      } else if (prayedRatio > 0) {
        status = 'partial';
      }
      statusMap.set(date, status);
    });
    
    return statusMap;
  }, [records]);

  // Generate month data for all 12 months
  const monthsData = useMemo(() => {
    const months = [];
    for (let m = 1; m <= 12; m++) {
      const dates = calendarMode === 'hijri' 
        ? getDatesInHijriMonth(year, m)
        : getDatesInMonth(year, m);
      
      const startDay = calendarMode === 'hijri'
        ? getHijriMonthStartDay(year, m)
        : moment(`${year}-${String(m).padStart(2, '0')}-01`).day();
      
      months.push({ month: m, dates, startDay });
    }
    return months;
  }, [year, calendarMode]);

  const monthNames = calendarMode === 'hijri' ? HIJRI_MONTHS : GREGORIAN_MONTHS;

  // Color classes for status levels
  const getStatusColor = (status: DayStatus) => {
    switch (status) {
      case 'missed': return 'bg-red-300 dark:bg-red-400';
      case 'unrecorded': return 'bg-gray-300 dark:bg-gray-600';
      case 'partial': return 'bg-yellow-300 dark:bg-yellow-400';
      case 'good': return 'bg-green-300 dark:bg-green-400';
      case 'complete': return 'bg-green-500 dark:bg-green-600';
      default: return 'bg-gray-200 dark:bg-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {year} {calendarMode === 'hijri' ? 'Hijri' : ''} Overview
      </h2>
      
      {/* 12-month grid - 3 columns on larger screens, 2 on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {monthsData.map(({ month, dates, startDay }) => (
          <div key={month} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2">
            {/* Month name */}
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 text-center">
              {monthNames[month - 1]}
            </div>
            
            {/* Mini calendar grid */}
            <div className="grid grid-cols-7 gap-[2px]">
              {/* Empty cells for offset */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {/* Day cells */}
              {dates.map((date) => {
                const isTrackedDate = Boolean(trackingRange && date >= trackingRange.startDate && date <= trackingRange.endDate);
                const status = dayStatusMap.get(date) ?? (isTrackedDate ? 'unrecorded' : 'empty');
                const isToday = moment(date).isSame(moment(), 'day');
                // Get the day number based on calendar mode
                const dayNum = calendarMode === 'hijri' 
                  ? getHijriDay(date) 
                  : moment(date).date();
                
                return (
                  <button
                    key={date}
                    onClick={() => onDayClick?.(date)}
                    className={`
                      aspect-square rounded-[2px] w-full flex items-center justify-center
                      ${getStatusColor(status)}
                      ${isToday ? 'ring-1 ring-primary-500' : ''}
                      hover:ring-1 hover:ring-gray-400
                      transition-all
                    `}
                    title={date}
                  >
                    <span className="text-[6px] font-medium text-gray-700 dark:text-gray-200">{dayNum}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-300 dark:bg-gray-600" />
          <span>Unrecorded</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-red-300" />
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-yellow-300" />
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span>Complete</span>
        </div>
      </div>
    </div>
  );
}
