import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PrayerList } from './PrayerList';
import type { PrayerName, PrayerStatus } from '../../models/PrayerRecord';

const prayerStatuses: Record<PrayerName, PrayerStatus> = {
  Fajr: null,
  Dhuhr: null,
  Asr: null,
  Maghrib: null,
  Isha: null,
};

describe('accessible localized prayer controls', () => {
  it('shows Arabic prayer names and gives each status action prayer-specific context', () => {
    const markup = renderToStaticMarkup(
      <PrayerList prayerStatuses={prayerStatuses} onStatusChange={vi.fn()} gender="male" />,
    );

    expect(markup).toContain('الفجر');
    expect(markup).toContain('العشاء');
    expect(markup).toContain('aria-label="Fajr: Prayed"');
    expect(markup).toContain('aria-label="Isha: Missed"');
  });
});
