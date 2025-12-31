# TrackMySalah: Detailed Development Plan for Coding Agent

**Project Goal:** Develop a simple, cross-platform Progressive Web App (PWA) for tracking the five daily prayers, featuring dual calendar views and data export.

**Platform:** PWA (React + Vite + Tailwind CSS)

## Phase 1: Project Setup and Dependencies

1.  **Initialize Project:** Create a new React project using Vite and set up Tailwind CSS for styling.
    \`\`\`bash
    npm create vite@latest trackmysalah -- --template react-ts
    cd trackmysalah
    npm install
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    # Configure Tailwind and PostCSS
    \`\`\`
2.  **Install Dependencies:** Install necessary libraries for date handling and local storage.
    \`\`\`bash
    npm install dayjs dayjs-plugin-hijri localforage
    npm install react-calendar-heatmap # For visualization
    \`\`\`
3.  **Initial Cleanup:** Clear boilerplate code and set up a basic, mobile-first layout with a header and main content area.

## Phase 2: Data Layer and Model Implementation

1.  **Define Data Model:** Implement the `PrayerRecord` interface based on the specification:
    - `id: string`
    - `gregorian_date: string` (YYYY-MM-DD)
    - `hijri_date: string` (YYYY-MM-DD)
    - `prayer_name: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'`
    - `status: 'Prayed' | 'Jamah' | 'Missed' | 'Excused'`
2.  **Local Storage Service:** Create a service using `localforage` (which uses IndexedDB) to handle CRUD operations for `PrayerRecord` objects.
    - `saveRecord(record: PrayerRecord)`
    - `getRecordsByDate(date: string)`
    - `getAllRecords()`
3.  **Date Utility:** Create a utility function to convert a Gregorian date string (YYYY-MM-DD) to its corresponding Hijri date string, using `dayjs` and the `dayjs-plugin-hijri`.

## Phase 3: Daily Tracking Interface (Core Feature)

1.  **Daily View Component:** Create the main component for tracking today's prayers.
2.  **Prayer List:** Display the five prayers in a list.
3.  **Status Toggles:** For each prayer, implement a set of buttons/toggles for the four status options (`Prayed`, `Jamah`, `Missed`, `Excused`).
4.  **Logging Logic:** On status change, use the Local Storage Service to save or update the `PrayerRecord` for the current day and prayer.
5.  **UX:** Ensure the interface is highly responsive and easy to use on a mobile screen (large, clear buttons).

## Phase 4: Visualization and Dual Calendar Views

1.  **Yearly Heatmap Component:**
    - Fetch all records using `getAllRecords()`.
    - Transform the data into the format required by `react-calendar-heatmap` (e.g., `{ date: 'YYYY-MM-DD', count: number }`). The 'count' can be a derived value based on the status (e.g., 1 for Prayed, 2 for Jamah, 0 for Missed).
    - Implement color mapping based on the status (Green, Blue, Red, Grey).
2.  **Monthly Grid Component:**
    - Create a calendar grid view for a selected month.
    - Display both the Gregorian and Hijri date for each day.
    - Color-code the day based on the overall prayer status for that day (e.g., if any are missed, color is red; if all are Jamah, color is dark green).
3.  **Navigation:** Implement simple month/year navigation controls for the visualization views.

## Phase 5: Data Export (CSV)

1.  **Export Utility Function:** Create a function `exportToCSV(records: PrayerRecord[])` that:
    - Takes the array of all prayer records.
    - Defines the CSV headers (e.g., `Date (Gregorian)`, `Date (Hijri)`, `Prayer`, `Status`).
    - Converts the JSON data into a CSV string.
    - Triggers a file download in the browser (client-side).
2.  **UI Integration:** Add a clear "Export Data (CSV)" button to the Visualization/Settings view.

## Phase 6: Final Touches and PWA Configuration

1.  **PWA Manifest:** Create a `manifest.json` file with app name, icons, start URL, and display mode (`standalone`).
2.  **Service Worker:** Implement a basic service worker for caching the app shell to enable offline access.
3.  **Styling:** Implement a simple Dark Mode toggle using Tailwind CSS classes.
4.  **Testing:** Verify functionality on a mobile browser (Chrome/Safari) to ensure PWA installation and offline tracking work correctly.
