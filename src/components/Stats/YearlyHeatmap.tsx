import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { PrayerRecord } from '../../models/PrayerRecord';
import { useMemo } from 'react';

interface YearlyHeatmapProps {
  records: PrayerRecord[];
  year: number;
  onDayClick?: (date: string) => void;
}

interface HeatmapValue {
  date: string;
  count: number; // 0 = missed, 1 = partial, 2 = prayed, 3 = jamah
}

export function YearlyHeatmap({ records, year, onDayClick }: YearlyHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Group records by date
    const dayMap = new Map<string, { prayed: number; jamah: number; missed: number; total: number }>();
    
    records.forEach((record) => {
      if (!dayMap.has(record.gregorian_date)) {
        dayMap.set(record.gregorian_date, { prayed: 0, jamah: 0, missed: 0, total: 0 });
      }
      
      const day = dayMap.get(record.gregorian_date)!;
      if (record.status === 'Prayed') day.prayed++;
      else if (record.status === 'Jamah') day.jamah++;
      else if (record.status === 'Missed') day.missed++;
      // Excused doesn't count towards total for coloring
      if (record.status !== 'Excused' && record.status !== null) day.total++;
    });
    
    // Convert to heatmap format
    const values: HeatmapValue[] = [];
    
    dayMap.forEach((stats, date) => {
      const prayedRatio = stats.total > 0 ? (stats.prayed + stats.jamah) / stats.total : 0;
      const jamahRatio = stats.total > 0 ? stats.jamah / stats.total : 0;
      
      let count = 0;
      if (stats.missed > 0 && stats.missed === stats.total) {
        count = 1; // All missed
      } else if (prayedRatio >= 0.8) {
        count = jamahRatio >= 0.5 ? 4 : 3; // Excellent (mostly jamah or mostly prayed)
      } else if (prayedRatio >= 0.5) {
        count = 2; // Good
      } else if (stats.total > 0) {
        count = 1; // Poor
      }
      
      values.push({ date, count });
    });
    
    return values;
  }, [records]);

  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  // Custom tooltip
  const getTooltipDataAttrs = (value: HeatmapValue | null) => {
    if (!value || !value.date) {
      return { 'data-tip': 'No data' };
    }
    
    const dayRecords = records.filter((r) => r.gregorian_date === value.date);
    const prayed = dayRecords.filter((r) => r.status === 'Prayed' || r.status === 'Jamah').length;
    const total = dayRecords.filter((r) => r.status !== 'Excused' && r.status !== null).length;
    
    return {
      'data-tip': `${value.date}: ${prayed}/${total || 0} prayers`,
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {year} Overview
      </h2>
      
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <CalendarHeatmap
            startDate={new Date(startDate)}
            endDate={new Date(endDate)}
            values={heatmapData}
            classForValue={(value) => {
              if (!value || value.count === 0) {
                return 'color-empty';
              }
              return `color-scale-${value.count}`;
            }}
            tooltipDataAttrs={getTooltipDataAttrs as any}
            onClick={(value) => {
              if (value && onDayClick) {
                onDayClick(value.date);
              }
            }}
            showWeekdayLabels
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-600 dark:text-gray-400">
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
      
      {/* Custom styles for heatmap */}
      <style>{`
        .react-calendar-heatmap .color-empty {
          fill: #e5e7eb;
        }
        .dark .react-calendar-heatmap .color-empty {
          fill: #374151;
        }
        .react-calendar-heatmap .color-scale-1 {
          fill: #fca5a5;
        }
        .react-calendar-heatmap .color-scale-2 {
          fill: #bbf7d0;
        }
        .react-calendar-heatmap .color-scale-3 {
          fill: #4ade80;
        }
        .react-calendar-heatmap .color-scale-4 {
          fill: #16a34a;
        }
        .react-calendar-heatmap text {
          fill: #6b7280;
          font-size: 8px;
        }
        .dark .react-calendar-heatmap text {
          fill: #9ca3af;
        }
        .react-calendar-heatmap rect:hover {
          stroke: #1f2937;
          stroke-width: 1px;
        }
        .dark .react-calendar-heatmap rect:hover {
          stroke: #f3f4f6;
        }
      `}</style>
    </div>
  );
}
