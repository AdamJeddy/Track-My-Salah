# TrackMySalah: Feature Specification & Platform Decision

## Platform Decision: Progressive Web App (PWA)
After evaluating the requirements for a simple, cross-platform (mobile + web) experience, a **Progressive Web App (PWA)** built with **React (Vite)** and **Tailwind CSS** is the recommended approach.

### Why PWA?
- **Single Codebase:** One project serves both web and mobile users.
- **Installable:** Users can "Add to Home Screen" on iOS and Android, making it feel like a native app.
- **Offline Capability:** Essential for tracking prayers even without an internet connection.
- **No App Store Friction:** Immediate deployment and updates without waiting for Apple/Google approval.
- **Simplicity:** Easier for a coding agent to build and maintain compared to React Native or Flutter.

---

## Core Feature Set

### 1. Prayer Tracking Interface (Daily View)
- **Simple Selection:** A clean list of the 5 daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha).
- **Status Options:**
    - **Prayed:** Standard completion.
    - **Prayed with Jamah:** Bonus for communal prayer.
    - **Missed:** For tracking Qaza (make-up) prayers.
    - **Excused:** Specifically for women during their monthly cycle (prevents "missed" streaks).
- **Quick Toggle:** One-tap logging for the current prayer time.

### 2. Visualization & History
- **Yearly Heatmap:** A GitHub-style activity grid showing prayer consistency over the year.
- **Monthly Grid View:** A traditional calendar view.
- **Dual Calendar Support:**
    - **Gregorian:** Standard international view.
    - **Hijri:** Islamic lunar calendar integration (essential for Ramadan and Islamic dates).
- **Color Coding:**
    - Green: All prayed.
    - Blue: Prayed with Jamah.
    - Red: Missed.
    - Grey: Excused/Future.

### 3. Data Management
- **Local-First Storage:** Data is saved on the device (IndexedDB) for privacy and offline use.
- **CSV Export:** A simple button to download all historical data in `.csv` format.
- **Import Functionality:** (Optional but recommended) Ability to restore data from a previously exported CSV.

### 4. User Experience (UX)
- **Mobile-First Design:** Large touch targets for easy logging on the go.
- **Dark Mode:** Easier on the eyes for Fajr and Isha logging.
- **Privacy:** No account required (initially) to keep it simple and private.
