import { PrayerRecord } from '../../models/PrayerRecord';
import { useMemo } from 'react';
import { 
  getDatesInMonth, 
  getDatesInHijriMonth,
  getHijriMonthStartDay,
  getHijriDay
} from '../../utils/dateUtils';
import momentHijri from 'moment-hijri';

const moment = momentHijri;

interface YearlyHeatmapProps {
  records: PrayerRecord[];
  year: number;
  calendarMode?: 'gregorian' | 'hijri';
  onDayClick?: (date: string) => void;
}

// Month names
const GREGORIAN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HIJRI_MONTHS = ['Muḥ', 'Ṣaf', 'Rb1', 'Rb2', 'Jm1', 'Jm2', 'Raj', 'Sha', 'Ram', 'Shw', 'Qʿd', 'Ḥij'];

export function YearlyHeatmap({ records, year, calendarMode = 'gregorian', onDayClick }: YearlyHeatmapProps) {
  // Group records by date with status calculation
  const dayStatusMap = useMemo(() => {
    const dayMap = new Map<string, { prayed: number; jamah: number; missed: number; qada: number; total: number }>();
    
    records.forEach((record) => {
      if (!dayMap.has(record.gregorian_date)) {
        dayMap.set(record.gregorian_date, { prayed: 0, jamah: 0, missed: 0, qada: 0, total: 0 });
      }
      
      const day = dayMap.get(record.gregorian_date)!;
      if (record.status === 'Prayed') day.prayed++;
      else if (record.status === 'Jamah') day.jamah++;
      else if (record.status === 'Missed') day.missed++;
      else if (record.status === 'Qada') day.qada++;
      if (record.status !== 'Excused' && record.status !== null) day.total++;
    });
    
    // Convert to status levels
    const statusMap = new Map<string, number>();
    dayMap.forEach((stats, date) => {
      const prayedRatio = stats.total > 0 ? (stats.prayed + stats.jamah + stats.qada) / stats.total : 0;
      const jamahRatio = stats.total > 0 ? stats.jamah / stats.total : 0;
      
      let status = 0;
      if (stats.missed > 0 && stats.missed === stats.total) {
        status = 1; // All missed
      } else if (prayedRatio >= 0.8) {
        status = jamahRatio >= 0.5 ? 4 : 3; // Excellent
      } else if (prayedRatio >= 0.5) {
        status = 2; // Good
      } else if (stats.total > 0) {
        status = 1; // Poor
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
  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return 'bg-red-300 dark:bg-red-400';
      case 2: return 'bg-green-200 dark:bg-green-300';
      case 3: return 'bg-green-400 dark:bg-green-500';
      case 4: return 'bg-green-600 dark:bg-green-700';
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
                const status = dayStatusMap.get(date) || 0;
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
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600 dark:text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700" />
          <div className="w-3 h-3 rounded-sm bg-red-300" />
          <div className="w-3 h-3 rounded-sm bg-green-200" />
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          <div className="w-3 h-3 rounded-sm bg-green-600" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
