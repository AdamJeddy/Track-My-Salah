# TrackMySalah Codebase Guide

This document is a working map of the repository for future maintenance. The existing `README.md` explains how to run and ship the app; this guide focuses on how the code is organized and where behavior lives.

## What This App Is

TrackMySalah is a client-side prayer tracking app built with React, TypeScript, Vite, Tailwind CSS, and Capacitor.

Key characteristics:

- Offline-first
- No backend or user accounts
- Local-only persistence
- Delivered as both a PWA and a Capacitor Android app

## Runtime Architecture

### Boot flow

- `src/main.tsx`
  - Boots React.
  - Registers `public/sw.js` only on the web.
  - Skips service worker registration on native Capacitor builds.

- `src/App.tsx`
  - Wraps the app in `ThemeProvider` and `BrowserRouter`.
  - Checks onboarding and gender state on startup.
  - Redirects `/` to `/tracker` once onboarding is complete.
  - Initializes notification scheduling without blocking the onboarding redirect.

### Route map

- `/`
  - Onboarding gate.
  - Shows `OnboardingPage` until onboarding is complete.

- `/tracker`
  - Daily logging flow.

- `/stats`
  - Monthly/yearly summaries and missed-prayer history.

- `/settings`
  - Theme, gender, reminders, import/export, and data reset.

## Source Tree

### App shell

- `src/App.tsx`
- `src/main.tsx`
- `src/index.css`

### Pages

- `src/pages/OnboardingPage.tsx`
  - First-run flow.
  - Collects gender.
  - Can import generated sample data for demo/testing.

- `src/pages/TrackerPage.tsx`
  - Main day-by-day tracking screen.
  - Loads records for a selected date.
  - Saves status changes optimistically.

- `src/pages/StatsPage.tsx`
  - Loads all records once and derives:
    - streaks
    - consistency
    - missed prayer groups
    - monthly calendar status
    - yearly heatmap status

- `src/pages/SettingsPage.tsx`
  - Theme toggle
  - Gender preference
  - Notification settings
  - CSV import/export
  - Full local data reset

### Components

- `src/components/Tracker/*`
  - Date header
  - Prayer status controls
  - Daily summary

- `src/components/Stats/*`
  - KPI card
  - Monthly grid
  - Yearly heatmap
  - Day detail modal
  - Calendar mode toggle

- `src/components/Navigation/BottomNav.tsx`
  - Bottom tab navigation for non-onboarding routes.

- `src/components/InstallPrompt/InstallPrompt.tsx`
  - PWA install prompt for browsers.
  - Includes iOS manual-install instructions.

### State, models, and services

- `src/models/PrayerRecord.ts`
  - Core domain types and UI status constants.

- `src/context/ThemeContext.tsx`
  - Light/dark theme state.
  - Uses browser `localStorage`, not `localforage`.
  - Also manages the native status bar appearance via `@capacitor/status-bar`
    (green background with white icons in light mode, dark in dark mode).

- `src/services/localStorageService.ts`
  - Main persistence layer using `localforage`.

- `src/services/notificationService.ts`
  - Platform switch for notifications.

- `src/services/notificationService.web.ts`
  - Web reminder storage and scheduling.

- `src/services/notificationService.native.ts`
  - Capacitor local notification scheduling.

### Utilities

- `src/utils/dateUtils.ts`
  - Gregorian/Hijri conversions and formatting.
  - Calendar helpers for both calendar systems.

- `src/utils/exportUtils.ts`
  - CSV export/download/import helpers.

## Data Model And Persistence

### Core record

`PrayerRecord` contains:

- `id`
- `gregorian_date`
- `hijri_date`
- `prayer_name`
- `status`
- optional `notes`

The current prayer names are:

- `Fajr`
- `Dhuhr`
- `Asr`
- `Maghrib`
- `Isha`

The current statuses are:

- `Jamah`
- `Prayed`
- `Qada`
- `Missed`
- `Excused`
- `null` for unlogged

### Storage layout

`localforage` is configured once in `src/services/localStorageService.ts`.

Important keys:

- Prayer records: `prayer_<YYYY-MM-DD>_<PrayerName>`
- Gender: `user_gender`
- Onboarding flag: `onboarded`
- Notification settings: `notification_settings`

Browser-only `localStorage` keys:

- Theme: `trackmysalah_theme`
- Install prompt dismissal: `pwaInstallDismissed`

### Storage behavior

- Saving a prayer overwrites the single record for that date and prayer.
- `hijri_date` is recomputed when saving a record.
- CSV import writes records directly by date/prayer key.
- Clearing data removes only prayer record keys, not theme or onboarding preferences.

## Page Behavior Details

### Onboarding

`OnboardingPage.tsx` does two important things besides the welcome UI:

- Saves gender preference before entering the app.
- Optionally generates 14 days of sample records via `buildSampleData()`.

### Tracker page

`TrackerPage.tsx` is the main operational screen.

Behavior worth knowing:

