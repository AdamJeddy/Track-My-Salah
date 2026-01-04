import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PrayerRecord } from '../../models/PrayerRecord';
import { 
  getDatesInMonth, 
  getMonthYearDisplay, 
  formatHijri,
  getDatesInHijriMonth,
  getHijriMonthYearDisplay,
  getHijriMonthStartDay,
  getHijriDay
} from '../../utils/dateUtils';
import momentHijri from 'moment-hijri';

const moment = momentHijri;

interface MonthlyGridProps {
  records: PrayerRecord[];
  year: number;
  month: number; // 1-12
  calendarMode?: 'gregorian' | 'hijri';
  onMonthChange: (year: number, month: number) => void;
  onDayClick?: (date: string) => void;
}

export function MonthlyGrid({ records, year, month, calendarMode = 'gregorian', onMonthChange, onDayClick }: MonthlyGridProps) {
  // Get dates based on calendar mode
  const dates = useMemo(() => {
    if (calendarMode === 'hijri') {
      return getDatesInHijriMonth(year, month);
    }
    return getDatesInMonth(year, month);
  }, [year, month, calendarMode]);
  
  // Group records by date
  const recordsByDate = useMemo(() => {
    const map = new Map<string, PrayerRecord[]>();
    records.forEach((record) => {
      if (!map.has(record.gregorian_date)) {
        map.set(record.gregorian_date, []);
      }
      map.get(record.gregorian_date)!.push(record);
    });
    return map;
  }, [records]);

  // Calculate day status
  const getDayStatus = (date: string): 'excellent' | 'good' | 'partial' | 'poor' | 'empty' => {
    const dayRecords = recordsByDate.get(date) || [];
    if (dayRecords.length === 0) return 'empty';
    
    const prayed = dayRecords.filter((r) => r.status === 'Prayed' || r.status === 'Jamah' || r.status === 'Qada').length;
    const relevant = dayRecords.filter((r) => r.status !== 'Excused' && r.status !== null).length;
    
    if (relevant === 0) return 'empty';
    
    const ratio = prayed / relevant;
    if (ratio >= 0.9) return 'excellent';
    if (ratio >= 0.7) return 'good';
    if (ratio >= 0.4) return 'partial';
    return 'poor';
  };

  const statusColors = {
    excellent: 'bg-green-500 text-white',
    good: 'bg-green-300 text-gray-900',
    partial: 'bg-yellow-300 text-gray-900',
    poor: 'bg-red-300 text-gray-900',
    empty: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  };

  // Get first day of month to calculate offset
  const startDayOfWeek = useMemo(() => {
    if (calendarMode === 'hijri') {
      return getHijriMonthStartDay(year, month);
    }
    const firstDayOfMonth = moment(`${year}-${String(month).padStart(2, '0')}-01`);
    return firstDayOfMonth.day(); // 0 = Sunday
  }, [year, month, calendarMode]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(year - 1, 12);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(year + 1, 1);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  // Get display title
  const monthTitle = useMemo(() => {
    if (calendarMode === 'hijri') {
      return getHijriMonthYearDisplay(year, month);
    }
    return getMonthYearDisplay(year, month);
  }, [year, month, calendarMode]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {monthTitle}
        </h2>
        
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Day of Week Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {/* Date cells */}
        {dates.map((date) => {
          const status = getDayStatus(date);
          // Show the day number based on calendar mode
          const dayNum = calendarMode === 'hijri' 
            ? getHijriDay(date)  // Hijri day number
            : moment(date).date();  // Gregorian day number
          const hijriDay = calendarMode === 'hijri'
            ? moment(date).date()  // Show Gregorian as secondary
            : formatHijri(date, 'iD');  // Show Hijri as secondary
          const isToday = moment(date).isSame(moment(), 'day');
          
          return (
            <button
              key={date}
              onClick={() => onDayClick?.(date)}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center
                transition-all hover:ring-2 hover:ring-primary-500
                ${statusColors[status]}
                ${isToday ? 'ring-2 ring-primary-600' : ''}
              `}
            >
              <span className="text-sm font-medium">{dayNum}</span>
              <span className="text-[10px] opacity-70">{hijriDay}</span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-gray-600 dark:text-gray-400">Excellent</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-300" />
          <span className="text-gray-600 dark:text-gray-400">Good</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-300" />
          <span className="text-gray-600 dark:text-gray-400">Partial</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-300" />
          <span className="text-gray-600 dark:text-gray-400">Poor</span>
        </div>
      </div>
    </div>
  );
}
