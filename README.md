# TrackMySalah

A privacy-focused Progressive Web App for tracking daily prayers (Salah). Built with React, TypeScript, and Vite.

## Features

- ✅ Track five daily prayers (On-Time, Qadha, Missed)
- ✅ Hijri and Gregorian calendar views
- ✅ Monthly and yearly statistics with heatmap visualization
- ✅ Daily reminder notifications
- ✅ 100% offline support
- ✅ Privacy-first: all data stored locally, no cloud sync
- ✅ Dark mode support
- ✅ Export your data anytime

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Publishing to Google Play

### Option 1: Trusted Web Activity (TWA) - Recommended

Best for most use cases. Wraps your PWA in a lightweight Android shell.

**See complete guide:** [PLAY_STORE_GUIDE.md](PLAY_STORE_GUIDE.md)

**Quick steps:**
```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest=https://YOUR_DOMAIN/manifest.json
bubblewrap build
bubblewrap sign
```

**Requirements:**
- HTTPS hosting with Digital Asset Links
- Generate signing key
- Update `public/.well-known/assetlinks.json`
- Create maskable icons (192×192, 512×512)

### Option 2: Capacitor - Full Offline

Choose this if you need 100% offline from first launch or background notifications when the app is closed.

**See complete guide:** [CAPACITOR_GUIDE.md](CAPACITOR_GUIDE.md)

**Quick steps:**
```bash
npm install @capacitor/core @capacitor/cli @capacitor/local-notifications
npx cap init "TrackMySalah" app.trackmysalah
npx cap add android
npx cap sync
npx cap open android
```

## Privacy Policy

A privacy policy is included at `public/privacy.html` and will be accessible at `https://YOUR_DOMAIN/privacy.html` after deployment. Update the contact email before publishing.

## Files Created for Play Submission

- ✅ `public/manifest.json` - Updated with maskable icon support and scope
- ✅ `public/.well-known/assetlinks.json` - Digital Asset Links template
- ✅ `public/privacy.html` - Privacy policy page
- ✅ `twa-manifest.json` - Bubblewrap configuration template
- ✅ `PLAY_STORE_GUIDE.md` - Complete TWA submission guide
- ✅ `CAPACITOR_GUIDE.md` - Capacitor setup and native app guide

## Next Steps

1. **Generate maskable icons** (see PLAY_STORE_GUIDE.md Step 1)
2. **Create signing key** (see PLAY_STORE_GUIDE.md Step 2)
3. **Update assetlinks.json** with your SHA-256 fingerprint
4. **Choose TWA or Capacitor** based on your requirements
5. **Follow the respective guide** to build and submit

## License

MIT

## Why This Was Created

TrackMySalah was built to make it simple to log the five daily prayers with an experience that is private, offline-first, and fast. Many prayer trackers are account-based or cloud-first; this app keeps everything on the device so users can focus on consistency, not setup.

## About the App
TrackMySalah is a Progressive Web App that lets you log each prayer with a single tap, view streaks and consistency, and visualize your year with a GitHub-style heatmap. It supports both Gregorian and Hijri dates, works offline via IndexedDB and a service worker, and offers CSV export/import so users control their data.

**Live App:** [https://track-my-salah.vercel.app/](https://track-my-salah.vercel.app/)  

## Core Features
- Log statuses for Fajr, Dhuhr, Asr, Maghrib, Isha: Prayed, Jamah, Missed, Excused
- Dual calendar display (Gregorian and Hijri) on the tracker and stats views
- Yearly heatmap and monthly grid visualization with streaks and consistency metrics
- Offline-first data storage using IndexedDB (via localforage)
- CSV export and import for portability and backups
- Dark mode toggle

## Tech Stack
- React + TypeScript (Vite)
- Tailwind CSS
- IndexedDB via localforage
- Date handling with moment and moment-hijri
- react-calendar-heatmap for yearly visualization

## Getting Started
1) Install dependencies: `npm install`
2) Run the dev server: `npm run dev`
3) Open the app: http://localhost:5173

## Build for Production
- `npm run build`
- Preview production build: `npm run preview`

## PWA and Data
- Manifest and service worker are configured for installability and offline use.
- All prayer data stays on the device; no accounts or remote storage are used.
