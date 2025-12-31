# TrackMySalah

## Why This Was Created
TrackMySalah was built to make it simple to log the five daily prayers with an experience that is private, offline-first, and fast. Many prayer trackers are account-based or cloud-first; this app keeps everything on the device so users can focus on consistency, not setup.

## About the App
TrackMySalah is a Progressive Web App that lets you log each prayer with a single tap, view streaks and consistency, and visualize your year with a GitHub-style heatmap. It supports both Gregorian and Hijri dates, works offline via IndexedDB and a service worker, and offers CSV export/import so users control their data.

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
