import { useState, useEffect, useCallback } from 'react';
import { PrayerRecord } from '../models/PrayerRecord';
import { getAllRecords, getRecordsByDate } from '../services/localStorageService';
import { getCurrentGregorianYear } from '../utils/dateUtils';
import {
  StatisticsCard,
  YearlyHeatmap,
  MonthlyGrid,
  DayDetailModal,
  CalendarToggle,
} from '../components/Stats';
import moment from 'moment';

export function StatsPage() {
  const [records, setRecords] = useState<PrayerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(getCurrentGregorianYear());
  const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1); // 1-12
  const [calendarMode, setCalendarMode] = useState<'gregorian' | 'hijri'>('gregorian');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayRecords, setDayRecords] = useState<PrayerRecord[]>([]);

  // Load all records
  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const allRecords = await getAllRecords();
      setRecords(allRecords);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Handle day click
  const handleDayClick = async (date: string) => {
    setSelectedDay(date);
    const dayRecs = await getRecordsByDate(date);
    setDayRecords(dayRecs);
  };

  // Filter records for selected year
  const yearRecords = records.filter((r) => {
    const recordYear = moment(r.gregorian_date).year();
    return recordYear === selectedYear;
  });

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-full pb-20">
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your prayer journey
          </p>
        </div>

        {/* Statistics Card */}
        <StatisticsCard records={records} />

        {/* Calendar Toggle */}
        <CalendarToggle mode={calendarMode} onModeChange={setCalendarMode} />

        {/* Year Selector */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setSelectedYear((y) => y - 1)}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← {selectedYear - 1}
          </button>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedYear}
          </span>
          <button
            onClick={() => setSelectedYear((y) => y + 1)}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            disabled={selectedYear >= getCurrentGregorianYear()}
          >
            {selectedYear + 1} →
          </button>
        </div>

        {/* Yearly Heatmap */}
        <YearlyHeatmap
          records={yearRecords}
          year={selectedYear}
          onDayClick={handleDayClick}
        />

        {/* Monthly Grid */}
        <MonthlyGrid
          records={records}
          year={selectedYear}
          month={selectedMonth}
          onMonthChange={(year, month) => {
            setSelectedYear(year);
            setSelectedMonth(month);
          }}
          onDayClick={handleDayClick}
        />

        {/* Day Detail Modal */}
        {selectedDay && (
          <DayDetailModal
            date={selectedDay}
            records={dayRecords}
            onClose={() => setSelectedDay(null)}
          />
        )}
      </div>
    </div>
  );
}
