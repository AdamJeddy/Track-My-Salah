import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrayerRecord } from '../models/PrayerRecord';
import { getAllRecords, getRecordsByDate, getGenderPreference, saveRecord } from '../services/localStorageService';
import { getCurrentGregorianYear, getCurrentHijriYear, getCurrentHijriMonth, getFormattedGregorianDate, getFormattedHijriDate } from '../utils/dateUtils';
import { getTimelineDays, getMissingPrayerNames, getFirstRecordDate } from '../utils/statsUtils';
import { getTodayGregorian } from '../utils/dateUtils';
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

type HijriMoment = ReturnType<typeof moment> & {
  iYear?: () => number;
};

export function StatsPage() {
  const navigate = useNavigate();
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
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const timelineDays = useMemo(() => getTimelineDays(records), [records]);

  interface PrayerEntry {
    name: string;
    type: 'Missed' | 'Unrecorded';
  }

  const missedDays = useMemo(() => {
    const explicitMissedByDate = new Map<string, string[]>();
    const today = getTodayGregorian();
    const firstRecordDate = getFirstRecordDate(records);

    records.forEach((record) => {
      if (record.status === 'Missed') {
        const prayers = explicitMissedByDate.get(record.gregorian_date) ?? [];
        prayers.push(record.prayer_name);
        explicitMissedByDate.set(record.gregorian_date, prayers);
      }
    });

    return timelineDays
      .filter((day) => (day.missed > 0 || day.unrecorded > 0))
      .filter((day) => day.date !== today || day.missed > 0)
      .filter((day) => day.date !== firstRecordDate)
      .map((day) => {
        const prayers: PrayerEntry[] = [];

        (explicitMissedByDate.get(day.date) ?? []).forEach((name) => {
          prayers.push({ name, type: 'Missed' });
        });

        if (day.unrecorded > 0 && day.date !== today) {
          getMissingPrayerNames(day).forEach((name) => {
            prayers.push({ name, type: 'Unrecorded' });
          });
        }

        return {
          gregorian: day.date,
          hijri: day.hijriDate,
          prayers,
        };
      })
      .sort((a, b) => b.gregorian.localeCompare(a.gregorian));
  }, [records, timelineDays]);

  // Load all records
  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const [allRecords, savedGender] = await Promise.all([getAllRecords(), getGenderPreference()]);
      setRecords(allRecords);
      setGender(savedGender);
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

  const handleDayStatusChange = async (
    date: string,
    prayerName: PrayerRecord['prayer_name'],
    status: PrayerRecord['status']
  ) => {
    try {
      await saveRecord(date, prayerName, status);
      const [dayRecs, allRecords] = await Promise.all([getRecordsByDate(date), getAllRecords()]);
      setDayRecords(dayRecs);
      setRecords(allRecords);
    } catch (error) {
      console.error('Failed to update record from stats:', error);
    }
  };

  const handleOpenDayInTracker = (date: string) => {
    navigate('/tracker', { state: { selectedDate: date } });
  };

  // Filter records for selected year
  const yearRecords = records.filter((r) => {
    try {
      if (calendarMode === 'gregorian') {
        const recordYear = moment(r.gregorian_date).year();
        return recordYear === selectedYear;
      } else {
        // For Hijri, parse from formatted iYYYY with Arabic numeral conversion
        const m = moment(r.gregorian_date) as HijriMoment;
        let hijriYear: number;
        
        if (typeof m.iYear === 'function') {
          hijriYear = m.iYear();
        } else {
          const hijriStr = m.format('iYYYY');
          // Convert Arabic numerals to ASCII using char codes
          const arabicZeroCode = '٠'.charCodeAt(0); // 1632
          const englishStr = Array.from(hijriStr)
            .map((char) => {
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
  void yearRecords;

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
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Missed Prayers</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Prayers that were missed or left unrecorded since your first record</p>
          </div>

          {missedDays.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">No missed prayers yet.</p>
          ) : (
            <div className="space-y-2">
              {missedDays.map((day) => (
                <div key={day.gregorian} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      {getFormattedGregorianDate(day.gregorian)}
                    </p>
                    <p className="text-xs text-primary-600 dark:text-primary-400">
                      {getFormattedHijriDate(day.gregorian)}
                    </p>
                    <span className="text-xs text-gray-400 ml-auto">
                      {day.prayers.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {day.prayers.map((p) => (
                      <span
                        key={`${day.gregorian}-${p.name}-${p.type}`}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.type === 'Missed'
                            ? 'bg-missed/10 text-missed'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {p.name}
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
          records={records}
          year={selectedYear}
          calendarMode={calendarMode}
          onDayClick={handleDayClick}
        />

        {/* Day Detail Modal */}
        {selectedDay && (
          <DayDetailModal
            date={selectedDay}
            records={dayRecords}
            gender={gender}
            onStatusChange={handleDayStatusChange}
            onOpenInTracker={handleOpenDayInTracker}
            onClose={() => setSelectedDay(null)}
          />
        )}
      </div>
    </div>
  );
}
