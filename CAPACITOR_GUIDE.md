# Capacitor Setup Guide - Full Offline Support

This guide explains how to package TrackMySalah as a native Android app using Capacitor for 100% offline functionality from first launch and reliable background notifications.

## When to Choose Capacitor Over TWA

**Choose Capacitor if:**
- ✅ App must work offline from first launch (no internet ever)
- ✅ You need reliable background notifications when app is closed
- ✅ You want to add native Android features later (camera, biometrics, etc.)
- ✅ You prefer full control over the native wrapper

**Choose TWA if:**
- ✅ Initial online load is acceptable
- ✅ In-app notifications (when app is open) are sufficient
- ✅ You want instant updates without app store releases for web changes
- ✅ Smaller app size and simpler maintenance

---

## Prerequisites

- Node.js and npm installed
- Android Studio installed
- Java JDK 11+ installed
- Project built successfully (`npm run build`)

---

## Step 1: Install Capacitor

```powershell
# Install Capacitor core and CLI
npm install @capacitor/core @capacitor/cli

# Install Local Notifications plugin for background reminders
npm install @capacitor/local-notifications

# Install App plugin for state management
npm install @capacitor/app
```

---

## Step 2: Initialize Capacitor

```powershell
# Initialize with app details
npx cap init "TrackMySalah" app.trackmysalah --web-dir=dist

# When prompted:
# - App name: TrackMySalah
# - App ID: app.trackmysalah (must match Play Console package name)
# - Web asset directory: dist
```

This creates `capacitor.config.ts` in your project root.

---

## Step 3: Configure Capacitor

Edit `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.trackmysalah',
  appName: 'TrackMySalah',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_notification",
      iconColor: "#16a34a"
    }
  }
};

export default config;
```

---

## Step 4: Build Web Assets

```powershell
npm run build
```

This creates optimized assets in the `dist/` folder.

---

## Step 5: Add Android Platform

```powershell
# Add Android platform
npx cap add android

# Copy web assets to Android project
npx cap copy android

# Sync plugins and configuration
npx cap sync android
```

This creates an `android/` directory with a complete Android Studio project.

---

## Step 6: Update Notification Service for Capacitor

Create a new file `src/services/notificationService.capacitor.ts`:

```typescript
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import localforage from 'localforage';

export type NotificationSettings = {
  enabled: boolean;
  time: string; // HH:mm 24h
};

const SETTINGS_KEY = 'notification_settings';
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  time: '21:00',
};

const NOTIFICATION_ID = 1;

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const stored = await localforage.getItem<NotificationSettings>(SETTINGS_KEY);
  if (!stored) return DEFAULT_SETTINGS;
  return {
    enabled: stored.enabled ?? DEFAULT_SETTINGS.enabled,
    time: stored.time || DEFAULT_SETTINGS.time,
  };
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await localforage.setItem(SETTINGS_KEY, settings);
}

export async function requestNotificationPermission(): Promise<'granted' | 'denied'> {
  if (!Capacitor.isNativePlatform()) {
    // Fallback to web notification
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      return result === 'granted' ? 'granted' : 'denied';
    }
    return Notification.permission === 'granted' ? 'granted' : 'denied';
  }

  // Native permission request
  const result = await LocalNotifications.requestPermissions();
  return result.display === 'granted' ? 'granted' : 'denied';
}

export async function applyNotificationScheduler(settings: NotificationSettings): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    // On web, use existing setTimeout-based scheduler
    // Import and call the original web implementation
    return;
  }

  // Cancel existing notifications
  await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });

  if (!settings.enabled) return;

  // Check permission
  const permission = await LocalNotifications.checkPermissions();
  if (permission.display !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  // Parse time
  const [hours, minutes] = settings.time.split(':').map(Number);
  
  // Schedule daily repeating notification
  const schedule: ScheduleOptions = {
    notifications: [
      {
        id: NOTIFICATION_ID,
        title: 'Daily reminder',
        body: 'Log your prayers for today.',
        schedule: {
          on: {
            hour: hours ?? 21,
            minute: minutes ?? 0,
          },
          allowWhileIdle: true,
        },
      },
    ],
  };

  await LocalNotifications.schedule(schedule);
}

export async function updateNotificationSettings(settings: NotificationSettings): Promise<void> {
  await saveNotificationSettings(settings);
  await applyNotificationScheduler(settings);
}
```

---

## Step 7: Update App to Use Capacitor Notifications

Modify `src/services/notificationService.ts` to detect platform:

```typescript
import { Capacitor } from '@capacitor/core';

// Import both implementations
import * as webNotifications from './notificationService.web';
import * as nativeNotifications from './notificationService.capacitor';

// Export the appropriate implementation based on platform
const isNative = Capacitor.isNativePlatform();

export const getNotificationSettings = isNative 
  ? nativeNotifications.getNotificationSettings 
  : webNotifications.getNotificationSettings;

export const saveNotificationSettings = isNative 
  ? nativeNotifications.saveNotificationSettings 
  : webNotifications.saveNotificationSettings;

export const requestNotificationPermission = isNative 
  ? nativeNotifications.requestNotificationPermission 
  : webNotifications.requestNotificationPermission;

export const applyNotificationScheduler = isNative 
  ? nativeNotifications.applyNotificationScheduler 
  : webNotifications.applyNotificationScheduler;

export const updateNotificationSettings = isNative 
  ? nativeNotifications.updateNotificationSettings 
  : webNotifications.updateNotificationSettings;

export type { NotificationSettings } from './notificationService.web';
```

