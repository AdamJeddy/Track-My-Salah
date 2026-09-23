import { Award, Focus, Lightbulb, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { PrayerRecord } from '../../models/PrayerRecord';
import { getPrayerInsights } from '../../utils/statsUtils';

interface InsightsCardProps {
  records: PrayerRecord[];
}

export function InsightsCard({ records }: InsightsCardProps) {
  const insights = getPrayerInsights(records);

  if (insights.rolling30Days.eligible === 0) {
    return (
      <section className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800" aria-labelledby="insights-heading">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          <h2 id="insights-heading" className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Insights
          </h2>
        </div>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Log your prayers to start seeing private insights about your progress.
        </p>
      </section>
    );
  }

  const trend = insights.sevenDayTrend.change;
  const TrendIcon = trend === null || trend === 0 ? Minus : trend > 0 ? TrendingUp : TrendingDown;
  const trendText = trend === null
    ? 'Keep tracking to unlock a week-over-week comparison.'
    : trend > 0
      ? `Your on-time rate is up ${trend} points from the previous 7 days.`
      : trend < 0
        ? `Your recent on-time rate is ${Math.abs(trend)} points lower. A fresh week starts now.`
        : 'Your on-time rate is holding steady compared with the previous 7 days.';

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800" aria-labelledby="insights-heading">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
        <h2 id="insights-heading" className="text-lg font-semibold text-gray-900 dark:text-white">
          Your Insights
        </h2>
      </div>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Calculated privately from your last 30 days on this device.
      </p>

      <div className="mt-4 space-y-3">
        {insights.strongestPrayer && (
          <div className="flex gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <Award className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Strongest prayer</h3>
              <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                {insights.strongestPrayer.prayer} is strongest at {insights.strongestPrayer.rate}% on time.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <Focus className="mt-0.5 h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Gentle focus</h3>
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
              {insights.focusPrayer
                ? `${insights.focusPrayer.prayer} has the most room to improve at ${insights.focusPrayer.rate}% on time.`
                : 'Your prayers are evenly consistent across the last 30 days.'}
            </p>
          </div>
        </div>

        <div className="flex gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <TrendIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent direction</h3>
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{trendText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
