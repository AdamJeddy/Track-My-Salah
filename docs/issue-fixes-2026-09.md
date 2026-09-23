# September 2026 issue fixes

## #11: Yearly calendar weekday labels

Added Sunday-first weekday abbreviations to every month in Gregorian and Hijri yearly views, with full weekday names available through abbreviation titles.

Verified both calendar modes visually in Edge at 390 × 844. Production build and lint passed.

## #10: Export feedback

Settings feedback now stays above the bottom navigation while scrolling. Messages have opaque light/dark backgrounds, status/alert roles and a dismiss button.

Verified a CSV download of 70 sample records and a visible mobile confirmation. Production build and lint passed. Native file saving was not exercised on a device.

## #4: Current-day statistics

The shared timeline now includes today's recorded prayers. Pending slots today do not count as missed or reduce consistency. Completing today extends the streak; an unfinished day preserves yesterday's streak. Statistics reload on resume and date rollover. Cleared historical prayer slots count as unrecorded.

Seven regression tests cover current-day totals, partial days, empty/future data, cleared prayers, and historical best streak preservation (#5). In the browser, marking today's Fajr as prayed increased completed prayers from 47 to 48 while missed/unrecorded remained 12.

## #3: Android widget

Registered the custom plugin before Capacitor builds its bridge. Expanded the calendar from 35 to 42 cells, with a conditional sixth row. Centralized widget refresh after record saves, imports, deletions and resets; widget failures do not undo persisted records. The widget stays on the current month and includes Qada/excused statuses.

Seven widget regression tests cover payloads and persistence synchronization. The XML has 42 unique cell IDs. `npx cap sync android` and `gradlew.bat :app:assembleDebug` completed successfully. Neither `versionCode` nor `targetSdkVersion` changed.

Device checks still needed: add/re-add the widget, log and edit prayers, import/reset data, inspect a six-week month, and confirm light/dark appearance. No connected device or configured emulator was available during implementation.

## Verification commands

- `npm test`: 14 passing tests.
- `npm run build`: passed.
- `npm run lint`: passed with two existing Fast Refresh warnings in StatusToggle and ThemeContext.
- Android debug build: passed; Gradle reports existing flatDir/deprecation warnings.

Browser captures are local artifacts under `output/playwright/`; generated browser files and captures are ignored by Git.
