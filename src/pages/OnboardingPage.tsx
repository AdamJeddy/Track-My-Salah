import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, BarChart3, CalendarClock, ShieldCheck, Sparkles } from 'lucide-react';
import { importRecords } from '../services/localStorageService';
import { PRAYER_NAMES, PrayerRecord, PrayerStatus } from '../models/PrayerRecord';
import { addDays, getTodayGregorian, gregorianToHijri } from '../utils/dateUtils';

const FEATURES = [
  {
    icon: CheckCircle2,
    title: 'Track Daily Prayers',
    desc: 'Monitor all five daily prayers with status options: Prayed, Jamah, Missed, or Excused',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100',
  },
  {
    icon: BarChart3,
    title: 'Visualize Progress',
    desc: 'See your consistency with beautiful heatmaps and monthly calendars',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100',
  },
  {
    icon: CalendarClock,
    title: 'Gregorian & Hijri',
    desc: 'View dates in both Gregorian and Hijri calendars',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-100',
  },
  {
    icon: ShieldCheck,
    title: 'Private & Offline',
    desc: 'All data stays on your device. No servers, complete privacy',
    color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-100',
  },
];

const SAMPLE_STATUSES: PrayerStatus[] = ['Prayed', 'Jamah', 'Prayed', 'Missed', 'Prayed', 'Excused'];

function buildSampleData(): PrayerRecord[] {
  const today = getTodayGregorian();
  const sampleRecords: PrayerRecord[] = [];

  for (let i = 0; i < 14; i++) {
    const date = addDays(today, -i);
    PRAYER_NAMES.forEach((prayer, idx) => {
      const status = SAMPLE_STATUSES[(i + idx) % SAMPLE_STATUSES.length] as PrayerStatus;
      sampleRecords.push({
        id: `${date}-${prayer}`,
        gregorian_date: date,
        hijri_date: gregorianToHijri(date),
        prayer_name: prayer,
        status,
      });
    });
  }

  return sampleRecords;
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGetStarted = () => {
    navigate('/tracker');
  };

  const handleSampleData = async () => {
    try {
      setLoading(true);
      const records = buildSampleData();
      await importRecords(records);
      navigate('/tracker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      <div className="max-w-lg mx-auto px-6 py-10 space-y-8">
        {/* Hero */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-600/90 flex items-center justify-center shadow-lg shadow-emerald-800/40">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">TrackMySalah</h1>
            <p className="text-slate-300 text-base">Build consistency in your spiritual journey</p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          {FEATURES.map((item) => (
            <div
              key={item.title}
              className="flex gap-4 bg-slate-800/60 backdrop-blur rounded-2xl p-4 border border-white/5 shadow-md"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <item.icon className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleGetStarted}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] transition text-base font-semibold shadow-lg shadow-emerald-900/40"
          >
            Get Started
          </button>
          <button
            onClick={handleSampleData}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.99] transition text-base font-semibold text-white border border-white/10 disabled:opacity-60"
          >
            {loading ? 'Loading sample data...' : 'View with Sample Data'}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-400 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Made with care for the Muslim community</span>
        </div>
      </div>
    </div>
  );
}