import { useState, useEffect, useCallback } from 'react';
import { PrayerName, PrayerStatus } from '../models/PrayerRecord';
import { getTodayGregorian, addDays, isFutureDate } from '../utils/dateUtils';
import { getRecordsByDate, saveRecord } from '../services/localStorageService';
import { DualDateHeader, PrayerList, DailySummary } from '../components/Tracker';

export function TrackerPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayGregorian());
  const [prayerStatuses, setPrayerStatuses] = useState<Record<PrayerName, PrayerStatus>>({
    Fajr: null,
    Dhuhr: null,
    Asr: null,
    Maghrib: null,
    Isha: null,
  });
  const [loading, setLoading] = useState(true);

  // Load records for selected date
  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const records = await getRecordsByDate(selectedDate);
      
      // Initialize all to null
      const statuses: Record<PrayerName, PrayerStatus> = {
        Fajr: null,
        Dhuhr: null,
        Asr: null,
        Maghrib: null,
        Isha: null,
      };
      
      // Fill in existing records
      records.forEach((record) => {
        statuses[record.prayer_name] = record.status;
      });
      
      setPrayerStatuses(statuses);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Handle status change
  const handleStatusChange = async (prayer: PrayerName, status: PrayerStatus) => {
    // Optimistically update UI
    setPrayerStatuses((prev) => ({ ...prev, [prayer]: status }));
    
    try {
      await saveRecord(selectedDate, prayer, status);
    } catch (error) {
      console.error('Failed to save record:', error);
      // Revert on error
      loadRecords();
    }
  };

  // Navigation handlers
  const handlePrevDay = () => {
    setSelectedDate((prev) => addDays(prev, -1));
  };

  const handleNextDay = () => {
    const nextDay = addDays(selectedDate, 1);
    // Allow navigating to future dates but they'll be disabled
    setSelectedDate(nextDay);
  };

  const handleToday = () => {
    setSelectedDate(getTodayGregorian());
  };

  const isDisabled = isFutureDate(selectedDate);

  return (
    <div className="min-h-full pb-20">
      <div className="max-w-lg mx-auto px-4 py-3 space-y-3">
        {/* Date Header */}
        <DualDateHeader
          date={selectedDate}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          onToday={handleToday}
        />

        {/* Future Date Warning */}
        {isDisabled && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-center">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              You cannot log prayers for future dates
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            {/* Prayer List */}
            <PrayerList
              prayerStatuses={prayerStatuses}
              onStatusChange={handleStatusChange}
              disabled={isDisabled}
            />

            {/* Daily Summary */}
            <DailySummary prayerStatuses={prayerStatuses} />
          </>
        )}
      </div>
    </div>
  );
}
