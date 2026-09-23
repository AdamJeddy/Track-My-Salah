import { CalendarDays, CheckCircle2 } from 'lucide-react';
import { PRAYER_NAMES } from '../../models/PrayerRecord';

export interface MissedPrayerGroup {
  gregorian: string;
  missed: string[];
  unrecorded: string[];
}

interface MissedPrayerSummaryProps {
  groups: MissedPrayerGroup[];
}

export function MissedPrayerSummary({ groups }: MissedPrayerSummaryProps) {
  const missedCount = groups.reduce((total, group) => total + group.missed.length, 0);
  const unrecordedCount = groups.reduce((total, group) => total + group.unrecorded.length, 0);
  const prayerBreakdown = PRAYER_NAMES.map((prayer) => ({
    prayer,
    missed: groups.reduce((total, group) => total + group.missed.filter((item) => item === prayer).length, 0),
    unrecorded: groups.reduce((total, group) => total + group.unrecorded.filter((item) => item === prayer).length, 0),
  })).filter((item) => item.missed > 0 || item.unrecorded > 0);

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-3" aria-labelledby="prayer-review-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="prayer-review-title" className="text-lg font-semibold text-gray-900 dark:text-white">Prayer review</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">A compact view of past prayers that need attention.</p>
        </div>
        <CalendarDays className="w-5 h-5 mt-1 text-primary-600 dark:text-primary-400 flex-shrink-0" aria-hidden="true" />
      </div>

      {groups.length === 0 ? (
        <div className="flex gap-3 rounded-lg bg-prayed/10 p-3 text-sm text-gray-700 dark:text-gray-200">
          <CheckCircle2 className="w-5 h-5 text-prayed flex-shrink-0" aria-hidden="true" />
          <p>No past prayers need a review. Keep logging one prayer at a time.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2" aria-label="Prayer review summary">
            <SummaryValue value={groups.length} label={groups.length === 1 ? 'day to review' : 'days to review'} />
            <SummaryValue value={missedCount} label={missedCount === 1 ? 'marked missed' : 'marked missed'} />
            <SummaryValue value={unrecordedCount} label={unrecordedCount === 1 ? 'left unrecorded' : 'left unrecorded'} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Missed by prayer</h3>
            <ul className="divide-y divide-gray-100 dark:divide-gray-700 rounded-lg border border-gray-100 dark:border-gray-700">
              {prayerBreakdown.map((item) => (
                <li key={item.prayer} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">{item.prayer}</span>
                  <span className="flex flex-wrap justify-end gap-x-2 gap-y-1 text-xs">
                    {item.missed > 0 && <span className="font-medium text-missed">{item.missed} missed</span>}
                    {item.unrecorded > 0 && <span className="text-gray-600 dark:text-gray-300">{item.unrecorded} unrecorded</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">The calendar keeps every date available to review or update.</p>
        </>
      )}

      <a
        href="/stats?view=calendar#calendar"
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-primary-200 dark:border-primary-700 px-3 py-2 text-sm font-semibold text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        View in calendar
      </a>
    </section>
  );
}

function SummaryValue({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 px-2 py-3 text-center">
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs leading-tight text-gray-600 dark:text-gray-300">{label}</p>
    </div>
  );
}
