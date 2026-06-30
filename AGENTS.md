# Repository Guidelines

## Project Structure & Module Organization

```
src/
├── components/       # Reusable UI (Navigation, Stats, Tracker, InstallPrompt)
├── pages/            # Top-level route pages (TrackerPage, StatsPage, SettingsPage, OnboardingPage)
├── services/         # Data & platform abstractions (localStorage, notifications)
├── context/          # React context providers (ThemeContext)
├── models/           # Domain models (PrayerRecord)
├── types/            # TypeScript ambient declarations
├── utils/            # Shared helpers (dates, stats, CSV export)
└── assets/           # Static assets (icons, images)
```

- **Web app**: `index.html` → `src/main.tsx` → `src/App.tsx` (React Router).
- **Android**: `android/` — Capacitor-managed native project. Do not edit generated files under `android/app/src/main/assets/` directly.
- **Public**: `public/` for service worker, PWA manifest, and privacy page.
- Refer to `CODEBASE_GUIDE.md` for a deeper architecture walkthrough.

## Build, Test, and Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Type-check (`tsc -b`) then produce `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the codebase |
| `npx cap sync android` | Sync web assets into the Android project (run after `build`) |
| `npx cap open android` | Open the native project in Android Studio |

There is no test suite yet. Contributions adding tests (Vitest + React Testing Library recommended) are welcome.

## Coding Style & Naming Conventions

- **TypeScript** throughout — no plain `.js` files in `src/`.
- **Indentation**: 2 spaces (as configured in the ESLint config).
- **Naming**: `PascalCase` for components and models, `camelCase` for utilities, services, and hooks. Files mirror their default export name.
- **Styling**: Tailwind CSS utility classes. Use the custom palette defined in `tailwind.config.js` (e.g., `text-primary-600`, `bg-prayed`, `text-missed`).
- **Linting**: `npm run lint` runs `typescript-eslint`, `react-hooks`, and `react-refresh` rules. CI should pass lint before merge.

## Commit & Pull Request Guidelines

- Use **conventional commit** prefixes: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.
- Keep commits atomic and focused. Review the existing `git log` for tone and granularity.
- **PR descriptions** should explain what changed, why, and any manual testing performed.
- Include screenshots or screen recordings for UI-affecting changes.
- If the PR touches Android config (`variables.gradle`, `build.gradle`), note whether `versionCode` or `targetSdkVersion` changed.
- Link related issues where applicable.

## Security & Configuration Tips

- Never commit Android signing keys (`.jks`, `.keystore`, `key.properties` — these are git-ignored).
- The app is offline-first; all prayer data lives in IndexedDB via `localforage`. No analytics or telemetry.
- When updating `targetSdkVersion`, ensure it meets the current Play Store minimum.
