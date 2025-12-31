import momentHijri from 'moment-hijri';

// Use the moment-hijri instance directly (it extends moment)
const moment = momentHijri;

// Force English locale to get ASCII numerals from moment-hijri
moment.locale('en');

// Convert Arabic numerals (٠-٩) to ASCII digits (0-9) using char codes
function arabicToEnglish(str: string): string {
  const arabicZeroCode = '٠'.charCodeAt(0); // 1632
  return Array.from(str)
    .map(char => {
      const code = char.charCodeAt(0);
      // Check if character is an Arabic digit
      if (code >= arabicZeroCode && code <= arabicZeroCode + 9) {
        return String(code - arabicZeroCode);
      }
      return char;
    })
    .join('');
}

// Remove leading 'i' prefixes that moment-hijri includes in formatted tokens
function stripHijriPrefixes(value: string): string {
  // Remove literal "i" prefixes moment-hijri adds before numbers/month names, e.g., "i31", "iDecember"
  return value.replace(/i(?=[\p{L}0-9\u0660-\u0669])/gu, '');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatHijri(date: any, pattern: string): string {
  return stripHijriPrefixes(moment(date).format(pattern));
}

// Hijri month names in English
const HIJRI_MONTH_NAMES = [
  'Muharram',
  'Safar', 
  'Rabi\' al-Awwal',
  'Rabi\' al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Sha\'ban',
  'Ramadan',
  'Shawwal',
  'Dhu al-Qi\'dah',
  'Dhu al-Hijjah'
];

/**
 * Get Hijri month name
 */
export function getHijriMonthName(month: number): string {
  return HIJRI_MONTH_NAMES[month - 1] || `Month ${month}`;
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
 * @returns Formatted Hijri date string (e.g., "12 Rajab 1447")
 */
export function getFormattedHijriDate(gregorianDate: string | Date): string {
  const m = moment(gregorianDate);
  const dayStr = stripHijriPrefixes(m.format('iD'));
  const monthStr = stripHijriPrefixes(m.format('iM'));
  const yearStr = stripHijriPrefixes(m.format('iYYYY'));
  
  const day = parseInt(arabicToEnglish(dayStr), 10);
  const month = parseInt(arabicToEnglish(monthStr), 10);
  const year = parseInt(arabicToEnglish(yearStr), 10);
  
  return `${day} ${getHijriMonthName(month)} ${year}`;
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
  try {
    const m = moment() as any;
    // moment-hijri stores hijri data in _d._hijri or via iYear() method
    // If iYear is not available, parse from format with Arabic-to-English conversion
    if (typeof m.iYear === 'function') {
      return m.iYear();
    }
    // Fallback: parse the formatted string with Arabic numeral conversion
    const hijriStr = m.format('iYYYY');
    const stripped = stripHijriPrefixes(hijriStr);
    const englishStr = arabicToEnglish(stripped);
    const year = parseInt(englishStr, 10);
    
    // Validate the result
    if (isNaN(year) || year < 1400 || year > 1500) {
      console.warn('Invalid Hijri year calculated:', year, 'from string:', hijriStr);
      // Return a reasonable default (Hijri year for 2026 is approximately 1447-1448)
      return 1447;
    }
    
    return year;
  } catch (error) {
    console.error('Error getting Hijri year:', error);
    return 1447; // Fallback to reasonable default
  }
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
export function getHijriMonthYearDisplay(hijriYear: number, hijriMonth: number): string {
  return `${getHijriMonthName(hijriMonth)} ${hijriYear}`;
}

/**
 * Get all dates in a Hijri month (returns Gregorian dates)
 */
export function getDatesInHijriMonth(hijriYear: number, hijriMonth: number): string[] {
  // Hijri months have 29 or 30 days
  const dates: string[] = [];
  
  // Start from day 1 of the Hijri month
  for (let day = 1; day <= 30; day++) {
    const hijriDateStr = `${hijriYear}-${String(hijriMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const m = moment(hijriDateStr, 'iYYYY-iMM-iDD');
    
    // Check if the date is valid (moment-hijri returns invalid for day 30 of 29-day months)
    if (m.isValid()) {
      // Convert to Gregorian
      dates.push(m.format('YYYY-MM-DD'));
    }
  }
  
  return dates;
}

/**
 * Get the start of a Hijri month (returns Gregorian date)
 */
export function getStartOfHijriMonth(hijriYear: number, hijriMonth: number): string {
  const m = moment(`${hijriYear}-${String(hijriMonth).padStart(2, '0')}-01`, 'iYYYY-iMM-iDD');
  return m.format('YYYY-MM-DD');
}

/**
 * Get the day of week (0=Sunday) for the start of a Hijri month
 */
export function getHijriMonthStartDay(hijriYear: number, hijriMonth: number): number {
  const m = moment(`${hijriYear}-${String(hijriMonth).padStart(2, '0')}-01`, 'iYYYY-iMM-iDD');
  return m.day();
}

/**
 * Get current Hijri month (1-12)
 */
export function getCurrentHijriMonth(): number {
  try {
    const m = moment() as any;
    if (typeof m.iMonth === 'function') {
      return m.iMonth() + 1; // iMonth is 0-indexed
    }
    // Fallback: use iM format (single digit month)
    const hijriStr = m.format('iM');
    const stripped = stripHijriPrefixes(hijriStr);
    const englishStr = arabicToEnglish(stripped);
    const month = parseInt(englishStr, 10);
    
    // Validate
    if (isNaN(month) || month < 1 || month > 12) {
      console.warn('Invalid Hijri month:', month, 'from:', hijriStr);
      return 1;
    }
    return month;
  } catch (err) {
    console.error('Error getting Hijri month:', err);
    return 1;
  }
}

/**
 * Get the Hijri day number for a Gregorian date
 */
export function getHijriDay(gregorianDate: string): number {
  const m = moment(gregorianDate) as any;
  if (typeof m.iDate === 'function') {
    return m.iDate();
  }
  const hijriStr = m.format('iD');
  const stripped = stripHijriPrefixes(hijriStr);
  const englishStr = arabicToEnglish(stripped);
  return parseInt(englishStr, 10);
}

// Export helpers if needed elsewhere
export { stripHijriPrefixes, formatHijri };
