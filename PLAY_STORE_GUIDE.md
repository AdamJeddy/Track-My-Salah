# Google Play Store Submission Guide

This guide walks you through publishing **TrackMySalah** to Google Play via Trusted Web Activity (TWA).

## Prerequisites

- ✅ PWA deployed at HTTPS (currently: `https://track-my-salah.vercel.app`)
- ✅ Service worker with offline support
- ✅ Valid web app manifest
- ✅ Node.js and npm installed
- ⏹️ Android development tools (Java JDK 11+)
- ⏹️ Google Play Developer account ($25 one-time fee)

---

## Step 1: Generate Maskable Icons

Your app needs maskable icons for best Android adaptive icon support.

### Option A: Online Generator
1. Visit [Maskable.app](https://maskable.app/editor)
2. Upload your existing icon `/public/android-chrome-512x512.png`
3. Adjust safe zone padding (recommend 20-25%)
4. Download as:
   - `android-chrome-192x192-maskable.png`
   - `android-chrome-512x512-maskable.png`
5. Place both files in `/public/` directory

### Option B: Manual Creation
- Design square icons with important content in the central 80% (safe zone)
- Export at 192×192 and 512×512
- Save as PNG with transparency

**Note:** Manifest already references these icons with `"purpose": "maskable"`.

---

## Step 2: Generate Signing Key

Create an Android keystore for signing your app.

```powershell
# Navigate to project root
cd D:\Code\GitHub\Track-My-Salah

# Generate keystore (replace YOUR_NAME with your info)
keytool -genkey -v -keystore android.keystore -alias android -keyalg RSA -keysize 2048 -validity 10000

# You'll be prompted for:
# - Keystore password (save securely!)
# - Key password (can be same as keystore)
# - Your name, organization, city, state, country
```

**IMPORTANT:** 
- Save passwords securely (you'll need them for every release)
- Back up `android.keystore` safely (losing it means you can't update the app)
- Extract SHA-256 fingerprint:

```powershell
keytool -list -v -keystore android.keystore -alias android
```

Copy the **SHA256** fingerprint (format: `AA:BB:CC:...`) and save it.

---

## Step 3: Update Digital Asset Links

1. Open `/public/.well-known/assetlinks.json`
2. Replace `REPLACE_WITH_YOUR_SHA256_CERT_FINGERPRINT` with your SHA-256 from Step 2
3. Confirm `package_name` is `app.trackmysalah` (or your chosen ID)

```json
{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "app.trackmysalah",
    "sha256_cert_fingerprints": ["AA:BB:CC:DD:...YOUR_FINGERPRINT"]
  }
}
```

4. **Deploy to production:**
   ```powershell
   # Rebuild and deploy
   npm run build
   # Then deploy to Vercel (or your hosting)
   # Ensure file is accessible at:
   # https://track-my-salah.vercel.app/.well-known/assetlinks.json
   ```

5. **Verify deployment:**
   - Visit `https://track-my-salah.vercel.app/.well-known/assetlinks.json` in browser
   - Confirm it returns JSON with correct `Content-Type: application/json`

---

## Step 4: Install Bubblewrap CLI

```powershell
npm install -g @bubblewrap/cli
```

Verify installation:
```powershell
bubblewrap --version
```

---

## Step 5: Initialize TWA Project

From your project root:

```powershell
# Initialize using your deployed manifest
bubblewrap init --manifest https://track-my-salah.vercel.app/manifest.json
```

Bubblewrap will prompt you for:
- **Application ID**: `app.trackmysalah` (must match assetlinks.json)
- **Application Name**: `TrackMySalah`
- **Signing key path**: `./android.keystore`
- **Key alias**: `android`
- **Passwords**: Enter keystore and key passwords from Step 2

This creates a `twa-manifest.json` file (a template already exists in your repo).

---

## Step 6: Build Android App Bundle (AAB)

```powershell
# Build the app
bubblewrap build

# Sign the bundle
bubblewrap sign
```

**Output:** `app-release-bundle.aab` (or similar) in the project directory.

**Troubleshooting:**
- If build fails, ensure Java JDK 11+ is installed and in PATH
- Check Android SDK is installed (Bubblewrap will prompt to install if missing)

---

## Step 7: Test the APK Locally

Generate a test APK for device testing:

```powershell
bubblewrap build --apk
```

Install on connected Android device:

```powershell
adb install app-release.apk
```

**Test checklist:**
- ✅ App launches and shows content
- ✅ Offline mode works (enable Airplane Mode, relaunch)
- ✅ Routes navigate correctly (`/tracker`, `/stats`, `/settings`)
- ✅ Notifications permission prompts correctly
- ✅ Clicking web links opens in the app (deep linking)
- ✅ Splash screen displays correctly
- ✅ Back button behavior is natural

---

## Step 8: Prepare Play Console Assets

### Required Assets:

1. **App Icon** (512×512 PNG)
   - Use `/public/android-chrome-512x512.png` or a polished version

2. **Feature Graphic** (1024×500 PNG)
   - Create promotional banner with app branding
   - Tools: Canva, Figma, or Adobe Express

3. **Screenshots** (2-8 required)
   - Phone screenshots at native resolution (e.g., 1080×2400)
   - Capture key screens: Tracker, Stats, Settings, Onboarding
   - Use Android emulator or real device
   - Recommended tool: Android Studio Device Frame Generator

4. **Short Description** (max 80 chars)
   ```
   Track your daily prayers with privacy-focused simplicity
   ```

5. **Full Description** (max 4000 chars)
   ```
   TrackMySalah helps you track your five daily prayers with ease and privacy.

   ✅ Simple, intuitive prayer tracking
   ✅ Hijri and Gregorian calendar views
   ✅ Monthly and yearly statistics
   ✅ Daily reminder notifications
   ✅ 100% offline - your data stays on your device
   ✅ No accounts, no ads, no tracking
   ✅ Dark mode support

   Features:
   • Mark prayers as On-Time, Qadha, or Missed
   • View prayer completion rates
   • Calendar heatmap visualization
   • Export your data anytime
   • Customizable notification reminders

   Privacy First:
   All your data is stored locally on your device. No cloud sync, no servers, 
   no external tracking. Your prayer records are yours alone.
   ```

6. **Privacy Policy URL**
   - Create a simple privacy policy page (see Step 9)
   - Host at GitHub Pages, Vercel, or similar
   - Example: `https://track-my-salah.vercel.app/privacy`

---

## Step 9: Create Privacy Policy

Create `/public/privacy.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Privacy Policy - TrackMySalah</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <h1>Privacy Policy</h1>
  <p><strong>Last updated: January 26, 2026</strong></p>
  
  <h2>Data Collection</h2>
  <p>TrackMySalah does not collect, transmit, or share any personal data. All prayer tracking data is stored locally on your device using browser storage (IndexedDB).</p>
  
  <h2>Data Storage</h2>
  <p>Your prayer records, settings, and preferences are stored only on your device. We do not have access to this data.</p>
  
  <h2>Notifications</h2>
  <p>If you enable daily reminders, notifications are scheduled locally on your device. No data is sent to external servers.</p>
  
  <h2>Third-Party Services</h2>
  <p>This app does not use analytics, advertising, or any third-party tracking services.</p>
  
  <h2>Contact</h2>
  <p>For questions, contact: [your-email@example.com]</p>
</body>
</html>
```

Deploy and use URL: `https://track-my-salah.vercel.app/privacy.html`

---

## Step 10: Google Play Console Setup

### Create App Listing

1. **Sign in** to [Google Play Console](https://play.google.com/console)
2. **Create app:**
   - App name: `TrackMySalah`
   - Default language: English (United States)
   - App/Game: App
   - Free/Paid: Free

### Complete Store Listing

Navigate to **Store presence → Main store listing**:

- Upload App icon (512×512)
- Upload Feature graphic (1024×500)
- Upload Phone screenshots (2-8)
- Enter Short description
- Enter Full description
- Add Privacy policy URL

### App Content

**App access:**
- Select "All functionality is available without special access"

**Ads:**
- Select "No, my app does not contain ads"

**Content rating:**
- Complete the questionnaire (select "Utilities/Productivity", no violence/mature themes)

**Target audience:**
- Primary: 18 and over (or select appropriate age range)

**Data safety:**
- **Does your app collect or share user data?** → **No**
- Confirm: "Data is processed and stored locally on the user's device only"

**News app:**
- Select "No"

**COVID-19 contact tracing/status:**
- Select "No"

**Privacy policy:**
- Enter your privacy policy URL

### App Category

**Store settings → Category:**
- Category: Lifestyle
- Tags: prayer, tracking, productivity, islamic, salah

---

## Step 11: Upload AAB

1. Navigate to **Release → Production**
2. Click **Create new release**
3. **Upload** `app-release-bundle.aab`
4. **Release name:** `1.0.0` (matches `appVersionName` in twa-manifest.json)
5. **Release notes:**
   ```
   Initial release
   - Track daily prayers (On-Time, Qadha, Missed)
   - Monthly and yearly statistics
   - Calendar heatmap view
   - Daily reminder notifications
   - Full offline support
   - Privacy-first design
   ```

---

## Step 12: Review & Publish

1. **Review release** for errors/warnings
2. **Countries/regions:** Select target countries (or "All countries")
3. **Rollout percentage:** Start with 100% or staged rollout
4. **Start rollout to Production**

**Review process:**
- Google typically reviews within 1-3 days
- Check email for approval or requested changes

---

## Step 13: Post-Publish Monitoring

After approval:
- Monitor **Play Console → Quality → Android vitals**
- Check crash reports and ANRs
- Monitor user reviews and ratings
- Verify deep links work in production

---

## Updating the App

To release updates:

1. **Increment version** in `twa-manifest.json`:
   ```json
   "appVersionName": "1.0.1",
   "appVersionCode": 2
   ```

2. **Rebuild:**
   ```powershell
   bubblewrap build
   bubblewrap sign
   ```

3. **Upload new AAB** to Play Console
4. Add release notes and publish

---

## Alternative: Capacitor for Full Offline

If you need **100% offline from first launch** or **background notifications**, use Capacitor instead of TWA:

### Quick Setup

```powershell
npm install @capacitor/core @capacitor/cli @capacitor/local-notifications
npx cap init "TrackMySalah" app.trackmysalah
npm run build
npx cap add android
npx cap copy
npx cap sync
```

### Open in Android Studio

```powershell
npx cap open android
```

Build signed APK/AAB from Android Studio:
- **Build → Generate Signed Bundle / APK**
- Select AAB, choose keystore, build release variant
- Upload to Play Console (same process as TWA)

### Notification Integration

Update `/src/services/notificationService.ts` to use Capacitor's LocalNotifications for reliable background scheduling (see Capacitor docs).

---

## Troubleshooting

### Asset Links Not Verifying
- Ensure `assetlinks.json` is at `https://YOUR_DOMAIN/.well-known/assetlinks.json`
- Check `Content-Type: application/json` header
- Verify SHA-256 fingerprint matches exactly
- Test with: [Asset Links Tester](https://developers.google.com/digital-asset-links/tools/generator)

### App Opens in Browser Instead of TWA
- Asset Links not verified yet (can take 24-48 hours)
- Package name mismatch between assetlinks.json and TWA
- Try clearing Chrome app data

### Offline Not Working
- Check service worker is registered (`chrome://serviceworker-internals`)
- Ensure all routes fallback to cached `index.html`
- Test with DevTools offline mode first

### Build Errors
- Verify Java JDK 11+ installed: `java -version`
- Update Bubblewrap: `npm update -g @bubblewrap/cli`
- Check Android SDK installed (Bubblewrap auto-installs if needed)

---

## Resources

- [Bubblewrap Documentation](https://github.com/GoogleChromeLabs/bubblewrap)
- [TWA Guide](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Play Console Help](https://support.google.com/googleplay/android-developer/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Maskable Icons](https://maskable.app/)

---

**Ready to publish!** Follow these steps in order, and your app will be live on Google Play. Good luck! 🚀
