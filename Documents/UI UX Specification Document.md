# TrackMySalah: UI/UX Specification Document

## 1. Overall UI/UX Philosophy

The design philosophy for **TrackMySalah** is centered on **Simplicity, Clarity, and Spiritual Focus**. The application must feel effortless to use, allowing the user to log their prayers in seconds and providing clear, motivating visualizations of their consistency.

| Principle | Implementation |
| :--- | :--- |
| **Mobile-First** | Large, accessible touch targets (44x44px minimum) and a single-column layout optimized for one-handed use. |
| **Clarity** | Minimalist design with ample white space. Statuses are communicated primarily through color and clear iconography. |
| **Efficiency** | The primary action (logging a prayer) is a one-tap process on the home screen. |
| **Spiritual Resonance** | Subtle use of Islamic-inspired color palettes (greens, blues, golds) and clean, high-contrast typography. |
| **Data-Driven Motivation** | Immediate visual feedback on consistency via the heatmap and monthly views to encourage continuous tracking. |

## 2. Navigation Structure

The application utilizes a persistent **Bottom Navigation Bar** for primary navigation, ensuring key views are always one tap away.

| Tab Name | Icon (Example) | Purpose |
| :--- | :--- | :--- |
| **Tracker** | Home/Clock | The primary daily logging interface. |
| **Stats** | Chart/Calendar | The visualization hub (Yearly Heatmap, Monthly Grid). |
| **Settings** | Gear/User | Configuration and data management (Export/Import). |

## 3. Page-by-Page Breakdown

### Page 1: Tracker (Home Screen)

**Purpose:** The main interface for logging the five daily prayers.

| Element | Content/Functionality | UI/UX Notes |
| :--- | :--- | :--- |
| **Header** | **Dual Date Display:** Gregorian date (e.g., "Thursday, 1 Jan 2026") and Hijri date (e.g., "11 Jumada al-Thani 1447"). | Must be prominent. The Hijri date reinforces the app's context. |
| **Prayer List** | A vertical list of the five prayers: Fajr, Dhuhr, Asr, Maghrib, Isha. | Each prayer is a large, distinct row. |
| **Status Toggles** | A set of four buttons/toggles per prayer: `Prayed`, `Jamah`, `Missed`, `Excused`. | **Key Interaction:** Tapping a status button immediately updates the record and highlights the selected status with the corresponding color. Only one status can be active per prayer. |
| **Daily Summary** | A small, dynamic progress bar or circle showing the day's completion (e.g., "4/5 Prayers Logged"). | Provides immediate, positive reinforcement. |

### Page 2: Stats (Visualization Hub)

**Purpose:** To provide visual feedback on prayer consistency over time.

| Element | Content/Functionality | UI/UX Notes |
| :--- | :--- | :--- |
| **Yearly Heatmap** | A grid visualization of the entire year, inspired by GitHub's contribution graph. | **Color Intensity:** Color depth reflects the quality of prayer (e.g., darker green for more `Jamah` prayers). Days with `Missed` prayers are clearly marked in red. |
| **Calendar Toggle** | A prominent switch or button group to toggle the heatmap's date range between **Gregorian Year** and **Hijri Year**. | Essential for users who track by the Islamic calendar. |
| **Monthly Grid View** | A standard calendar view for the currently selected month. | Each day block is color-coded based on the day's overall status. Tapping a day should open a modal with the detailed prayer log for that day. |
| **Statistics Card** | Displays key metrics: "Current Streak," "Best Streak," "Overall Consistency %." | Motivational and data-driven. |

### Page 3: Settings

**Purpose:** Configuration and data management.

| Element | Content/Functionality | UI/UX Notes |
| :--- | :--- | :--- |
| **Appearance** | **Dark Mode Toggle:** Switch between Light and Dark themes. | High-priority feature for comfort. |
| **Data Management** | **"Export Data (CSV)" Button:** Triggers a client-side download of all `PrayerRecord` data. | Must be clearly labeled and accessible. |
| **Data Management** | **"Import Data (CSV)" Button:** Allows users to upload a previously exported CSV to restore data. | Optional but highly recommended for data portability. |
| **About/Help** | Links to project repository, version number, and a brief "About TrackMySalah" section. | Standard application information. |

## 4. User Flow: Logging a Prayer

1.  **User opens app:** Lands on the **Tracker (Home)** screen.
2.  **User selects prayer:** Taps the row for the prayer they just completed (e.g., Maghrib).
3.  **User selects status:** Taps the `Prayed` button.
4.  **System Feedback:** The `Prayed` button highlights in the primary color (Green), and the Daily Summary updates instantly.
5.  **User navigates to Stats:** Taps the **Stats** tab.
6.  **System Feedback:** The heatmap updates immediately, showing the current day's block with the new status color.

This flow is designed to be fast, requiring minimal taps, and providing immediate visual confirmation, which is key to forming a consistent tracking habit.
