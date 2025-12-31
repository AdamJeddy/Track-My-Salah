import { PrayerRecord, PrayerName, PrayerStatus, PRAYER_NAMES, PRAYER_STATUS_OPTIONS } from '../models/PrayerRecord';
import { gregorianToHijri } from './dateUtils';
import { v4 as uuidv4 } from 'uuid';

/**
 * Export prayer records to CSV format
 */
export function exportToCSV(records: PrayerRecord[]): string {
  // CSV Headers
  const headers = ['Date (Gregorian)', 'Date (Hijri)', 'Prayer', 'Status', 'Notes'];
  
  // Convert records to CSV rows
  const rows = records.map((record) => [
    record.gregorian_date,
    record.hijri_date,
    record.prayer_name,
    record.status || '',
    record.notes || '',
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCSVField).join(',')),
  ].join('\n');
  
  return csvContent;
}

/**
 * Escape a CSV field (handle commas, quotes, newlines)
 */
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(csvContent: string, filename: string = 'trackmysalah_export.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Parse CSV content to prayer records
 */
export function parseCSV(csvContent: string): PrayerRecord[] {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows');
  }
  
  // Skip header row
  const dataRows = lines.slice(1);
  const records: PrayerRecord[] = [];
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = parseCSVRow(dataRows[i]);
    
    if (row.length < 4) {
      console.warn(`Skipping row ${i + 2}: insufficient columns`);
      continue;
    }
    
    const [gregorianDate, hijriDate, prayerName, status, notes] = row;
    
    // Validate prayer name
    if (!PRAYER_NAMES.includes(prayerName as PrayerName)) {
      console.warn(`Skipping row ${i + 2}: invalid prayer name "${prayerName}"`);
      continue;
    }
    
    // Validate status
    const validStatus = status === '' ? null : status as PrayerStatus;
    if (validStatus !== null && !PRAYER_STATUS_OPTIONS.includes(validStatus)) {
      console.warn(`Skipping row ${i + 2}: invalid status "${status}"`);
      continue;
    }
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(gregorianDate)) {
      console.warn(`Skipping row ${i + 2}: invalid date format "${gregorianDate}"`);
      continue;
    }
    
    records.push({
      id: uuidv4(),
      gregorian_date: gregorianDate,
      hijri_date: hijriDate || gregorianToHijri(gregorianDate),
      prayer_name: prayerName as PrayerName,
      status: validStatus,
      notes: notes?.substring(0, 255),
    });
  }
  
  return records;
}

/**
 * Parse a single CSV row (handling quoted fields)
 */
function parseCSVRow(row: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];
    
    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  
  fields.push(current.trim());
  return fields;
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
