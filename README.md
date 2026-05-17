# TrackMySalah

TrackMySalah is an offline-first prayer tracking app built with React, TypeScript, and Vite.

The project is shipped as:

- A Progressive Web App (web)
- A Capacitor Android app bundle for Google Play

## Features

- Track five daily prayers with status logging
- Gregorian and Hijri date support
- Monthly and yearly statistics with heatmap views
- Local-only storage (privacy-first)
- Offline support via service worker (web) and embedded assets (native)
- Daily reminder notifications (web and native)
- CSV export/import

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- localforage (IndexedDB)
- Capacitor 6 + Local Notifications

## Local Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Lint:

```bash
npm run lint
```

## Android (Capacitor) Workflow

Sync web assets and native config:

```bash
npm run build
npx cap sync android
```

Open Android Studio:

```bash
npx cap open android
```

### Play Store Requirements (Important)

- targetSdkVersion must be at least 35
- versionCode must increase on every upload

Current Android values are set in android/variables.gradle and android/app/build.gradle.

## Release Notes

- If Play Console says versionCode is already used, increment versionCode in android/app/build.gradle.
- Rebuild a new signed AAB after any versionCode, targetSdkVersion, or app config change.
- Deobfuscation mapping upload is optional unless minifyEnabled is true.

## Privacy

Privacy policy page is available at public/privacy.html.

## Related Docs

- CAPACITOR_GUIDE.md
- PLAY_STORE_GUIDE.md
- MASKABLE_ICONS.md

## License

MIT
