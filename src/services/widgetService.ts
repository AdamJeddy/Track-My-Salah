import { Capacitor, registerPlugin } from '@capacitor/core';
import { PRAYER_NAMES, type PrayerName } from '../models/PrayerRecord';
import { getAllRecords } from './localStorageService';

interface PrayerWidgetPlugin { updateWidgetData(options: { data: WidgetMonthData }): Promise<void>; }
interface WidgetDayData { status: 'complete' | 'partial' | 'missed' | 'none' }
interface WidgetMonthData { monthLabel: string; firstDayOfWeek: number; numDays: number; trackedDays: number; days: WidgetDayData[] }

const PrayerWidget = registerPlugin<PrayerWidgetPlugin>('PrayerWidget');

function getDayStatus(records: { prayer_name: PrayerName; status: string | null }[]): WidgetDayData['status'] {
  const nonNull = records.filter(r => r.status !== null);
  if (nonNull.length === 0) return 'none';
  const completed = nonNull.filter(r => r.status === 'Jamah' || r.status === 'Prayed' || r.status === 'Qada').length;
  const excused = nonNull.filter(r => r.status === 'Excused').length;
  if (nonNull.filter(r => r.status === 'Missed').length > 0) return 'missed';
  if (completed + excused === PRAYER_NAMES.length) return 'complete';
  if (completed + excused > 0) return 'partial';
  return 'none';
}

function buildMonth(y: number, m: number, records: { gregorian_date: string; prayer_name: PrayerName; status: string | null }[]): WidgetMonthData {
  const N = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const numDays = new Date(y, m+1, 0).getDate();
  const days: WidgetDayData[] = []; let t = 0;
  for (let d = 1; d <= numDays; d++) {
    const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const s = getDayStatus(records.filter(r => r.gregorian_date === ds));
    days.push({ status: s }); if (s !== 'none') t++;
  }
  return { monthLabel: `${N[m]} ${y}`, firstDayOfWeek: new Date(y, m, 1).getDay(), numDays, trackedDays: t, days };
}

export async function pushMonthToWidget(): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return;
  const all = await getAllRecords();
  const now = new Date();
  const data = buildMonth(now.getFullYear(), now.getMonth(), all);
  await PrayerWidget.updateWidgetData({ data });
}
