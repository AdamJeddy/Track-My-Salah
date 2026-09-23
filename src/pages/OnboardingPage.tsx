import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Download, Flame, ListChecks, Sparkles, Users } from 'lucide-react';
import { importRecords, setGenderPreference, setOnboardingStatus } from '../services/localStorageService';
import { PRAYER_NAMES, PrayerRecord, PrayerStatus } from '../models/PrayerRecord';
import { addDays, getTodayGregorian, gregorianToHijri } from '../utils/dateUtils';

const FIRST_WEEK_STEPS = [
  {
    icon: ListChecks,
    title: 'Log honestly',
    desc: 'Prayed or Jamah count as on time. Qada means made up later, Missed means missed, and Excused removes a prayer from that day’s requirement.',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100',
  },
  {
    icon: Flame,
    title: 'Strict on-time streaks',
    desc: 'A streak grows only when every required prayer is Prayed or Jamah. Qada, missed, and past unrecorded prayers break it; fully excused days are neutral.',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100',
  },
  {
    icon: Download,
    title: 'Keep a local backup',
    desc: 'After your first few entries, use Settings → Export Data (CSV). The app will show when your latest backup was made.',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-100',
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
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const [importSampleData, setImportSampleData] = useState(false);

  const proceedToTracker = async (withGender: 'male' | 'female' | null = selectedGender, importSample = false) => {
    try {
      setLoading(true);
      if (withGender) {
        await setGenderPreference(withGender);
      }
      if (importSample) {
        const records = buildSampleData();
        await importRecords(records);
      }
      await setOnboardingStatus(true);
      navigate('/tracker');
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    setImportSampleData(false);
    setShowGenderModal(true);
  };

  const handleSampleData = async () => {
    setImportSampleData(true);
    setShowGenderModal(true);
  };

  const handleGenderSelected = async (gender: 'male' | 'female') => {
    setSelectedGender(gender);
    setShowGenderModal(false);
    await proceedToTracker(gender, importSampleData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      <div className="max-w-lg mx-auto px-6 py-10 space-y-6">
        {/* Hero */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-600/90 flex items-center justify-center shadow-lg shadow-emerald-800/40">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">TrackMySalah</h1>
            <p className="text-slate-300 text-base">Start today, one prayer at a time</p>
          </div>
        </div>

        <section aria-labelledby="first-week-title" className="space-y-3">
          <div className="text-center">
            <h2 id="first-week-title" className="text-xl font-semibold text-white">Your first week</h2>
            <p className="mt-1 text-sm text-slate-300">Log today, learn the rules, and keep a copy of your progress.</p>
          </div>

        <div className="space-y-3">
          {FIRST_WEEK_STEPS.map((item, index) => (
            <div
              key={item.title}
              className="flex gap-4 bg-slate-800/60 backdrop-blur rounded-2xl p-4 border border-white/5 shadow-md"
            >
              <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <item.icon className="w-7 h-7 stroke-[1.5]" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
                  {index + 1}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        </section>
        {/* Actions */}
        <div className="space-y-3">
          <p className="text-center text-sm text-slate-300">
            Gender selection only changes available status options. You can change this later in Settings.
          </p>
          <button
            onClick={handleGetStarted}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] transition text-base font-semibold shadow-lg shadow-emerald-900/40 disabled:opacity-60"
          >
            Get Started
          </button>
          <button
            onClick={handleSampleData}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.99] transition text-base font-semibold text-white border border-white/10 disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'View with Sample Data'}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-400 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Made with care for the Muslim community</span>
        </div>
      </div>

      {/* Gender Selection Modal */}
      {showGenderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Select Your Gender
              </h3>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
              This helps us customize your prayer tracking experience. You can change this later in Settings.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleGenderSelected('male')}
                className="w-full py-3 px-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-blue-900 dark:text-blue-100 font-semibold"
              >
                Male
              </button>
              <button
                onClick={() => handleGenderSelected('female')}
                className="w-full py-3 px-4 bg-pink-50 dark:bg-pink-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors text-pink-900 dark:text-pink-100 font-semibold"
              >
                Female
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
