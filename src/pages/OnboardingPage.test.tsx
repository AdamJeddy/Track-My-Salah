import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { OnboardingPage } from './OnboardingPage';

describe('first-week onboarding', () => {
  it('explains statuses, strict streaks, and local backups before setup', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>,
    );

    expect(markup).toContain('Your first week');
    expect(markup).toContain('Prayed or Jamah');
    expect(markup).toContain('Strict on-time streaks');
    expect(markup).toContain('Keep a local backup');
    expect(markup).toContain('You can change this later in Settings.');
  });
});
