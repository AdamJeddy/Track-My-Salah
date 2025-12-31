# TrackMySalah: Technical Architecture and Data Model Design

## 1. Technical Architecture Overview

The application will be developed as a **Progressive Web App (PWA)** to ensure a single codebase delivers a seamless experience across web browsers and mobile devices (iOS and Android). This approach prioritizes simplicity, rapid deployment, and offline functionality.

| Component | Technology/Tool | Purpose |
| :--- | :--- | :--- |
| **Platform** | PWA (Progressive Web App) | Cross-platform compatibility and installability. |
| **Frontend Framework** | **React** (via **Vite**) | Modern, component-based UI development. |
| **Styling** | **Tailwind CSS** | Utility-first CSS for rapid, responsive, and mobile-first styling. |
| **Data Storage** | **IndexedDB** (Local-First) | Persistent, offline-ready storage for prayer records on the user's device. |
| **Calendar Logic** | `dayjs` + `dayjs-hijri` plugin | Handling date and time operations, including the essential conversion between Gregorian and Hijri calendars. |
| **Visualization** | `react-calendar-heatmap` (or similar) | Rendering the yearly activity heatmap. |
| **Data Export** | Client-side CSV generation | Enabling users to download their data without server-side processing. |

## 2. Data Model Specification

The core of the application is the `PrayerRecord` entity, which tracks the status of a single prayer on a given day. The data model is designed to be simple, efficient for local storage, and easy to export.

### PrayerRecord Entity

| Field Name | Data Type | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Unique identifier for the record. | Primary Key |
| `gregorian_date` | Date (ISO 8601) | The Gregorian date of the prayer. | Indexed for fast lookups |
| `hijri_date` | String | The corresponding Hijri date (e.g., "1447-06-10"). | Used for display in Hijri calendar view |
| `prayer_name` | String (Enum) | The name of the prayer. | Must be one of: `Fajr`, `Dhuhr`, `Asr`, `Maghrib`, `Isha` |
| `status` | String (Enum) | The tracking status of the prayer. | Must be one of: `Prayed`, `Jamah`, `Missed`, `Excused` |
| `notes` | String (Optional) | Any optional user notes for the day/prayer. | Max 255 characters |

### Status Enumeration Details

The `status` field is crucial for the app's logic and visualization.

| Status Value | Description | Visualization Color (Example) |
| :--- | :--- | :--- |
| `Prayed` | The prayer was performed on time. | Light Green |
| `Jamah` | The prayer was performed in congregation. | Dark Green / Blue |
| `Missed` | The prayer was not performed (Qaza). | Red |
| `Excused` | The prayer was excused (e.g., due to menstruation). | Grey / Yellow |

## 3. Data Flow and Logic

1.  **Input:** User interacts with the Daily View UI to set the `status` for a `prayer_name` on the current `gregorian_date`.
2.  **Processing:** The application generates a unique `id`, calculates the `hijri_date`, and saves the complete `PrayerRecord` object to **IndexedDB**.
3.  **Output (Visualization):** The visualization components (Heatmap, Monthly Grid) query the IndexedDB for all records within the selected time range, group them by date, and render the corresponding color based on the recorded `status`.
4.  **Output (Export):** The user triggers the CSV export, which reads all records from IndexedDB, converts the JSON data into a comma-separated string, and triggers a browser download.
