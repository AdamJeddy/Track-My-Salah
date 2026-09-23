import { Sprout } from 'lucide-react';
import type { PrayerRecord } from '../../models/PrayerRecord';
import { getRecoveryGuidance } from '../../utils/recoveryUtils';

interface RecoveryCardProps {
  records: PrayerRecord[];
}

export function RecoveryCard({ records }: RecoveryCardProps) {
  const guidance = getRecoveryGuidance(records);
  if (!guidance) return null;

  return (
    <section
      aria-labelledby="recovery-title"
      className="border-l-4 border-primary-500 bg-primary-50 p-4 dark:bg-primary-950/30"
    >
      <div className="flex items-start gap-3">
        <Sprout className="mt-0.5 h-5 w-5 shrink-0 text-primary-700 dark:text-primary-300" aria-hidden="true" />
        <div>
          <h2 id="recovery-title" className="font-semibold text-gray-900 dark:text-white">
            A fresh start begins with one prayer
          </h2>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            A broken streak does not erase your progress. {guidance.message}
          </p>
        </div>
      </div>
    </section>
  );
}
