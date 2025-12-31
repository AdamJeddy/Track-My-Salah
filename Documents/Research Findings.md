# Research Findings: TrackMySalah

## Platform Comparison (2025/2026 Context)

| Feature | Progressive Web App (PWA) | React Native | Flutter |
| :--- | :--- | :--- | :--- |
| **Development Speed** | Fastest (Web-first) | High (if React known) | High (Widget-based) |
| **Web Support** | Native/Primary | Good (via RN Web) | Excellent |
| **Mobile Feel** | Good (Installable) | Native | Custom/High Performance |
| **Offline Support** | Service Workers | Native Storage | Native Storage |
| **Push Notifications** | Limited on iOS | Full Native | Full Native |
| **Maintenance** | Single codebase | Single codebase* | Single codebase |

**Recommendation:** For a "simple" tracking app that needs to be on phone and web, a **PWA (Progressive Web App)** or **React Native with Web support** are the strongest contenders. Given the user's desire for simplicity and web availability, a PWA built with a modern framework like **Next.js** or **Vite + React** offers the lowest friction for both development and user access (no app store required, but can be "installed" on home screen).

## Islamic Prayer Tracking Features
- **Prayer Statuses:** Missed, Prayed, Prayed with Jamah, Prayed Late, Excused (for women).
- **Calendars:** Dual support for Gregorian and Hijri calendars is essential for Islamic context.
- **Visualizations:** Heatmaps (GitHub style) for yearly views, color-coded monthly grids.
- **Data Export:** CSV is standard; JSON could be a secondary option for developers.
- **Privacy:** Local-first storage (IndexedDB/LocalStorage) with optional cloud sync.
