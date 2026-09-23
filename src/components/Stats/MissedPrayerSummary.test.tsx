import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MissedPrayerSummary, type MissedPrayerGroup } from './MissedPrayerSummary';

function render(groups: MissedPrayerGroup[]) {
  return renderToStaticMarkup(<MissedPrayerSummary groups={groups} />)
    .replace(/></g, '> <')
    .replace(/<[^>]*>/g, '');
}

describe('MissedPrayerSummary', () => {
  it('summarises prayer review counts and links to the calendar', () => {
    const content = render([
      { gregorian: '2026-09-20', missed: ['Fajr', 'Dhuhr'], unrecorded: ['Asr'] },
      { gregorian: '2026-09-19', missed: [], unrecorded: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] },
    ]);

    expect(content).toContain('2 days to review');
    expect(content).toContain('2 marked missed');
    expect(content).toContain('6 left unrecorded');
    expect(content).toContain('View in calendar');
  });

  it('uses an encouraging empty state', () => {
    expect(render([])).toContain('No past prayers need a review');
  });
});