And rename current implementation to `src/services/notificationService.web.ts`.

---

## Step 8: Open in Android Studio

```powershell
npx cap open android
```

This opens the project in Android Studio.

---

## Step 9: Configure Android Manifest

Android Studio should be open. Edit `android/app/src/main/AndroidManifest.xml`:

Ensure these permissions are present (Capacitor usually adds them):

```xml
<!-- For notifications on Android 13+ -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>

<!-- For scheduling exact alarms -->
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>
```

---

## Step 10: Add Notification Icon

1. Right-click `android/app/src/main/res` in Android Studio
2. Select **New → Image Asset**
3. Icon Type: **Notification Icons**
4. Name: `ic_stat_icon_notification`
5. Asset Type: **Image** (upload your icon)
6. Trim: **Yes**
7. Padding: **25%**
8. Click **Finish**

This generates notification icons for all densities.

---

## Step 11: Build and Test

### Debug Build (for testing)

In Android Studio:
1. Connect Android device or start emulator
2. Click **Run** (green play button)
3. App will install and launch

### Test Checklist:
- ✅ App launches offline (enable Airplane Mode before launch)
- ✅ All routes work offline
- ✅ Data persists across app restarts
- ✅ Notification permission prompts correctly
- ✅ Daily reminder fires at set time (even when app is closed)
- ✅ Tapping notification opens the app

---

## Step 12: Generate Signed Release Build

### Option A: Android Studio GUI

1. **Build → Generate Signed Bundle / APK**
2. Select **Android App Bundle**
3. **Create new keystore:**
   - Key store path: `D:\Code\GitHub\Track-My-Salah\android.keystore`
   - Password: (choose secure password)
   - Alias: `android`
   - Validity: 25 years
   - Fill in certificate info
4. Click **Next**
5. Select **release** build variant
6. Check **Export encrypted key** (for Play App Signing)
7. Click **Finish**

### Option B: Command Line

First, create keystore:

```powershell
keytool -genkey -v -keystore android.keystore -alias android -keyalg RSA -keysize 2048 -validity 10000
```

Then build:

```powershell
cd android
./gradlew bundleRelease
```

Signed AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Step 13: Upload to Google Play

Follow the same Play Console steps from `PLAY_STORE_GUIDE.md`:

1. Create app listing
2. Upload assets (icon, feature graphic, screenshots)
3. Complete Data Safety form
4. Upload `app-release.aab`
5. Submit for review

**Note:** Digital Asset Links (assetlinks.json) are NOT required for Capacitor apps.

---

## Step 14: Update Workflow

When you update the app:

```powershell
# 1. Update version in package.json
# Update "version": "1.0.1"

# 2. Update Android version
# Edit android/app/build.gradle:
# - versionCode 2
# - versionName "1.0.1"

# 3. Rebuild web assets
npm run build

# 4. Sync to Android
npx cap sync android

# 5. Open in Android Studio
npx cap open android

# 6. Build signed bundle and upload to Play Console
```

---

## Troubleshooting

### Service Worker Conflicts
If the web service worker interferes with Capacitor:

Edit `src/main.tsx`:
```typescript
import { Capacitor } from '@capacitor/core';

// Only register service worker on web
if ('serviceWorker' in navigator && !Capacitor.isNativePlatform()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker registration failed:', error)
    })
  })
}
```

### Notifications Not Firing
- Check Android Settings → Apps → TrackMySalah → Notifications (enabled?)
- Verify `POST_NOTIFICATIONS` permission granted
- Check battery optimization (some devices kill background tasks)
- Test on multiple devices/Android versions

### Offline Not Working
- Ensure `npm run build` was run before `npx cap sync`
- Check `capacitor.config.ts` has correct `webDir: 'dist'`
- Verify assets copied: `npx cap copy android`

### Build Errors
- Update Gradle: Android Studio → File → Project Structure → Gradle version
- Update dependencies: `npx cap sync android`
- Clean build: Android Studio → Build → Clean Project

---

## Comparison: TWA vs Capacitor

| Feature | TWA | Capacitor |
|---------|-----|-----------|
| First-run offline | ❌ Needs online | ✅ Fully offline |
| Background notifications | ❌ Only when app open | ✅ Always works |
| App size | ~1-2 MB | ~5-10 MB |
| Updates | Instant (web) | Play Store release |
| Setup complexity | Low | Medium |
| Native APIs | Limited | Full access |
| Deep linking | Via Asset Links | Built-in |
| Maintenance | Easier | More complex |

---

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Local Notifications Plugin](https://capacitorjs.com/docs/apis/local-notifications)
- [Android Studio Download](https://developer.android.com/studio)

---

**You're all set!** Your app now works 100% offline with reliable background notifications. 🎉
