import { useState, useEffect, useCallback, useMemo } from 'react';
import { PrayerRecord } from '../models/PrayerRecord';
import { getAllRecords, getRecordsByDate } from '../services/localStorageService';
import { getCurrentGregorianYear, getCurrentHijriYear, getCurrentHijriMonth, getFormattedGregorianDate, getFormattedHijriDate } from '../utils/dateUtils';
import {
  StatisticsCard,
  YearlyHeatmap,
  MonthlyGrid,
  DayDetailModal,
  CalendarToggle,
} from '../components/Stats';
import momentHijri from 'moment-hijri';

const moment = momentHijri;
moment.locale('en');

export function StatsPage() {
  const [records, setRecords] = useState<PrayerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarMode, setCalendarMode] = useState<'gregorian' | 'hijri'>('gregorian');
  const [selectedYear, setSelectedYear] = useState(
    calendarMode === 'gregorian' ? getCurrentGregorianYear() : getCurrentHijriYear()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    calendarMode === 'gregorian' ? moment().month() + 1 : getCurrentHijriMonth()
  ); // 1-12
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayRecords, setDayRecords] = useState<PrayerRecord[]>([]);

  const missedGroups = useMemo(() => {
    const map = new Map<string, { gregorian: string; hijri: string; missed: string[] }>();

    records.forEach((record) => {
      if (record.status === 'Missed') {
        if (!map.has(record.gregorian_date)) {
          map.set(record.gregorian_date, {
            gregorian: record.gregorian_date,
            hijri: record.hijri_date,
            missed: [],
          });
        }
        const entry = map.get(record.gregorian_date)!;
        entry.missed.push(record.prayer_name);
      }
    });

    return Array.from(map.values()).sort((a, b) => b.gregorian.localeCompare(a.gregorian)).slice(0, 20);
  }, [records]);

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
    try {
      if (calendarMode === 'gregorian') {
        const recordYear = moment(r.gregorian_date).year();
        return recordYear === selectedYear;
      } else {
        // For Hijri, parse from formatted iYYYY with Arabic numeral conversion
        const m = moment(r.gregorian_date) as any;
        let hijriYear: number;
        
        if (typeof m.iYear === 'function') {
          hijriYear = m.iYear();
        } else {
          const hijriStr = m.format('iYYYY');
          // Convert Arabic numerals to ASCII using char codes
          const arabicZeroCode = '٠'.charCodeAt(0); // 1632
          const englishStr = (Array.from(hijriStr) as string[])
            .map((char: string) => {
              const code = char.charCodeAt(0);
              if (code >= arabicZeroCode && code <= arabicZeroCode + 9) {
                return String(code - arabicZeroCode);
              }
              return char;
            })
            .join('')
            .replace(/i/g, '');
          hijriYear = parseInt(englishStr, 10);
        }
        
        return hijriYear === selectedYear;
      }
    } catch (error) {
      console.error('Error filtering record:', r, error);
      return false;
    }
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

        {/* Missed Log */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Missed Prayers</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recent prayers that were missed</p>
            </div>
          </div>

          {missedGroups.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">No missed prayers yet.</p>
          ) : (
            <div className="space-y-3">
              {missedGroups.map((group) => (
                <div key={group.gregorian} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{getFormattedGregorianDate(group.gregorian)}</p>
                      <p className="text-xs text-primary-600 dark:text-primary-400">{getFormattedHijriDate(group.gregorian)}</p>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {group.missed.length} {group.missed.length === 1 ? 'prayer' : 'prayers'}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {group.missed.map((prayer) => (
                      <span key={`${group.gregorian}-${prayer}-missed`} className="px-2 py-1 rounded-full text-xs font-medium bg-missed/10 text-missed">
                        {prayer} — Missed
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendar Toggle */}
        <CalendarToggle mode={calendarMode} onModeChange={(mode) => {
          setCalendarMode(mode);
          // Reset year and month when switching modes
          setSelectedYear(mode === 'gregorian' ? getCurrentGregorianYear() : getCurrentHijriYear());
          setSelectedMonth(mode === 'gregorian' ? moment().month() + 1 : getCurrentHijriMonth());
        }} />

        {/* Year Selector */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setSelectedYear((y) => y - 1)}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← {selectedYear - 1}
          </button>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedYear} {calendarMode === 'hijri' ? 'H' : ''}
          </span>
          <button
            onClick={() => setSelectedYear((y) => y + 1)}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            disabled={calendarMode === 'gregorian' && selectedYear >= getCurrentGregorianYear()}
          >
            {selectedYear + 1} →
          </button>
        </div>

        {/* Monthly Grid */}
        <MonthlyGrid
          records={records}
          year={selectedYear}
          month={selectedMonth}
          calendarMode={calendarMode}
          onMonthChange={(year, month) => {
            setSelectedYear(year);
            setSelectedMonth(month);
          }}
          onDayClick={handleDayClick}
        />

        {/* Yearly Heatmap */}
        <YearlyHeatmap
          records={yearRecords}
          year={selectedYear}
          calendarMode={calendarMode}
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
