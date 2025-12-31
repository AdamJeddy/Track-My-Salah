import moment from 'moment';
import 'moment-hijri';

// Remove leading 'i' prefixes that moment-hijri includes in formatted tokens
function stripHijriPrefixes(value: string): string {
  // Remove literal "i" prefixes moment-hijri adds before numbers/month names, e.g., "i31", "iDecember"
  return value.replace(/i(?=[\p{L}0-9\u0660-\u0669])/gu, '');
}

function formatHijri(date: string | Date, pattern: string): string {
  return stripHijriPrefixes(moment(date).format(pattern));
}

/**
 * Convert Gregorian date to Hijri date string
 * @param gregorianDate - Date in YYYY-MM-DD format or Date object
 * @returns Hijri date string in YYYY-MM-DD format
 */
export function gregorianToHijri(gregorianDate: string | Date): string {
  const m = moment(gregorianDate);
  return stripHijriPrefixes(m.format('iYYYY-iMM-iDD'));
}

/**
 * Get formatted Hijri date for display
 * @param gregorianDate - Date in YYYY-MM-DD format or Date object
 * @returns Formatted Hijri date string (e.g., "11 Jumada al-Thani 1447")
 */
export function getFormattedHijriDate(gregorianDate: string | Date): string {
  return formatHijri(gregorianDate, 'iD iMMMM iYYYY');
}

/**
 * Get formatted Gregorian date for display
 * @param date - Date in YYYY-MM-DD format or Date object
 * @returns Formatted date string (e.g., "Thursday, 1 Jan 2026")
 */
export function getFormattedGregorianDate(date: string | Date): string {
  const m = moment(date);
  return m.format('dddd, D MMM YYYY');
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayGregorian(): string {
  return moment().format('YYYY-MM-DD');
}

/**
 * Get today's Hijri date in iYYYY-iMM-iDD format
 */
export function getTodayHijri(): string {
  return formatHijri(moment(), 'iYYYY-iMM-iDD');
}

/**
 * Format a date to YYYY-MM-DD
 */
export function formatDateToISO(date: Date | string): string {
  return moment(date).format('YYYY-MM-DD');
}

/**
 * Get the start and end dates of a Gregorian year
 */
export function getGregorianYearRange(year: number): { start: string; end: string } {
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
}

/**
 * Get the start and end dates of a Hijri year (in Gregorian dates)
 */
export function getHijriYearRange(hijriYear: number): { start: string; end: string } {
  // First day of Hijri year
  const startHijri = moment(`${hijriYear}-01-01`, 'iYYYY-iMM-iDD');
  // Last day of Hijri year (12th month, 29 or 30 days)
  const endHijri = moment(`${hijriYear}-12-30`, 'iYYYY-iMM-iDD');
  
  return {
    start: startHijri.format('YYYY-MM-DD'),
    end: endHijri.format('YYYY-MM-DD'),
  };
}

/**
 * Get the current Hijri year
 */
export function getCurrentHijriYear(): number {
  return moment().iYear();
}

/**
 * Get the current Gregorian year
 */
export function getCurrentGregorianYear(): number {
  return moment().year();
}

/**
 * Navigate to previous/next day
 */
export function addDays(date: string, days: number): string {
  return moment(date).add(days, 'days').format('YYYY-MM-DD');
}

/**
 * Get all dates in a month
 */
export function getDatesInMonth(year: number, month: number): string[] {
  const startOfMonth = moment({ year, month: month - 1, day: 1 });
  const endOfMonth = startOfMonth.clone().endOf('month');
  const dates: string[] = [];
  
  const current = startOfMonth.clone();
  while (current.isSameOrBefore(endOfMonth)) {
    dates.push(current.format('YYYY-MM-DD'));
    current.add(1, 'day');
  }
  
  return dates;
}

/**
 * Check if a date is today
 */
export function isToday(date: string): boolean {
  return moment(date).isSame(moment(), 'day');
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(date: string): boolean {
  return moment(date).isAfter(moment(), 'day');
}

/**
 * Get month name and year for display
 */
export function getMonthYearDisplay(year: number, month: number): string {
  return moment({ year, month: month - 1 }).format('MMMM YYYY');
}

/**
 * Get Hijri month name and year for display
 */
export function getHijriMonthYearDisplay(date: string): string {
  return formatHijri(date, 'iMMMM iYYYY');
}

// Export helpers if needed elsewhere
export { stripHijriPrefixes, formatHijri };