- Uses `selectedDate` as the screen state.
- Loads records every time the selected date changes.
- Optimistically updates the UI before `saveRecord()` completes.
- Re-fetches if save fails.
- Allows browsing future dates, but disables logging on them.
- Passes `gender` to tracker components so `Excused` can be hidden for males.

### Stats page

`StatsPage.tsx` derives everything from `getAllRecords()`.

Important implications:

- Stats are computed fully client-side.
- Gregorian and Hijri views are both based on the same stored Gregorian records.
- Missed-prayer history is displayed as per-date cards with color-coded prayer badges.
- Day-detail modal re-reads records for the clicked day.

The page currently treats `Prayed`, `Jamah`, and `Qada` as completed prayers in most aggregate views.

### Settings page

`SettingsPage.tsx` is the operational settings hub.

Important behaviors:

- Theme is controlled through `ThemeContext`.
- Gender changes affect available tracker status options.
- Notification toggles go through the platform-specific notification service.
- Export creates a CSV from current local records.
- Import validates prayer names, statuses, and date format before saving.
- Clear data removes prayer records only.

## Notifications

Notifications are intentionally split by platform.

### Platform selection

`src/services/notificationService.ts` picks the implementation using `Capacitor.isNativePlatform()`.

### Web notifications

`src/services/notificationService.web.ts`:

- Stores reminder settings in `localforage`.
- Requests browser notification permission.
- Uses `navigator.serviceWorker.ready`.
- Schedules reminders with `setTimeout`, then reschedules after firing.

Practical limitation:

- Web reminders only work while the app is open because they are not backed by a true periodic background scheduler.

### Native notifications

`src/services/notificationService.native.ts`:

- Uses `@capacitor/local-notifications`.
- Cancels the existing scheduled notification before reapplying settings.
- Schedules a daily local notification at the chosen hour/minute.

## Offline And PWA Behavior

- `public/sw.js` handles basic caching and SPA navigation fallback.
- `src/main.tsx` registers the service worker only on web builds.
- `InstallPrompt.tsx` handles install UX for browsers.

Service worker notes:

- Cache version is controlled by `CACHE_NAME` in `public/sw.js`.
- If cached asset behavior changes, bumping the cache name is the simplest invalidation path.

## Styling And UI Conventions

- Tailwind is configured in `tailwind.config.js`.
- Dark mode uses the `class` strategy.
- Status colors are domain-specific and reused across tracker/stats UI:
  - `prayed`
  - `jamah`
  - `missed`
  - `excused`
  - `qada`

The design is mobile-first:

- Bottom navigation is fixed.
- Tracker has a distinct mobile button grid and desktop row layout.
- Safe-area helpers are defined in `src/index.css`.
- The native status bar is styled via `@capacitor/status-bar` (green `#16a34a` in light mode,
  dark gray `#111827` in dark mode), with `html`/`body` background CSS to show the correct
  color behind the transparent overlay.
- Samsung One UI devices require the native workaround in `MainActivity.java` to force
  white status bar icons via `WindowInsetsController`.

## Change Guide

### If you add or rename a prayer status

Update all of these together:

- `src/models/PrayerRecord.ts`
- `src/components/Tracker/StatusToggle.tsx`
- `src/components/Tracker/PrayerList.tsx`
- `src/components/Tracker/DailySummary.tsx`
- `src/components/Stats/StatisticsCard.tsx`
- `src/components/Stats/MonthlyGrid.tsx`
- `src/components/Stats/YearlyHeatmap.tsx`
- `src/components/Stats/DayDetailModal.tsx`
- `src/utils/exportUtils.ts`

### If you change persistence behavior

Start in:

- `src/services/localStorageService.ts`

Then verify downstream assumptions in:

- `src/pages/TrackerPage.tsx`
- `src/pages/StatsPage.tsx`
- `src/pages/SettingsPage.tsx`
- `src/utils/exportUtils.ts`

### If you change reminder behavior

Check both implementations:

- `src/services/notificationService.web.ts`
- `src/services/notificationService.native.ts`

Keep their storage contract aligned through:

- `src/services/notificationService.ts`

### If you change calendar logic

Most date logic is centralized in:

- `src/utils/dateUtils.ts`

Anything affecting displayed calendar data should also be checked in:

- `src/pages/TrackerPage.tsx`
- `src/pages/StatsPage.tsx`
- `src/components/Stats/MonthlyGrid.tsx`
- `src/components/Stats/YearlyHeatmap.tsx`
- `src/components/Tracker/DualDateHeader.tsx`

## Known Constraints

- There is no backend, server API, or authentication layer.
- There is no automated test suite in the repository right now.
- Stats rely on iterating local records in memory, which is simple and fine for this app size.
- Some browser-only behavior uses `localStorage` while record data uses `localforage`; that split is intentional.
- The Android app depends on web assets built into `dist` and then synced into Capacitor.

## Related Docs

- `README.md`
- `CAPACITOR_GUIDE.md`
- `PLAY_STORE_GUIDE.md`
- `MASKABLE_ICONS.md`
